# Brezze Platform

Brezze is a two-sided services marketplace maintained as a monorepo. It contains the customer app, provider app, Laravel API/admin panel, and shared product documentation.

## Repository structure

| Path | Purpose |
| --- | --- |
| `apps/customer/` | React Native customer app (`Bezzie`) |
| `apps/provider/` | React Native service-provider app (`BezzieProvider`) |
| `apps/backend/` | Laravel 12 REST API and admin panel |
| `docs/requirements/` | Functional and non-functional requirements |
| `docs/design-system/` | Shared design-system guidance |
| `docs/typography/` | Typography assets and usage rules |

## Local development

Run commands from the relevant app folder.

```powershell
# Customer app
cd apps/customer
corepack yarn install --frozen-lockfile
corepack yarn start --port 8081

# Provider app
cd apps/provider
corepack yarn install --frozen-lockfile
corepack yarn start --port 8082

# Backend
cd apps/backend
composer install
php artisan serve
```

Mobile tests use `corepack yarn test --runInBand`; lint uses `corepack yarn lint`. Backend tests use `php artisan test`.

## Source-of-truth rule

The three applications and shared documentation are versioned together. When an API contract, shared requirement, or design token changes, update every affected application in the same branch and pull request.
