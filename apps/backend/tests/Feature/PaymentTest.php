<?php

use App\Contracts\PaymentGateway;
use App\Contracts\CustomerPaymentGateway;
use App\Models\Bid;
use App\Models\Payment;
use App\Models\Project;
use App\Models\User;
use App\Models\UserNotification;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Laravel\Sanctum\Sanctum;

class FakePaymentGateway implements PaymentGateway
{
    public int $createCount = 0;

    public array $lastCreateParameters = [];

    public ?string $lastConnectedAccountId = null;

    public array $intents = [];

    public bool $accountReady = true;

    public function retrieveConnectedAccount(string $connectedAccountId): object
    {
        $status = $this->accountReady ? 'active' : 'restricted';

        return (object) [
            'charges_enabled' => $status === 'active',
            'payouts_enabled' => $status === 'active',
        ];
    }

    public function createPaymentIntent(
        array $parameters,
        string $idempotencyKey,
        ?string $connectedAccountId = null
    ): object {
        $this->createCount++;
        $this->lastCreateParameters = $parameters;
        $this->lastConnectedAccountId = $connectedAccountId;
        $id = 'pi_test_'.$this->createCount;
        $this->intents[$id] = (object) [
            'id' => $id,
            'client_secret' => $id.'_secret_test',
            'amount' => $parameters['amount'],
            'currency' => $parameters['currency'],
            'metadata' => (object) $parameters['metadata'],
            'application_fee_amount' => $parameters['application_fee_amount'] ?? null,
            'status' => 'requires_payment_method',
            'latest_charge' => null,
            'last_payment_error' => null,
        ];

        return $this->intents[$id];
    }

    public function retrievePaymentIntent(
        string $paymentIntentId,
        ?string $connectedAccountId = null
    ): object {
        $this->lastConnectedAccountId = $connectedAccountId;

        return $this->intents[$paymentIntentId];
    }

    public function cancelPaymentIntent(
        string $paymentIntentId,
        ?string $connectedAccountId = null
    ): object {
        $this->lastConnectedAccountId = $connectedAccountId;
        $this->intents[$paymentIntentId]->status = 'canceled';

        return $this->intents[$paymentIntentId];
    }

    public function constructWebhookEvent(string $payload, string $signature, string $secret): object
    {
        return (object) [];
    }
}

class FakeCustomerPaymentGateway implements CustomerPaymentGateway
{
    public array $paymentMethods = [];

    public function createCustomer(array $parameters): object
    {
        return (object) ['id' => 'cus_customer_test'];
    }

    public function retrieveCustomer(string $customerId): object
    {
        return (object) ['invoice_settings' => (object) ['default_payment_method' => null]];
    }

    public function updateCustomer(string $customerId, array $parameters): object
    {
        return (object) ['id' => $customerId];
    }

    public function createCustomerSession(string $customerId): object
    {
        return (object) ['client_secret' => 'cuss_test_secret'];
    }

    public function createSetupIntent(string $customerId): object
    {
        return (object) ['client_secret' => 'seti_test_secret'];
    }

    public function listCardPaymentMethods(string $customerId): array
    {
        return $this->paymentMethods;
    }

    public function retrievePaymentMethod(string $paymentMethodId): object
    {
        return (object) ['id' => $paymentMethodId, 'customer' => 'cus_customer_test'];
    }

    public function detachPaymentMethod(string $paymentMethodId): object
    {
        return (object) ['id' => $paymentMethodId];
    }
}

beforeEach(function () {
    Schema::create('users', function (Blueprint $table) {
        $table->id();
        $table->string('name');
        $table->string('email')->unique();
        $table->string('password');
        $table->string('user_type');
        $table->string('stripe_account_id')->nullable();
        $table->string('stripe_customer_id')->nullable();
        $table->rememberToken();
        $table->timestamps();
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

    Schema::create('payments', function (Blueprint $table) {
        $table->id();
        $table->unsignedInteger('project_id')->unique();
        $table->unsignedBigInteger('customer_id')->index();
        $table->unsignedBigInteger('provider_id')->index();
        $table->string('stripe_payment_intent_id')->nullable()->unique();
        $table->string('transaction_id')->nullable()->unique();
        $table->char('currency', 3)->default('aud');
        $table->unsignedBigInteger('amount_minor');
        $table->unsignedBigInteger('commission_minor');
        $table->unsignedBigInteger('provider_earnings_minor');
        $table->decimal('amount', 12, 2);
        $table->decimal('commission_amount', 12, 2);
        $table->decimal('provider_earnings', 12, 2);
        $table->decimal('commission_rate', 5, 2)->default(10);
        $table->string('status')->default('pending')->index();
        $table->unsignedInteger('attempts')->default(0);
        $table->string('failure_code')->nullable();
        $table->text('failure_message')->nullable();
        $table->timestamp('paid_at')->nullable();
        $table->timestamp('failed_at')->nullable();
        $table->timestamp('cancelled_at')->nullable();
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

    config()->set('services.stripe.secret', 'sk_test_fake');
    config()->set('services.stripe.key', 'pk_test_fake');
    config()->set('services.stripe.currency', 'aud');
    config()->set('services.stripe.test_platform_payments', false);

    $this->gateway = new FakePaymentGateway;
    app()->instance(PaymentGateway::class, $this->gateway);
    $this->customerGateway = new FakeCustomerPaymentGateway;
    app()->instance(CustomerPaymentGateway::class, $this->customerGateway);

    $this->customer = User::create([
        'name' => 'Customer',
        'email' => 'customer@payment.test',
        'password' => Hash::make('password'),
        'user_type' => 'client',
    ]);
    $this->provider = User::create([
        'name' => 'Provider',
        'email' => 'provider@payment.test',
        'password' => Hash::make('password'),
        'user_type' => 'freelancer',
        'stripe_account_id' => 'acct_provider_test',
    ]);
    $this->job = Project::create([
        'title' => 'Completed plumbing job',
        'description' => 'Test job',
        'budget' => '150.00',
        'status' => 'completed',
        'user_id' => $this->customer->id,
    ]);
    Bid::create([
        'project_id' => $this->job->id,
        'user_id' => $this->provider->id,
        'bid_amount' => '123.45',
        'is_hired' => true,
    ]);
});

afterEach(function () {
    Schema::dropIfExists('user_notifications');
    Schema::dropIfExists('payments');
    Schema::dropIfExists('bids');
    Schema::dropIfExists('projects');
    Schema::dropIfExists('users');
});

it('calculates the ten percent split on the backend from the hired bid', function () {
    Sanctum::actingAs($this->customer);

    $this->postJson('/api/client/payments/intent', ['job_id' => $this->job->id])
        ->assertOk()
        ->assertJsonPath('data.payment.amount', '123.45')
        ->assertJsonPath('data.payment.commission', '12.35')
        ->assertJsonPath('data.payment.provider_earnings', '111.10')
        ->assertJsonPath('data.stripe_account_id', 'acct_provider_test')
        ->assertJsonPath('data.already_paid', false);

    expect($this->gateway->lastCreateParameters['amount'])->toBe(12345)
        ->and($this->gateway->lastCreateParameters['application_fee_amount'])->toBe(1235)
        ->and($this->gateway->lastConnectedAccountId)->toBe('acct_provider_test')
        ->and($this->gateway->lastCreateParameters)->not->toHaveKey('transfer_data');

    $this->assertDatabaseHas('payments', [
        'project_id' => $this->job->id,
        'amount_minor' => 12345,
        'commission_minor' => 1235,
        'provider_earnings_minor' => 11110,
    ]);
});

it('reuses an open intent and prevents duplicate payment records', function () {
    Sanctum::actingAs($this->customer);

    $this->postJson('/api/client/payments/intent', ['job_id' => $this->job->id])->assertOk();
    $this->postJson('/api/client/payments/intent', ['job_id' => $this->job->id])->assertOk();

    expect($this->gateway->createCount)->toBe(1)
        ->and(Payment::query()->where('project_id', $this->job->id)->count())->toBe(1);
});

it('verifies success against the gateway and then returns already paid', function () {
    Sanctum::actingAs($this->customer);
    $this->job->update(['status' => 'in progress']);
    $started = $this->postJson('/api/client/payments/intent', ['job_id' => $this->job->id]);
    $paymentId = $started->json('data.payment.id');
    $intentId = Payment::findOrFail($paymentId)->stripe_payment_intent_id;
    $this->gateway->intents[$intentId]->status = 'succeeded';
    $this->gateway->intents[$intentId]->latest_charge = 'ch_verified_test';

    $this->postJson("/api/client/payments/{$paymentId}/verify")
        ->assertOk()
        ->assertJsonPath('data.payment.status', 'succeeded')
        ->assertJsonPath('data.payment.transaction_id', 'ch_verified_test');

    expect($this->job->fresh()->status)->toBe('completed');
    expect(UserNotification::query()
        ->where('user_id', $this->provider->id)
        ->where('type', 'payment_succeeded')
        ->where('action_type', 'project')
        ->where('action_id', $this->job->id)
        ->exists())->toBeTrue();

    $this->postJson('/api/client/payments/intent', ['job_id' => $this->job->id])
        ->assertOk()
        ->assertJsonPath('data.already_paid', true);

    expect($this->gateway->createCount)->toBe(1);
});

it('accepts payment while in progress and rejects an inactive job or different customer', function () {
    Sanctum::actingAs($this->customer);
    $this->job->update(['status' => 'in progress']);
    $this->postJson('/api/client/payments/intent', ['job_id' => $this->job->id])
        ->assertOk();

    $this->job->update(['status' => 'active']);
    $this->postJson('/api/client/payments/intent', ['job_id' => $this->job->id])
        ->assertStatus(422);

    $otherCustomer = User::create([
        'name' => 'Other Customer',
        'email' => 'other@payment.test',
        'password' => Hash::make('password'),
        'user_type' => 'client',
    ]);
    Sanctum::actingAs($otherCustomer);
    $this->postJson('/api/client/payments/intent', ['job_id' => $this->job->id])
        ->assertNotFound();
});

it('rejects payment clearly when provider Stripe onboarding is incomplete', function () {
    Sanctum::actingAs($this->customer);
    $this->job->update(['status' => 'in progress']);
    $this->gateway->accountReady = false;

    $this->postJson('/api/client/payments/intent', ['job_id' => $this->job->id])
        ->assertStatus(422)
        ->assertJsonPath(
            'message',
            'The provider must finish Stripe payment setup before this job can be paid.'
        );

    expect($this->gateway->createCount)->toBe(0);
});

it('allows an incomplete provider only through the explicit test-mode platform fallback', function () {
    Sanctum::actingAs($this->customer);
    $this->job->update(['status' => 'in progress']);
    $this->gateway->accountReady = false;
    config()->set('services.stripe.test_platform_payments', true);

    $this->postJson('/api/client/payments/intent', ['job_id' => $this->job->id])
        ->assertOk()
        ->assertJsonPath('data.stripe_account_id', null)
        ->assertJsonPath('data.stripe_customer_id', 'cus_customer_test')
        ->assertJsonPath('data.customer_session_client_secret', 'cuss_test_secret')
        ->assertJsonPath('data.already_paid', false);

    expect($this->gateway->createCount)->toBe(1)
        ->and($this->gateway->lastConnectedAccountId)->toBeNull()
        ->and($this->gateway->lastCreateParameters)->not->toHaveKey('application_fee_amount')
        ->and($this->gateway->lastCreateParameters['customer'])->toBe('cus_customer_test')
        ->and($this->gateway->lastCreateParameters['setup_future_usage'])->toBe('off_session')
        ->and($this->gateway->lastCreateParameters['metadata']['charge_model'])->toBe('platform_test');
});

it('shows only the authenticated provider payment history and successful total', function () {
    Payment::create([
        'project_id' => $this->job->id,
        'customer_id' => $this->customer->id,
        'provider_id' => $this->provider->id,
        'transaction_id' => 'ch_history_test',
        'currency' => 'aud',
        'amount_minor' => 12345,
        'commission_minor' => 1235,
        'provider_earnings_minor' => 11110,
        'amount' => '123.45',
        'commission_amount' => '12.35',
        'provider_earnings' => '111.10',
        'commission_rate' => 10,
        'status' => Payment::STATUS_SUCCEEDED,
        'paid_at' => now(),
    ]);
    Sanctum::actingAs($this->provider);

    $this->postJson('/api/freelancer/payments')
        ->assertOk()
        ->assertJsonCount(1, 'data.payments')
        ->assertJsonPath('data.total_earnings', '111.10')
        ->assertJsonPath('data.payments.0.transaction_id', 'ch_history_test');
});
