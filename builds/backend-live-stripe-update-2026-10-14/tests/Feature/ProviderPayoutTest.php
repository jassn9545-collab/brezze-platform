<?php

use App\Contracts\PaymentGateway;
use App\Contracts\PayoutGateway;
use App\Models\User;
use App\Models\WithdrawalRequest;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Laravel\Sanctum\Sanctum;

class FakeProviderPayoutGateway implements PayoutGateway
{
    public int $createCount = 0;

    public int $scheduleUpdateCount = 0;

    public int $availableMinor = 12500;

    public array $lastParameters = [];

    public array $payouts = [];

    public bool $payoutsEnabled = true;

    public bool $hasDestination = true;

    public string $schedule = 'daily';

    public function retrieveConnectedAccount(string $connectedAccountId): object
    {
        return (object) [
            'id' => $connectedAccountId,
            'details_submitted' => true,
            'payouts_enabled' => $this->payoutsEnabled,
            'settings' => (object) [
                'payouts' => (object) [
                    'schedule' => (object) ['interval' => $this->schedule],
                ],
            ],
            'external_accounts' => (object) [
                'data' => $this->hasDestination ? [(object) [
                    'id' => 'ba_test_123',
                    'object' => 'bank_account',
                    'bank_name' => 'Test Bank',
                    'last4' => '6789',
                    'currency' => 'aud',
                    'default_for_currency' => true,
                ]] : [],
            ],
        ];
    }

    public function setManualPayoutSchedule(string $connectedAccountId): object
    {
        $this->scheduleUpdateCount++;
        $this->schedule = 'manual';

        return $this->retrieveConnectedAccount($connectedAccountId);
    }

    public function retrieveBalance(string $connectedAccountId): object
    {
        return (object) [
            'available' => [(object) ['amount' => $this->availableMinor, 'currency' => 'aud']],
            'pending' => [(object) ['amount' => 3500, 'currency' => 'aud']],
        ];
    }

    public function createPayout(array $parameters, string $idempotencyKey, string $connectedAccountId): object
    {
        $this->createCount++;
        $this->lastParameters = $parameters;
        $payout = (object) [
            'id' => 'po_test_'.$this->createCount,
            'amount' => $parameters['amount'],
            'currency' => $parameters['currency'],
            'status' => 'pending',
            'method' => 'standard',
            'destination' => 'ba_test_123',
            'arrival_date' => now()->addDays(2)->timestamp,
            'failure_code' => null,
            'failure_message' => null,
        ];
        $this->payouts[] = $payout;

        return $payout;
    }

    public function listPayouts(string $connectedAccountId, int $limit = 25): array
    {
        return array_slice($this->payouts, 0, $limit);
    }

    public function createLoginLink(string $connectedAccountId): object
    {
        return (object) ['url' => 'https://connect.stripe.test/express/login'];
    }
}

class FakePayoutWebhookGateway implements PaymentGateway
{
    public object $event;

    public function retrieveConnectedAccount(string $connectedAccountId): object
    {
        return (object) [];
    }

    public function createPaymentIntent(array $parameters, string $idempotencyKey, ?string $connectedAccountId = null): object
    {
        return (object) [];
    }

    public function retrievePaymentIntent(string $paymentIntentId, ?string $connectedAccountId = null): object
    {
        return (object) [];
    }

    public function cancelPaymentIntent(string $paymentIntentId, ?string $connectedAccountId = null): object
    {
        return (object) [];
    }

    public function constructWebhookEvent(string $payload, string $signature, string $secret): object
    {
        return $this->event;
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
        $table->rememberToken();
        $table->timestamps();
    });

    Schema::create('payments', function (Blueprint $table) {
        $table->id();
        $table->unsignedBigInteger('provider_id')->index();
        $table->decimal('provider_earnings', 12, 2)->default(0);
        $table->string('status')->default('pending');
        $table->timestamps();
    });

    Schema::create('withdrawal_requests', function (Blueprint $table) {
        $table->id();
        $table->unsignedBigInteger('provider_id')->index();
        $table->decimal('requested_amount', 12, 2);
        $table->char('currency', 3)->default('aud');
        $table->string('status', 30)->default('pending')->index();
        $table->string('payment_reference')->nullable();
        $table->string('stripe_payout_id')->nullable()->unique();
        $table->string('idempotency_key')->nullable();
        $table->string('destination')->nullable();
        $table->string('method', 20)->default('standard');
        $table->timestamp('arrival_at')->nullable();
        $table->string('failure_code')->nullable();
        $table->text('failure_message')->nullable();
        $table->text('provider_notes')->nullable();
        $table->text('admin_notes')->nullable();
        $table->unsignedBigInteger('processed_by')->nullable();
        $table->timestamp('processed_at')->nullable();
        $table->timestamps();
        $table->unique(['provider_id', 'idempotency_key']);
    });

    config()->set('services.stripe.secret', 'sk_test_fake');
    config()->set('services.stripe.currency', 'aud');
    config()->set('services.stripe.minimum_payout_minor', 1000);

    $this->gateway = new FakeProviderPayoutGateway;
    app()->instance(PayoutGateway::class, $this->gateway);

    $this->provider = User::create([
        'name' => 'Provider',
        'email' => 'provider-payout@example.test',
        'password' => Hash::make('password'),
        'user_type' => 'freelancer',
        'stripe_account_id' => 'acct_provider_payout',
    ]);
    $this->client = User::create([
        'name' => 'Client',
        'email' => 'client-payout@example.test',
        'password' => Hash::make('password'),
        'user_type' => 'client',
    ]);
});

afterEach(function () {
    Schema::dropIfExists('withdrawal_requests');
    Schema::dropIfExists('payments');
    Schema::dropIfExists('users');
});

it('returns the connected Stripe balance and masked payout destination', function () {
    Sanctum::actingAs($this->provider);

    $this->getJson('/api/freelancer/payouts')
        ->assertOk()
        ->assertJsonPath('data.balance.available_minor', 12500)
        ->assertJsonPath('data.balance.pending_minor', 3500)
        ->assertJsonPath('data.account.destination.bank_name', 'Test Bank')
        ->assertJsonPath('data.account.destination.last4', '6789')
        ->assertJsonMissingPath('data.account.destination.id');
});

it('creates an idempotent standard payout and switches the account to manual payouts', function () {
    Sanctum::actingAs($this->provider);
    $payload = [
        'amount' => '25.50',
        'idempotency_key' => 'mobile-request-123456789',
    ];

    $this->postJson('/api/freelancer/payouts', $payload)
        ->assertCreated()
        ->assertJsonPath('data.payout.amount', '25.50')
        ->assertJsonPath('data.payout.status', 'pending')
        ->assertJsonPath('data.payout.stripe_payout_id', 'po_test_1');

    $this->postJson('/api/freelancer/payouts', $payload)
        ->assertOk()
        ->assertJsonPath('data.payout.stripe_payout_id', 'po_test_1');

    expect($this->gateway->createCount)->toBe(1)
        ->and($this->gateway->scheduleUpdateCount)->toBe(1)
        ->and($this->gateway->lastParameters['amount'])->toBe(2550);
    $this->assertDatabaseHas('withdrawal_requests', [
        'provider_id' => $this->provider->id,
        'stripe_payout_id' => 'po_test_1',
        'requested_amount' => 25.50,
    ]);
});

it('rejects a payout larger than the Stripe available balance', function () {
    Sanctum::actingAs($this->provider);

    $this->postJson('/api/freelancer/payouts', [
        'amount' => '126.00',
        'idempotency_key' => 'mobile-request-too-large',
    ])->assertStatus(422)
        ->assertJsonPath('errors.available_minor', 12500);

    expect($this->gateway->createCount)->toBe(0);
});

it('rejects payout amounts with more than two decimal places', function () {
    Sanctum::actingAs($this->provider);

    $this->postJson('/api/freelancer/payouts', [
        'amount' => '25.555',
        'idempotency_key' => 'mobile-request-too-precise',
    ])->assertStatus(422)
        ->assertJsonValidationErrors('amount');

    expect($this->gateway->createCount)->toBe(0);
});

it('requires a payout destination and provider role', function () {
    Sanctum::actingAs($this->provider);
    $this->gateway->hasDestination = false;

    $this->postJson('/api/freelancer/payouts', [
        'amount' => '25.00',
        'idempotency_key' => 'mobile-request-no-bank',
    ])->assertStatus(422)
        ->assertJsonPath('message', 'Add a payout bank account in Stripe before withdrawing funds.');

    Sanctum::actingAs($this->client);
    $this->getJson('/api/freelancer/payouts')->assertForbidden();
});

it('creates an Express Dashboard login link for bank account management', function () {
    Sanctum::actingAs($this->provider);

    $this->postJson('/api/freelancer/payouts/dashboard-link')
        ->assertOk()
        ->assertJsonPath('data.url', 'https://connect.stripe.test/express/login');
});

it('updates a payout from a signed connected-account webhook', function () {
    $withdrawal = WithdrawalRequest::create([
        'provider_id' => $this->provider->id,
        'requested_amount' => '25.50',
        'currency' => 'aud',
        'status' => WithdrawalRequest::STATUS_PENDING,
        'stripe_payout_id' => 'po_webhook_test',
        'payment_reference' => 'po_webhook_test',
        'idempotency_key' => 'webhook-request-123456',
    ]);
    $gateway = new FakePayoutWebhookGateway;
    $gateway->event = (object) [
        'type' => 'payout.paid',
        'account' => 'acct_provider_payout',
        'data' => (object) [
            'object' => (object) [
                'id' => 'po_webhook_test',
                'status' => 'paid',
                'destination' => 'ba_test_123',
                'method' => 'standard',
                'arrival_date' => now()->timestamp,
                'failure_code' => null,
                'failure_message' => null,
            ],
        ],
    ];
    app()->instance(PaymentGateway::class, $gateway);
    config()->set('services.stripe.webhook_secret', 'whsec_test');

    $this->postJson('/api/stripe/webhook', [], ['Stripe-Signature' => 'test'])
        ->assertOk()
        ->assertJsonPath('received', true);

    expect($withdrawal->fresh()->status)->toBe(WithdrawalRequest::STATUS_PAID)
        ->and($withdrawal->fresh()->processed_at)->not->toBeNull();
});
