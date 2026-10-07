<?php

namespace App\Services;

use App\Contracts\CustomerPaymentGateway;
use Stripe\StripeClient;

class StripeCustomerPaymentGateway implements CustomerPaymentGateway
{
    public function __construct(private readonly StripeClient $stripe) {}

    public function createCustomer(array $parameters): object
    {
        return $this->stripe->customers->create($parameters);
    }

    public function retrieveCustomer(string $customerId): object
    {
        return $this->stripe->customers->retrieve($customerId, []);
    }

    public function updateCustomer(string $customerId, array $parameters): object
    {
        return $this->stripe->customers->update($customerId, $parameters);
    }

    public function createCustomerSession(string $customerId): object
    {
        return $this->stripe->customerSessions->create([
            'customer' => $customerId,
            'components' => [
                'mobile_payment_element' => [
                    'enabled' => true,
                    'features' => [
                        'payment_method_redisplay' => 'enabled',
                        'payment_method_remove' => 'enabled',
                        'payment_method_save' => 'enabled',
                    ],
                ],
            ],
        ]);
    }

    public function createSetupIntent(string $customerId): object
    {
        return $this->stripe->setupIntents->create([
            'customer' => $customerId,
            'payment_method_types' => ['card'],
            'usage' => 'off_session',
        ]);
    }

    public function listCardPaymentMethods(string $customerId): array
    {
        return $this->stripe->paymentMethods->all([
            'customer' => $customerId,
            'type' => 'card',
        ])->data;
    }

    public function retrievePaymentMethod(string $paymentMethodId): object
    {
        return $this->stripe->paymentMethods->retrieve($paymentMethodId, []);
    }

    public function detachPaymentMethod(string $paymentMethodId): object
    {
        return $this->stripe->paymentMethods->detach($paymentMethodId, []);
    }
}
