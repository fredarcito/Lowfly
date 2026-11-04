---
paths: ["src/app/[lang]/trips/**"]
---
# trips

## Purpose
"My trips" (`/trips`, the saved trips and their itineraries) and the manual trip planner (`/trips/new`).

## Map
- Public API: `src/app/[lang]/trips/new/page.js`, `src/app/[lang]/trips/page.js`
- Files: 2. Most imported: `src/app/[lang]/trips/new/page.js`, `src/app/[lang]/trips/page.js`
- Used by: nothing outside the module
- Depends on: src/components (3), src/utils (3), src/constants (2), src/i18n (2), src/providers (2), src/server (2)
- `page.js`: renders `TripsApp` (components/trips), which runs in the browser; `noindex`.
- `new/page.js`: `ManualTripForm`, prefilled from `?to=BCN` (an airport's town) or `?stops=…` (every town with its
  dates, `utils/manualTrips`), resolved on the server from `server/airports` and `server/multiCity/routes`.

## How it works
Trips live in the browser (localStorage, `src/store`) and, when signed in, sync to Supabase. So `/trips` is rendered
in the browser; the server only sends the shell. `/trips/new` builds the form's first stops on the server from the
query, then the form takes over.

## Traps
- `<Suspense>` on `/trips` is required: `TripsApp` reads `?id` from the URL.
- In `?stops=`, a stop code is either an airport (`BCN`) or a multi-city route town (`classic-italy/full/2`,
  `isRouteTown`); both paths must keep working.
- The local `TripsPage` component in `page.js` is not `components/trips/TripsPage` (the page frame other pages use).
