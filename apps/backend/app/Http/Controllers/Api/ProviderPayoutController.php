<?php

namespace App\Http\Controllers\Api;

use App\Contracts\PayoutGateway;
use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\WithdrawalRequest;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Throwable;

class ProviderPayoutController extends Controller
{
    use ApiResponse;

    public function index(Request $request, PayoutGateway $gateway)
    {
        if ($response = $this->requireProvider($request)) {
            return $response;
        }

        $provider = $request->user();
        $currency = strtolower((string) config('services.stripe.currency', 'aud'));
        $history = fn () => WithdrawalRequest::query()
            ->where('provider_id', $provider->id)
            ->latest()
            ->limit(50)
            ->get()
            ->map(fn (WithdrawalRequest $withdrawal) => $this->payoutData($withdrawal))
            ->values();

        if (! $provider->stripe_account_id) {
            return $this->success([
                'account' => $this->accountData(null),
                'balance' => $this->balanceData(0, 0, $currency),
                'minimum_payout_minor' => $this->minimumPayoutMinor(),
                'total_earnings' => $this->totalEarnings((int) $provider->id),
                'payment_mode' => $this->paymentMode(),
                'wallet' => app(\App\Services\ProviderWallet::class)->balance((int) $provider->id, $currency),
                'payouts' => $history(),
            ], 'Connect a Stripe account to receive payouts.');
        }

        if (! config('services.stripe.secret')) {
            return $this->error('Stripe payouts are not configured.', 503);
        }

        try {
            $account = $gateway->retrieveConnectedAccount($provider->stripe_account_id);
            $balance = $gateway->retrieveBalance($provider->stripe_account_id);
            $this->synchronizePayouts(
                (int) $provider->id,
                $gateway->listPayouts($provider->stripe_account_id, 50)
            );
        } catch (Throwable $exception) {
            report($exception);

            return $this->error('Stripe payout information could not be loaded.', 422);
        }

        return $this->success([
            'account' => $this->accountData($account),
            'balance' => $this->balanceData(
                $this->balanceAmount($balance, 'available', $currency),
                $this->balanceAmount($balance, 'pending', $currency),
                $currency
            ),
            'minimum_payout_minor' => $this->minimumPayoutMinor(),
            'total_earnings' => $this->totalEarnings((int) $provider->id),
            'payment_mode' => $this->paymentMode(),
            'wallet' => app(\App\Services\ProviderWallet::class)->balance((int) $provider->id, $currency),
            'payouts' => $history(),
            'wallet_sync_supported' => true,
        ], 'Payout information retrieved successfully.');
    }

    public function sync(Request $request, PayoutGateway $gateway)
    {
        if ($response = $this->requireProvider($request)) {
            return $response;
        }
        $provider = $request->user();
        if (! $provider->stripe_account_id || ! config('services.stripe.secret')) {
            return $this->index($request, $gateway);
        }
        $wallet = app(\App\Services\ProviderWallet::class);
        try {
            $wallet->reconcile((int) $provider->id, $gateway->listPayouts($provider->stripe_account_id, 50));
            $withdrawals = WithdrawalRequest::query()->where('provider_id', $provider->id)
                ->whereIn('status', ['awaiting_settlement', 'processing'])
                ->whereNull('stripe_payout_id')->orderBy('id')->get();
            foreach ($withdrawals as $withdrawal) {
                $wallet->process($withdrawal, $gateway);
            }
        } catch (Throwable $exception) {
            report($exception);

            return $this->error('Withdrawal status could not be refreshed. Please try again.', 503);
        }

        // Read fresh Stripe balances after submitting payouts, never subtract
        // from pending settlement locally or mark a request paid prematurely.
        return $this->index($request, $gateway);
    }

    public function store(Request $request, PayoutGateway $gateway)
    {
        if ($response = $this->requireProvider($request)) {
            return $response;
        }

        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:0.01', 'max:999999999.99', 'regex:/^\d{1,9}(\.\d{1,2})?$/'],
            'idempotency_key' => ['required', 'string', 'regex:/^[A-Za-z0-9_-]{16,100}$/'],
        ]);
        $provider = $request->user();
        $amountMinor = $this->moneyToMinor($validated['amount']);
        $currency = strtolower((string) config('services.stripe.currency', 'aud'));

        if ($amountMinor < $this->minimumPayoutMinor()) {
            return $this->error(
                'The minimum payout is '.$this->minorToMoney($this->minimumPayoutMinor()).' '.strtoupper($currency).'.',
                422
            );
        }
        if (! $provider->stripe_account_id) {
            return $this->error('Connect and verify your Stripe account before withdrawing.', 422);
        }
        if (! config('services.stripe.secret')) {
            return $this->error('Stripe payouts are not configured.', 503);
        }

        try {
            $account = $gateway->retrieveConnectedAccount($provider->stripe_account_id);
            if (! (bool) data_get($account, 'payouts_enabled', false)) {
                return $this->error('Complete Stripe verification before withdrawing funds.', 422);
            }
            if (! $this->defaultDestination($account, $currency)) {
                return $this->error('Add a payout bank account in Stripe before withdrawing funds.', 422);
            }
            if (data_get($account, 'settings.payouts.schedule.interval') !== 'manual') {
                $gateway->setManualPayoutSchedule($provider->stripe_account_id);
            }
            $wallet = app(\App\Services\ProviderWallet::class);
            $wallet->reconcile((int) $provider->id, $gateway->listPayouts($provider->stripe_account_id, 50));
            $withdrawal = $wallet->reserve($provider, $currency, $amountMinor, trim($validated['idempotency_key']));
        } catch (\Symfony\Component\HttpKernel\Exception\HttpException $exception) {
            return $this->error($exception->getMessage(), $exception->getStatusCode());
        } catch (Throwable $exception) {
            report($exception);

            return $this->error('The withdrawal could not be requested. Please try again.', 503);
        }

        $wallet->process($withdrawal, $gateway);
        $withdrawal->refresh();

        return $this->success([
            'payout' => $this->payoutData($withdrawal),
            'wallet' => $wallet->balance((int) $provider->id, $currency),
        ], $withdrawal->status === 'awaiting_settlement'
            ? 'Withdrawal requested. Your amount is reserved until Stripe funds settle.'
            : 'Withdrawal request retrieved.', $withdrawal->wasRecentlyCreated ? 201 : 200);
    }

    public function dashboardLink(Request $request, PayoutGateway $gateway)
    {
        if ($response = $this->requireProvider($request)) {
            return $response;
        }
        if (! $request->user()->stripe_account_id) {
            return $this->error('Connect your Stripe account first.', 422);
        }
        if (! config('services.stripe.secret')) {
            return $this->error('Stripe payouts are not configured.', 503);
        }

        try {
            $link = $gateway->createLoginLink($request->user()->stripe_account_id);
        } catch (Throwable $exception) {
            report($exception);

            return $this->error('The Stripe dashboard could not be opened.', 422);
        }

        return $this->success(['url' => $link->url], 'Stripe dashboard link created.');
    }

    private function requireProvider(Request $request)
    {
        if (! $request->user()) {
            return $this->error('Unauthenticated', 401);
        }
        if ($request->user()->user_type !== 'freelancer') {
            return $this->error('Only providers can access payouts.', 403);
        }

        return null;
    }

    private function synchronizePayouts(int $providerId, array $stripePayouts): void
    {
        app(\App\Services\ProviderWallet::class)->reconcile($providerId, $stripePayouts);
    }

    private function accountData(?object $account): array
    {
        $currency = strtolower((string) config('services.stripe.currency', 'aud'));
        $destination = $account ? $this->defaultDestination($account, $currency) : null;

        return [
            'connected' => (bool) $account,
            'payouts_enabled' => (bool) data_get($account, 'payouts_enabled', false),
            'details_submitted' => (bool) data_get($account, 'details_submitted', false),
            'onboarding_required' => ! $account
                || ! (bool) data_get($account, 'details_submitted', false)
                || ! (bool) data_get($account, 'payouts_enabled', false),
            'payout_schedule' => data_get($account, 'settings.payouts.schedule.interval'),
            'destination' => $destination ? [
                'type' => data_get($destination, 'object'),
                'bank_name' => data_get($destination, 'bank_name'),
                'last4' => data_get($destination, 'last4'),
                'currency' => data_get($destination, 'currency'),
            ] : null,
        ];
    }

    private function defaultDestination(object $account, string $currency): ?object
    {
        $destinations = data_get($account, 'external_accounts.data', []) ?: [];

        foreach ($destinations as $destination) {
            if (
                strtolower((string) data_get($destination, 'currency')) === $currency
                && (bool) data_get($destination, 'default_for_currency', false)
            ) {
                return $destination;
            }
        }

        return null;
    }

    private function balanceAmount(object $balance, string $bucket, string $currency): int
    {
        foreach (data_get($balance, $bucket, []) ?: [] as $entry) {
            if (strtolower((string) data_get($entry, 'currency')) === $currency) {
                return max(0, (int) data_get($entry, 'amount', 0));
            }
        }

        return 0;
    }

    private function balanceData(int $availableMinor, int $pendingMinor, string $currency): array
    {
        return [
            'currency' => $currency,
            'available_minor' => $availableMinor,
            'available' => $this->minorToMoney($availableMinor),
            'pending_minor' => $pendingMinor,
            'pending' => $this->minorToMoney($pendingMinor),
        ];
    }

    private function payoutData(WithdrawalRequest $withdrawal): array
    {
        return [
            'id' => $withdrawal->id,
            'stripe_payout_id' => $withdrawal->stripe_payout_id,
            'amount' => (string) $withdrawal->requested_amount,
            'currency' => $withdrawal->currency,
            'status' => $withdrawal->status,
            'method' => $withdrawal->method,
            'arrival_at' => $withdrawal->arrival_at?->toIso8601String(),
            'failure_message' => $withdrawal->failure_message,
            'created_at' => $withdrawal->created_at?->toIso8601String(),
        ];
    }

    private function totalEarnings(int $providerId): string
    {
        return number_format((float) Payment::query()
            ->where('provider_id', $providerId)
            ->where('status', Payment::STATUS_SUCCEEDED)
            ->sum('provider_earnings'), 2, '.', '');
    }

    private function paymentMode(): array
    {
        $testMode = str_starts_with((string) config('services.stripe.secret'), 'sk_test_');

        return [
            'test_mode' => $testMode,
            'platform_test_payments' => $testMode
                && str_starts_with((string) config('services.stripe.key'), 'pk_test_')
                && (bool) config('services.stripe.test_platform_payments'),
        ];
    }

    private function moneyToMinor(mixed $amount): int
    {
        $normalized = number_format((float) $amount, 2, '.', '');
        [$whole, $fraction] = explode('.', $normalized);

        return ((int) $whole * 100) + (int) $fraction;
    }

    private function minorToMoney(int $amount): string
    {
        return number_format($amount / 100, 2, '.', '');
    }

    private function minimumPayoutMinor(): int
    {
        return max(1, (int) config('services.stripe.minimum_payout_minor', 1000));
    }
}
