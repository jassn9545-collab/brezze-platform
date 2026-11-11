# Mobile app names and roles

The approved app mapping from 9 November 2026 is:

| Displayed brand | User role | Source folder | React Native / Xcode target | Android and iOS application ID |
| --- | --- | --- | --- | --- |
| **Our Bezzie Provider** | Customer / job poster / hirer | `apps/our-bezzie-provider` | `OurBezzieProvider` | `com.bezzie` |
| **Our Bezzie** | Professional / freelancer / service provider | `apps/our-bezzie` | `OurBezzie` | `com.bezzieprovider` |

`mobile-apps.json` is the repository mapping used by run/build scripts. Always select an app by its role and this mapping; the word “Provider” in the customer brand does not change the backend role.

Android/iOS application IDs, Firebase Android registrations, existing signing certificates, backend device `app_type` values (`customer`, `provider`), login user types (`client`, `freelancer`), and existing deep-link schemes retain their installed identities. Reversing those identities would mix up existing installs/accounts and break notification routing. Names, logos, splash screens, project targets, source folders and new APK filenames use the approved brands.

The existing `bezzieprovider://stripe/onboarding/...` callback belongs to the **Our Bezzie professional app**, which owns Stripe onboarding. It remains compatible with the live backend and previously installed builds.

Both apps use `https://hirephpdeveloperindia.com/bezzie/api`. The separate Android `local` variant continues to use the local development backend and a `.local` installation ID.

Run `node scripts/check-mobile-branding.cjs` to check the mapping. Android `preBuild` and all device launchers run this guard automatically. On Linux/macOS, with Java 17 and the Android SDK configured, run `bash scripts/build-live-apks.sh` to generate signed standalone ARM32/ARM64 testing APKs with embedded JavaScript. That script also verifies the finished APK labels, packages, version, signature and embedded live bundle. The filenames include both brand and role:

- `Our-Bezzie-Provider-Customer-Live-YYYY-MM-DD.apk`
- `Our-Bezzie-Professional-Live-YYYY-MM-DD.apk`

The three PowerShell device launchers resolve app folders and installation IDs from the same manifest. `run-customer.local.ps1` launches Our Bezzie Provider; `run-provider.local.ps1` launches Our Bezzie.

The backend's `config/mobile_apps.php` mirrors these display labels for admin diagnostics. Deploy that configuration and the updated diagnostics Blade view together, then refresh Laravel's configuration/view caches.

Earlier APKs used the reversed labels. Use the renamed builds from `client-live-renamed-2026-11-09`; the original public Drive file links now serve the corrected versions, verified by unauthenticated downloads and matching SHA-256 hashes.

For iOS, run `pod install` from each renamed app's `ios` directory before opening its renamed workspace. iOS compilation requires macOS/Xcode; Android APK verification does not establish an iOS runtime test.
