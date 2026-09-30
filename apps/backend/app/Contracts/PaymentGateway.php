<?php

namespace App\Contracts;

interface PaymentGateway
{
    public function createPaymentIntent(
        array $parameters,
        string $idempotencyKey,
        ?string $connectedAccountId = null
    ): object;

    public function retrievePaymentIntent(
        string $paymentIntentId,
        ?string $connectedAccountId = null
    ): object;

    public function cancelPaymentIntent(
        string $paymentIntentId,
        ?string $connectedAccountId = null
    ): object;

    public function constructWebhookEvent(
        string $payload,
        string $signature,
        string $secret
    ): object;
}
