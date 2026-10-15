<?php

namespace App\Contracts;

interface PayoutGateway
{
    public function retrieveConnectedAccount(string $connectedAccountId): object;

    public function setManualPayoutSchedule(string $connectedAccountId): object;

    public function retrieveBalance(string $connectedAccountId): object;

    public function createPayout(
        array $parameters,
        string $idempotencyKey,
        string $connectedAccountId
    ): object;

    public function listPayouts(string $connectedAccountId, int $limit = 25): array;

    public function createLoginLink(string $connectedAccountId): object;
}
