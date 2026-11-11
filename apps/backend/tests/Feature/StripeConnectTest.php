<?php

use App\Http\Controllers\Api\AuthController;
use App\Models\User;
use Laravel\Sanctum\Sanctum;
use Stripe\Account;
use Stripe\AccountLink;
use Stripe\Service\AccountLinkService;
use Stripe\Service\AccountService as LegacyAccountService;
use Stripe\Service\V2\Core\AccountService as V2AccountService;
use Stripe\Service\V2\Core\CoreServiceFactory;
use Stripe\Service\V2\V2ServiceFactory;
use Stripe\StripeClient;
use Stripe\V2\Core\Account as V2Account;

beforeEach(function () {
    config()->set('services.stripe.secret', 'sk_test_not_a_real_key');
});

function connectedUser(?string $accountId = 'acct_test_123'): User
{
    $user = new User([
        'name' => 'Test Freelancer',
        'email' => 'freelancer@example.com',
        'user_type' => 'freelancer',
        'country' => 'AU',
    ]);
    $user->id = 42;
    $user->stripe_account_id = $accountId;
    $user->stripe_customer_id = 'cus_test_123';

    return $user;
}

function mockStripeService(string $name, object $service): StripeClient
{
    $stripe = Mockery::mock(StripeClient::class);
    $stripe->shouldReceive('getService')->with($name)->andReturn($service);

    return $stripe;
}

function mockV2AccountService(V2AccountService $accounts): StripeClient
{
    $stripe = Mockery::mock(StripeClient::class);
    $core = new CoreServiceFactory($stripe);
    $v2 = new V2ServiceFactory($stripe);

    $services = new ReflectionProperty($core, 'services');
    $services->setValue($core, ['accounts' => $accounts]);
    $services->setValue($v2, ['core' => $core]);

    $stripe->shouldReceive('getService')->with('v2')->andReturn($v2);

    return $stripe;
}

test('account creation uses Accounts v2 for an Express connected account', function () {
    $accounts = Mockery::mock(V2AccountService::class);
    $stripe = mockV2AccountService($accounts);
    $accounts->shouldReceive('create')->once()->with(Mockery::on(function ($params) {
        return $params['dashboard'] === 'express'
            && $params['identity']['country'] === 'AU'
            && $params['identity']['entity_type'] === 'individual'
            && $params['contact_email'] === 'freelancer@example.com'
            && $params['configuration']['merchant']['capabilities']['card_payments']['requested'] === true
            && $params['configuration']['recipient']['capabilities']['stripe_balance']['stripe_transfers']['requested'] === true
            && $params['metadata']['user_id'] === '42';
    }), Mockery::on(fn ($options) => $options['idempotency_key'] === 'user_42_stripe_connected_account_v2'))
        ->andReturn(V2Account::constructFrom(['id' => 'acct_test_123']));

    $method = new ReflectionMethod(AuthController::class, 'createStripeConnectedAccount');
    $account = $method->invoke(new AuthController, connectedUser(null), 'AU', $stripe);

    expect($account->id)->toBe('acct_test_123');
});

test('the installed Stripe SDK dispatches connected account creation to Accounts v2', function () {
    $stripe = Mockery::mock(StripeClient::class, ['sk_test_not_a_real_key'])->makePartial();
    $stripe->shouldReceive('request')->once()->withArgs(function ($method, $path, $params) {
        return $method === 'post'
            && $path === '/v2/core/accounts'
            && $params['dashboard'] === 'express'
            && $params['configuration']['merchant']['capabilities']['card_payments']['requested'] === true;
    })->andReturn(V2Account::constructFrom(['id' => 'acct_test_123']));

    $method = new ReflectionMethod(AuthController::class, 'createStripeConnectedAccount');
    $account = $method->invoke(new AuthController, connectedUser(null), 'AU', $stripe);

    expect($account->id)->toBe('acct_test_123');
});

test('connected account creation normalizes saved phone numbers for both Stripe phone fields', function ($country, $phone, $expected) {
    $user = connectedUser(null);
    $user->phone = $phone;
    $accounts = Mockery::mock(V2AccountService::class);
    $accounts->shouldReceive('create')->once()->with(
        Mockery::on(function ($params) use ($expected) {
            if ($expected === null) {
                return ! array_key_exists('contact_phone', $params)
                    && ! array_key_exists('phone', $params['identity']['individual']);
            }

            return $params['contact_phone'] === $expected
                && $params['identity']['individual']['phone'] === $expected;
        }),
        Mockery::on(fn ($options) => $options['idempotency_key'] === 'user_42_stripe_connected_account_v2')
    )->andReturn(V2Account::constructFrom(['id' => 'acct_test_123']));

    $method = new ReflectionMethod(AuthController::class, 'createStripeConnectedAccount');
    $account = $method->invoke(new AuthController, $user, $country, mockV2AccountService($accounts));

    expect($account->id)->toBe('acct_test_123');
    expect($user->phone)->toBe($phone);
})->with([
    'Australian mobile' => ['AU', '0412 345 678', '+61412345678'],
    'Australian national number' => ['AU', '412345678', '+61412345678'],
    'Australian landline' => ['AU', '(02) 1234-5678', '+61212345678'],
    'Australian country code' => ['AU', '61412345678', '+61412345678'],
    'Indian mobile' => ['IN', '98765 43210', '+919876543210'],
    'Indian trunk prefix' => ['IN', '09876543210', '+919876543210'],
    'Indian country code' => ['IN', '919876543210', '+919876543210'],
    'international prefix' => ['AU', '0061 412 345 678', '+61412345678'],
    'formatted international number' => ['IN', '+91 (98765) 43210', '+919876543210'],
    'explicit foreign country code' => ['AU', '+919876543210', '+919876543210'],
    'missing number' => ['AU', null, null],
    'empty number' => ['AU', ' ', null],
    'short legacy value' => ['AU', '12345', null],
    'letters' => ['IN', 'not a phone', null],
    'extension' => ['AU', '0412345678 ext 12', null],
    'invalid international prefix' => ['AU', '+0123456789', null],
    'too long' => ['IN', '+1234567890123456', null],
    'ambiguous foreign number' => ['AU', '9876543210', null],
]);

test('signup onboarding link uses the saved connected account and mobile callback URLs', function () {
    $links = Mockery::mock(AccountLinkService::class);
    $stripe = mockStripeService('accountLinks', $links);
    $links->shouldReceive('create')->once()->with(Mockery::on(function ($params) {
        return $params['account'] === 'acct_test_123'
            && $params['type'] === 'account_onboarding'
            && $params['return_url'] === 'https://example.com/stripe/return'
            && $params['refresh_url'] === 'https://example.com/stripe/refresh'
            && $params['collection_options']['fields'] === 'currently_due';
    }))->andReturn(AccountLink::constructFrom([
        'url' => 'https://connect.stripe.com/signup-link',
        'expires_at' => 1800000000,
    ]));

    $method = new ReflectionMethod(AuthController::class, 'createStripeOnboardingLink');
    $link = $method->invoke(
        new AuthController,
        connectedUser(),
        'https://example.com/stripe/return',
        'https://example.com/stripe/refresh',
        $stripe
    );

    expect($link->url)->toBe('https://connect.stripe.com/signup-link');
});

test('onboarding rejects a missing callback when only one is provided', function () {
    Sanctum::actingAs(connectedUser());

    $this->postJson('/api/stripe/onboarding-link', [
        'return_url' => 'https://example.com/stripe/return',
    ])
        ->assertStatus(400)
        ->assertJsonPath('errors.refresh_url.0', 'The refresh url field is required when return url is present.');
});

test('onboarding defaults to the server callback routes', function () {
    Sanctum::actingAs(connectedUser());
    config()->set('services.stripe.onboarding_base_url', 'https://api.example.com/bezzie');
    $links = Mockery::mock(AccountLinkService::class);
    $links->shouldReceive('create')->once()->with(Mockery::on(function ($params) {
        return $params['return_url'] === 'https://api.example.com/bezzie/stripe/onboarding/return'
            && $params['refresh_url'] === 'https://api.example.com/bezzie/stripe/onboarding/refresh';
    }))->andReturn(AccountLink::constructFrom([
        'url' => 'https://connect.stripe.com/default-link',
        'expires_at' => 1800000000,
    ]));
    app()->instance(StripeClient::class, mockStripeService('accountLinks', $links));

    $this->postJson('/api/stripe/onboarding-link', [])
        ->assertOk()
        ->assertJsonPath('data.url', 'https://connect.stripe.com/default-link');
});

test('Stripe callback pages direct mobile users back to the app', function () {
    $this->get('/stripe/onboarding/return')->assertOk()->assertSee('check your Stripe account status')
        ->assertSee('bezzieprovider://stripe/onboarding/return')->assertSee('Open Bezzie app');
    $this->get('/stripe/onboarding/refresh')->assertOk()->assertSee('Continue Stripe setup')
        ->assertSee('bezzieprovider://stripe/onboarding/refresh')->assertSee('Open Bezzie app');
});

test('an authenticated user can receive a Stripe onboarding link', function () {
    Sanctum::actingAs(connectedUser());
    $links = Mockery::mock(AccountLinkService::class);
    $stripe = mockStripeService('accountLinks', $links);
    $links->shouldReceive('create')->once()->with(Mockery::on(function ($params) {
        return $params['account'] === 'acct_test_123'
            && $params['return_url'] === 'http://localhost:8000/stripe/return'
            && $params['refresh_url'] === 'http://localhost:8000/stripe/refresh'
            && $params['type'] === 'account_onboarding';
    }))->andReturn(AccountLink::constructFrom([
        'url' => 'https://connect.stripe.com/test-link',
        'expires_at' => 1800000000,
    ]));
    app()->instance(StripeClient::class, $stripe);

    $this->postJson('/api/stripe/onboarding-link', [
        'return_url' => 'http://localhost:8000/stripe/return',
        'refresh_url' => 'http://localhost:8000/stripe/refresh',
    ])->assertOk()
        ->assertJsonPath('data.url', 'https://connect.stripe.com/test-link')
        ->assertJsonPath('data.stripe_account_id', 'acct_test_123');
});

test('live-mode onboarding links require HTTPS callback URLs', function () {
    Sanctum::actingAs(connectedUser(null));
    config()->set('services.stripe.secret', 'sk_live_test_value');

    $this->postJson('/api/stripe/onboarding-link', [
        'return_url' => 'http://example.com/stripe/return',
        'refresh_url' => 'https://example.com/stripe/refresh',
    ])->assertStatus(400)
        ->assertJsonPath('message', 'Stripe live-mode onboarding URLs must use HTTPS.');
});

test('account status reports whether the connected account can charge and pay out', function () {
    Sanctum::actingAs(connectedUser());
    $accounts = Mockery::mock(LegacyAccountService::class);
    $stripe = mockStripeService('accounts', $accounts);
    $accounts->shouldReceive('retrieve')->once()->with('acct_test_123', [])
        ->andReturn(Account::constructFrom([
            'id' => 'acct_test_123',
            'charges_enabled' => true,
            'payouts_enabled' => false,
            'details_submitted' => false,
            'requirements' => [
                'currently_due' => ['external_account'],
                'eventually_due' => [],
                'disabled_reason' => 'requirements.past_due',
            ],
            'future_requirements' => ['currently_due' => [], 'eventually_due' => []],
        ]));
    app()->instance(StripeClient::class, $stripe);

    $this->getJson('/api/stripe/account-status')->assertOk()
        ->assertJsonPath('data.connected', true)
        ->assertJsonPath('data.onboarding_required', true)
        ->assertJsonPath('data.ready_for_payments', false)
        ->assertJsonPath('data.charges_enabled', true)
        ->assertJsonPath('data.payouts_enabled', false)
        ->assertJsonPath('data.requirements.currently_due.0', 'external_account');
});

test('future requirements keep onboarding available before the account is ready', function () {
    Sanctum::actingAs(connectedUser());
    $accounts = Mockery::mock(LegacyAccountService::class);
    $accounts->shouldReceive('retrieve')->once()->andReturn(Account::constructFrom([
        'charges_enabled' => false,
        'payouts_enabled' => false,
        'details_submitted' => false,
        'requirements' => ['currently_due' => [], 'eventually_due' => ['individual.verification.document']],
        'future_requirements' => ['currently_due' => [], 'eventually_due' => []],
    ]));
    app()->instance(StripeClient::class, mockStripeService('accounts', $accounts));

    $this->getJson('/api/stripe/account-status')->assertOk()
        ->assertJsonPath('data.onboarding_required', true)
        ->assertJsonPath('data.details_submitted', false)
        ->assertJsonPath('data.requirements.eventually_due.0', 'individual.verification.document');
});

test('an account under review is not marked ready but needs no more onboarding', function () {
    Sanctum::actingAs(connectedUser());
    $accounts = Mockery::mock(LegacyAccountService::class);
    $accounts->shouldReceive('retrieve')->once()->andReturn(Account::constructFrom([
        'charges_enabled' => false,
        'payouts_enabled' => false,
        'details_submitted' => true,
        'requirements' => ['currently_due' => [], 'eventually_due' => []],
        'future_requirements' => ['currently_due' => [], 'eventually_due' => []],
    ]));
    app()->instance(StripeClient::class, mockStripeService('accounts', $accounts));

    $this->getJson('/api/stripe/account-status')->assertOk()
        ->assertJsonPath('data.onboarding_required', false)
        ->assertJsonPath('data.ready_for_payments', false);
});

test('account status is clear for users without a connected account', function () {
    config()->set('services.stripe.secret', '');
    Sanctum::actingAs(connectedUser(null));

    $this->getJson('/api/stripe/account-status')->assertOk()
        ->assertJsonPath('data.connected', false)
        ->assertJsonPath('data.ready_for_payments', false)
        ->assertJsonPath('data.onboarding_required', true);
});

test('public onboarding recovers from a localhost server setting using the public API deployment path', function () {
    config()->set('services.stripe.onboarding_base_url', 'http://localhost/bezzie');
    config()->set('app.api_url', 'https://api.example.com/bezzie/api');
    $method = new ReflectionMethod(AuthController::class, 'onboardingCallbackUrls');
    $urls = $method->invoke(new AuthController, \Illuminate\Http\Request::create('https://api.example.com/api/stripe/onboarding-link', 'POST'));
    expect($urls)->toBe(['https://api.example.com/bezzie/stripe/onboarding/return', 'https://api.example.com/bezzie/stripe/onboarding/refresh']);
});

test('public onboarding falls back to the public request when all configured origins are local', function () {
    config()->set('services.stripe.onboarding_base_url', 'http://127.0.0.1:8000');
    config()->set('app.api_url', 'http://localhost/api');
    $method = new ReflectionMethod(AuthController::class, 'onboardingCallbackUrls');
    $urls = $method->invoke(new AuthController, \Illuminate\Http\Request::create('https://api.example.com/api/stripe/onboarding-link', 'POST'));
    expect($urls[0])->toBe('https://api.example.com/stripe/onboarding/return');
});

test('public onboarding rejects callbacks that redirect mobile users to local machines', function ($host) {
    $method = new ReflectionMethod(AuthController::class, 'onboardingCallbackUrls');
    $request = \Illuminate\Http\Request::create('https://api.example.com/api/stripe/onboarding-link', 'POST', [
        'return_url' => 'https://'.$host.'/return', 'refresh_url' => 'https://'.$host.'/refresh',
    ]);
    expect(fn () => $method->invoke(new AuthController, $request))->toThrow(\Illuminate\Validation\ValidationException::class);
})->with(['localhost', '127.0.0.1', '192.168.1.5', '10.0.0.2', '[::1]']);

test('public onboarding honors the release apps public HTTPS callbacks', function () {
    config()->set('services.stripe.onboarding_base_url', 'http://localhost');
    $callbacks = ['return_url' => 'https://hirephpdeveloperindia.com/bezzie/stripe/onboarding/return', 'refresh_url' => 'https://hirephpdeveloperindia.com/bezzie/stripe/onboarding/refresh'];
    $method = new ReflectionMethod(AuthController::class, 'onboardingCallbackUrls');
    $urls = $method->invoke(new AuthController, \Illuminate\Http\Request::create('https://api.example.com/api/stripe/onboarding-link', 'POST', $callbacks));
    expect($urls)->toBe(array_values($callbacks));
});
