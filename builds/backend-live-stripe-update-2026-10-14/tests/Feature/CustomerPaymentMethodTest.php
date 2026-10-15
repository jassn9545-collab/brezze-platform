<?php

use App\Contracts\CustomerPaymentGateway;
use App\Models\User;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Laravel\Sanctum\Sanctum;

class SavedCardGatewayFake implements CustomerPaymentGateway
{
    public ?string $defaultPaymentMethod = 'pm_visa';

    public array $paymentMethods;

    public function __construct()
    {
        $this->paymentMethods = [
            $this->card('pm_visa', 'visa', '4242'),
            $this->card('pm_mastercard', 'mastercard', '4444'),
        ];
    }

    public function createCustomer(array $parameters): object
    {
        return (object) ['id' => 'cus_saved_cards'];
    }

    public function retrieveCustomer(string $customerId): object
    {
        return (object) [
            'invoice_settings' => (object) [
                'default_payment_method' => $this->defaultPaymentMethod,
            ],
        ];
    }

    public function updateCustomer(string $customerId, array $parameters): object
    {
        $this->defaultPaymentMethod = data_get(
            $parameters,
            'invoice_settings.default_payment_method'
        );

        return (object) ['id' => $customerId];
    }

    public function createCustomerSession(string $customerId): object
    {
        return (object) ['client_secret' => 'cuss_saved_cards_secret'];
    }

    public function createSetupIntent(string $customerId): object
    {
        return (object) ['client_secret' => 'seti_saved_cards_secret'];
    }

    public function listCardPaymentMethods(string $customerId): array
    {
        return $this->paymentMethods;
    }

    public function retrievePaymentMethod(string $paymentMethodId): object
    {
        foreach ($this->paymentMethods as $method) {
            if ($method->id === $paymentMethodId) {
                return $method;
            }
        }

        return $this->card($paymentMethodId, 'visa', '0000', 'cus_someone_else');
    }

    public function detachPaymentMethod(string $paymentMethodId): object
    {
        $this->paymentMethods = array_values(array_filter(
            $this->paymentMethods,
            fn (object $method) => $method->id !== $paymentMethodId
        ));

        return (object) ['id' => $paymentMethodId];
    }

    private function card(
        string $id,
        string $brand,
        string $last4,
        string $customer = 'cus_saved_cards'
    ): object {
        return (object) [
            'id' => $id,
            'customer' => $customer,
            'card' => (object) [
                'brand' => $brand,
                'last4' => $last4,
                'exp_month' => 12,
                'exp_year' => 2030,
            ],
        ];
    }
}

beforeEach(function () {
    Schema::create('users', function (Blueprint $table) {
        $table->id();
        $table->string('name');
        $table->string('email')->unique();
        $table->string('password');
        $table->string('user_type');
        $table->string('stripe_customer_id')->nullable();
        $table->rememberToken();
        $table->timestamps();
    });

    config()->set('services.stripe.secret', 'sk_test_fake');
    config()->set('services.stripe.key', 'pk_test_fake');

    $this->gateway = new SavedCardGatewayFake;
    app()->instance(CustomerPaymentGateway::class, $this->gateway);
    $this->customer = User::create([
        'name' => 'Saved Card Customer',
        'email' => 'saved-card@payment.test',
        'password' => Hash::make('password'),
        'user_type' => 'client',
    ]);
});

afterEach(function () {
    Schema::dropIfExists('users');
});

it('creates a Stripe customer and returns only safe card details', function () {
    Sanctum::actingAs($this->customer);

    $this->getJson('/api/client/payment-methods')
        ->assertOk()
        ->assertJsonCount(2, 'data.payment_methods')
        ->assertJsonPath('data.payment_methods.0.brand', 'Visa')
        ->assertJsonPath('data.payment_methods.0.last4', '4242')
        ->assertJsonPath('data.payment_methods.0.is_default', true)
        ->assertJsonMissingPath('data.payment_methods.0.card_number');

    expect($this->customer->fresh()->stripe_customer_id)->toBe('cus_saved_cards');
});

it('returns setup secrets for the native Stripe card sheet', function () {
    Sanctum::actingAs($this->customer);

    $this->postJson('/api/client/payment-methods/setup')
        ->assertOk()
        ->assertJsonPath('data.customer_id', 'cus_saved_cards')
        ->assertJsonPath('data.customer_session_client_secret', 'cuss_saved_cards_secret')
        ->assertJsonPath('data.setup_intent_client_secret', 'seti_saved_cards_secret');
});

it('sets a default card and safely removes a card owned by the customer', function () {
    $this->customer->update(['stripe_customer_id' => 'cus_saved_cards']);
    Sanctum::actingAs($this->customer);

    $this->postJson('/api/client/payment-methods/pm_mastercard/default')
        ->assertOk()
        ->assertJsonPath('data.payment_method.is_default', true);
    expect($this->gateway->defaultPaymentMethod)->toBe('pm_mastercard');

    $this->deleteJson('/api/client/payment-methods/pm_mastercard')->assertOk();
    expect($this->gateway->defaultPaymentMethod)->toBe('pm_visa')
        ->and($this->gateway->paymentMethods)->toHaveCount(1);

    $this->deleteJson('/api/client/payment-methods/pm_not_owned')->assertNotFound();
});

it('rejects unauthenticated users and providers', function () {
    $this->getJson('/api/client/payment-methods')->assertUnauthorized();

    $provider = User::create([
        'name' => 'Provider',
        'email' => 'provider-saved-card@payment.test',
        'password' => Hash::make('password'),
        'user_type' => 'freelancer',
    ]);
    Sanctum::actingAs($provider);

    $this->getJson('/api/client/payment-methods')->assertForbidden();
});
