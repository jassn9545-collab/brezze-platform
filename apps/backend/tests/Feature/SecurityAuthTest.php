<?php

use App\Http\Middleware\EnsureAdmin;
use App\Models\User;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Schema;

beforeEach(function () {
    Schema::create('users', function (Blueprint $table) {
        $table->id();
        $table->string('name');
        $table->string('email')->unique();
        $table->string('password');
        $table->string('user_type')->nullable();
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

    Mail::fake();
});

afterEach(function () {
    Schema::dropIfExists('personal_access_tokens');
    Schema::dropIfExists('users');
});

it('requires a one-time token before a password can be reset', function () {
    $user = User::create([
        'name' => 'Reset User',
        'email' => 'reset@example.test',
        'password' => Hash::make('old-password'),
        'user_type' => 'client',
    ]);

    Cache::put(
        'password_reset_otp_' . $user->id,
        Hash::make('123456'),
        now()->addMinutes(5)
    );

    $verification = $this->postJson('/api/forget-password-otp-verification', [
        'user_id' => $user->id,
        'otp' => '123456',
    ])->assertOk();

    $resetToken = $verification->json('data.reset_token');
    expect($resetToken)->toBeString()->toHaveLength(64);

    $payload = [
        'user_id' => $user->id,
        'reset_token' => $resetToken,
        'new_password' => 'new-password',
        'confirmed_password' => 'new-password',
    ];

    $this->postJson('/api/update-password', $payload)->assertOk();
    expect(Hash::check('new-password', $user->fresh()->password))->toBeTrue();

    $this->postJson('/api/update-password', $payload)
        ->assertStatus(400)
        ->assertJsonPath('message', 'Invalid or expired password reset token.');
});

it('does not let a normal user sign in to the admin panel', function () {
    User::create([
        'name' => 'Client User',
        'email' => 'client@example.test',
        'password' => Hash::make('password'),
        'user_type' => 'client',
    ]);

    $this->postJson('/admin/login', [
        'email' => 'client@example.test',
        'password' => 'password',
    ])->assertUnauthorized();
});

it('allows an administrator through the admin middleware', function () {
    $admin = User::create([
        'name' => 'Admin User',
        'email' => 'admin@example.test',
        'password' => Hash::make('password'),
        'user_type' => 'admin',
    ]);

    $this->postJson('/admin/login', [
        'email' => 'admin@example.test',
        'password' => 'password',
    ])->assertOk();

    $request = Request::create('/admin/dashboard');
    $request->setUserResolver(fn () => $admin);

    $response = (new EnsureAdmin())->handle(
        $request,
        fn () => response('allowed')
    );

    expect($response->getContent())->toBe('allowed');
});
