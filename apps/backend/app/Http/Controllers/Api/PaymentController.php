<?php

namespace App\Http\Controllers\Api;

use App\Contracts\PaymentGateway;
use App\Contracts\CustomerPaymentGateway;
use App\Http\Controllers\Controller;
use App\Models\Bid;
use App\Models\Payment;
use App\Models\Project;
use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Throwable;

class PaymentController extends Controller
{
    use ApiResponse;

    public function createIntent(
        Request $request,
        PaymentGateway $gateway,
        CustomerPaymentGateway $customerGateway
    )
    {
        if ($response = $this->requireClient($request)) {
            return $response;
        }

        $validator = Validator::make($request->all(), [
            'job_id' => 'required|integer|exists:projects,id',
        ]);
        if ($validator->fails()) {
            return $this->error($validator->errors()->first(), 400, $validator->errors());
        }

        if (! config('services.stripe.secret') || ! config('services.stripe.key')) {
            return $this->error('Online payment is not configured.', 503);
        }

        $gatewayError = null;
        $intent = null;
        $alreadyPaid = false;
        $stripeAccountId = null;
        $usePlatformTestCharge = $this->usePlatformTestCharge();
        $stripeCustomerId = null;
        $customerSessionSecret = null;

        if ($usePlatformTestCharge) {
            try {
                $stripeCustomerId = $this->ensureStripeCustomer($request->user(), $customerGateway);
                $customerSessionSecret = $customerGateway
                    ->createCustomerSession($stripeCustomerId)
                    ->client_secret;
            } catch (Throwable $exception) {
                report($exception);

                return $this->error('Payment customer session could not be started.', 422);
            }
        }

        try {
            $payment = DB::transaction(function () use (
                $request,
                $gateway,
                &$gatewayError,
                &$intent,
                &$alreadyPaid,
                &$stripeAccountId,
                $usePlatformTestCharge,
                $stripeCustomerId
            ) {
                $job = Project::query()->lockForUpdate()->find($request->integer('job_id'));
                if (! $job || (int) $job->user_id !== (int) $request->user()->id) {
                    abort(404, 'Job not found.');
                }
                if (! in_array($job->status, ['in progress', 'completed'], true)) {
                    abort(422, 'Payment is available only for an in-progress job.');
                }

                $hiredBid = Bid::query()
                    ->where('project_id', $job->id)
                    ->where('is_hired', 1)
                    ->lockForUpdate()
                    ->first();
                if (! $hiredBid) {
                    abort(422, 'The completed job does not have a hired provider.');
                }

                $provider = User::query()->find($hiredBid->user_id);
                if (! $provider) {
                    abort(422, 'The hired provider is unavailable.');
                }

                if (! $usePlatformTestCharge) {
                    if (! $provider->stripe_account_id) {
                        abort(422, 'The provider has not completed payment onboarding.');
                    }
                    $stripeAccountId = $provider->stripe_account_id;

                    $account = $gateway->retrieveConnectedAccount($stripeAccountId);
                    $chargesEnabled = data_get(
                        $account,
                        'configuration.merchant.capabilities.card_payments.status'
                    ) === 'active';
                    $payoutsEnabled = data_get(
                        $account,
                        'configuration.merchant.capabilities.stripe_balance.payouts.status'
                    ) === 'active';
                    if (! $chargesEnabled || ! $payoutsEnabled) {
                        abort(422, 'The provider must finish Stripe payment setup before this job can be paid.');
                    }
                }

                $amountMinor = $this->moneyToMinor($hiredBid->bid_amount);
                $commissionMinor = intdiv(
                    ($amountMinor * Payment::COMMISSION_PERCENT) + 50,
                    100
                );
                $providerEarningsMinor = $amountMinor - $commissionMinor;
                $currency = strtolower((string) config('services.stripe.currency', 'aud'));

                $payment = Payment::query()
                    ->where('project_id', $job->id)
                    ->lockForUpdate()
                    ->first();

                if ($payment && $payment->status === Payment::STATUS_SUCCEEDED) {
                    $alreadyPaid = true;

                    return $payment;
                }

                if (! $payment) {
                    $payment = Payment::create([
                        'project_id' => $job->id,
                        'customer_id' => $request->user()->id,
                        'provider_id' => $provider->id,
                        'currency' => $currency,
                        'amount_minor' => $amountMinor,
                        'commission_minor' => $commissionMinor,
                        'provider_earnings_minor' => $providerEarningsMinor,
                        'amount' => $this->minorToMoney($amountMinor),
                        'commission_amount' => $this->minorToMoney($commissionMinor),
                        'provider_earnings' => $this->minorToMoney($providerEarningsMinor),
                        'commission_rate' => Payment::COMMISSION_PERCENT,
                        'status' => Payment::STATUS_PENDING,
                    ]);
                } else {
                    $this->assertPaymentLedgerMatches(
                        $payment,
                        $request->user()->id,
                        $provider->id,
                        $amountMinor,
                        $commissionMinor,
                        $providerEarningsMinor,
                        $currency
                    );
                }

                if (
                    $payment->stripe_payment_intent_id &&
                    in_array($payment->status, [
                        Payment::STATUS_PENDING,
                        Payment::STATUS_PROCESSING,
                    ], true)
                ) {
                    $intent = $gateway->retrievePaymentIntent(
                        $payment->stripe_payment_intent_id,
                        $stripeAccountId
                    );
                    $this->synchronizePayment($payment, $intent, $stripeAccountId);
                    if ($payment->status === Payment::STATUS_SUCCEEDED) {
                        $alreadyPaid = true;
                    }
                    if (! in_array($payment->status, [
                        Payment::STATUS_FAILED,
                        Payment::STATUS_CANCELLED,
                    ], true)) {
                        return $payment;
                    }
                }

                $payment->attempts++;
                $payment->status = Payment::STATUS_PENDING;
                $payment->failure_code = null;
                $payment->failure_message = null;
                $payment->failed_at = null;
                $payment->cancelled_at = null;
                $payment->save();

                try {
                    $intentParameters = [
                        'amount' => $payment->amount_minor,
                        'currency' => $payment->currency,
                        'automatic_payment_methods' => ['enabled' => true],
                        'description' => 'Payment for job #'.$job->id,
                        'receipt_email' => $request->user()->email,
                        'metadata' => [
                            'payment_id' => (string) $payment->id,
                            'job_id' => (string) $job->id,
                            'customer_id' => (string) $request->user()->id,
                            'provider_id' => (string) $provider->id,
                            'commission_percent' => (string) Payment::COMMISSION_PERCENT,
                            'charge_model' => $usePlatformTestCharge ? 'platform_test' : 'direct',
                        ],
                    ];
                    if (! $usePlatformTestCharge) {
                        $intentParameters['application_fee_amount'] = $payment->commission_minor;
                    } else {
                        $intentParameters['customer'] = $stripeCustomerId;
                        $intentParameters['setup_future_usage'] = 'off_session';
                    }

                    $intent = $gateway->createPaymentIntent(
                        $intentParameters,
                        'job-payment-'.$payment->id.'-attempt-'.$payment->attempts,
                        $stripeAccountId
                    );

                    $payment->stripe_payment_intent_id = $intent->id;
                    $this->synchronizePayment($payment, $intent, $stripeAccountId);
                } catch (Throwable $exception) {
                    $payment->status = Payment::STATUS_FAILED;
                    $payment->failure_code = $this->gatewayErrorCode($exception);
                    $payment->failure_message = $exception->getMessage();
                    $payment->failed_at = now();
                    $payment->save();
                    $gatewayError = $exception;
                }

                return $payment;
            });
        } catch (\Symfony\Component\HttpKernel\Exception\HttpException $exception) {
            return $this->error($exception->getMessage(), $exception->getStatusCode());
        } catch (Throwable $exception) {
            report($exception);

            return $this->error('Payment could not be started.', 500);
        }

        if ($gatewayError) {
            Log::warning('Stripe payment intent creation failed.', [
                'payment_id' => $payment->id,
                'code' => $payment->failure_code,
            ]);

            return $this->error('Payment could not be started. Please try again.', 422);
        }

        return $this->success([
            'payment' => $this->paymentData($payment),
            'publishable_key' => config('services.stripe.key'),
            'stripe_account_id' => $stripeAccountId,
            'stripe_customer_id' => $stripeCustomerId,
            'customer_session_client_secret' => $customerSessionSecret,
            'client_secret' => $alreadyPaid ? null : ($intent->client_secret ?? null),
            'already_paid' => $alreadyPaid,
        ], $alreadyPaid ? 'This job is already paid.' : 'Payment is ready.');
    }

    public function status(Request $request, int $jobId)
    {
        if ($response = $this->requireClient($request)) {
            return $response;
        }

        $job = Project::query()
            ->where('id', $jobId)
            ->where('user_id', $request->user()->id)
            ->first();
        if (! $job) {
            return $this->error('Job not found.', 404);
        }

        $payment = Payment::query()->where('project_id', $job->id)->first();

        return $this->success([
            'payment' => $payment ? $this->paymentData($payment) : [
                'job_id' => $job->id,
                'status' => 'unpaid',
            ],
        ]);
    }

    public function verify(Request $request, int $paymentId, PaymentGateway $gateway)
    {
        if ($response = $this->requireClient($request)) {
            return $response;
        }

        $payment = Payment::query()
            ->where('id', $paymentId)
            ->where('customer_id', $request->user()->id)
            ->first();
        if (! $payment || ! $payment->stripe_payment_intent_id) {
            return $this->error('Payment not found.', 404);
        }

        $usePlatformTestCharge = $this->usePlatformTestCharge();
        $stripeAccountId = $usePlatformTestCharge
            ? null
            : $this->providerStripeAccount($payment);
        if (! $usePlatformTestCharge && ! $stripeAccountId) {
            return $this->error('The provider payment account is unavailable.', 422);
        }

        try {
            $intent = $gateway->retrievePaymentIntent(
                $payment->stripe_payment_intent_id,
                $stripeAccountId
            );
            DB::transaction(function () use ($payment, $intent, $stripeAccountId) {
                $lockedPayment = Payment::query()->lockForUpdate()->findOrFail($payment->id);
                $this->synchronizePayment($lockedPayment, $intent, $stripeAccountId);
            });
            $payment->refresh();
        } catch (Throwable $exception) {
            report($exception);

            return $this->error('Payment verification failed. Please try again.', 422);
        }

        if ($payment->status === Payment::STATUS_SUCCEEDED) {
            return $this->success([
                'payment' => $this->paymentData($payment),
            ], 'Payment verified successfully.');
        }

        if ($payment->status === Payment::STATUS_PROCESSING) {
            return $this->success([
                'payment' => $this->paymentData($payment),
            ], 'Payment is processing.', 202);
        }

        return $this->error(
            $payment->status === Payment::STATUS_CANCELLED
                ? 'Payment was cancelled.'
                : 'Payment was not successful.',
            422,
            ['payment' => $this->paymentData($payment)]
        );
    }

    public function cancel(Request $request, int $paymentId, PaymentGateway $gateway)
    {
        if ($response = $this->requireClient($request)) {
            return $response;
        }

        $payment = Payment::query()
            ->where('id', $paymentId)
            ->where('customer_id', $request->user()->id)
            ->first();
        if (! $payment || ! $payment->stripe_payment_intent_id) {
            return $this->error('Payment not found.', 404);
        }
        if ($payment->status === Payment::STATUS_SUCCEEDED) {
            return $this->success([
                'payment' => $this->paymentData($payment),
                'already_paid' => true,
            ], 'This job is already paid.');
        }

        $usePlatformTestCharge = $this->usePlatformTestCharge();
        $stripeAccountId = $usePlatformTestCharge
            ? null
            : $this->providerStripeAccount($payment);
        if (! $usePlatformTestCharge && ! $stripeAccountId) {
            return $this->error('The provider payment account is unavailable.', 422);
        }

        try {
            $intent = $gateway->retrievePaymentIntent(
                $payment->stripe_payment_intent_id,
                $stripeAccountId
            );
            if (! in_array($intent->status, ['succeeded', 'canceled'], true)) {
                $intent = $gateway->cancelPaymentIntent(
                    $payment->stripe_payment_intent_id,
                    $stripeAccountId
                );
            }
            DB::transaction(function () use ($payment, $intent, $stripeAccountId) {
                $lockedPayment = Payment::query()->lockForUpdate()->findOrFail($payment->id);
                $this->synchronizePayment($lockedPayment, $intent, $stripeAccountId);
            });
            $payment->refresh();
        } catch (Throwable $exception) {
            report($exception);

            return $this->error('Payment cancellation could not be confirmed.', 422);
        }

        return $this->success([
            'payment' => $this->paymentData($payment),
        ], 'Payment cancelled.');
    }

    public function providerHistory(Request $request)
    {
        if (! $request->user() || $request->user()->user_type !== 'freelancer') {
            return $this->error('Only providers can access earnings.', 403);
        }

        $perPage = min(max($request->integer('per_page', 10), 1), 50);
        $payments = Payment::query()
            ->with('project:id,title')
            ->where('provider_id', $request->user()->id)
            ->latest()
            ->paginate($perPage);

        $totalEarnings = Payment::query()
            ->where('provider_id', $request->user()->id)
            ->where('status', Payment::STATUS_SUCCEEDED)
            ->sum('provider_earnings');

        return $this->success([
            'payments' => collect($payments->items())
                ->map(fn (Payment $payment) => $this->paymentData($payment))
                ->values(),
            'total_earnings' => number_format((float) $totalEarnings, 2, '.', ''),
            'total_pages' => $payments->lastPage(),
            'current_page' => $payments->currentPage(),
            'total' => $payments->total(),
            'per_page' => $payments->perPage(),
        ], 'Payment history retrieved successfully.');
    }

    public function webhook(Request $request, PaymentGateway $gateway)
    {
        $secret = (string) config('services.stripe.webhook_secret');
        if ($secret === '') {
            return response()->json(['message' => 'Stripe webhook is not configured.'], 503);
        }

        try {
            $event = $gateway->constructWebhookEvent(
                $request->getContent(),
                (string) $request->header('Stripe-Signature'),
                $secret
            );
        } catch (Throwable $exception) {
            return response()->json(['message' => 'Invalid webhook signature.'], 400);
        }

        if (in_array($event->type, [
            'payment_intent.succeeded',
            'payment_intent.processing',
            'payment_intent.payment_failed',
            'payment_intent.canceled',
        ], true)) {
            $intent = $event->data->object;
            $payment = Payment::query()
                ->where('stripe_payment_intent_id', $intent->id)
                ->first();
            if ($payment) {
                $stripeAccountId = is_string($event->account ?? null)
                    ? $event->account
                    : null;
                DB::transaction(function () use ($payment, $intent, $stripeAccountId) {
                    $lockedPayment = Payment::query()->lockForUpdate()->findOrFail($payment->id);
                    $this->synchronizePayment($lockedPayment, $intent, $stripeAccountId);
                });
            }
        }

        return response()->json(['received' => true]);
    }

    private function requireClient(Request $request)
    {
        if (! $request->user()) {
            return $this->error('Unauthenticated', 401);
        }
        if ($request->user()->user_type !== 'client') {
            return $this->error('Only clients can make payments.', 403);
        }

        return null;
    }

    private function ensureStripeCustomer(
        User $user,
        CustomerPaymentGateway $gateway
    ): string {
        if ($user->stripe_customer_id) {
            return $user->stripe_customer_id;
        }

        $customer = $gateway->createCustomer([
            'name' => $user->name,
            'email' => $user->email,
            'metadata' => ['bezzie_user_id' => (string) $user->id],
        ]);
        $user->stripe_customer_id = $customer->id;
        $user->save();

        return $customer->id;
    }

    private function moneyToMinor(mixed $amount): int
    {
        $normalized = str_replace([',', ' '], '', trim((string) $amount));
        if (! preg_match('/^(\d+)(?:\.(\d{1,2}))?$/', $normalized, $matches)) {
            abort(422, 'The hired bid amount is invalid.');
        }

        $whole = (int) $matches[1];
        $fraction = str_pad($matches[2] ?? '', 2, '0');
        $minor = ($whole * 100) + (int) $fraction;
        if ($minor < 1) {
            abort(422, 'The hired bid amount must be greater than zero.');
        }

        return $minor;
    }

    private function minorToMoney(int $minor): string
    {
        return intdiv($minor, 100).'.'.str_pad((string) ($minor % 100), 2, '0');
    }

    private function assertPaymentLedgerMatches(
        Payment $payment,
        int $customerId,
        int $providerId,
        int $amountMinor,
        int $commissionMinor,
        int $providerEarningsMinor,
        string $currency
    ): void {
        if (
            (int) $payment->customer_id !== $customerId ||
            (int) $payment->provider_id !== $providerId ||
            (int) $payment->amount_minor !== $amountMinor ||
            (int) $payment->commission_minor !== $commissionMinor ||
            (int) $payment->provider_earnings_minor !== $providerEarningsMinor ||
            strtolower($payment->currency) !== $currency
        ) {
            abort(409, 'Stored payment details do not match the completed job.');
        }
    }

    private function synchronizePayment(
        Payment $payment,
        object $intent,
        ?string $connectedAccountId
    ): void
    {
        if ($payment->stripe_payment_intent_id && $payment->stripe_payment_intent_id !== $intent->id) {
            abort(409, 'Payment intent mismatch.');
        }
        if ((int) $intent->amount !== (int) $payment->amount_minor) {
            abort(409, 'Payment amount verification failed.');
        }
        if (strtolower((string) $intent->currency) !== strtolower($payment->currency)) {
            abort(409, 'Payment currency verification failed.');
        }

        $metadata = $this->stripeObjectToArray($intent->metadata ?? []);
        $expectedMetadata = [
            'payment_id' => (string) $payment->id,
            'job_id' => (string) $payment->project_id,
            'customer_id' => (string) $payment->customer_id,
            'provider_id' => (string) $payment->provider_id,
        ];
        foreach ($expectedMetadata as $key => $value) {
            if (($metadata[$key] ?? null) !== $value) {
                abort(409, 'Payment metadata verification failed.');
            }
        }

        $chargeModel = $metadata['charge_model'] ?? null;
        if ($chargeModel === 'direct') {
            $providerStripeAccount = $this->providerStripeAccount($payment);
            if (
                ! $providerStripeAccount ||
                ! $connectedAccountId ||
                $connectedAccountId !== $providerStripeAccount
            ) {
                abort(409, 'Payment account verification failed.');
            }
            if ((int) ($intent->application_fee_amount ?? -1) !== (int) $payment->commission_minor) {
                abort(409, 'Payment commission verification failed.');
            }
        } elseif (
            $chargeModel !== 'platform_test' ||
            ! $this->usePlatformTestCharge() ||
            $connectedAccountId !== null
        ) {
            abort(409, 'Payment charge model verification failed.');
        }

        $payment->stripe_payment_intent_id = $intent->id;
        $payment->failure_code = null;
        $payment->failure_message = null;

        switch ($intent->status) {
            case 'succeeded':
                $payment->status = Payment::STATUS_SUCCEEDED;
                $payment->transaction_id = $this->transactionId($intent);
                $payment->paid_at ??= now();
                $payment->failed_at = null;
                $payment->cancelled_at = null;
                Project::query()
                    ->where('id', $payment->project_id)
                    ->where('user_id', $payment->customer_id)
                    ->where('status', 'in progress')
                    ->update(['status' => 'completed']);
                break;
            case 'processing':
                $payment->status = Payment::STATUS_PROCESSING;
                break;
            case 'canceled':
                $payment->status = Payment::STATUS_CANCELLED;
                $payment->cancelled_at = now();
                break;
            case 'requires_payment_method':
                if (! empty($intent->last_payment_error)) {
                    $payment->status = Payment::STATUS_FAILED;
                    $lastError = $this->stripeObjectToArray($intent->last_payment_error);
                    $payment->failure_code = $lastError['code'] ?? null;
                    $payment->failure_message = $lastError['message'] ?? 'Payment failed.';
                    $payment->failed_at = now();
                } else {
                    $payment->status = Payment::STATUS_PENDING;
                }
                break;
            default:
                $payment->status = Payment::STATUS_PENDING;
                break;
        }

        $payment->save();
    }

    private function stripeObjectToArray(mixed $value): array
    {
        if (is_array($value)) {
            return $value;
        }
        if (is_object($value) && method_exists($value, 'toArray')) {
            return $value->toArray();
        }

        return (array) $value;
    }

    private function transactionId(object $intent): string
    {
        $charge = $intent->latest_charge ?? null;
        if (is_string($charge) && $charge !== '') {
            return $charge;
        }
        if (is_object($charge) && isset($charge->id)) {
            return (string) $charge->id;
        }

        return (string) $intent->id;
    }

    private function providerStripeAccount(Payment $payment): ?string
    {
        $accountId = User::query()
            ->where('id', $payment->provider_id)
            ->value('stripe_account_id');

        return is_string($accountId) && $accountId !== '' ? $accountId : null;
    }

    private function usePlatformTestCharge(): bool
    {
        return (bool) config('services.stripe.test_platform_payments')
            && str_starts_with((string) config('services.stripe.secret'), 'sk_test_')
            && str_starts_with((string) config('services.stripe.key'), 'pk_test_');
    }

    private function gatewayErrorCode(Throwable $exception): ?string
    {
        return method_exists($exception, 'getStripeCode')
            ? $exception->getStripeCode()
            : (string) $exception->getCode();
    }

    private function paymentData(Payment $payment): array
    {
        return [
            'id' => $payment->id,
            'job_id' => $payment->project_id,
            'job_title' => $payment->relationLoaded('project')
                ? $payment->project?->title
                : null,
            'customer_id' => $payment->customer_id,
            'provider_id' => $payment->provider_id,
            'transaction_id' => $payment->transaction_id,
            'amount' => $payment->amount,
            'commission' => $payment->commission_amount,
            'provider_earnings' => $payment->provider_earnings,
            'currency' => strtoupper($payment->currency),
            'status' => $payment->status,
            'paid_at' => $payment->paid_at?->toIso8601String(),
            'created_at' => $payment->created_at?->toIso8601String(),
        ];
    }
}
