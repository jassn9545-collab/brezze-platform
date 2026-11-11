# Our Bezzie job filters

The professional app (`apps/our-bezzie`, Android `com.bezzieprovider`) opens
`AdvanceFilterScreen` from the floating filter button on Jobs.

- The screen contains distance radius, AUD budget and date
  posted. Current Search Center and Job Categories are intentionally omitted.
- Radius defaults to 50 km, with a 5–300 km slider and 5/25/50/100/150/300 presets.
  The center is the device location used by Jobs; there is no manual center picker.
- Apply commits the draft filters and reloads page one. Closing discards edits.
  Reset changes the draft to 50 km, minimum AUD 0, no maximum and Anytime;
  press Apply to commit it. Applied filters remain while navigating the app and
  reset on a fresh app session or logout.
- Distance uses a Haversine great-circle calculation in kilometres, not a road
  travel distance. Missing, blank, malformed or out-of-range coordinates are
  excluded. Coordinate zero is valid.
- Budget boundaries are inclusive. Empty maximum means unlimited. Date windows
  are rolling 24-hour/7-day/30-day windows. Plain database timestamps are UTC.
- The Job Type section (Fixed Price, Hourly Rate, Urgent and its explanatory note)
  was removed at the user's request. The current API job model remains fixed-price.
  Payment-verification and client-rating filters from the old placeholder screen
  have also been removed.

## Live API compatibility

The live `/freelancer/latest-jobs` endpoint currently returns paginated active
jobs and ignores coordinates for filtering. `loadJobSearch` requests every source
page (100 jobs per request), deduplicates job IDs, then applies search, radius,
budget and date filters before slicing the requested result page. This makes the
preview count and pagination reflect actual matching jobs, including jobs from
later source pages. A failed source page rejects the search instead of presenting
partial results as complete. Stale asynchronous responses cannot overwrite a
newer filter/search request.

No backend deployment, database migration, Firebase or package identity change is
required. This compatibility path downloads all active matching source jobs on
an uncached search; if the catalogue grows substantially, move these filters and counts
to the server before pagination and update the app response contract together.

## Current-location freshness

The original location helper defaults to an unlimited cache age and low accuracy.
That is unsuitable for a nearby-job search: a cached fix from another city can
produce internally consistent distances around the wrong city. Jobs now requests
high-accuracy GPS with a bounded native timeout, and validates
that the resulting fix is at most 30 seconds old with accuracy within 500 metres.
Stale, invalid, imprecise and future-dated fixes fail with a retry message.

Opening Jobs, returning from Filters (including Apply) and resuming the focused
Jobs screen validate a recent precise GPS fix, requesting a new fix when needed.
Pull-to-refresh explicitly bypasses both location and feed caches. Search also
reacquires GPS if its existing fix has expired. Pagination keeps the current
search center and source snapshot consistent instead of restarting the search.
If a native provider returns a wrong but fresh location,
the app cannot infer the actual physical city from profile text; the device's
location source must be checked. The app does not hardcode a city or substitute
profile coordinates for the device location.

Follow-up diagnosis on 10 November: the connected Samsung returned a new GPS fix
in the same Hoshiarpur region with 14.1 m reported accuracy. The user confirmed
Patiala was the profile's saved city. Thus the original mismatch was between the
profile city and the device search center, rather than an incorrect Haversine
distance. The fresh-GPS guard is retained as an independent correctness fix.
The updated build was installed in place; the two targeted suites passed 28
tests, and lint/type-check/Android build passed. Its artifact is in
`deliverables/job-radius-fresh-gps-2026-11-10`; public Drive files were not changed.

## Filter speed correction (v1.0.3)

The initial freshness fix forced a new native GPS request every time Jobs gained
focus, including immediately after Apply, then fetched all source pages again.
On the connected Samsung, one observed cold request spent 16,327 ms waiting for
GPS and 303 ms fetching jobs. An earlier GPS acquisition took about 29 seconds.

The app now reuses only a precise location fix whose original timestamp is still
within 30 seconds. Concurrent requests share one in-flight acquisition. Filters
maintains a high-accuracy watch while focused and foregrounded so Apply can use
a current fix; the watch stops on blur or background. Invalid or expired fixes
are never accepted, and explicit refresh requests new GPS.

Complete source jobs are cached in memory for 30 seconds, keyed by account and
search. Changing radius, budget or date recalculates results against this source
without another API request. Cache hits do not extend the original expiry. A
different account/search, expiry, explicit refresh or a saved/applied-job mutation
requires a new source request. Pagination reuses its search snapshot even after
the short refresh TTL, preserving its center/count instead of jumping to page one.
Logout resets the Redux source cache. Nothing is persisted to disk.

The location wait has its own message, separate from job-data loading. Local
diagnostic messages record only durations and the cache-hit flag, with no tokens,
coordinates or user identifiers. The targeted suites cover freshness, cache
isolation/expiry, explicit refresh, concurrent GPS, native watch cleanup,
pagination and distance correctness (42 passing tests).

The user then identified a separate delay between tapping the filter button and
the filter screen opening. Home now preloads the controls after its interactions
finish. Preloading does not start GPS or an API call. The filter route has no
transition animation, and its foreground GPS watch starts 500 ms after focus so
native location work does not compete with the initial controls mounting.
Diagnostic events distinguish the button handler, focus, next JS animation-frame
callback and native navigation transition. These callbacks are timing probes,
not proof that a frame has physically appeared on the display; the opening still
requires a visual check on the phone. Earlier 54–69 ms cached-feed measurements
measure result calculation only, not end-to-end screen opening.

A follow-up phone screenshot showed a loaded job card with the old animated
"Loading…" box still visible, even though the feed timing had already completed
(294 ms in that run). Home's empty-state loader now uses ordinary React Native
views and an ActivityIndicator, with no Reanimated exit animation. This lets its
removal follow the loading/data state directly. Other screens' loaders are
unchanged.

The user clarified that the remaining wait was the initial app launch, before
Home controls appeared, rather than a filter-button navigation delay. Home now
renders Search, Filter and navigation immediately; only nearby-job results wait
for a validated search center. The location status is part of the empty jobs
area and does not cover or disable controls. Filters can be configured while
location is pending; Apply/count wait for a center.

The installed location module's Android `auto` configuration keeps its platform
LocationManager implementation; high-accuracy requests therefore use the GPS
provider. The app now explicitly prefers the Google Play services fused provider,
with the module's built-in platform fallback when Play services is unavailable.
This can combine device location sources instead of relying only on a satellite
fix.

Job location acquisition owns a short-lived high-accuracy subscription with
1-second updates and a 20-second JavaScript deadline. This avoids relying on the
fused single-position implementation's missing timeout handling. The subscription
is removed after a valid fix, permission denial or timeout. Transient availability
errors and stale/imprecise initial updates can be followed by a valid fix before
the deadline. Late callbacks cannot populate the recent-location cache after a
request has timed out. Concurrent callers share one acquisition.

Normal requests allow native fixes at most 30 seconds old, with the same timestamp
and 500 m accuracy validation. Explicit pull-to-refresh bypasses the memory cache,
requests zero native cache age and additionally rejects fixes timestamped before
the request. The targeted suites pass 45 tests, including timeout cleanup,
late-callback rejection, permission failure, explicit refresh and cache isolation.
A genuinely cold device without a sufficiently accurate location can still take
several seconds to populate nearby jobs; Home controls are available throughout.

Final Samsung standalone check: the first fused acquisition took 10,302 ms and
the live jobs request took 300 ms. Restarting the app process shortly afterward
reused a sufficiently recent native fix in 426 ms; the jobs request took 416 ms.
These are operation timings, not total splash-to-Home or physical screen-paint
measurements. The final screenshot shows the live job card with no retained
loading box. Version 1.0.3/code 4 preserves the testing certificate and login.

## Validation

From `apps/our-bezzie`:

```sh
npx jest --runInBand __tests__/jobFilters.test.ts
npx eslint src/screens/AdvanceFilterScreen.tsx src/screens/HomeScreen.tsx src/slices/home.slice.ts src/utils/jobFilters.ts
npx tsc --noEmit
```

Tests cover known kilometre distances, date-line/pole cases, unknown coordinates,
radius boundaries, budget/date validation, late-page matches, count consistency,
deduplication and incomplete network responses.

On 10 November 2026 the standalone Android build was installed over the existing
Our Bezzie app on the connected Samsung SM-A125F, keeping the signed-in account.
Live checks returned 1 match at 5 km and 50 km, 14 matches at 300 km, and 13 matches
after dragging the slider to 144 km. Applying 300 km expanded the Jobs list;
reopening retained the selected radius. A maximum budget of AUD 100 at 5 km
returned zero matches; 300 km plus Past 24 hours returned one. Reset restored
50 km / AUD 0 minimum / no maximum / Anytime. The phone was left on the new
Filters screen with the default 50 km applied.

The feature APK and screenshots are in `deliverables/job-radius-live-2026-11-10`.
The previous public Drive APK versions have not been replaced by this feature
build. The customer app and live backend were not changed. iOS runtime testing
was not performed on this Linux machine.

## Published Android update — 10 November 2026

Professional v1.0.3/code 4 is published as a new revision of the existing public
Drive file `1VFXXqelkJ3NopXfzY9SjSKF_rknQi56z`; the shared download URL is unchanged.
An unauthenticated HTTP 200 download matched the tested APK's 46,346,879 bytes and
SHA-256 `55e43fafa3d068c0d17578d47b98282e40b057bab4bf6e0cd508c2c97193df53`.
The customer APK remains v1.0.1/code 2. No backend deployment is required.
Release metadata, checks and screenshots are in
`deliverables/client-professional-v1.0.3-2026-11-10`.

Professional v1.0.4/code 5 replaces that revision on the same public file ID after
removing the Job Type section. Unauthenticated download verification matched
46,345,903 bytes and SHA-256
`592fbde1d5e765b57f1a6a0ce2bff3c2f1defabeef25ad0e90b7815ba34adff0`.
The exact published APK was installed over the connected phone's existing app.
Release evidence is in `deliverables/client-professional-v1.0.4-2026-11-10`.
