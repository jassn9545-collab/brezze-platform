<?php

namespace App\Http\Controllers\Api;

use App\Contracts\PayoutGateway;
use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\WithdrawalRequest;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Stripe\Exception\ApiErrorException;
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
            'payouts' => $history(),
        ], 'Payout information retrieved successfully.');
    }

    public function store(Request $request, PayoutGateway $gateway)
    {
        if ($response = $this->requireProvider($request)) {
            return $response;
        }

        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:0.01', 'max:999999999.99', 'regex:/^\d{1,9}(\.\d{1,2})?$/'],
            'idempotency_key' => ['required', 'string', 'min:16', 'max:100'],
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

        $requestKey = trim($validated['idempotency_key']);
        $withdrawal = WithdrawalRequest::query()
            ->where('provider_id', $provider->id)
            ->where('idempotency_key', $requestKey)
            ->first();

        if ($withdrawal) {
            if ($this->moneyToMinor($withdrawal->requested_amount) !== $amountMinor) {
                return $this->error('This payout request key was already used for another amount.', 409);
            }
            if ($withdrawal->stripe_payout_id) {
                return $this->success([
                    'payout' => $this->payoutData($withdrawal),
                ], 'This payout request was already submitted.');
            }
            if ($withdrawal->status === WithdrawalRequest::STATUS_FAILED) {
                return $this->error(
                    $withdrawal->failure_message ?: 'The payout request failed. Submit a new request.',
                    422,
                    ['payout' => $this->payoutData($withdrawal)]
                );
            }
        }

        try {
            $account = $gateway->retrieveConnectedAccount($provider->stripe_account_id);
            if (! (bool) data_get($account, 'payouts_enabled', false)) {
                return $this->error('Complete Stripe verification before withdrawing funds.', 422);
            }
            if (! $this->defaultDestination($account, $currency)) {
                return $this->error('Add a payout bank account in Stripe before withdrawing funds.', 422);
            }

            $balance = $gateway->retrieveBalance($provider->stripe_account_id);
            $availableMinor = $this->balanceAmount($balance, 'available', $currency);
            if ($amountMinor > $availableMinor) {
                return $this->error('The requested amount is greater than your available Stripe balance.', 422, [
                    'available_minor' => $availableMinor,
                    'available' => $this->minorToMoney($availableMinor),
                ]);
            }

            $withdrawal ??= WithdrawalRequest::create([
                'provider_id' => $provider->id,
                'requested_amount' => $this->minorToMoney($amountMinor),
                'currency' => $currency,
                'status' => WithdrawalRequest::STATUS_PROCESSING,
                'idempotency_key' => $requestKey,
                'method' => 'standard',
            ]);

            if (data_get($account, 'settings.payouts.schedule.interval') !== 'manual') {
                $gateway->setManualPayoutSchedule($provider->stripe_account_id);
            }

            $stripePayout = $gateway->createPayout([
                'amount' => $amountMinor,
                'currency' => $currency,
                'method' => 'standard',
                'description' => 'Our Bezzie provider withdrawal',
                'metadata' => [
                    'provider_id' => (string) $provider->id,
                    'withdrawal_request_id' => (string) $withdrawal->id,
                ],
            ], $this->stripeIdempotencyKey((int) $provider->id, $requestKey), $provider->stripe_account_id);

            $this->applyStripePayout($withdrawal, $stripePayout);
        } catch (ApiErrorException $exception) {
            $this->markFailed($withdrawal ?? null, $exception->getStripeCode(), $exception->getMessage());
            Log::warning('Stripe provider payout failed.', [
                'provider_id' => $provider->id,
                'stripe_code' => $exception->getStripeCode(),
            ]);

            return $this->error($this->safePayoutError($exception), 422);
        } catch (Throwable $exception) {
            $this->markFailed($withdrawal ?? null, 'payout_request_failed', $exception->getMessage());
            report($exception);

            return $this->error('The payout could not be submitted. Please try again.', 500);
        }

        return $this->success([
            'payout' => $this->payoutData($withdrawal->fresh()),
        ], 'Your payout is being processed by Stripe.', 201);
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
        foreach ($stripePayouts as $stripePayout) {
            $withdrawal = WithdrawalRequest::query()
                ->where('provider_id', $providerId)
                ->where('stripe_payout_id', data_get($stripePayout, 'id'))
                ->first();
            if ($withdrawal) {
                $this->applyStripePayout($withdrawal, $stripePayout);
            }
        }
    }

    private function applyStripePayout(WithdrawalRequest $withdrawal, object $payout): void
    {
        $status = $this->normalizeStatus((string) data_get($payout, 'status', 'pending'));
        $processed = in_array($status, [
            WithdrawalRequest::STATUS_PAID,
            WithdrawalRequest::STATUS_FAILED,
            WithdrawalRequest::STATUS_CANCELED,
        ], true);

        $withdrawal->update([
            'stripe_payout_id' => data_get($payout, 'id'),
            'payment_reference' => data_get($payout, 'id'),
            'destination' => data_get($payout, 'destination'),
            'method' => data_get($payout, 'method', 'standard'),
            'status' => $status,
            'arrival_at' => data_get($payout, 'arrival_date')
                ? now()->setTimestamp((int) data_get($payout, 'arrival_date'))
                : null,
            'failure_code' => data_get($payout, 'failure_code'),
            'failure_message' => data_get($payout, 'failure_message'),
            'processed_at' => $processed ? now() : null,
        ]);
    }

    private function markFailed(?WithdrawalRequest $withdrawal, ?string $code, string $message): void
    {
        $withdrawal?->update([
            'status' => WithdrawalRequest::STATUS_FAILED,
            'failure_code' => $code ?: 'stripe_error',
            'failure_message' => Str::limit($message, 2000),
            'processed_at' => now(),
        ]);
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

    private function normalizeStatus(string $status): string
    {
        return match ($status) {
            'paid' => WithdrawalRequest::STATUS_PAID,
            'failed' => WithdrawalRequest::STATUS_FAILED,
            'canceled', 'cancelled' => WithdrawalRequest::STATUS_CANCELED,
            'in_transit' => WithdrawalRequest::STATUS_IN_TRANSIT,
            default => WithdrawalRequest::STATUS_PENDING,
        };
    }

    private function totalEarnings(int $providerId): string
    {
        return number_format((float) Payment::query()
            ->where('provider_id', $providerId)
            ->where('status', Payment::STATUS_SUCCEEDED)
            ->sum('provider_earnings'), 2, '.', '');
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

    private function stripeIdempotencyKey(int $providerId, string $requestKey): string
    {
        return 'provider-payout-'.$providerId.'-'.hash('sha256', $requestKey);
    }

    private function safePayoutError(ApiErrorException $exception): string
    {
        return match ($exception->getStripeCode()) {
            'balance_insufficient' => 'Your Stripe balance is not yet available for this payout.',
            'account_invalid' => 'Your Stripe payout account needs attention before withdrawing.',
            default => 'Stripe could not process this payout. Check your payout account and try again.',
        };
    }
}
