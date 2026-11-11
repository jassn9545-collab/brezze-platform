# Professional My Jobs screen

The 10 November 2026 design update is scoped to the Our Bezzie professional
app's My Jobs area. It adds a pale screen background, compact back/notifications
header, segmented Applied/Active/Completed tabs and white rounded job cards.
The dark rounded bottom dock is enabled only on the My Jobs tab.

`components/MyJobCard.tsx` is used by all three job-list screens. It displays
actual API job/client/status/payment/budget data. Missing payment status is
omitted rather than inferred. The existing active-list date mapping is retained.
Successful payment provider earnings remain visible when supplied by the API.

Active cards retain the existing project chat and job-detail routes, now shown as
side-by-side Message and View Details buttons. Completed cards retain their
conditional customer-review action. Applied cards retain their job-detail
navigation. The separate `TripCell` used by Submit Work is unchanged.

The notification bell opens Notification, Back returns to Home, and the floating
plus keeps its existing Add Catalog action. No backend, payment logic, job
status, package ID, Firebase setup or API base URL was changed.

Lint, TypeScript and the Android standalone build passed. The APK was installed
in place on the connected Samsung SM-A125F. Artifacts are in
`deliverables/my-jobs-design-live-2026-11-10`. Public Drive APK revisions were not
replaced as part of this screen-only task.

The connected device's Active tab showed the live empty state during the visual
check, so the header, segmented selection, background and rounded dock were
reviewed on-device. The notification image initially tinted into a solid dot;
it was replaced with a native outline bell and the corrected build passed the
same checks and was installed. Populated card layouts/actions still need a
manual check with an account that has jobs; no live jobs were created or altered
for this design task.
