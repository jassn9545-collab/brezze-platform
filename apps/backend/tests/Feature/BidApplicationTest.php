<?php

use App\Models\Bid;
use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Hash;
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
