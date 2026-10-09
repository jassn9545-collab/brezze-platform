<?php

use App\Models\Bid;
use App\Models\Project;
use App\Models\Review;
use App\Models\User;
use App\Models\UserNotification;
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
        $table->string('skills')->nullable();
        $table->rememberToken();
        $table->timestamps();
    });

    Schema::create('user_proofs', function (Blueprint $table) {
        $table->id();
        $table->unsignedBigInteger('user_id');
        $table->boolean('is_verified')->default(false);
    });

    Schema::create('categories', function (Blueprint $table) {
        $table->id();
        $table->string('name');
    });

    Schema::create('projects', function (Blueprint $table) {
        $table->increments('id');
        $table->string('title');
        $table->text('description')->nullable();
        $table->string('budget')->nullable();
        $table->string('status');
        $table->unsignedBigInteger('user_id');
    });

    Schema::create('bids', function (Blueprint $table) {
        $table->increments('id');
        $table->unsignedInteger('project_id');
        $table->unsignedBigInteger('user_id');
        $table->string('bid_amount');
        $table->boolean('is_hired')->default(false);
    });

    Schema::create('reviews', function (Blueprint $table) {
        $table->id();
        $table->unsignedBigInteger('given_by');
        $table->unsignedBigInteger('given_to');
        $table->unsignedInteger('job_id');
        $table->unsignedTinyInteger('star');
        $table->text('review')->nullable();
        $table->string('review_to');
        $table->timestamps();
    });

    Schema::create('user_notifications', function (Blueprint $table) {
        $table->id();
        $table->unsignedBigInteger('user_id')->index();
        $table->string('title');
        $table->text('message');
        $table->string('type')->index();
        $table->string('action_type')->nullable();
        $table->unsignedBigInteger('action_id')->nullable();
        $table->timestamp('read_at')->nullable();
        $table->timestamps();
    });

    Schema::create('payments', function (Blueprint $table) {
        $table->id();
        $table->unsignedBigInteger('provider_id');
        $table->string('status');
        $table->decimal('provider_earnings', 12, 2)->default(0);
    });

    $this->customer = User::create([
        'name' => 'Customer',
        'email' => 'customer@review.test',
        'password' => Hash::make('password'),
        'user_type' => 'client',
    ]);
    $this->provider = User::create([
        'name' => 'Provider',
        'email' => 'provider@review.test',
        'password' => Hash::make('password'),
        'user_type' => 'freelancer',
    ]);
    $this->job = Project::create([
        'title' => 'Completed test job',
        'description' => 'Test job',
        'budget' => '34.00',
        'status' => 'completed',
        'user_id' => $this->customer->id,
    ]);
    Bid::create([
        'project_id' => $this->job->id,
        'user_id' => $this->provider->id,
        'bid_amount' => '34.00',
        'is_hired' => true,
    ]);
});

afterEach(function () {
    Schema::dropIfExists('payments');
    Schema::dropIfExists('user_notifications');
    Schema::dropIfExists('reviews');
    Schema::dropIfExists('bids');
    Schema::dropIfExists('projects');
    Schema::dropIfExists('categories');
    Schema::dropIfExists('user_proofs');
    Schema::dropIfExists('users');
});

it('allows a customer to review the hired provider after completion', function () {
    Sanctum::actingAs($this->customer);

    $this->postJson('/api/submit-review', [
        'project_id' => $this->job->id,
        'star' => 5,
        'review' => 'Great service.',
    ])->assertOk()
        ->assertJsonPath('status', 'success')
        ->assertJsonPath('data.given_by', $this->customer->id)
        ->assertJsonPath('data.given_to', $this->provider->id)
        ->assertJsonPath('data.review_to', 'freelancer');

    expect(Review::query()->count())->toBe(1);
    expect(UserNotification::query()
        ->where('user_id', $this->provider->id)
        ->where('type', 'review_received')
        ->where('action_id', $this->job->id)
        ->exists())->toBeTrue();
});

it('returns the current users review status and submitted review', function () {
    Sanctum::actingAs($this->customer);

    $this->getJson("/api/reviews/projects/{$this->job->id}")
        ->assertOk()
        ->assertJsonPath('status', 'success')
        ->assertJsonPath('data.can_review', true)
        ->assertJsonPath('data.has_reviewed', false)
        ->assertJsonPath('data.review', null);

    $review = Review::create([
        'given_by' => $this->customer->id,
        'given_to' => $this->provider->id,
        'job_id' => $this->job->id,
        'star' => 5,
        'review' => 'Already submitted feedback.',
        'review_to' => 'freelancer',
    ]);

    $this->getJson("/api/reviews/projects/{$this->job->id}")
        ->assertOk()
        ->assertJsonPath('data.can_review', false)
        ->assertJsonPath('data.has_reviewed', true)
        ->assertJsonPath('data.review.id', $review->id)
        ->assertJsonPath('data.review.review', 'Already submitted feedback.');
});

it('returns review eligibility on the customer completed job detail', function () {
    Sanctum::actingAs($this->customer);

    $this->postJson('/api/client/job-details', ['job_id' => $this->job->id])
        ->assertOk()
        ->assertJsonPath('data.job.can_review', true)
        ->assertJsonPath('data.job.has_reviewed', false);

    Review::create([
        'given_by' => $this->customer->id,
        'given_to' => $this->provider->id,
        'job_id' => $this->job->id,
        'star' => 5,
        'review' => 'Completed review.',
        'review_to' => 'freelancer',
    ]);

    $this->postJson('/api/client/job-details', ['job_id' => $this->job->id])
        ->assertOk()
        ->assertJsonPath('data.job.can_review', false)
        ->assertJsonPath('data.job.has_reviewed', true);
});

it('returns the existing review when submission is retried', function () {
    Sanctum::actingAs($this->customer);

    $payload = [
        'project_id' => $this->job->id,
        'star' => 5,
        'review' => 'Great service.',
    ];

    $firstReviewId = $this->postJson('/api/submit-review', $payload)
        ->assertOk()
        ->json('data.id');

    $this->postJson('/api/submit-review', $payload)
        ->assertOk()
        ->assertJsonPath('status', 'success')
        ->assertJsonPath('data.id', $firstReviewId)
        ->assertJsonPath('data.already_reviewed', true);

    expect(Review::query()->count())->toBe(1);
});

it('allows the hired provider to review the customer after completion', function () {
    Sanctum::actingAs($this->provider);

    $reviewId = $this->postJson('/api/submit-review', [
        'project_id' => $this->job->id,
        'star' => 4,
        'review' => 'Clear requirements.',
    ])->assertOk()
        ->assertJsonPath('data.given_by', $this->provider->id)
        ->assertJsonPath('data.given_to', $this->customer->id)
        ->assertJsonPath('data.review_to', 'client')
        ->json('data.id');

    expect(UserNotification::query()
        ->where('user_id', $this->customer->id)
        ->where('type', 'review_received')
        ->where('action_id', $this->job->id)
        ->exists())->toBeTrue();

    Sanctum::actingAs($this->customer);
    $this->postJson('/api/client/my-profile')
        ->assertOk()
        ->assertJsonPath('data.profile.avg_rating', 4)
        ->assertJsonPath('data.profile.review_count', 1)
        ->assertJsonPath('data.profile.reviews.0.id', $reviewId)
        ->assertJsonPath('data.profile.reviews.0.reviewer.name', 'Provider')
        ->assertJsonPath('data.profile.reviews.0.review', 'Clear requirements.');
});

it('rejects a review while the project is not completed', function () {
    $this->job->update(['status' => 'in progress']);
    Sanctum::actingAs($this->customer);

    $this->postJson('/api/submit-review', [
        'project_id' => $this->job->id,
        'star' => 5,
        'review' => 'Too early.',
    ])->assertStatus(400)
        ->assertJsonPath('message', 'You can only review completed projects.');

    expect(Review::query()->count())->toBe(0);
});

it('returns real provider review totals and reviewer details on both profile APIs', function () {
    Review::create([
        'given_by' => $this->customer->id,
        'given_to' => $this->provider->id,
        'job_id' => $this->job->id,
        'star' => 5,
        'review' => 'Real customer feedback.',
        'review_to' => 'freelancer',
    ]);

    Sanctum::actingAs($this->customer);
    $this->postJson('/api/client/freelancer-profile', [
        'id' => $this->provider->id,
    ])->assertOk()
        ->assertJsonPath('data.profile.avg_rating', 5)
        ->assertJsonPath('data.profile.review_count', 1)
        ->assertJsonPath('data.profile.reviews.0.reviewer.name', 'Customer')
        ->assertJsonPath('data.profile.reviews.0.review', 'Real customer feedback.');

    Sanctum::actingAs($this->provider);
    $this->postJson('/api/freelancer/my-profile')
        ->assertOk()
        ->assertJsonPath('data.avg_rating', 5)
        ->assertJsonPath('data.review_count', 1)
        ->assertJsonPath('data.reviews.0.reviewer.name', 'Customer')
        ->assertJsonPath('data.reviews.0.job.title', 'Completed test job');
});
