---
paths: ["src/app/[lang]/shared/**"]
---
# shared

## Purpose
A trip someone shared (`/es/shared/<id>`): read only, for anyone with the link, signed in or not, plus its link preview.

## Map
- Public API: `src/app/[lang]/shared/[id]/opengraph-image.js`, `src/app/[lang]/shared/[id]/page.js`
- Files: 2. Most imported: `src/app/[lang]/shared/[id]/opengraph-image.js`, `src/app/[lang]/shared/[id]/page.js`
- Used by: nothing outside the module
- Depends on: src/server (5), src/components (3), src/i18n (2), src/utils (2), src/constants (1), src/providers (1)
- `[id]/page.js`: `SharedTrip`, or `SharedTripGone` when the link is off (components/trips/sharing).
- `[id]/opengraph-image.js`: the preview: destination photo, who shares it, dates and nights; cached a day.
- Data: `src/server/sharedTrips` (`getSharedTrip`).

## How it works
Every request reads the trip as it is now (`force-dynamic`), so the owner's changes show at once. The preview image
uses the first town's photo for a trip planned by hand, the destination airport's otherwise, and the Positano
photo when there is none.

## Decisions
- 2026-10-15: personal pages, reachable by link only and never indexed (`noindex, nofollow`) (page comment).

## Traps
- Not the same as `src/components/shared/` (shared UI components): this folder is the shared-trip page.
- The image is cached a day in the CDN, so a renamed trip can show the old preview for up to a day.
