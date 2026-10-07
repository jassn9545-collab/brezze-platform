<?php

namespace App\Http\Controllers\Api;

use App\Contracts\CustomerPaymentGateway;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Throwable;

class CustomerPaymentMethodController extends Controller
{
    use ApiResponse;

    public function index(Request $request, CustomerPaymentGateway $gateway)
    {
        if ($response = $this->requireClient($request)) {
            return $response;
        }
        if ($response = $this->requireStripe()) {
            return $response;
        }

        try {
            $customerId = $this->ensureCustomer($request->user(), $gateway);
            $customer = $gateway->retrieveCustomer($customerId);
            $defaultPaymentMethod = data_get($customer, 'invoice_settings.default_payment_method');
            if (is_object($defaultPaymentMethod)) {
                $defaultPaymentMethod = $defaultPaymentMethod->id ?? null;
            }

            return $this->success([
                'payment_methods' => collect($gateway->listCardPaymentMethods($customerId))
                    ->map(fn (object $method) => $this->paymentMethodData(
                        $method,
                        (string) $defaultPaymentMethod === (string) $method->id
                    ))
                    ->values(),
            ], 'Payment methods retrieved successfully.');
        } catch (Throwable $exception) {
            report($exception);

            return $this->error('Payment methods could not be loaded. Please try again.', 422);
        }
    }

    public function setup(Request $request, CustomerPaymentGateway $gateway)
    {
        if ($response = $this->requireClient($request)) {
            return $response;
        }
        if ($response = $this->requireStripe()) {
            return $response;
        }

        try {
            $customerId = $this->ensureCustomer($request->user(), $gateway);
            $setupIntent = $gateway->createSetupIntent($customerId);
            $customerSession = $gateway->createCustomerSession($customerId);

            return $this->success([
                'publishable_key' => config('services.stripe.key'),
                'customer_id' => $customerId,
                'customer_session_client_secret' => $customerSession->client_secret,
                'setup_intent_client_secret' => $setupIntent->client_secret,
            ], 'Card setup is ready.');
        } catch (Throwable $exception) {
            report($exception);

            return $this->error('Card setup could not be started. Please try again.', 422);
        }
    }

    public function session(Request $request, CustomerPaymentGateway $gateway)
    {
        if ($response = $this->requireClient($request)) {
            return $response;
        }
        if ($response = $this->requireStripe()) {
            return $response;
        }

        try {
            $customerId = $this->ensureCustomer($request->user(), $gateway);
            $customerSession = $gateway->createCustomerSession($customerId);

            return $this->success([
                'publishable_key' => config('services.stripe.key'),
                'customer_id' => $customerId,
                'customer_session_client_secret' => $customerSession->client_secret,
            ], 'Customer payment session is ready.');
        } catch (Throwable $exception) {
            report($exception);

            return $this->error('Payment session could not be started. Please try again.', 422);
        }
    }

    public function makeDefault(
        Request $request,
        string $paymentMethodId,
        CustomerPaymentGateway $gateway
    ) {
        if ($response = $this->requireClient($request)) {
            return $response;
        }
        if ($response = $this->requireStripe()) {
            return $response;
        }

        try {
            $customerId = $request->user()->stripe_customer_id;
            if (! $customerId) {
                return $this->error('Payment method not found.', 404);
            }
            $method = $this->ownedPaymentMethod($paymentMethodId, $customerId, $gateway);
            if (! $method) {
                return $this->error('Payment method not found.', 404);
            }

            $gateway->updateCustomer($customerId, [
                'invoice_settings' => ['default_payment_method' => $paymentMethodId],
            ]);

            return $this->success([
                'payment_method' => $this->paymentMethodData($method, true),
            ], 'Default payment method updated.');
        } catch (Throwable $exception) {
            report($exception);

            return $this->error('Default payment method could not be updated.', 422);
        }
    }

    public function destroy(
        Request $request,
        string $paymentMethodId,
        CustomerPaymentGateway $gateway
    ) {
        if ($response = $this->requireClient($request)) {
            return $response;
        }
        if ($response = $this->requireStripe()) {
            return $response;
        }

        try {
            $customerId = $request->user()->stripe_customer_id;
            if (! $customerId) {
                return $this->error('Payment method not found.', 404);
            }
            $method = $this->ownedPaymentMethod($paymentMethodId, $customerId, $gateway);
            if (! $method) {
                return $this->error('Payment method not found.', 404);
            }

            $customer = $gateway->retrieveCustomer($customerId);
            $defaultPaymentMethod = data_get($customer, 'invoice_settings.default_payment_method');
            if (is_object($defaultPaymentMethod)) {
                $defaultPaymentMethod = $defaultPaymentMethod->id ?? null;
            }
            $wasDefault = (string) $defaultPaymentMethod === $paymentMethodId;

            $gateway->detachPaymentMethod($paymentMethodId);
            if ($wasDefault) {
                $remaining = $gateway->listCardPaymentMethods($customerId);
                $gateway->updateCustomer($customerId, [
                    'invoice_settings' => [
                        'default_payment_method' => $remaining[0]->id ?? null,
                    ],
                ]);
            }

            return $this->success(null, 'Payment method removed.');
        } catch (Throwable $exception) {
            report($exception);

            return $this->error('Payment method could not be removed.', 422);
        }
    }

    private function ensureCustomer(User $user, CustomerPaymentGateway $gateway): string
    {
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

    private function ownedPaymentMethod(
        string $paymentMethodId,
        string $customerId,
        CustomerPaymentGateway $gateway
    ): ?object {
        $method = $gateway->retrievePaymentMethod($paymentMethodId);
        $ownerId = is_object($method->customer ?? null)
            ? ($method->customer->id ?? null)
            : ($method->customer ?? null);

        return (string) $ownerId === $customerId ? $method : null;
    }

    private function paymentMethodData(object $method, bool $isDefault): array
    {
        return [
            'id' => $method->id,
            'brand' => ucfirst((string) data_get($method, 'card.brand', 'card')),
            'last4' => (string) data_get($method, 'card.last4', ''),
            'exp_month' => (int) data_get($method, 'card.exp_month', 0),
            'exp_year' => (int) data_get($method, 'card.exp_year', 0),
            'is_default' => $isDefault,
        ];
    }

    private function requireClient(Request $request)
    {
        if (! $request->user()) {
            return $this->error('Unauthenticated', 401);
        }
        if ($request->user()->user_type !== 'client') {
            return $this->error('Only clients can manage payment methods.', 403);
        }

        return null;
    }

    private function requireStripe()
    {
        if (! config('services.stripe.secret') || ! config('services.stripe.key')) {
            return $this->error('Online payment is not configured.', 503);
        }

        return null;
    }
}
