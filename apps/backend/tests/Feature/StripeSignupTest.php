<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Schema;
use Stripe\AccountLink;
use Stripe\Customer;
use Stripe\Service\AccountLinkService;
use Stripe\Service\CustomerService;
use Stripe\Service\V2\Core\AccountService as V2AccountService;
use Stripe\Service\V2\Core\CoreServiceFactory;
use Stripe\Service\V2\V2ServiceFactory;
use Stripe\StripeClient;
use Stripe\V2\Core\Account as V2Account;

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

test('duplicate phone numbers are rejected before an OTP is sent', function () {
    \Illuminate\Support\Facades\Mail::fake();
    \App\Models\User::create([
        'name' => 'Existing Customer', 'email' => 'existing@example.test',
        'phone' => '0400000011', 'password' => 'password', 'user_type' => 'client',
    ]);

    $this->postJson('/api/register', [
        'name' => 'New Customer', 'email' => 'new@example.test', 'phone' => '0400000011',
        'password' => 'password', 'confirm_password' => 'password', 'user_type' => 'client',
        'country_code' => '61',
    ])->assertStatus(400)
        ->assertJsonValidationErrors('phone')
        ->assertJsonPath('message', 'This phone number is already registered. Sign in to your existing account or use a different number.');

    expect(Cache::has('user_otp_new@example.test'))->toBeFalse();
    \Illuminate\Support\Facades\Mail::assertNothingSent();
    $this->assertDatabaseCount('users', 1);
});

test('OTP verification still prevents reusing a phone claimed after registration began', function () {
    Cache::put('user_otp_new@example.test', 123456, now()->addMinutes(5));
    \App\Models\User::create([
        'name' => 'Existing Customer', 'email' => 'existing@example.test',
        'phone' => '0400000011', 'password' => 'password', 'user_type' => 'client',
    ]);
    $stripe = Mockery::mock(StripeClient::class);
    $stripe->shouldNotReceive('getService');
    app()->instance(StripeClient::class, $stripe);

    $this->postJson('/api/verify-otp', [
        'otp' => '123456', 'name' => 'New Customer', 'email' => 'new@example.test',
        'phone' => '0400000011', 'password' => 'password', 'confirm_password' => 'password',
        'user_type' => 'client', 'country_code' => '61',
    ])->assertStatus(400)
        ->assertJsonValidationErrors('phone')
        ->assertJsonPath('message', 'This phone number is already registered. Sign in to your existing account or use a different number.');

    $this->assertDatabaseCount('users', 1);
    $this->assertDatabaseCount('personal_access_tokens', 0);
});

test('an existing provider can attach a Stripe account using a saved national phone number', function ($country, $phone, $expected) {
    config()->set('services.stripe.secret', 'sk_test_not_a_real_key');
    config()->set('services.stripe.onboarding_base_url', 'https://api.example.com');
    $user = \App\Models\User::create([
        'name' => 'Test Provider',
        'email' => 'provider@example.test',
        'phone' => $phone,
        'country' => $country,
        'password' => 'password',
        'user_type' => 'freelancer',
        'stripe_customer_id' => 'cus_provider_test',
    ]);
    \Laravel\Sanctum\Sanctum::actingAs($user);

    $accounts = Mockery::mock(V2AccountService::class);
    $accounts->shouldReceive('create')->once()->with(
        Mockery::on(fn ($params) => $params['contact_phone'] === $expected
            && $params['identity']['individual']['phone'] === $expected),
        Mockery::type('array')
    )->andReturn(V2Account::constructFrom(['id' => 'acct_provider_test']));

    $links = Mockery::mock(AccountLinkService::class);
    $links->shouldReceive('create')->once()->with(Mockery::on(
        fn ($params) => $params['account'] === 'acct_provider_test'
    ))->andReturn(AccountLink::constructFrom([
        'url' => 'https://connect.stripe.com/test-onboarding',
        'expires_at' => 1800000000,
    ]));

    $stripe = Mockery::mock(StripeClient::class);
    $core = new CoreServiceFactory($stripe);
    $v2 = new V2ServiceFactory($stripe);
    $services = new ReflectionProperty($core, 'services');
    $services->setValue($core, ['accounts' => $accounts]);
    $services->setValue($v2, ['core' => $core]);
    $stripe->shouldReceive('getService')->with('v2')->andReturn($v2);
    $stripe->shouldReceive('getService')->with('accountLinks')->andReturn($links);
    app()->instance(StripeClient::class, $stripe);

    $this->postJson('/api/stripe/onboarding-link', [])
        ->assertOk()
        ->assertJsonPath('data.stripe_account_id', 'acct_provider_test')
        ->assertJsonPath('data.url', 'https://connect.stripe.com/test-onboarding');

    $this->assertDatabaseHas('users', [
        'id' => $user->id,
        'stripe_account_id' => 'acct_provider_test',
        'phone' => $phone,
    ]);
})->with([
    'Australia' => ['AU', '0412345678', '+61412345678'],
    'India' => ['IN', '9876543210', '+919876543210'],
]);

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

    $accounts = Mockery::mock(V2AccountService::class);
    $accounts->shouldReceive('create')->once()->andThrow(new RuntimeException('Stripe unavailable'));

    $stripe = Mockery::mock(StripeClient::class);
    $core = new CoreServiceFactory($stripe);
    $v2 = new V2ServiceFactory($stripe);
    $services = new ReflectionProperty($core, 'services');
    $services->setValue($core, ['accounts' => $accounts]);
    $services->setValue($v2, ['core' => $core]);

    $stripe->shouldReceive('getService')->with('customers')->andReturn($customers);
    $stripe->shouldReceive('getService')->with('v2')->andReturn($v2);
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
