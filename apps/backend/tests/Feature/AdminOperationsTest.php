<?php

use App\Models\Bid;
use App\Models\Dispute;
use App\Models\Payment;
use App\Models\Project;
use App\Models\Review;
use App\Models\ServiceBooking;
use App\Models\ServiceCatalog;
use App\Models\User;
use App\Models\UserProof;
use App\Models\WithdrawalRequest;
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
        $table->date('dob')->nullable();
        $table->string('phone')->nullable();
        $table->string('gender')->nullable();
        $table->string('user_type');
        $table->string('alternate_phone')->nullable();
        $table->integer('is_verified')->default(0);
        $table->boolean('is_featured')->default(false);
        $table->string('refral_code')->nullable();
        $table->string('refrence')->nullable();
        $table->string('latitude')->nullable();
        $table->string('longitude')->nullable();
        $table->text('skills')->nullable();
        $table->string('experience')->nullable();
        $table->string('street_address')->nullable();
        $table->string('city')->nullable();
        $table->string('state')->nullable();
        $table->string('country')->nullable();
        $table->string('pincode')->nullable();
        $table->string('profile_image')->nullable();
        $table->string('profile_title')->nullable();
        $table->text('profile_description')->nullable();
        $table->string('stripe_account_id')->nullable();
        $table->string('stripe_customer_id')->nullable();
        $table->rememberToken();
        $table->timestamps();
    });
    Schema::create('user_proofs', function (Blueprint $table) {
        $table->id();
        $table->unsignedBigInteger('user_id');
        $table->string('proof_type')->nullable();
        $table->string('id_number')->nullable();
        $table->date('expiry_date')->nullable();
        $table->string('front_image')->nullable();
        $table->string('back_image')->nullable();
        $table->integer('is_verified')->default(0);
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
        $table->decimal('budget', 10, 2)->nullable();
        $table->string('status')->default('active');
        $table->timestamp('created_at')->useCurrent();
        $table->timestamp('modify_id')->nullable();
        $table->unsignedBigInteger('user_id')->nullable();
    });
    Schema::create('bids', function (Blueprint $table) {
        $table->id();
        $table->unsignedBigInteger('user_id')->nullable();
        $table->unsignedBigInteger('project_id');
        $table->decimal('bid_amount', 10, 2)->nullable();
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
        $table->timestamps();
    });
    Schema::create('service_catalogs', function (Blueprint $table) {
        $table->id();
        $table->unsignedBigInteger('provider_id');
        $table->unsignedBigInteger('category_id')->nullable();
        $table->string('heading');
        $table->text('description')->nullable();
        $table->decimal('price', 10, 2)->default(0);
        $table->json('images')->nullable();
        $table->boolean('status')->default(true);
        $table->timestamps();
    });
    Schema::create('service_bookings', function (Blueprint $table) {
        $table->id();
        $table->unsignedBigInteger('service_catalog_id');
        $table->unsignedBigInteger('client_id');
        $table->unsignedBigInteger('provider_id');
        $table->text('note')->nullable();
        $table->decimal('price', 10, 2)->default(0);
        $table->string('status')->default('pending');
        $table->unsignedBigInteger('project_id')->nullable();
        $table->unsignedBigInteger('conversation_id')->nullable();
        $table->timestamp('responded_at')->nullable();
        $table->timestamps();
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
    Schema::create('disputes', function (Blueprint $table) {
        $table->id();
        $table->unsignedBigInteger('project_id');
        $table->unsignedBigInteger('payment_id')->nullable();
        $table->unsignedBigInteger('opened_by');
        $table->unsignedBigInteger('against_user_id')->nullable();
        $table->string('subject');
        $table->text('description');
        $table->string('priority')->default('normal');
        $table->string('status')->default('open');
        $table->text('resolution_notes')->nullable();
        $table->unsignedBigInteger('resolved_by')->nullable();
        $table->timestamp('resolved_at')->nullable();
        $table->timestamps();
    });
    Schema::create('withdrawal_requests', function (Blueprint $table) {
        $table->id();
        $table->unsignedBigInteger('provider_id');
        $table->decimal('requested_amount', 12, 2);
        $table->string('currency', 3)->default('aud');
        $table->string('status')->default('pending');
        $table->string('payment_reference')->nullable();
        $table->text('provider_notes')->nullable();
        $table->text('admin_notes')->nullable();
        $table->unsignedBigInteger('processed_by')->nullable();
        $table->timestamp('processed_at')->nullable();
        $table->timestamps();
    });

    $this->admin = User::create(['name' => 'Admin', 'email' => 'admin-operations@example.test', 'password' => Hash::make('password'), 'user_type' => 'admin']);
    $this->client = User::create(['name' => 'Client Account', 'email' => 'client-operations@example.test', 'password' => Hash::make('password'), 'user_type' => 'client', 'phone' => '0400000001', 'is_verified' => 1, 'stripe_customer_id' => 'cus_test']);
    $this->provider = User::create(['name' => 'Professional Account', 'email' => 'provider-operations@example.test', 'password' => Hash::make('password'), 'user_type' => 'freelancer', 'phone' => '0400000002', 'skills' => 'Plumbing', 'experience' => '5 years', 'profile_title' => 'Licensed Plumber', 'stripe_account_id' => 'acct_test']);
    UserProof::create(['user_id' => $this->provider->id, 'proof_type' => 'driver_license', 'id_number' => 'TEST-123', 'is_verified' => 0]);

    $this->project = Project::create(['title' => 'Bathroom plumbing', 'slug' => 'bathroom-plumbing', 'budget' => 300, 'status' => 'completed', 'user_id' => $this->client->id]);
    Bid::create(['user_id' => $this->provider->id, 'project_id' => $this->project->id, 'bid_amount' => 280, 'freelancer_name' => $this->provider->name, 'date_time' => now(), 'is_hired' => true]);
    $this->payment = Payment::create(['project_id' => $this->project->id, 'customer_id' => $this->client->id, 'provider_id' => $this->provider->id, 'transaction_id' => 'txn_operations', 'currency' => 'aud', 'amount' => 280, 'commission_amount' => 28, 'provider_earnings' => 252, 'status' => Payment::STATUS_SUCCEEDED, 'paid_at' => now()]);
    Review::create(['given_by' => $this->client->id, 'given_to' => $this->provider->id, 'job_id' => $this->project->id, 'star' => 5, 'review' => 'Excellent plumbing work.', 'review_to' => 'freelancer']);
    $this->dispute = Dispute::create(['project_id' => $this->project->id, 'payment_id' => $this->payment->id, 'opened_by' => $this->client->id, 'against_user_id' => $this->provider->id, 'subject' => 'Invoice question', 'description' => 'Please clarify the final invoice.', 'priority' => 'normal', 'status' => Dispute::STATUS_OPEN]);
    $this->withdrawal = WithdrawalRequest::create(['provider_id' => $this->provider->id, 'requested_amount' => 100, 'currency' => 'aud', 'status' => WithdrawalRequest::STATUS_PENDING]);

    $this->actingAs($this->admin);
});

afterEach(function () {
    foreach (['withdrawal_requests', 'disputes', 'reviews', 'service_bookings', 'service_catalogs', 'categories', 'payments', 'bids', 'projects', 'user_proofs', 'users', 'settings'] as $table) {
        Schema::dropIfExists($table);
    }
});

it('renders role-aware client and professional lists and details', function () {
    $this->get(route('admin.users.index', ['type' => 'freelancer']))->assertOk()->assertSee('Professionals');
    $this->get(route('admin.users.index', ['type' => 'client']))->assertOk()->assertSee('Clients');

    $this->postJson(route('admin.users.index_users'), ['draw' => 1, 'start' => 0, 'length' => 10, 'user_type' => 'freelancer'])
        ->assertOk()->assertJsonPath('recordsTotal', 1)->assertJsonPath('recordsFiltered', 1)->assertJsonCount(1, 'data');

    $this->get(route('admin.users.show', $this->provider->id))
        ->assertOk()->assertSee('Professional Details')->assertSee('Bathroom plumbing')->assertSee('Excellent plumbing work.')->assertSee('Invoice question')->assertSee('AUD 100.00');
    $this->get(route('admin.users.show', $this->client->id))
        ->assertOk()->assertSee('Client Details')->assertSee('Bathroom plumbing')->assertSee('Professional Account')->assertSee('Invoice question');
});

it('updates both account and proof verification status', function () {
    $this->postJson(route('admin.users.update_status', $this->provider->id), ['status' => 1])->assertOk()->assertJson(['status' => true]);
    expect($this->provider->fresh()->is_verified)->toBe(1)
        ->and((int) $this->provider->proof()->first()->is_verified)->toBe(1);
});

it('renders disputes and requires resolution notes to close one', function () {
    $this->get(route('admin.disputes.index'))->assertOk()->assertSee('Invoice question');
    $this->get(route('admin.disputes.show', $this->dispute))->assertOk()->assertSee('Please clarify the final invoice.')->assertSee('Bathroom plumbing');
    $this->patch(route('admin.disputes.update_status', $this->dispute), ['status' => Dispute::STATUS_RESOLVED])->assertSessionHasErrors('resolution_notes');
    $this->patch(route('admin.disputes.update_status', $this->dispute), ['status' => Dispute::STATUS_RESOLVED, 'resolution_notes' => 'Invoice confirmed with both parties.'])->assertRedirect();
    expect($this->dispute->fresh()->status)->toBe(Dispute::STATUS_RESOLVED)
        ->and($this->dispute->fresh()->resolved_by)->toBe($this->admin->id);
});

it('tracks withdrawal approval and payment reference without initiating a transfer', function () {
    $this->get(route('admin.withdrawals.index'))->assertOk()->assertSee('Professional Account');
    $this->get(route('admin.withdrawals.show', $this->withdrawal))->assertOk()->assertSee('252.00')->assertSee('100.00');
    $this->patch(route('admin.withdrawals.update_status', $this->withdrawal), ['status' => WithdrawalRequest::STATUS_APPROVED])->assertRedirect();
    expect($this->withdrawal->fresh()->status)->toBe(WithdrawalRequest::STATUS_APPROVED);

    $this->patch(route('admin.withdrawals.update_status', $this->withdrawal), ['status' => WithdrawalRequest::STATUS_PAID])->assertSessionHasErrors('payment_reference');
    $this->patch(route('admin.withdrawals.update_status', $this->withdrawal), ['status' => WithdrawalRequest::STATUS_PAID, 'payment_reference' => 'bank-ref-100'])->assertRedirect();
    expect($this->withdrawal->fresh()->status)->toBe(WithdrawalRequest::STATUS_PAID)
        ->and($this->withdrawal->fresh()->payment_reference)->toBe('bank-ref-100');
});

it('rejects a withdrawal above available provider earnings', function () {
    $large = WithdrawalRequest::create(['provider_id' => $this->provider->id, 'requested_amount' => 500, 'currency' => 'aud', 'status' => WithdrawalRequest::STATUS_PENDING]);
    $this->patch(route('admin.withdrawals.update_status', $large), ['status' => WithdrawalRequest::STATUS_APPROVED])->assertSessionHasErrors('status');
    expect($large->fresh()->status)->toBe(WithdrawalRequest::STATUS_PENDING);
});
