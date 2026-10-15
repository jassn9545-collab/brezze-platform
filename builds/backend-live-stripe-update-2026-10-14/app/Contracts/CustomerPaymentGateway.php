<?php

namespace App\Contracts;

interface CustomerPaymentGateway
{
    public function createCustomer(array $parameters): object;

    public function retrieveCustomer(string $customerId): object;

    public function updateCustomer(string $customerId, array $parameters): object;

    public function createCustomerSession(string $customerId): object;

    public function createSetupIntent(string $customerId): object;

    public function listCardPaymentMethods(string $customerId): array;

    public function retrievePaymentMethod(string $paymentMethodId): object;

    public function detachPaymentMethod(string $paymentMethodId): object;
}
