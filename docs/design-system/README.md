# Brezze Design System

## Scope

This page documents the existing UI foundation shared by the customer **Brezzee** app and the **Provider** app. It is derived from both projects' `src/theme`, `src/components`, and navigator files. It describes the current implementation; it does not replace product or accessibility review.

## Product roles

| App | Primary role | Core journeys |
| --- | --- | --- |
| Brezzee | Customer/client | Discover services, post a job, hire a provider, track work, release payment, review |
| Provider | Freelancer/service provider | Discover jobs, filter/save/apply, manage active work, submit work, manage wallet and catalog |

Both apps use a white, blue-led interface with Montserrat typography, rounded controls, cards, modal sheets, drawer navigation, and bottom tabs.

## Shared foundation

### Semantic colors

| Token | Value | Intended use |
| --- | --- | --- |
| `primary` | `#0054A5` | Main calls to action, selected states, brand emphasis |
| `text` | `#252525` | Primary body and heading text |
| `textDim` | `#565656` | Secondary descriptions and metadata |
| `background` | `#FFFFFF` | Default screen and card background |
| `separator` | `#EBEBEB` | Dividers and subtle boundaries |
| `error` | `#C03403` | Validation and destructive/error text |
| `errorBackground` | `#F2D6CD` | Error surfaces |
| `success` | `#00C851` | Successful actions and completion states |
| `info` | `#33B5E5` | Informational status |
| `danger` | `#D9534F` | Destructive actions |

### App-specific color differences

| Usage | Brezzee | Provider |
| --- | --- | --- |
| Positive green | `#27AE60` | `#14A800` |
| Primary dim surface | `#EBF4FF` | `#92CEFF` |
| Secondary light gray | `#F2F2F7` | `#EFEFEF` |
| Warning | `#B45309` | `#FFD54F` |
| Warm highlight | `#FEF3C7` | `rgba(254, 181, 18, 1)` |

Use shared semantic tokens for common behavior. Keep app-specific values only where customer and provider states genuinely need different meaning.

## Spacing scale

| Token | Pixels |
| --- | ---: |
| `zero` | 0 |
| `one` | 1 |
| `xxxs` | 2 |
| `xxs` | 4 |
| `xs` | 8 |
| `sm` | 12 |
| `md` | 16 |
| `lg` | 24 |
| `xl` | 32 |
| `xxl` | 48 |
| `xxxl` | 64 |

Prefer this scale for padding, margins, gaps, control heights, and layout rhythm. Avoid new one-off values unless a platform constraint requires them.

## Shared component inventory

The projects already contain reusable primitives for:

- Text, buttons, text fields, OTP entry, loaders, empty states, and toast messages.
- Screen containers, authentication headers, back buttons, bottom tabs, and drawers.
- Address search/display, country selection, date selection, dropdowns, and image picking.
- Slide-up/center/success modals, ratings, stars, dashed separators, and expandable text.
- Provider-only range slider, image viewer/zoom, and service catalog interactions.

Before creating a new screen-level control, check `src/components` in both apps and extend an existing primitive where possible.

## Navigation patterns

### Brezzee

- Bottom tabs: Home, Service, Job action, Chat, Profile.
- Job action opens the job-post flow instead of rendering a normal tab screen.
- Stack journeys include job creation, categories, job details/list, hire history, provider profile, job completion, and review.

### Provider

- Bottom tabs: Home, Hire Jobs, Chat, Profile.
- Hire Jobs uses a top-tab booking/job-status navigator.
- Stack journeys include job detail, filters, application, saved jobs, active/submitted work, wallet, service catalog, and image viewer.

## Interaction and layout rules

1. Use the shared `Text`, `Button`, `TextField`, and `Screen` components for consistent behavior.
2. Use semantic colors from `src/theme/colors.ts`; do not add raw hex values inside screens.
3. Use the spacing scale and safe-area helpers for all screen edges.
4. Show loading, empty, error, and success states for every API-backed view.
5. Keep touch targets at least 44×44 logical pixels.
6. Provide labels for icon-only controls and maintain readable color contrast.
7. Preserve platform back behavior and typed navigation parameters.
8. Test compact and large device widths; do not rely on fixed pixel positioning.

## Current design debt

- Several screens still use inline colors, inline styles, and direct `fontWeight` values.
- Some tokens have overlapping names or different values between apps.
- Brezzee includes screen-specific blue/job-post tokens that are not yet normalized.
- Provider includes additional catalog, slider, and image-viewer patterns that are not shared.

New work should reduce this drift instead of introducing more app-local tokens.

## Implementation sources

- Brezzee: `apps/customer/src/theme`, `apps/customer/src/components`, `apps/customer/src/navigators`
- Provider: `apps/provider/src/theme`, `apps/provider/src/components`, `apps/provider/src/navigators`
