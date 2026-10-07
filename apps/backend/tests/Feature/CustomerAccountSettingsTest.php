<?php

use App\Models\SupportRequest;
use App\Models\User;
use App\Models\UserNotification;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Laravel\Sanctum\Sanctum;

beforeEach(function () {
    Schema::dropIfExists('support_requests');
    Schema::dropIfExists('user_notifications');
    Schema::dropIfExists('users');

    Schema::create('users', function (Blueprint $table) {
        $table->id();
        $table->string('name');
        $table->string('email')->unique();
        $table->string('password');
        $table->string('user_type')->nullable();
        $table->rememberToken();
        $table->timestamps();
    });

    Schema::create('user_notifications', function (Blueprint $table) {
        $table->id();
        $table->unsignedBigInteger('user_id')->index();
        $table->string('title');
        $table->text('message');
        $table->string('type')->default('general');
        $table->string('action_type')->nullable();
        $table->unsignedBigInteger('action_id')->nullable();
        $table->timestamp('read_at')->nullable();
        $table->timestamps();
    });

    Schema::create('support_requests', function (Blueprint $table) {
        $table->id();
        $table->unsignedBigInteger('user_id')->index();
        $table->string('name');
        $table->string('email');
        $table->string('country_code', 8)->nullable();
        $table->string('phone', 24)->nullable();
        $table->text('message');
        $table->string('status')->default('open');
        $table->timestamps();
    });
});

afterEach(function () {
    Schema::dropIfExists('support_requests');
    Schema::dropIfExists('user_notifications');
    Schema::dropIfExists('users');
});

function accountSettingsUser(string $email = 'customer@example.test'): User
{
    return User::create([
        'name' => 'Customer',
        'email' => $email,
        'password' => Hash::make('old-password'),
        'user_type' => 'client',
    ]);
}

it('submits a support request for the signed-in customer', function () {
    $user = accountSettingsUser();
    Sanctum::actingAs($user);

    $this->postJson('/api/support-requests', [
        'name' => 'Customer Name',
        'email' => 'customer@example.test',
        'country_code' => '91',
        'phone' => '9876543210',
        'message' => 'I need help with a service booking.',
    ])->assertCreated()
        ->assertJsonPath('status', 'success')
        ->assertJsonPath('data.status', 'open');

    expect(SupportRequest::query()->count())->toBe(1)
        ->and(SupportRequest::query()->first()->user_id)->toBe($user->id);
});

it('submits a support request for the signed-in provider', function () {
    $provider = accountSettingsUser('provider@example.test');
    $provider->update([
        'name' => 'Provider',
        'user_type' => 'freelancer',
    ]);
    Sanctum::actingAs($provider);

    $this->postJson('/api/support-requests', [
        'name' => 'Provider Name',
        'email' => 'provider@example.test',
        'country_code' => '91',
        'phone' => '9876543210',
        'message' => 'I need help with an active provider job.',
    ])->assertCreated()
        ->assertJsonPath('status', 'success')
        ->assertJsonPath('data.status', 'open');

    expect(SupportRequest::query()->count())->toBe(1)
        ->and(SupportRequest::query()->first()->user_id)->toBe($provider->id);
});

it('validates support requests and requires authentication', function () {
    $this->postJson('/api/support-requests', [])->assertUnauthorized();

    Sanctum::actingAs(accountSettingsUser());
    $this->postJson('/api/support-requests', [
        'name' => 'Customer',
        'email' => 'invalid',
        'message' => 'short',
    ])->assertStatus(422);
});

it('updates an account password only when the current password is correct', function () {
    $user = accountSettingsUser();
    Sanctum::actingAs($user);

    $this->postJson('/api/account/update-password', [
        'current_password' => 'old-password',
        'new_password' => 'new-password',
        'new_password_confirmation' => 'new-password',
    ])->assertOk()->assertJsonPath('status', 'success');

    expect(Hash::check('new-password', $user->fresh()->password))->toBeTrue();
});

it('rejects an incorrect current password and password reuse', function () {
    $user = accountSettingsUser();
    Sanctum::actingAs($user);

    $this->postJson('/api/account/update-password', [
        'current_password' => 'incorrect',
        'new_password' => 'new-password',
        'new_password_confirmation' => 'new-password',
    ])->assertStatus(400)->assertJsonPath('message', 'Current password is incorrect.');

    $this->postJson('/api/account/update-password', [
        'current_password' => 'old-password',
        'new_password' => 'old-password',
        'new_password_confirmation' => 'old-password',
    ])->assertStatus(400);
});

it('returns only the signed-in users notifications and marks them read', function () {
    $user = accountSettingsUser();
    $other = accountSettingsUser('other@example.test');
    $own = UserNotification::create([
        'user_id' => $user->id,
        'title' => 'Own notification',
        'message' => 'Visible to this customer.',
    ]);
    UserNotification::create([
        'user_id' => $other->id,
        'title' => 'Other notification',
        'message' => 'Must not be returned.',
    ]);

    Sanctum::actingAs($user);
    $this->getJson('/api/notifications')
        ->assertOk()
        ->assertJsonCount(1, 'data.notifications')
        ->assertJsonPath('data.notifications.0.id', $own->id)
        ->assertJsonPath('data.unread_count', 1);

    $this->postJson("/api/notifications/{$own->id}/read")
        ->assertOk()
        ->assertJsonPath('data.is_read', true);

    expect($own->fresh()->read_at)->not->toBeNull();
});

it('does not let a customer read another users notification', function () {
    $user = accountSettingsUser();
    $other = accountSettingsUser('other@example.test');
    $notification = UserNotification::create([
        'user_id' => $other->id,
        'title' => 'Private notification',
        'message' => 'Only the owner can read this.',
    ]);

    Sanctum::actingAs($user);
    $this->postJson("/api/notifications/{$notification->id}/read")->assertNotFound();
    expect($notification->fresh()->read_at)->toBeNull();
});

it('serves structured privacy policy content', function () {
    Sanctum::actingAs(accountSettingsUser());

    $this->getJson('/api/legal/privacy-policy')
        ->assertOk()
        ->assertJsonPath('status', 'success')
        ->assertJsonStructure([
            'data' => ['updated_at', 'title', 'intro', 'sections', 'rights', 'contact_email'],
        ]);
});
