# Brezze Product Requirements

## Purpose

Brezze is a two-sided services marketplace made of two mobile applications:

- **Brezzee** lets customers create and manage service jobs.
- **Provider** lets freelancers/service providers find and complete those jobs.

This baseline is derived from the current React Native screens, navigation, Redux slices, Laravel controllers, and API route definitions. Items marked **Decision required** need product confirmation before their implementation is completed.

## Shared requirements

### Account and onboarding

- Walkthrough/onboarding screens.
- Registration and login.
- OTP verification and resend.
- Forgot/reset password.
- Basic profile details and profile photo.
- Identity/document upload and verification review.
- Profile editing and password change.
- Logout and persisted authenticated session.

### Platform services

- REST API integration with authenticated requests.
- Central loading, empty, error, and success states.
- Redux-based client state and async actions.
- Localization infrastructure and language selection.
- Address search, saved addresses, geolocation, and country selection.
- Image/file selection and upload.
- Notifications and deep-link-ready navigation.
- Real-time chat architecture; the current socket URL is not configured.
- FAQ/help/support and static policy content.

## Brezzee customer app requirements

The current app contains 43 screen files and approximately 30 reusable component files.

### Service discovery

- Show customer home content and available service categories.
- Browse service lists and provider/professional profiles.
- Display provider details required for a hiring decision.

### Job creation and hiring

- Create a job with category, description, schedule, location, and supporting information.
- Confirm job details before submission.
- List customer jobs and open job details.
- Hire a provider for an eligible job.
- Track hire history and status details.

### Completion and trust

- Mark jobs completed using an allowed status transition.
- Release or record payment state where applicable.
- Submit a rating/review after completion.
- Prevent duplicate completion, payment, or review actions.

### Customer account

- View/edit profile, documents, addresses, notifications, and support content.
- Chat with a provider in the context of a job.
- Referral/invite and earnings-related screens are present but require business-rule confirmation.

## Provider app requirements

The current app contains 39 screen files and approximately 34 reusable component files.

### Job discovery

- Show the latest available jobs.
- Open a complete job-detail view.
- Filter jobs using advanced criteria.
- Save and remove saved jobs.
- Apply to a job and show an unambiguous success result.

### Work management

- Separate applied, active, and completed job states.
- Submit completed work with the required evidence/details.
- Prevent applications or submissions when a job is not eligible.
- Keep job status synchronized with the customer app.

### Provider business profile

- Maintain provider profile, verification documents, and service catalog.
- Add/edit catalog information and associated media.
- Show wallet/earnings information.
- Chat with customers in the context of a job.

## Backend requirements

The Laravel backend is located at `apps/backend`. The mobile apps currently expect an API rooted at:

`https://hirephpdeveloperindia.com/bezzie/api`

Backend changes must preserve the current contract or introduce a versioned migration for both apps. Several domains below are only partially implemented and remain part of the required scope.

### Required domains

| Domain | Main capabilities |
| --- | --- |
| Authentication | Register, login, OTP, password recovery, logout, token/session lifecycle |
| Profiles | Customer/provider profiles, photos, basic information, verification documents |
| Jobs | Create, browse, filter, view, save, apply, hire, activate, submit, complete |
| Catalog | Provider services and media |
| Chat | Conversations, messages, read state, job context, real-time delivery |
| Notifications | Push/in-app notification records and read state |
| Payments | Customer payment/release state, provider wallet/earnings, transaction history |
| Reviews | Post-completion ratings and reviews with one-review-per-job enforcement |
| Settings/content | App settings, FAQ, policies, referral rules, supported locales/countries |

### Core data relationships

- A user has one role per app context: customer or provider.
- A customer owns jobs.
- A provider may save/apply to many jobs.
- A job may have many applicants but only one active hired provider unless product rules say otherwise.
- Chat, payment, submission, completion, and review records must reference the relevant job and participants.
- Status changes must be validated server-side and recorded with timestamps.

### Security and compliance

- Enforce authorization by role and record ownership on every protected endpoint.
- Validate uploads by type, size, and ownership; never trust client filenames.
- Store secrets outside source control and use environment-specific configuration.
- Rate-limit authentication/OTP endpoints and audit sensitive actions.
- Encrypt transport, protect personal/location/document data, and define retention rules.
- Return stable error codes/messages usable by both mobile apps.

## Non-functional requirements

- Android and iOS support consistent with React Native 0.82.1.
- Predictable API pagination and filtering for lists.
- Idempotency for payment, completion, work submission, and other retryable mutations.
- Offline-safe behavior for transient network loss; no duplicate actions after retry.
- Accessible labels, scalable text, sufficient contrast, and 44×44 minimum touch targets.
- Centralized logging and crash/error monitoring without recording credentials or private documents.
- Automated tests for state transitions and permission boundaries.

## Acceptance baseline

1. Customer can register, verify, create a job, hire a provider, track completion, and review.
2. Provider can register, verify, discover/save/apply to a job, manage active work, and submit completion.
3. Both users can exchange job-linked messages and receive status notifications.
4. Unauthorized users cannot read or modify another user's jobs, wallet, documents, or messages.
5. App state remains consistent after refresh, relaunch, or a retried request.
6. Both mobile repositories pass their tests and lint checks before release.

## Decisions required

- Deployment target and environment strategy.
- Final job lifecycle and cancellation/dispute rules.
- Payment gateway, escrow/release behavior, fees, refunds, and payout rules.
- Chat transport/provider and attachment limits.
- Notification provider and event matrix.
- Supported countries, currencies, taxes, privacy terms, and identity-verification policy.
- Referral program and wallet accounting rules.
