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

    public bool $loseResponse = false;

    public ?string $rejectCode = null;

    public array $keys = [];

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
        if ($this->rejectCode) {
            throw \Stripe\Exception\InvalidRequestException::factory('Test rejection', 400, null, null, null, $this->rejectCode);
        }
        if (isset($this->keys[$idempotencyKey])) {
            return $this->keys[$idempotencyKey];
        }
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
            'metadata' => (object) ($parameters['metadata'] ?? []),
        ];
        $this->payouts[] = $payout;
        $this->availableMinor -= $parameters['amount'];
        $this->keys[$idempotencyKey] = $payout;
        if ($this->loseResponse) {
            throw new RuntimeException('Simulated response loss after Stripe accepted payout');
        }

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
        $table->char('currency', 3)->default('aud');
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
        $table->timestamp('stripe_submission_started_at')->nullable();
        $table->unsignedInteger('stripe_submission_attempt')->default(0);
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
    \App\Models\Payment::create(['provider_id' => $this->provider->id, 'currency' => 'aud', 'provider_earnings' => '125.00', 'status' => 'succeeded']);
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

it('reports platform-only test payments without treating earnings as withdrawable funds', function () {
    Sanctum::actingAs($this->provider);
    config()->set('services.stripe.key', 'pk_test_fake');
    config()->set('services.stripe.test_platform_payments', true);
    $this->gateway->availableMinor = 0;
    \App\Models\Payment::query()->delete();
    \App\Models\Payment::create([
        'provider_id' => $this->provider->id,
        'provider_earnings' => '354.60',
        'currency' => 'aud',
        'status' => 'succeeded',
    ]);

    $this->getJson('/api/freelancer/payouts')
        ->assertOk()
        ->assertJsonPath('data.total_earnings', '354.60')
        ->assertJsonPath('data.balance.available_minor', 0)
        ->assertJsonPath('data.payment_mode.test_mode', true)
        ->assertJsonPath('data.payment_mode.platform_test_payments', true);

    config()->set('services.stripe.test_platform_payments', false);
    $this->getJson('/api/freelancer/payouts')
        ->assertOk()
        ->assertJsonPath('data.payment_mode.platform_test_payments', false);
});

it('never labels live payments as platform-only test payments', function () {
    Sanctum::actingAs($this->provider);
    config()->set('services.stripe.secret', 'sk_live_fake');
    config()->set('services.stripe.key', 'pk_live_fake');
    config()->set('services.stripe.test_platform_payments', true);

    $this->getJson('/api/freelancer/payouts')
        ->assertOk()
        ->assertJsonPath('data.payment_mode.test_mode', false)
        ->assertJsonPath('data.payment_mode.platform_test_payments', false);
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

it('rejects a withdrawal larger than the wallet balance', function () {
    Sanctum::actingAs($this->provider);

    $this->postJson('/api/freelancer/payouts', [
        'amount' => '126.00',
        'idempotency_key' => 'mobile-request-too-large',
    ])->assertStatus(422)
        ->assertJsonPath('message', 'The requested amount exceeds your available wallet balance.');

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

it('credits successful payments immediately and reserves a pending withdrawal exactly once', function () {
    Sanctum::actingAs($this->provider);
    $this->gateway->availableMinor = 0;
    $payload = ['amount' => '40.00', 'idempotency_key' => 'wallet-queued-request-1234'];
    $this->getJson('/api/freelancer/payouts')->assertOk()
        ->assertJsonPath('data.wallet.available', '125.00');
    $this->postJson('/api/freelancer/payouts', $payload)->assertCreated()
        ->assertJsonPath('data.payout.status', 'awaiting_settlement')
        ->assertJsonPath('data.wallet.available', '85.00')
        ->assertJsonPath('data.wallet.reserved', '40.00');
    $this->postJson('/api/freelancer/payouts', $payload)->assertOk()
        ->assertJsonPath('data.wallet.available', '85.00');
    $this->postJson('/api/freelancer/payouts', ['amount' => '90.00', 'idempotency_key' => 'wallet-other-request-1234'])
        ->assertStatus(422);
    expect(WithdrawalRequest::count())->toBe(1)->and($this->gateway->createCount)->toBe(0);
});

it('automatically submits reserved funds after settlement without deducting twice', function () {
    Sanctum::actingAs($this->provider);
    $this->gateway->availableMinor = 0;
    $this->postJson('/api/freelancer/payouts', ['amount' => '40.00', 'idempotency_key' => 'wallet-settlement-1234'])->assertCreated();
    $this->artisan('wallet:process-withdrawals')->assertSuccessful();
    expect($this->gateway->createCount)->toBe(0);
    $this->gateway->availableMinor = 4000;
    $this->artisan('wallet:process-withdrawals')->assertSuccessful();
    $this->artisan('wallet:process-withdrawals')->assertSuccessful();
    $this->getJson('/api/freelancer/payouts')->assertOk()
        ->assertJsonPath('data.wallet.available', '85.00')
        ->assertJsonPath('data.wallet.reserved', '40.00')
        ->assertJsonPath('data.payouts.0.status', 'pending');
    expect($this->gateway->createCount)->toBe(1);
});

it('restores a failed or canceled withdrawal and keeps paid funds deducted', function () {
    $wallet = app(\App\Services\ProviderWallet::class);
    $request = $wallet->reserve($this->provider, 'aud', 4000, 'wallet-restore-1234');
    foreach (['paid', 'failed', 'canceled'] as $status) {
        $wallet->apply($request, (object) ['id' => 'po_restore', 'status' => $status]);
        $balance = $wallet->balance($this->provider->id, 'aud');
        expect($balance['available'])->toBe($status === 'paid' ? '85.00' : '125.00')
            ->and($balance['reserved'])->toBe('0.00');
    }
});

it('retains the debit after a lost Stripe response and recovers with the same key', function () {
    Sanctum::actingAs($this->provider);
    $this->gateway->loseResponse = true;
    $payload = ['amount' => '40.00', 'idempotency_key' => 'wallet-response-lost-1234'];
    $this->postJson('/api/freelancer/payouts', $payload)->assertCreated()
        ->assertJsonPath('data.payout.status', 'processing')
        ->assertJsonPath('data.wallet.available', '85.00');
    $this->gateway->availableMinor = 0;
    $this->postJson('/api/freelancer/payouts', $payload)->assertOk()
        ->assertJsonPath('data.payout.status', 'pending')
        ->assertJsonPath('data.wallet.available', '85.00');
    expect($this->gateway->createCount)->toBe(1);
});

it('holds uncertain old submissions for reconciliation instead of paying twice', function () {
    Sanctum::actingAs($this->provider);
    $this->gateway->loseResponse = true;
    $this->postJson('/api/freelancer/payouts', ['amount' => '40.00', 'idempotency_key' => 'wallet-expired-key-1234'])->assertCreated();
    WithdrawalRequest::query()->update(['stripe_submission_started_at' => now()->subHours(25)]);
    $this->gateway->payouts = [];
    $this->artisan('wallet:process-withdrawals')->assertSuccessful();
    expect($this->gateway->createCount)->toBe(1);
    expect(app(\App\Services\ProviderWallet::class)->balance($this->provider->id, 'aud')['available'])->toBe('85.00');
});

it('rejects reused keys for different amounts and excludes other currencies and failed credits', function () {
    Sanctum::actingAs($this->provider);
    $this->gateway->availableMinor = 0;
    \App\Models\Payment::create(['provider_id' => $this->provider->id, 'currency' => 'usd', 'provider_earnings' => '900.00', 'status' => 'succeeded']);
    \App\Models\Payment::create(['provider_id' => $this->provider->id, 'currency' => 'aud', 'provider_earnings' => '900.00', 'status' => 'failed']);
    $this->postJson('/api/freelancer/payouts', ['amount' => '40.00', 'idempotency_key' => 'wallet-key-conflict-1234'])->assertCreated();
    $this->postJson('/api/freelancer/payouts', ['amount' => '41.00', 'idempotency_key' => 'wallet-key-conflict-1234'])->assertStatus(409);
    expect(app(\App\Services\ProviderWallet::class)->balance($this->provider->id, 'aud')['available'])->toBe('85.00');
});

it('reconciles automatic Stripe payouts so historical wallet credits cannot be spent twice', function () {
    $wallet = app(\App\Services\ProviderWallet::class);
    $payout = (object) ['id' => 'po_automatic', 'amount' => 4000, 'currency' => 'aud', 'status' => 'paid', 'created' => now()->subDay()->timestamp];
    $wallet->reconcile($this->provider->id, [$payout]);
    $wallet->reconcile($this->provider->id, [$payout]);
    expect(WithdrawalRequest::count())->toBe(1);
    expect($wallet->balance($this->provider->id, 'aud')['available'])->toBe('85.00');
    expect($wallet->balance($this->provider->id, 'aud')['withdrawn'])->toBe('40.00');
});

it('does not reopen a completed withdrawal on a delayed pending event', function () {
    $wallet = app(\App\Services\ProviderWallet::class);
    $withdrawal = $wallet->reserve($this->provider, 'aud', 4000, 'wallet-late-webhook-1234');
    $wallet->apply($withdrawal, (object) ['id' => 'po_late', 'status' => 'paid']);
    $wallet->apply($withdrawal, (object) ['id' => 'po_late', 'status' => 'pending']);
    expect($withdrawal->fresh()->status)->toBe('paid');
    expect($wallet->balance($this->provider->id, 'aud')['available'])->toBe('85.00');
});

it('restores wallet funds when Stripe definitively rejects a payout', function () {
    Sanctum::actingAs($this->provider);
    $this->gateway->rejectCode = 'account_invalid';
    $this->postJson('/api/freelancer/payouts', ['amount' => '40.00', 'idempotency_key' => 'wallet-rejection-1234'])->assertCreated()
        ->assertJsonPath('data.payout.status', 'failed')
        ->assertJsonPath('data.wallet.available', '125.00')
        ->assertJsonPath('data.wallet.reserved', '0.00');
});

it('keeps a reservation after insufficient Stripe funds and can submit a fresh rejected-attempt key later', function () {
    Sanctum::actingAs($this->provider);
    $this->gateway->rejectCode = 'balance_insufficient';
    $this->postJson('/api/freelancer/payouts', ['amount' => '40.00', 'idempotency_key' => 'wallet-balance-race-1234'])->assertCreated()
        ->assertJsonPath('data.payout.status', 'awaiting_settlement')
        ->assertJsonPath('data.wallet.available', '85.00');
    expect(WithdrawalRequest::first()->stripe_submission_attempt)->toBe(1);
    $this->gateway->rejectCode = null;
    $this->artisan('wallet:process-withdrawals')->assertSuccessful();
    expect(WithdrawalRequest::first()->status)->toBe('pending');
    expect($this->gateway->createCount)->toBe(1);
});

it('migrates legacy uncertain withdrawals without authorizing a duplicate payout', function () {
    Schema::table('withdrawal_requests', function (Blueprint $table) {
        $table->dropColumn(['stripe_submission_started_at', 'stripe_submission_attempt']);
    });
    $withdrawal = WithdrawalRequest::create(['provider_id' => $this->provider->id, 'requested_amount' => '40.00', 'currency' => 'aud', 'status' => 'processing']);
    $migration = require database_path('migrations/2026_11_02_000001_add_submission_time_to_withdrawal_requests.php');
    $migration->up();
    expect($withdrawal->fresh()->stripe_submission_started_at->lt(now()->subHours(23)))->toBeTrue();
    expect($withdrawal->fresh()->stripe_submission_attempt)->toBe(0);
    $migration->down();
    expect(Schema::hasColumn('withdrawal_requests', 'stripe_submission_started_at'))->toBeFalse();
});

it('wallet sync processes only the signed-in providers settled withdrawal and reads updated balances', function () {
    Sanctum::actingAs($this->provider);
    $this->gateway->availableMinor = 0;
    $this->postJson('/api/freelancer/payouts', ['amount' => '40.00', 'idempotency_key' => 'wallet-screen-sync-1234'])->assertCreated();
    $this->postJson('/api/freelancer/payouts/sync')->assertOk()
        ->assertJsonPath('data.payouts.0.status', 'awaiting_settlement');
    $this->gateway->availableMinor = 4590;
    $this->postJson('/api/freelancer/payouts/sync')->assertOk()
        ->assertJsonPath('data.payouts.0.status', 'pending')
        ->assertJsonPath('data.balance.available_minor', 590)
        ->assertJsonPath('data.wallet.available', '85.00');
    $this->postJson('/api/freelancer/payouts/sync')->assertOk();
    expect($this->gateway->createCount)->toBe(1);
    Sanctum::actingAs($this->client);
    $this->postJson('/api/freelancer/payouts/sync')->assertForbidden();
});
