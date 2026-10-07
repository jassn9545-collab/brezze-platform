<?php

namespace App\Providers;

use App\Contracts\PaymentGateway;
use App\Contracts\CustomerPaymentGateway;
use App\Services\StripeCustomerPaymentGateway;
use App\Services\StripePaymentGateway;
use Illuminate\Support\ServiceProvider;
use Stripe\StripeClient;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(StripeClient::class, fn () => new StripeClient([
            'api_key' => config('services.stripe.secret') ?: null,
        ]));
        $this->app->bind(PaymentGateway::class, StripePaymentGateway::class);
        $this->app->bind(CustomerPaymentGateway::class, StripeCustomerPaymentGateway::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
