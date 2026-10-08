<?php

namespace App\Services;

use App\Contracts\PaymentGateway;
use Stripe\StripeClient;
use Stripe\Webhook;

class StripePaymentGateway implements PaymentGateway
{
    public function __construct(private readonly StripeClient $stripe) {}

    public function retrieveConnectedAccount(string $connectedAccountId): object
    {
        return $this->stripe->accounts->retrieve($connectedAccountId, []);
    }

    public function createPaymentIntent(
        array $parameters,
        string $idempotencyKey,
        ?string $connectedAccountId = null
    ): object {
        $options = ['idempotency_key' => $idempotencyKey];
        if ($connectedAccountId) {
            $options['stripe_account'] = $connectedAccountId;
        }

        return $this->stripe->paymentIntents->create($parameters, $options);
    }

    public function retrievePaymentIntent(
        string $paymentIntentId,
        ?string $connectedAccountId = null
    ): object {
        return $this->stripe->paymentIntents->retrieve(
            $paymentIntentId,
            [],
            $connectedAccountId ? ['stripe_account' => $connectedAccountId] : []
        );
    }

    public function cancelPaymentIntent(
        string $paymentIntentId,
        ?string $connectedAccountId = null
    ): object {
        return $this->stripe->paymentIntents->cancel(
            $paymentIntentId,
            [],
            $connectedAccountId ? ['stripe_account' => $connectedAccountId] : []
        );
    }

    public function constructWebhookEvent(
        string $payload,
        string $signature,
        string $secret
    ): object {
        return Webhook::constructEvent($payload, $signature, $secret);
    }
}
