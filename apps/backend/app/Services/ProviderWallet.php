<?php

namespace App\Services;

use App\Contracts\PayoutGateway;
use App\Models\Payment;
use App\Models\User;
use App\Models\WithdrawalRequest;
use Illuminate\Support\Facades\DB;
use Stripe\Exception\ApiErrorException;
use Throwable;

class ProviderWallet
{
    // Payments are credit entries; withdrawal requests are debit/reservation
    // entries. Deriving the balance avoids double credit on webhook retries.
    public function balance(int $providerId, string $currency): array
    {
        $earned = Payment::query()->where('provider_id', $providerId)
            ->where('currency', $currency)->where('status', Payment::STATUS_SUCCEEDED)
            ->get(['provider_earnings'])->sum(fn ($payment) => $this->minor((string) $payment->provider_earnings));
        $withdrawals = WithdrawalRequest::query()->where('provider_id', $providerId)
            ->where('currency', $currency)->get(['requested_amount', 'status']);
        $debited = 0;
        $reserved = 0;
        foreach ($withdrawals as $withdrawal) {
            if (in_array($withdrawal->status, ['failed', 'canceled', 'rejected'], true)) {
                continue;
            }
            $amount = $this->minor((string) $withdrawal->requested_amount);
            $debited += $amount;
            if ($withdrawal->status !== 'paid') {
                $reserved += $amount;
            }
        }

        return [
            'currency' => $currency,
            'available_minor' => max(0, $earned - $debited),
            'available' => $this->money(max(0, $earned - $debited)),
            'reserved_minor' => $reserved,
            'reserved' => $this->money($reserved),
            'withdrawn_minor' => $debited - $reserved,
            'withdrawn' => $this->money($debited - $reserved),
        ];
    }

    public function reserve(User $provider, string $currency, int $amount, string $key): WithdrawalRequest
    {
        return DB::transaction(function () use ($provider, $currency, $amount, $key) {
            // Serialize all requests for a provider, including different keys.
            User::query()->whereKey($provider->id)->lockForUpdate()->firstOrFail();
            $existing = WithdrawalRequest::query()->where('provider_id', $provider->id)
                ->where('idempotency_key', $key)->first();
            if ($existing) {
                abort_if($existing->currency !== $currency || $this->minor($existing->requested_amount) !== $amount,
                    409, 'This withdrawal request key was already used for another amount.');

                return $existing;
            }
            abort_if($amount > $this->balance($provider->id, $currency)['available_minor'],
                422, 'The requested amount exceeds your available wallet balance.');

            return WithdrawalRequest::create([
                'provider_id' => $provider->id,
                'requested_amount' => $this->money($amount),
                'currency' => $currency,
                'status' => WithdrawalRequest::STATUS_AWAITING_SETTLEMENT,
                'idempotency_key' => $key,
                'method' => 'standard',
            ]);
        });
    }

    public function process(WithdrawalRequest $request, PayoutGateway $gateway): void
    {
        // Persist the submission marker BEFORE calling Stripe. A crash after
        // Stripe succeeds must leave a durable reservation and retry identity.
        $ready = DB::transaction(function () use ($request, $gateway) {
            $provider = User::query()->whereKey($request->provider_id)->lockForUpdate()->firstOrFail();
            $withdrawal = WithdrawalRequest::query()->whereKey($request->id)->lockForUpdate()->firstOrFail();
            if ($withdrawal->stripe_payout_id || ! in_array($withdrawal->status, ['awaiting_settlement', 'processing'], true)) {
                return false;
            }
            if (! $withdrawal->idempotency_key || ! $provider->stripe_account_id) {
                return false;
            }
            if ($withdrawal->stripe_submission_started_at) {
                // Never replay an uncertain payout after Stripe may expire its
                // idempotency key. Keep it reserved for manual reconciliation.
                return $withdrawal->stripe_submission_started_at->gt(now()->subHours(23));
            }
            try {
                $account = $gateway->retrieveConnectedAccount($provider->stripe_account_id);
                if (! data_get($account, 'payouts_enabled', false)) {
                    return false;
                }
                if (data_get($account, 'settings.payouts.schedule.interval') !== 'manual') {
                    $gateway->setManualPayoutSchedule($provider->stripe_account_id);
                }
                $available = 0;
                foreach (data_get($gateway->retrieveBalance($provider->stripe_account_id), 'available', []) as $entry) {
                    if (data_get($entry, 'currency') === $withdrawal->currency) {
                        $available += (int) data_get($entry, 'amount', 0);
                    }
                }
                if ($available < $this->minor($withdrawal->requested_amount)) {
                    return false;
                }
                $withdrawal->update(['status' => 'processing', 'stripe_submission_started_at' => now()]);

                return true;
            } catch (Throwable $exception) {
                report($exception);

                return false;
            }
        });
        if (! $ready) {
            return;
        }
        $withdrawal = $request->fresh();
        $provider = $withdrawal->provider;
        try {
            $payout = $gateway->createPayout([
                'amount' => $this->minor($withdrawal->requested_amount),
                'currency' => $withdrawal->currency,
                'method' => 'standard',
                'description' => 'Our Bezzie provider withdrawal',
                'metadata' => ['provider_id' => (string) $provider->id, 'withdrawal_request_id' => (string) $withdrawal->id],
            ], 'provider-payout-'.$provider->id.'-'.hash('sha256', $withdrawal->idempotency_key).'-attempt-'.(int) $withdrawal->stripe_submission_attempt, $provider->stripe_account_id);
            $this->apply($withdrawal, $payout);
        } catch (ApiErrorException $exception) {
            if ($exception->getStripeCode() === 'balance_insufficient') {
                // Stripe definitively rejected the attempt; it is safe to wait
                // for funds, retaining the original request identity.
                DB::transaction(function () use ($withdrawal) {
                    User::query()->whereKey($withdrawal->provider_id)->lockForUpdate()->firstOrFail();
                    WithdrawalRequest::query()->whereKey($withdrawal->id)
                        ->whereNull('stripe_payout_id')->where('status', 'processing')
                        ->where('stripe_submission_attempt', $withdrawal->stripe_submission_attempt)
                        ->update(['status' => 'awaiting_settlement', 'stripe_submission_started_at' => null,
                            'stripe_submission_attempt' => (int) $withdrawal->stripe_submission_attempt + 1]);
                });
            } elseif (! ($exception instanceof \Stripe\Exception\IdempotencyException) && $exception->getHttpStatus() >= 400 && $exception->getHttpStatus() < 500
                && ! in_array($exception->getHttpStatus(), [409, 429], true)) {
                DB::transaction(function () use ($withdrawal) {
                    User::query()->whereKey($withdrawal->provider_id)->lockForUpdate()->firstOrFail();
                    $withdrawal->refresh();
                    if (! $withdrawal->stripe_payout_id) {
                        $withdrawal->update(['status' => 'failed', 'failure_message' => 'Stripe rejected this withdrawal. Your wallet funds have been restored.', 'processed_at' => now()]);
                    }
                });
            }
            report($exception);
        } catch (Throwable $exception) {
            // Unknown/network errors may follow a successful Stripe POST.
            // Preserve the reservation and original submission time/key.
            report($exception);
        }
    }

    public function apply(WithdrawalRequest $withdrawal, object $payout): void
    {
        $status = (string) data_get($payout, 'status', 'pending');
        $status = in_array($status, ['paid', 'failed', 'canceled', 'in_transit'], true) ? $status : 'pending';
        DB::transaction(function () use ($withdrawal, $payout, $status) {
            User::query()->whereKey($withdrawal->provider_id)->lockForUpdate()->firstOrFail();
            $withdrawal->refresh();
            // Ignore delayed nonterminal events after a final status.
            if (in_array($withdrawal->status, ['paid', 'failed', 'canceled'], true)
                && in_array($status, ['pending', 'in_transit'], true)) {
                return;
            }
            $withdrawal->update([
                'stripe_payout_id' => data_get($payout, 'id'),
                'payment_reference' => data_get($payout, 'id'),
                'destination' => data_get($payout, 'destination'),
                'method' => data_get($payout, 'method', 'standard'),
                'status' => $status,
                'arrival_at' => data_get($payout, 'arrival_date') ? now()->setTimestamp((int) data_get($payout, 'arrival_date')) : null,
                'failure_code' => data_get($payout, 'failure_code'),
                'failure_message' => data_get($payout, 'failure_message'),
                'processed_at' => in_array($status, ['paid', 'failed', 'canceled'], true) ? now() : null,
            ]);
        });
    }

    public function reconcile(int $providerId, array $payouts): void
    {
        DB::transaction(function () use ($providerId, $payouts) {
            User::query()->whereKey($providerId)->lockForUpdate()->firstOrFail();
            foreach ($payouts as $payout) {
                $id = data_get($payout, 'id');
                if (! $id) {
                    continue;
                }
                $withdrawal = WithdrawalRequest::query()->where('provider_id', $providerId)
                    ->where('stripe_payout_id', $id)->first();
                if (! $withdrawal && (string) data_get($payout, 'metadata.provider_id') === (string) $providerId) {
                    $withdrawal = WithdrawalRequest::query()->where('provider_id', $providerId)
                        ->whereKey(data_get($payout, 'metadata.withdrawal_request_id'))->first();
                }
                if (! $withdrawal) {
                    if ((int) data_get($payout, 'amount', 0) <= 0 || ! data_get($payout, 'currency')) {
                        continue;
                    }
                    $withdrawal = WithdrawalRequest::create([
                        'provider_id' => $providerId,
                        'requested_amount' => $this->money((int) data_get($payout, 'amount')),
                        'currency' => data_get($payout, 'currency'),
                        'stripe_payout_id' => $id,
                        'status' => 'pending',
                        'method' => data_get($payout, 'method', 'standard'),
                        'created_at' => data_get($payout, 'created') ? now()->setTimestamp((int) data_get($payout, 'created')) : now(),
                    ]);
                }
                $this->apply($withdrawal, $payout);
            }
        });
    }

    public function minor(string $amount): int
    {
        [$whole, $fraction] = array_pad(explode('.', $amount, 2), 2, '');

        return (int) $whole * 100 + (int) str_pad(substr($fraction, 0, 2), 2, '0');
    }

    private function money(int $amount): string
    {
        return intdiv($amount, 100).'.'.str_pad((string) ($amount % 100), 2, '0', STR_PAD_LEFT);
    }
}
