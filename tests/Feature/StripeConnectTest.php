<?php

use App\Http\Controllers\Api\AuthController;
use App\Models\User;
use Laravel\Sanctum\Sanctum;
use Stripe\Service\V2\Core\AccountLinkService;
use Stripe\Service\V2\Core\AccountService;
use Stripe\StripeClient;
use Stripe\V2\Core\Account;
use Stripe\V2\Core\AccountLink;

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

    return $user;
}

function mockStripeCoreService(string $name, object $service): StripeClient
{
    $stripe = Mockery::mock(StripeClient::class);
    $stripe->shouldReceive('getService')->with('v2')->andReturn((object) [
        'core' => (object) [$name => $service],
    ]);

    return $stripe;
}

test('account creation uses v2 merchant configuration for an Express account', function () {
    $accounts = Mockery::mock(AccountService::class);
    $stripe = mockStripeCoreService('accounts', $accounts);
    $accounts->shouldReceive('create')->once()->with(Mockery::on(function ($params) {
        return $params['dashboard'] === 'express'
            && $params['identity']['country'] === 'AU'
            && $params['identity']['entity_type'] === 'individual'
            && $params['contact_email'] === 'freelancer@example.com'
            && $params['configuration']['merchant']['capabilities']['card_payments']['requested'] === true
            && $params['defaults']['responsibilities']['fees_collector'] === 'application'
            && $params['defaults']['responsibilities']['losses_collector'] === 'application'
            && $params['metadata']['user_id'] === '42';
    }))->andReturn(Account::constructFrom(['id' => 'acct_test_123']));

    $method = new ReflectionMethod(AuthController::class, 'createStripeConnectedAccount');
    $account = $method->invoke(new AuthController, connectedUser(null), 'AU', $stripe);

    expect($account->id)->toBe('acct_test_123');
});

test('the installed Stripe SDK dispatches connected account creation to Accounts v2', function () {
    $stripe = Mockery::mock(StripeClient::class, ['sk_test_not_a_real_key'])->makePartial();
    $stripe->shouldReceive('request')->once()->withArgs(function ($method, $path, $params) {
        return $method === 'post'
            && $path === '/v2/core/accounts'
            && $params['configuration']['merchant']['capabilities']['card_payments']['requested'] === true;
    })->andReturn(Account::constructFrom(['id' => 'acct_test_123']));

    $method = new ReflectionMethod(AuthController::class, 'createStripeConnectedAccount');
    $account = $method->invoke(new AuthController, connectedUser(null), 'AU', $stripe);

    expect($account->id)->toBe('acct_test_123');
});

test('signup onboarding link uses the saved connected account and mobile callback URLs', function () {
    $links = Mockery::mock(AccountLinkService::class);
    $stripe = mockStripeCoreService('accountLinks', $links);
    $links->shouldReceive('create')->once()->with(Mockery::on(function ($params) {
        $onboarding = $params['use_case']['account_onboarding'];

        return $params['account'] === 'acct_test_123'
            && $params['use_case']['type'] === 'account_onboarding'
            && $onboarding['configurations'] === ['merchant']
            && $onboarding['return_url'] === 'https://example.com/stripe/return'
            && $onboarding['refresh_url'] === 'https://example.com/stripe/refresh'
            && $onboarding['collection_options']['fields'] === 'eventually_due'
            && $onboarding['collection_options']['future_requirements'] === 'include';
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
        $onboarding = $params['use_case']['account_onboarding'];

        return $onboarding['return_url'] === 'https://api.example.com/bezzie/stripe/onboarding/return'
            && $onboarding['refresh_url'] === 'https://api.example.com/bezzie/stripe/onboarding/refresh';
    }))->andReturn(AccountLink::constructFrom([
        'url' => 'https://connect.stripe.com/default-link',
        'expires_at' => 1800000000,
    ]));
    app()->instance(StripeClient::class, mockStripeCoreService('accountLinks', $links));

    $this->postJson('/api/stripe/onboarding-link', [])
        ->assertOk()
        ->assertJsonPath('data.url', 'https://connect.stripe.com/default-link');
});

test('Stripe callback pages direct mobile users back to the app', function () {
    $this->get('/stripe/onboarding/return')->assertOk()->assertSee('check your Stripe account status');
    $this->get('/stripe/onboarding/refresh')->assertOk()->assertSee('Continue Stripe setup');
});

test('an authenticated user can receive a Stripe onboarding link', function () {
    Sanctum::actingAs(connectedUser());
    $links = Mockery::mock(AccountLinkService::class);
    $stripe = mockStripeCoreService('accountLinks', $links);
    $links->shouldReceive('create')->once()->with(Mockery::on(function ($params) {
        return $params['account'] === 'acct_test_123'
            && $params['use_case']['account_onboarding']['return_url'] === 'http://localhost:8000/stripe/return'
            && $params['use_case']['account_onboarding']['refresh_url'] === 'http://localhost:8000/stripe/refresh'
            && $params['use_case']['account_onboarding']['configurations'] === ['merchant']
            && $params['use_case']['type'] === 'account_onboarding';
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
    $accounts = Mockery::mock(AccountService::class);
    $stripe = mockStripeCoreService('accounts', $accounts);
    $accounts->shouldReceive('retrieve')->once()->with('acct_test_123', [
        'include' => ['configuration.merchant', 'requirements'],
    ])
        ->andReturn(Account::constructFrom([
            'id' => 'acct_test_123',
            'configuration' => [
                'merchant' => [
                    'capabilities' => [
                        'card_payments' => ['status' => 'active'],
                        'stripe_balance' => ['payouts' => ['status' => 'restricted']],
                    ],
                ],
            ],
            'requirements' => [
                'entries' => [
                    [
                        'description' => 'Add a payout bank account',
                        'minimum_deadline' => ['status' => 'currently_due'],
                    ],
                ],
            ],
        ]));
    app()->instance(StripeClient::class, $stripe);

    $this->getJson('/api/stripe/account-status')->assertOk()
        ->assertJsonPath('data.connected', true)
        ->assertJsonPath('data.onboarding_required', true)
        ->assertJsonPath('data.ready_for_payments', false)
        ->assertJsonPath('data.charges_enabled', true)
        ->assertJsonPath('data.payouts_enabled', false)
        ->assertJsonPath('data.requirements.currently_due.0', 'Add a payout bank account');
});

test('future requirements keep onboarding available before the account is ready', function () {
    Sanctum::actingAs(connectedUser());
    $accounts = Mockery::mock(AccountService::class);
    $accounts->shouldReceive('retrieve')->once()->andReturn(Account::constructFrom([
        'configuration' => [
            'merchant' => [
                'capabilities' => [
                    'card_payments' => ['status' => 'pending'],
                    'stripe_balance' => ['payouts' => ['status' => 'pending']],
                ],
            ],
        ],
        'requirements' => [
            'entries' => [[
                'description' => 'Verify identity',
                'minimum_deadline' => ['status' => 'eventually_due'],
            ]],
        ],
    ]));
    app()->instance(StripeClient::class, mockStripeCoreService('accounts', $accounts));

    $this->getJson('/api/stripe/account-status')->assertOk()
        ->assertJsonPath('data.onboarding_required', true)
        ->assertJsonPath('data.details_submitted', false)
        ->assertJsonPath('data.requirements.eventually_due.0', 'Verify identity');
});

test('an account under review is not marked ready but needs no more onboarding', function () {
    Sanctum::actingAs(connectedUser());
    $accounts = Mockery::mock(AccountService::class);
    $accounts->shouldReceive('retrieve')->once()->andReturn(Account::constructFrom([
        'configuration' => [
            'merchant' => [
                'capabilities' => [
                    'card_payments' => ['status' => 'pending'],
                    'stripe_balance' => ['payouts' => ['status' => 'pending']],
                ],
            ],
        ],
        'requirements' => ['entries' => []],
    ]));
    app()->instance(StripeClient::class, mockStripeCoreService('accounts', $accounts));

    $this->getJson('/api/stripe/account-status')->assertOk()
        ->assertJsonPath('data.onboarding_required', false)
        ->assertJsonPath('data.ready_for_payments', false);
});

test('account status is clear for users without a connected account', function () {
    Sanctum::actingAs(connectedUser(null));

    $this->getJson('/api/stripe/account-status')->assertOk()
        ->assertJsonPath('data.connected', false)
        ->assertJsonPath('data.ready_for_payments', false)
        ->assertJsonPath('data.onboarding_required', true);
});
