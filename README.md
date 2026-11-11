# Our Bezzie Platform

Our Bezzie is a two-sided services marketplace maintained as a monorepo. It contains the customer app, provider app, Laravel API/admin panel, and shared product documentation.

## Repository structure

| Path | Purpose |
| --- | --- |
| `apps/our-bezzie-provider/` | **Our Bezzie Provider** — customer app (`OurBezzieProvider`) |
| `apps/our-bezzie/` | **Our Bezzie** — professional/freelancer app (`OurBezzie`) |
| `apps/backend/` | Laravel 12 REST API and admin panel |
| `docs/requirements/` | Functional and non-functional requirements |
| `docs/design-system/` | Shared design-system guidance |
| `docs/typography/` | Typography assets and usage rules |

## Local development

App names and roles are defined in `mobile-apps.json` and explained in [the mobile naming guide](docs/mobile-app-names.md). **Our Bezzie Provider is the customer app; Our Bezzie is the professional app.** Run `node scripts/check-mobile-branding.cjs` before building. Standalone live Android testing APKs can be generated with `bash scripts/build-live-apks.sh` when Java 17 and the Android SDK are configured.

Use Node 22.13 or newer in the Node 22 series, or another version allowed by the app package.json engines. Node 21 is incompatible with the locked mobile dependencies. Run commands from the relevant app folder.

```powershell
# Our Bezzie Provider — customer app
cd apps/our-bezzie-provider
corepack yarn install --frozen-lockfile
corepack yarn start --port 8081

# Our Bezzie — professional app
cd apps/our-bezzie
corepack yarn install --frozen-lockfile
corepack yarn start --port 8082

# Backend
cd apps/backend
composer install
php artisan serve
```

Mobile TypeScript checks use `corepack yarn typecheck`. If the editor cannot resolve `@react-native/typescript-config/tsconfig.json`, install dependencies in that app folder and restart the TypeScript language service.

Mobile tests use `corepack yarn test --runInBand`; lint uses `corepack yarn lint`. Backend tests use `php artisan test`.

## Run both apps on a USB Android phone (Windows/Laragon)

The local setup uses `.tools/android-sdk`, `.tools/node`, Java 17, and the existing Laragon PHP/MySQL installation. Android Studio is not required. Backend configuration is in the ignored `apps/backend/.env`; the local database is `bezzie`.

Enable USB debugging on the phone, connect a data-capable USB cable, and accept the phone's authorization prompt. From the repository root:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\run-device.ps1
```

The script builds both debug APKs, starts the backend and Metro servers, forwards ports 8000/8081/8082 over USB, installs both apps, and launches them. The professional app, Our Bezzie, is launched last; select Our Bezzie Provider from the phone launcher for the customer app. Use `-SkipBuild` to reuse existing APKs, `-DeviceId SERIAL` when multiple devices are connected, or `-BuildOnly` to prepare ARM64 APKs without a phone. Build-only mode accepts `-Architecture` for other Android ABIs.

Server logs are stored under `.tools/`. Local mail uses the log mailer; Stripe payments and provider Stripe onboarding require valid credentials in `.env`.

## Source-of-truth rule

The three applications and shared documentation are versioned together. When an API contract, shared requirement, or design token changes, update every affected application in the same branch and pull request.
