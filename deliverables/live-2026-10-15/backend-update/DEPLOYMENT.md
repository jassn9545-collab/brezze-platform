# Bezzie backend live update

This is an overlay package for the existing Laravel backend. It intentionally does not contain `.env`, `vendor`, uploads, logs, caches, or user data.

## Deployment order

1. Back up the live database and current backend files.
2. Extract this ZIP into the live Laravel project root, preserving the included folder structure and replacing matching files.
3. Keep the live `.env`; do not replace it with `.env.example`.
4. Confirm these production values in `.env`:

   ```dotenv
   APP_URL=https://hirephpdeveloperindia.com/bezzie
   API_URL=https://hirephpdeveloperindia.com/bezzie/api
   ASSET_URL=https://hirephpdeveloperindia.com/bezzie/public
   STRIPE_ONBOARDING_BASE_URL=https://hirephpdeveloperindia.com/bezzie
   STRIPE_MINIMUM_PAYOUT_MINOR=1000
   ```

   Use `STRIPE_TEST_PLATFORM_PAYMENTS=false` with real live Stripe payments. Keep it `true` only for an intentional Stripe test-mode environment.

5. Run from the Laravel project root:

   ```bash
   php artisan down
   php artisan migrate --force
   php artisan optimize:clear
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   php artisan up
   ```

6. Ensure `storage`, `bootstrap/cache`, and `public/uploads/heroes` are writable by the web-server user.
7. Configure the Stripe Connect webhook at `/api/stripe/webhook` for `payout.created`, `payout.updated`, `payout.paid`, `payout.failed`, and `payout.canceled`.

## Post-deployment checks

- An unauthenticated `GET /api/client/hero` must return `401`, not `404`.
- Save Customer Hero image/text/button in Admin Settings and confirm a signed-in Customer Home updates within 10 seconds.
- Confirm a freelancer without completed Stripe onboarding cannot apply for a job.
- Confirm chat-message unread counts appear on the Chat icon, not the bell icon.
- Confirm provider wallet/account status and withdrawal screens load.

Deploy this backend update before distributing the new APKs. The APKs use `https://hirephpdeveloperindia.com/bezzie/api`.
