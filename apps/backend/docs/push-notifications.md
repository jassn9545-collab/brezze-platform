App branding (9 November 2026): **Our Bezzie Provider** is the customer/job-poster app (`customer`, `com.bezzie`); **Our Bezzie** is the professional app (`provider`, `com.bezzieprovider`). Persisted roles and Firebase identities remain attached to the same accounts. Admin display labels are defined in `config/mobile_apps.php`.

# Push delivery troubleshooting

The mobile apps register Firebase tokens through authenticated `POST /api/devices`. Both apps use Firebase project `our-bezzie-42461`. The backend sends notification and data payloads through the FCM HTTP v1 API, independently of the in-app notification list and email. A notification appearing in that list does not establish that FCM accepted or displayed it.

After deploying the changed backend files and clearing the application cache, sign into `/admin` and open `/admin/push-diagnostics`. This admin-only page checks the service-account file, project match, PHP OpenSSL, device table and recent device registrations. It never displays private keys or registration tokens. Use an expected test account and explicitly send a test to that user; the form sends to all their enabled devices and is limited to five requests per minute. GET requests do not send notifications.

- Missing/unreadable configuration: set `FIREBASE_CREDENTIALS` to the private, readable JSON service-account file. Do not upload it into the public directory or bundle it with mobile apps. Run `php artisan config:cache` after changing environment configuration.
- Wrong project or `SENDER_ID_MISMATCH`: use a service account from `our-bezzie-42461` that matches the installed mobile build.
- Missing device table: run the existing backend migrations. No new migration is introduced by this patch.
- No registered device or stale last registration: reopen the signed-in app with internet access. The updated apps retry Firebase startup and token registration failures and resync registration on resume.
- `PERMISSION_DENIED`: verify that the Firebase Cloud Messaging API is enabled and the configured service account has permission to send FCM messages for the project.
- Authentication failure: check `storage/logs/laravel.log`, service-account key validity, server clock and outbound HTTPS access to Google's OAuth and FCM endpoints. A cached OAuth token rejected with HTTP 401 is now refreshed and retried once.
- `UNREGISTERED`: the server disables the expired token; reopen the app to register its current token.
- FCM accepted but no display: check system notification permission, the Bezzie updates channel, background/battery restrictions and that the receiving app has been opened since installation. The app must be reopened after a force stop. FCM acceptance alone does not prove device delivery.

System pushes start when a provider is hired (`job_in_progress`) and include work submission (`work_submitted`). Both the customer and hired provider receive each event. Set `FIREBASE_PUSH_TYPES=job_in_progress,work_submitted` on existing deployments and clear cached configuration. New-job broadcasts, applications, chat, payment and review events remain in-app notifications. Work submission notifies the customer to review and confirms submission to the provider; it does not mark the job complete.

The mobile apps create the notification channel during startup, display foreground notifications using Notifee, and use the OS for background notification payloads. Verify hire and submission with each app open, in the background and launched from a notification tap. Confirm unrelated events do not produce system pushes.

The CLI alternative is `php artisan push:diagnose USER_ID --send`. Automated tests mock Firebase and do not establish production delivery. Live diagnosis still requires the deployed server result and the receiving phone.

Provider release builds log successful device registration and token-sync failures with the failing stage and error code/HTTP status. These diagnostics omit bearer tokens, Firebase registration tokens, and notification contents. A successful registration confirms the API accepted the device; it does not confirm that the backend sent or FCM delivered a notification.
