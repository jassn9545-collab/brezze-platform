<?php

use App\Models\User;
use App\Models\UserDevice;
use App\Services\FirebasePushService;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

beforeEach(function () {
    Schema::create('users', function (Blueprint $table) {
        $table->id();
        $table->string('name');
        $table->string('email')->nullable();
        $table->string('user_type');
        $table->timestamps();
    });
    Schema::create('user_devices', function (Blueprint $table) {
        $table->id();
        $table->unsignedBigInteger('user_id');
        $table->string('token');
        $table->string('platform');
        $table->string('app_type');
        $table->boolean('enabled')->default(true);
        $table->timestamp('last_seen_at')->nullable();
        $table->timestamps();
    });
});

afterEach(function () {
    Schema::dropIfExists('user_devices');
    Schema::dropIfExists('users');
});

it('requires an admin session for push diagnostics and test sends', function () {
    $this->get('/admin/push-diagnostics')->assertRedirect('/admin');
    $provider = User::create(['name' => 'Provider', 'user_type' => 'freelancer']);
    $this->actingAs($provider)->get('/admin/push-diagnostics')->assertForbidden();
    $this->post('/admin/push-diagnostics/test', ['user_id' => $provider->id])->assertForbidden();
});

it('shows device registration and configuration without exposing credentials or tokens', function () {
    $admin = User::create(['name' => 'Admin', 'user_type' => 'admin']);
    UserDevice::create([
        'user_id' => $admin->id, 'token' => 'must-not-display-token', 'platform' => 'android',
        'app_type' => 'provider', 'enabled' => true, 'last_seen_at' => now(),
    ]);
    UserDevice::create([
        'user_id' => $admin->id, 'token' => 'customer-token-must-stay-private', 'platform' => 'android',
        'app_type' => 'customer', 'enabled' => true, 'last_seen_at' => now(),
    ]);
    $firebase = Mockery::mock(FirebasePushService::class);
    $firebase->shouldReceive('diagnostics')->once()->andReturn([
        'configured' => true, 'project_id' => 'our-bezzie-42461',
        'matches_mobile_project' => true, 'openssl_available' => true,
    ]);
    app()->instance(FirebasePushService::class, $firebase);
    $this->actingAs($admin)->get('/admin/push-diagnostics')->assertOk()
        ->assertSee('our-bezzie-42461')->assertSee('Registered devices')
        ->assertSee('Our Bezzie Provider')->assertSee('Our Bezzie')
        ->assertSee('(customer)')->assertSee('(provider)')
        ->assertDontSee('must-not-display-token')->assertDontSee('customer-token-must-stay-private');
});

it('only sends an explicitly requested test and exposes the delivery result to the admin', function () {
    $admin = User::create(['name' => 'Admin', 'user_type' => 'admin']);
    $firebase = Mockery::mock(FirebasePushService::class);
    $firebase->shouldReceive('sendToUser')->once()->with(
        $admin->id, 'Bezzie notification test', 'Push notifications are connected.', ['type' => 'test']
    )->andReturn(['sent' => 0, 'failed' => 1, 'devices' => 1, 'error' => 'SENDER_ID_MISMATCH']);
    app()->instance(FirebasePushService::class, $firebase);
    $this->actingAs($admin)->post('/admin/push-diagnostics/test', ['user_id' => $admin->id])
        ->assertRedirect('/admin/push-diagnostics')->assertSessionHas('push_result.error', 'SENDER_ID_MISMATCH');
});
