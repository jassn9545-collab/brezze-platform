<?php

namespace App\Services;

use App\Contracts\PayoutGateway;
use Stripe\StripeClient;

class StripePayoutGateway implements PayoutGateway
{
    public function __construct(private readonly StripeClient $stripe) {}

    public function retrieveConnectedAccount(string $connectedAccountId): object
    {
        return $this->stripe->accounts->retrieve($connectedAccountId, []);
    }

    public function setManualPayoutSchedule(string $connectedAccountId): object
    {
        return $this->stripe->accounts->update($connectedAccountId, [
            'settings' => [
                'payouts' => [
                    'schedule' => ['interval' => 'manual'],
                ],
            ],
        ]);
    }

    public function retrieveBalance(string $connectedAccountId): object
    {
        return $this->stripe->balance->retrieve([], [
            'stripe_account' => $connectedAccountId,
        ]);
    }

    public function createPayout(
        array $parameters,
        string $idempotencyKey,
        string $connectedAccountId
    ): object {
        return $this->stripe->payouts->create($parameters, [
            'idempotency_key' => $idempotencyKey,
            'stripe_account' => $connectedAccountId,
        ]);
    }

    public function listPayouts(string $connectedAccountId, int $limit = 25): array
    {
        $page = $this->stripe->payouts->all(
            ['limit' => min(max($limit, 1), 100)],
            ['stripe_account' => $connectedAccountId]
        );

        // Include historical automatic payouts so wallet funds cannot be spent
        // again merely because the provider used Stripe before this wallet.
        return iterator_to_array($page->autoPagingIterator(), false);
    }

    public function createLoginLink(string $connectedAccountId): object
    {
        return $this->stripe->accounts->createLoginLink($connectedAccountId, []);
    }
}
