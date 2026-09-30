# Brezze Typography

## Font family

Both apps use **Montserrat** as their primary typeface. The font assets are stored in each app at `src/assets/fonts`.

| Semantic weight | Font asset |
| --- | --- |
| `light` | `Montserrat-Light.ttf` |
| `regular` | `Montserrat-Regular.ttf` |
| `medium` | `Montserrat-Medium.ttf` |
| `semiBold` | `Montserrat-SemiBold.ttf` |
| `bold` | `Montserrat-Bold.ttf` |
| `extraBold` | `Montserrat-ExtraBold.ttf` |

Use the semantic weight through the shared `Text` component. Avoid combining a Montserrat `fontFamily` with a separate numeric `fontWeight`, because native platforms may synthesize inconsistent results.

## Type scale

The same scale is implemented by both apps in `src/components/Text.tsx`.

| Size token | Font size | Line height | Recommended use |
| --- | ---: | ---: | --- |
| `xxxxl` | 44 | 48 | Rare hero number or promotional display |
| `xxxl` | 36 | 44 | Large display heading |
| `xxl` | 28 | 38 | Screen title or major section heading |
| `xl` | 24 | 34 | Standard heading preset |
| `lg` | 20 | 32 | Card/section title |
| `md` | 18 | 26 | Subheading, emphasized form content |
| `sm` | 16 | 24 | Default body text and controls |
| `xs` | 14 | 21 | Labels, metadata, helper text |
| `xxs` | 12 | 18 | Compact captions and status text |

## Existing presets

| Preset | Definition | Use |
| --- | --- | --- |
| `default` | 16/24, regular, primary text | Normal body copy |
| `medium` | 16/24, medium, secondary text | Emphasized supporting text |
| `bold` | 16/24, bold | Strong inline emphasis |
| `light` | 16/24, regular, light color | Low-emphasis copy |
| `heading` | 24/34, semi-bold | Screen and major section headings |
| `subheading` | 18/26, regular, dim text | Introductory/supporting headings |
| `formLabel` | 14/21, regular, dim text | Field labels |
| `formHelper` | 14/21, regular | Validation/help copy |
| `semibold` | 18/26, semi-bold | Prominent actions or section emphasis |

## App-specific guidance

### Brezzee customer app

- Job titles and provider names should use `lg` or `md` with `semiBold`.
- Job metadata, hire status, and pricing labels should use `xs` or `xxs`.
- Job creation forms should use the shared `formLabel` and `formHelper` presets.
- Completion/payment actions should not rely on uppercase or color alone to communicate state.

### Provider app

- Job titles and earnings totals should use `lg`/`xl` with `semiBold` or `bold`.
- Filter values, application metadata, and status tabs should use `xs`/`sm`.
- Catalog and work-submission forms should use the shared form presets.
- Wallet amounts should preserve tabular readability and include a currency code/sign.

## Usage examples

```tsx
<Text preset="heading" text="Available jobs" />
<Text preset="subheading" text="Jobs matching your services" />
<Text size="xs" weight="medium" text="Posted 2 hours ago" />
<Text preset="formLabel" text="Service category" />
```

## Accessibility rules

1. Keep React Native font scaling enabled unless a verified layout exception exists.
2. Test at large system text sizes; text must wrap instead of clipping.
3. Do not use text below 12 px for required information.
4. Maintain WCAG-readable contrast against the actual surface color.
5. Use sentence case for actions and headings; avoid long all-caps labels.
6. Use text plus icon/status wording rather than color alone.
7. Localized strings must be allowed to expand by at least 30%.

## Known inconsistencies to resolve

- Some screens bypass the shared `Text` component with direct `fontSize`/`fontWeight` values.
- Brezzee `ServiceListScreen` contains a direct `Roboto` reference although Montserrat is the documented family.
- Several screen styles hard-code sizes already available in the shared scale.
- Typography tokens are duplicated between the two repositories and can drift.

Treat each app's `src/theme/typography.ts` and `src/components/Text.tsx` as implementation sources, and this page as the shared usage contract. The apps live under `apps/customer` and `apps/provider`.
