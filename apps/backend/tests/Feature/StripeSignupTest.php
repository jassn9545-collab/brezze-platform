<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Schema;
use Stripe\Customer;
use Stripe\Service\AccountService;
use Stripe\Service\CustomerService;
use Stripe\StripeClient;

beforeEach(function () {
    Schema::create('users', function (Blueprint $table) {
        $table->id();
        $table->string('name');
        $table->string('email')->unique();
        $table->string('phone')->nullable()->unique();
        $table->string('password');
        $table->string('user_type')->nullable();
        $table->boolean('is_verified')->default(false);
        $table->timestamp('email_verified_at')->nullable();
        $table->string('refrence')->nullable();
        $table->string('refral_code')->nullable();
        $table->string('country')->nullable();
        $table->string('latitude')->nullable();
        $table->string('longitude')->nullable();
        $table->string('stripe_account_id')->nullable();
        $table->string('stripe_customer_id')->nullable();
        $table->date('dob')->nullable();
        $table->string('street_address')->nullable();
        $table->string('profile_image')->nullable();
        $table->rememberToken();
        $table->timestamps();
    });

    Schema::create('personal_access_tokens', function (Blueprint $table) {
        $table->id();
        $table->morphs('tokenable');
        $table->string('name');
        $table->string('token', 64)->unique();
        $table->text('abilities')->nullable();
        $table->timestamp('last_used_at')->nullable();
        $table->timestamp('expires_at')->nullable();
        $table->timestamps();
    });
});

afterEach(function () {
    Schema::dropIfExists('personal_access_tokens');
    Schema::dropIfExists('users');
});

test('provider OTP signup stores its Stripe customer ID even when Connect onboarding is temporarily unavailable', function () {
    Cache::put('user_otp_provider@example.test', 123456, now()->addMinutes(5));

    $customers = Mockery::mock(CustomerService::class);
    $customers->shouldReceive('create')->once()->with(
        Mockery::on(fn (array $params) => $params['email'] === 'provider@example.test'
            && $params['metadata']['user_type'] === 'freelancer'),
        Mockery::on(fn (array $options) => str_starts_with(
            $options['idempotency_key'],
            'user_'
        ))
    )->andReturn(Customer::constructFrom(['id' => 'cus_provider_test']));

    $accounts = Mockery::mock(AccountService::class);
    $accounts->shouldReceive('create')->once()->andThrow(new RuntimeException('Stripe unavailable'));

    $stripe = Mockery::mock(StripeClient::class);
    $stripe->shouldReceive('getService')->with('customers')->andReturn($customers);
    $stripe->shouldReceive('getService')->with('accounts')->andReturn($accounts);
    app()->instance(StripeClient::class, $stripe);

    $this->postJson('/api/verify-otp', [
        'otp' => '123456',
        'email' => 'provider@example.test',
        'phone' => '0400000010',
        'name' => 'Test Provider',
        'password' => 'password',
        'confirm_password' => 'password',
        'user_type' => 'freelancer',
        'country' => 'AU',
    ])->assertOk()
        ->assertJsonPath('data.user.email', 'provider@example.test')
        ->assertJsonPath('data.user.stripe_customer_id', 'cus_provider_test')
        ->assertJsonPath('data.user.stripe_account_id', null)
        ->assertJsonPath('message', 'OTP verified. Registration complete. Complete Stripe setup from your profile.');

    $this->assertDatabaseHas('users', [
        'email' => 'provider@example.test',
        'stripe_customer_id' => 'cus_provider_test',
        'stripe_account_id' => null,
    ]);
});

test('client OTP signup creates and stores its Stripe customer ID', function () {
    Cache::put('user_otp_customer@example.test', 654321, now()->addMinutes(5));

    $customers = Mockery::mock(CustomerService::class);
    $customers->shouldReceive('create')->once()->with(
        Mockery::on(fn (array $params) => $params['email'] === 'customer@example.test'
            && $params['metadata']['user_type'] === 'client'),
        Mockery::on(fn (array $options) => str_starts_with(
            $options['idempotency_key'],
            'user_'
        ))
    )->andReturn(Customer::constructFrom(['id' => 'cus_customer_signup_test']));

    $stripe = Mockery::mock(StripeClient::class);
    $stripe->shouldReceive('getService')->with('customers')->andReturn($customers);
    app()->instance(StripeClient::class, $stripe);

    $this->postJson('/api/verify-otp', [
        'otp' => '654321',
        'email' => 'customer@example.test',
        'phone' => '0400000011',
        'name' => 'Test Customer',
        'password' => 'password',
        'confirm_password' => 'password',
        'user_type' => 'client',
        'country' => 'AU',
    ])->assertOk()
        ->assertJsonPath('data.user.email', 'customer@example.test')
        ->assertJsonPath('data.user.stripe_customer_id', 'cus_customer_signup_test')
        ->assertJsonPath('data.user.stripe_account_id', null)
        ->assertJsonPath('data.onboarding_url', null)
        ->assertJsonPath('message', 'OTP verified. Registration complete.');

    $this->assertDatabaseHas('users', [
        'email' => 'customer@example.test',
        'user_type' => 'client',
        'stripe_customer_id' => 'cus_customer_signup_test',
        'stripe_account_id' => null,
    ]);
});
