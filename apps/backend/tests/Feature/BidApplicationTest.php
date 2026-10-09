<?php

use App\Models\Bid;
use App\Models\Project;
use App\Models\User;
use App\Models\UserNotification;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Schema;
use Laravel\Sanctum\Sanctum;

beforeEach(function () {
    Schema::create('users', function (Blueprint $table) {
        $table->id();
        $table->string('name');
        $table->string('email')->unique();
        $table->string('password');
        $table->string('user_type');
        $table->string('profile_image')->nullable();
        $table->rememberToken();
        $table->timestamps();
    });
    Schema::create('projects', function (Blueprint $table) {
        $table->id();
        $table->string('title');
        $table->string('slug')->nullable();
        $table->string('category')->nullable();
        $table->text('description')->nullable();
        $table->string('address')->nullable();
        $table->string('city')->nullable();
        $table->string('country')->nullable();
        $table->string('pincode')->nullable();
        $table->string('latitude')->nullable();
        $table->string('longitude')->nullable();
        $table->string('budget');
        $table->string('status')->default('active');
        $table->unsignedBigInteger('user_id');
    });
    Schema::create('bids', function (Blueprint $table) {
        $table->id();
        $table->unsignedBigInteger('user_id');
        $table->unsignedBigInteger('project_id');
        $table->string('bid_amount');
        $table->string('freelancer_name')->nullable();
        $table->string('freelancer_image')->nullable();
        $table->string('attachment')->nullable();
        $table->dateTime('date_time')->nullable();
        $table->boolean('is_hired')->default(false);
        $table->dateTime('modify_at')->nullable();
        $table->dateTime('end_date_time')->nullable();
        $table->string('work_attachment')->nullable();
        $table->text('work_description')->nullable();
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

    $this->client = User::create([
        'name' => 'Customer',
        'email' => 'customer-bid@example.test',
        'password' => Hash::make('password'),
        'user_type' => 'client',
    ]);
    $this->provider = User::create([
        'name' => 'Provider',
        'email' => 'provider-bid@example.test',
        'password' => Hash::make('password'),
        'user_type' => 'freelancer',
    ]);
    $this->project = Project::create([
        'title' => 'Repair the wall',
        'budget' => '32',
        'status' => 'active',
        'user_id' => $this->client->id,
    ]);

    Sanctum::actingAs($this->provider);
});

afterEach(function () {
    Schema::dropIfExists('user_notifications');
    Schema::dropIfExists('bids');
    Schema::dropIfExists('projects');
    Schema::dropIfExists('users');
});

it('accepts a positive bid below the customer budget', function () {
    $this->postJson('/api/freelancer/apply-job', [
        'project_id' => $this->project->id,
        'bid_amount' => '31',
    ])->assertOk()
        ->assertJsonPath('status', 'success')
        ->assertJsonPath('data.bid_amount', '31')
        ->assertJsonPath('data.already_applied', false);

    expect(Bid::query()->count())->toBe(1);
    expect(UserNotification::query()
        ->where('user_id', $this->client->id)
        ->where('type', 'job_application')
        ->where('action_type', 'project')
        ->where('action_id', $this->project->id)
        ->count())->toBe(1);
});

it('treats a repeated application as an idempotent success', function () {
    $payload = [
        'project_id' => $this->project->id,
        'bid_amount' => '31',
    ];

    $this->postJson('/api/freelancer/apply-job', $payload)->assertOk();
    $this->postJson('/api/freelancer/apply-job', $payload)
        ->assertOk()
        ->assertJsonPath('message', 'You have already applied for this job.')
        ->assertJsonPath('data.already_applied', true)
        ->assertJsonPath('data.bid_amount', '31');

    expect(Bid::query()->count())->toBe(1);
    expect(UserNotification::query()->where('user_id', $this->client->id)->count())->toBe(1);
});

it('rejects invalid bid amounts before creating a bid', function (string $amount) {
    $this->postJson('/api/freelancer/apply-job', [
        'project_id' => $this->project->id,
        'bid_amount' => $amount,
    ])->assertStatus(400);

    expect(Bid::query()->count())->toBe(0);
})->with(['0', '-1', 'not-a-number', '12.345']);

it('keeps a successful application successful when notification storage is unavailable', function () {
    Schema::dropIfExists('user_notifications');

    $this->postJson('/api/freelancer/apply-job', [
        'project_id' => $this->project->id,
        'bid_amount' => '31',
    ])->assertOk()
        ->assertJsonPath('status', 'success');

    expect(Bid::query()->count())->toBe(1);
});

it('returns an existing application even after the job stops accepting bids', function () {
    Bid::create([
        'project_id' => $this->project->id,
        'user_id' => $this->provider->id,
        'bid_amount' => '31',
        'date_time' => now(),
        'is_hired' => true,
    ]);
    $this->project->update(['status' => 'in progress']);

    $this->postJson('/api/freelancer/apply-job', [
        'project_id' => $this->project->id,
        'bid_amount' => '31',
    ])->assertOk()
        ->assertJsonPath('data.already_applied', true)
        ->assertJsonPath('data.bid_amount', '31');
});

it('treats retrying the same hire as an idempotent success', function () {
    Mail::fake();
    $bid = Bid::create([
        'project_id' => $this->project->id,
        'user_id' => $this->provider->id,
        'bid_amount' => '31',
        'date_time' => now(),
        'is_hired' => false,
    ]);
    Sanctum::actingAs($this->client);

    $payload = ['job_id' => $this->project->id, 'bid_id' => $bid->id];

    $this->postJson('/api/client/hire-now', $payload)
        ->assertOk()
        ->assertJsonPath('data.already_hired', false)
        ->assertJsonPath('data.hired_bid_id', $bid->id)
        ->assertJsonPath('data.job.status', 'in progress')
        ->assertJsonPath('data.job.bids.0.is_hired', true);

    $this->postJson('/api/client/hire-now', $payload)
        ->assertOk()
        ->assertJsonPath('message', 'This provider is already hired for this job.')
        ->assertJsonPath('data.already_hired', true)
        ->assertJsonPath('data.hired_bid_id', $bid->id);

    expect(Bid::query()->where('project_id', $this->project->id)->where('is_hired', true)->count())
        ->toBe(1);
});

it('rejects hiring a different provider after a provider is selected', function () {
    Mail::fake();
    $otherProvider = User::create([
        'name' => 'Other Provider',
        'email' => 'other-provider-bid@example.test',
        'password' => Hash::make('password'),
        'user_type' => 'freelancer',
    ]);
    $firstBid = Bid::create([
        'project_id' => $this->project->id,
        'user_id' => $this->provider->id,
        'bid_amount' => '31',
        'is_hired' => false,
    ]);
    $secondBid = Bid::create([
        'project_id' => $this->project->id,
        'user_id' => $otherProvider->id,
        'bid_amount' => '30',
        'is_hired' => false,
    ]);
    Sanctum::actingAs($this->client);

    $this->postJson('/api/client/hire-now', [
        'job_id' => $this->project->id,
        'bid_id' => $firstBid->id,
    ])->assertOk();

    $this->postJson('/api/client/hire-now', [
        'job_id' => $this->project->id,
        'bid_id' => $secondBid->id,
    ])->assertStatus(409)
        ->assertJsonPath('message', 'Another provider has already been hired for this job.');

    expect($firstBid->fresh()->is_hired)->toBeTrue()
        ->and($secondBid->fresh()->is_hired)->toBeFalse();
});
