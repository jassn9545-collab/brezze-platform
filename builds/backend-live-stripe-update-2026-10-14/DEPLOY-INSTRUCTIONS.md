# Our Bezzie Stripe payment/payout backend update

Package date: 2026-10-14

This package contains the backend files required for:

- Stripe Connect onboarding and payment-account readiness checks
- blocking job applications until the freelancer payment account is fully ready
- customer payment intents and saved payment methods
- provider Stripe balance, bank destination, withdrawals, and payout history
- Stripe payment and connected-account payout webhooks

## Before deployment

1. Back up the live database and application directory.
2. Keep the live `.env`; do not replace it with a local file.
3. Confirm the live Stripe keys and webhook secret are configured.

Required production variables:

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://hirephpdeveloperindia.com/bezzie
STRIPE_KEY=pk_live_...
STRIPE_SECRET=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_CURRENCY=aud
STRIPE_TEST_PLATFORM_PAYMENTS=false
STRIPE_ONBOARDING_BASE_URL=https://hirephpdeveloperindia.com/bezzie
```

Stripe webhook endpoint:

```text
https://hirephpdeveloperindia.com/bezzie/api/stripe/webhook
```

## Deploy

Extract this archive over the Laravel application root, then run:

```bash
php artisan down
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan queue:restart
php artisan up
```

The archive intentionally excludes `.env`, `vendor`, uploads, logs, caches, and local database dumps.

## Verification

Run before enabling live payments when possible:

```bash
php artisan test tests/Feature/BidApplicationTest.php
php artisan test tests/Feature/StripeConnectTest.php
php artisan test tests/Feature/PaymentTest.php
php artisan test tests/Feature/ProviderPayoutTest.php
php artisan test tests/Feature/CustomerPaymentMethodTest.php
```

Expected behavior: an unconnected or incomplete Stripe freelancer account receives HTTP 422 and no bid is created. A fully verified account can apply, receive job payments, and withdraw an available Stripe balance to its verified bank destination.
