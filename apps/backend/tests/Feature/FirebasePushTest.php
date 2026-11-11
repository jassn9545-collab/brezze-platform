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

it('refreshes rejected cached OAuth credentials and retries delivery once', function () {
    $key = openssl_pkey_new(['private_key_bits' => 2048]);
    openssl_pkey_export($key, $privateKey);
    file_put_contents($this->credentialsPath, json_encode([
        'project_id' => 'test-project', 'client_email' => 'test@example.test', 'private_key' => $privateKey,
    ]));
    Http::fake([
        'oauth2.googleapis.com/token' => Http::response(['access_token' => 'refreshed-access-token'], 200),
        'fcm.googleapis.com/*' => Http::sequence()
            ->push(['error' => ['status' => 'UNAUTHENTICATED']], 401)
            ->push(['name' => 'projects/test-project/messages/retried'], 200),
    ]);

    $result = app(FirebasePushService::class)->sendToUser(15, 'Title', 'Body');

    expect($result['sent'])->toBe(1)->and($result['failed'])->toBe(0);
    Http::assertSentCount(3);
    Http::assertSent(fn ($request) => str_contains($request->url(), 'fcm.googleapis.com')
        && $request->hasHeader('Authorization', 'Bearer refreshed-access-token'));
    expect($this->device->fresh()->enabled)->toBeTrue();
});

it('reports an account without devices as a registration problem', function () {
    $result = app(FirebasePushService::class)->sendToUser(99, 'Title', 'Body');
    expect($result['devices'])->toBe(0)->and($result['error'])->toContain('No enabled devices');
    Http::assertNothingSent();
});

it('only pushes events from hire through work submission', function (string $type, bool $push) {
    $firebase = Mockery::mock(FirebasePushService::class);
    if ($push) {
        $firebase->shouldReceive('sendToUser')->once()->with(
            15, 'Job update', 'Job status changed.',
            ['type' => $type, 'action_type' => 'project', 'action_id' => 26],
        )->andReturn(['sent' => 1, 'failed' => 0, 'devices' => 1, 'error' => null]);
    } else {
        $firebase->shouldNotReceive('sendToUser');
    }
    app()->instance(FirebasePushService::class, $firebase);

    app(\App\Services\RealtimeNotifier::class)->notify(15, 'Job update', 'Job status changed.', $type, 'project', 26);
})->with([
    ['job_in_progress', true],
    ['work_submitted', true],
    ['new_job', false],
    ['job_application', false],
    ['chat_message', false],
    ['job_completed', false],
    ['payment_succeeded', false],
    ['review_received', false],
    ['service_booking_created', false],
    ['service_booking_rejected', false],
]);
