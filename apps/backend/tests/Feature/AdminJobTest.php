<?php

use App\Models\Bid;
use App\Models\Payment;
use App\Models\Project;
use App\Models\Review;
use App\Models\User;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;

beforeEach(function () {
    Schema::create('settings', function (Blueprint $table) {
        $table->id();
        $table->string('key')->unique();
        $table->text('value')->nullable();
    });

    Schema::create('users', function (Blueprint $table) {
        $table->id();
        $table->string('name');
        $table->string('email')->unique();
        $table->string('password');
        $table->string('user_type');
        $table->string('phone')->nullable();
        $table->string('profile_image')->nullable();
        $table->string('street_address')->nullable();
        $table->string('city')->nullable();
        $table->string('state')->nullable();
        $table->string('country')->nullable();
        $table->string('pincode')->nullable();
        $table->string('is_verified')->nullable();
        $table->text('skills')->nullable();
        $table->string('experience')->nullable();
        $table->rememberToken();
        $table->timestamps();
    });

    Schema::create('projects', function (Blueprint $table) {
        $table->id();
        $table->string('title')->nullable();
        $table->string('slug')->nullable();
        $table->string('category')->nullable();
        $table->text('description')->nullable();
        $table->string('address')->nullable();
        $table->string('city')->nullable();
        $table->string('country')->nullable();
        $table->string('pincode')->nullable();
        $table->string('latitude')->nullable();
        $table->string('longitude')->nullable();
        $table->string('budget')->nullable();
        $table->string('status')->default('active');
        $table->timestamp('created_at')->useCurrent();
        $table->timestamp('modify_id')->useCurrent();
        $table->unsignedBigInteger('user_id')->nullable();
    });

    Schema::create('bids', function (Blueprint $table) {
        $table->id();
        $table->unsignedBigInteger('user_id')->nullable();
        $table->unsignedBigInteger('project_id');
        $table->string('bid_amount')->nullable();
        $table->string('freelancer_name')->nullable();
        $table->string('freelancer_image')->nullable();
        $table->string('attachment')->nullable();
        $table->dateTime('date_time')->nullable();
        $table->boolean('is_hired')->default(false);
        $table->dateTime('modify_at')->nullable();
        $table->dateTime('end_date_time')->nullable();
        $table->string('work_attachment')->nullable();
        $table->text('work_description')->nullable();
        $table->timestamp('created_at')->useCurrent();
    });

    Schema::create('payments', function (Blueprint $table) {
        $table->id();
        $table->unsignedBigInteger('project_id')->unique();
        $table->unsignedBigInteger('customer_id');
        $table->unsignedBigInteger('provider_id');
        $table->string('stripe_payment_intent_id')->nullable();
        $table->string('transaction_id')->nullable();
        $table->string('currency')->default('aud');
        $table->unsignedBigInteger('amount_minor')->default(0);
        $table->unsignedBigInteger('commission_minor')->default(0);
        $table->unsignedBigInteger('provider_earnings_minor')->default(0);
        $table->decimal('amount', 10, 2)->default(0);
        $table->decimal('commission_amount', 10, 2)->default(0);
        $table->decimal('provider_earnings', 10, 2)->default(0);
        $table->decimal('commission_rate', 5, 2)->default(10);
        $table->string('status')->default('pending');
        $table->unsignedInteger('attempts')->default(0);
        $table->string('failure_code')->nullable();
        $table->text('failure_message')->nullable();
        $table->timestamp('paid_at')->nullable();
        $table->timestamp('failed_at')->nullable();
        $table->timestamp('cancelled_at')->nullable();
        $table->timestamps();
    });

    Schema::create('categories', function (Blueprint $table) {
        $table->id();
        $table->string('name')->nullable();
        $table->string('slug')->nullable();
        $table->string('photo')->nullable();
        $table->timestamp('created_at')->useCurrent();
        $table->timestamp('modify_at')->useCurrent();
    });

    Schema::create('project_images', function (Blueprint $table) {
        $table->id();
        $table->unsignedBigInteger('project_id');
        $table->string('image')->nullable();
        $table->timestamp('created_at')->useCurrent();
    });

    Schema::create('reviews', function (Blueprint $table) {
        $table->id();
        $table->unsignedBigInteger('given_by');
        $table->unsignedBigInteger('given_to');
        $table->unsignedBigInteger('job_id');
        $table->unsignedTinyInteger('star');
        $table->text('review')->nullable();
        $table->string('review_to');
        $table->timestamps();
    });

    $this->admin = User::create([
        'name' => 'Admin',
        'email' => 'admin-jobs@example.test',
        'password' => Hash::make('password'),
        'user_type' => 'admin',
    ]);
    $this->customer = User::create([
        'name' => 'Customer Test',
        'email' => 'customer-jobs@example.test',
        'password' => Hash::make('password'),
        'user_type' => 'client',
        'phone' => '0400000001',
        'is_verified' => '1',
    ]);
    $this->provider = User::create([
        'name' => 'Provider Test',
        'email' => 'provider-jobs@example.test',
        'password' => Hash::make('password'),
        'user_type' => 'freelancer',
        'phone' => '0400000002',
        'is_verified' => '1',
        'skills' => 'Plumbing',
    ]);

    $this->openJob = Project::create([
        'title' => 'Open plumbing work',
        'slug' => 'open-plumbing-work',
        'category' => '1',
        'description' => 'Repair a leaking pipe.',
        'address' => '10 Test Street',
        'city' => 'Sydney',
        'country' => 'Australia',
        'pincode' => '2000',
        'budget' => '120',
        'status' => 'active',
        'user_id' => $this->customer->id,
    ]);
    $this->progressJob = Project::create([
        'title' => 'Assigned electrical work',
        'slug' => 'assigned-electrical-work',
        'category' => '2',
        'budget' => '240',
        'status' => 'in progress',
        'user_id' => $this->customer->id,
    ]);
    $this->closedJob = Project::create([
        'title' => 'Completed painting work',
        'slug' => 'completed-painting-work',
        'category' => '1',
        'description' => 'Paint the living room.',
        'budget' => '300',
        'status' => 'completed',
        'user_id' => $this->customer->id,
    ]);

    Bid::create([
        'user_id' => $this->provider->id,
        'project_id' => $this->closedJob->id,
        'bid_amount' => '280',
        'freelancer_name' => $this->provider->name,
        'date_time' => now(),
        'is_hired' => true,
        'work_description' => 'Painting completed.',
        'end_date_time' => now(),
    ]);

    Payment::create([
        'project_id' => $this->closedJob->id,
        'customer_id' => $this->customer->id,
        'provider_id' => $this->provider->id,
        'transaction_id' => 'txn_admin_job_test',
        'currency' => 'aud',
        'amount' => 280,
        'commission_amount' => 28,
        'provider_earnings' => 252,
        'status' => Payment::STATUS_SUCCEEDED,
        'paid_at' => now(),
    ]);

    Review::create([
        'given_by' => $this->customer->id,
        'given_to' => $this->provider->id,
        'job_id' => $this->closedJob->id,
        'star' => 5,
        'review' => 'Excellent work.',
        'review_to' => 'freelancer',
    ]);

    $this->actingAs($this->admin);
});

afterEach(function () {
    Schema::dropIfExists('reviews');
    Schema::dropIfExists('project_images');
    Schema::dropIfExists('categories');
    Schema::dropIfExists('payments');
    Schema::dropIfExists('bids');
    Schema::dropIfExists('projects');
    Schema::dropIfExists('users');
    Schema::dropIfExists('settings');
});

it('renders all, open, and closed job pages with accurate summary counts', function () {
    $this->get(route('admin.jobs.index'))
        ->assertOk()
        ->assertSee('All Jobs')
        ->assertViewHas('allCount', 3)
        ->assertViewHas('openCount', 1)
        ->assertViewHas('inProgressCount', 1)
        ->assertViewHas('closedCount', 1);

    $this->get(route('admin.jobs.open'))->assertOk()->assertSee('Open Jobs');
    $this->get(route('admin.jobs.closed'))->assertOk()->assertSee('Closed Jobs');
});

it('returns correctly filtered server-side job lists', function () {
    $this->postJson(route('admin.jobs.job_list'), [
        'draw' => 1,
        'scope' => 'open',
        'start' => 0,
        'length' => 25,
    ])->assertOk()
        ->assertJsonPath('recordsTotal', 1)
        ->assertJsonPath('recordsFiltered', 1)
        ->assertJsonCount(1, 'data')
        ->assertJsonFragment(['<strong>Open plumbing work</strong>']);

    $this->postJson(route('admin.jobs.job_list'), [
        'draw' => 2,
        'scope' => 'closed',
        'start' => 0,
        'length' => 25,
    ])->assertOk()
        ->assertJsonPath('recordsTotal', 1)
        ->assertJsonCount(1, 'data')
        ->assertJsonFragment(['<strong>Completed painting work</strong>']);
});

it('renders complete customer provider bid payment and review details', function () {
    $this->get(route('admin.jobs.project_view', $this->closedJob->id))
        ->assertOk()
        ->assertSee('Completed painting work')
        ->assertSee('Customer Test')
        ->assertSee('Provider Test')
        ->assertSee('AUD 280.00')
        ->assertSee('AUD 28.00')
        ->assertSee('Excellent work.')
        ->assertSee('Painting completed.');
});

it('does not crash the job list when a customer account is missing', function () {
    Project::create([
        'title' => 'Orphaned job',
        'budget' => '50',
        'status' => 'active',
        'user_id' => 999999,
    ]);

    $this->postJson(route('admin.jobs.job_list'), [
        'draw' => 3,
        'scope' => 'all',
        'start' => 0,
        'length' => 25,
        'search' => ['value' => 'Orphaned job'],
    ])->assertOk()
        ->assertJsonPath('recordsFiltered', 1)
        ->assertJsonFragment(['<span class="text-muted">Deleted client</span>']);
});
