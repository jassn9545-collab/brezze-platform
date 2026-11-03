<?php

use App\Models\UserDevice;
use App\Services\FirebasePushService;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Schema;

beforeEach(function () {
    Schema::create('user_devices', function (Blueprint $table) {
        $table->id();
        $table->unsignedBigInteger('user_id');
        $table->string('token')->unique();
        $table->string('platform');
        $table->string('app_type');
        $table->boolean('enabled')->default(true);
        $table->timestamp('last_seen_at')->nullable();
        $table->timestamps();
    });
    $this->credentialsPath = tempnam(sys_get_temp_dir(), 'bezzie-push-test-');
    file_put_contents($this->credentialsPath, json_encode(['project_id' => 'test-project', 'client_email' => 'test@example.test', 'private_key' => 'not-used-cached-token']));
    config()->set('services.firebase.credentials', $this->credentialsPath);
    Cache::put('firebase_access_token:'.hash('sha256', 'test-project|test@example.test'), 'fake-access-token', 300);
    $this->device = UserDevice::create(['user_id' => 15, 'token' => 'test-device-token', 'platform' => 'android', 'app_type' => 'provider', 'enabled' => true]);
    Http::preventStrayRequests();
});

afterEach(function () {
    Schema::dropIfExists('user_devices');
    unlink($this->credentialsPath);
});

it('reports missing service account configuration instead of silently claiming delivery', function () {
    config()->set('services.firebase.credentials', '');
    $service = app(FirebasePushService::class);
    expect($service->diagnostics()['configured'])->toBeFalse();
    expect($service->sendToUser(15, 'Title', 'Body')['sent'])->toBe(0);
    Http::assertNothingSent();
});

it('sends the configured Android notification channel and reports successful FCM acceptance', function () {
    Http::fake(['fcm.googleapis.com/*' => Http::response(['name' => 'projects/test-project/messages/test'], 200)]);
    $result = app(FirebasePushService::class)->sendToUser(15, 'Title', 'Body', ['action_id' => 26]);
    expect($result['sent'])->toBe(1)->and($result['devices'])->toBe(1);
    Http::assertSent(fn ($request) => $request['message']['android']['notification']['channel_id'] === 'bezzie_updates'
        && $request['message']['data']['action_id'] === '26');
});

it('keeps a valid registration enabled when a message payload is invalid', function () {
    Http::fake(['fcm.googleapis.com/*' => Http::response(['error' => ['status' => 'INVALID_ARGUMENT', 'details' => [['@type' => 'type.googleapis.com/google.firebase.fcm.v1.FcmError', 'errorCode' => 'INVALID_ARGUMENT']]]], 400)]);
    $result = app(FirebasePushService::class)->sendToUser(15, 'Title', 'Body');
    expect($result['failed'])->toBe(1)->and($result['error'])->toBe('INVALID_ARGUMENT');
    expect($this->device->fresh()->enabled)->toBeTrue();
});

it('disables expired tokens even when FCM error details are not the first detail', function () {
    Http::fake(['fcm.googleapis.com/*' => Http::response(['error' => ['details' => [['@type' => 'other-detail'], ['@type' => 'type.googleapis.com/google.firebase.fcm.v1.FcmError', 'errorCode' => 'UNREGISTERED']]]], 404)]);
    app(FirebasePushService::class)->sendToUser(15, 'Title', 'Body');
    expect($this->device->fresh()->enabled)->toBeFalse();
});
