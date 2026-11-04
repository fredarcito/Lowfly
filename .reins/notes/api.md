---
paths: ["src/app/api/**"]
---
# api

## Purpose
Lowfly's own HTTP API: the flight searches the browser runs, airports/places/photos lookups, the AI itinerary,
search metrics, the sign-in callback, and the crons and scripts' endpoints.

## Map
- Public API: `src/app/api/airports/route.js`, `src/app/api/auth/callback/route.js`, `src/app/api/city-guides/route.js`, `src/app/api/country/route.js`, `src/app/api/cron/flight-routes/route.js`, `src/app/api/cron/route-graph/route.js`, `src/app/api/destinations/route.js`, `src/app/api/everywhere/route.js`, `src/app/api/flexible/route.js`, `src/app/api/guides/route.js`, `src/app/api/itinerary/route.js`, `src/app/api/metrics/search/route.js`, `src/app/api/multi-city/route.js`, `src/app/api/origin/route.js`, `src/app/api/photos/place/route.js`, `src/app/api/photos/route.js`, `src/app/api/places/route.js`, `src/app/api/spots/route.js`, `src/app/api/stopovers/route.js`
- Files: 19. Most imported: `src/app/api/airports/route.js`, `src/app/api/auth/callback/route.js`, `src/app/api/city-guides/route.js`, `src/app/api/country/route.js`, `src/app/api/cron/flight-routes/route.js`, `src/app/api/cron/route-graph/route.js`, `src/app/api/destinations/route.js`, `src/app/api/everywhere/route.js` (+11 more)
- Used by: nothing outside the module
- Depends on: src/server (47), src/constants (6), src/i18n (5), src/supabase (2), src/utils (2)
- Searches (`country`, `everywhere`, `flexible`, `multi-city`, `stopovers`): wrapped in `handleSearch` (`server/handler`).
- Lookups (`airports`, `destinations`, `places`, `spots`…): wrapped in `handle`.
- `itinerary`: the AI itinerary, with daily limits per account (Supabase) or per IP.
- `cron/*`: called by Vercel Cron (`vercel.json`) with `CRON_SECRET`. `city-guides`: only `scripts/city-guides.mjs`, same secret.
- Browser callers: one file per service in `src/api/` (axios); see `docs/multi-city.md` for the request budget.

## How it works
A route handler validates its query with `server/handler` (`iata`, `day`, `range`, `stay`…; a bad value is a 400 with
an error code), calls `src/server/*`, and returns JSON cached 10 minutes in the CDN. `handleSearch` first runs BotID
(unverified bots get 403) and the visitor's search limit, so a bot costs nothing.

## Decisions
- 2026-10-20: search metrics are reported by the browser, because the CDN answers some searches without reaching the server (metrics/search comment).
- 2026-10-17: the flight-routes cron runs three times, an hour apart, because the Hobby plan runs a cron once a day; later runs only write what is still old (cron comment).

## Traps
- Any new endpoint that may reach the airlines must use `handleSearch`, not `handle`, and be listed in
  `constants/searchRoutes`.
- Airline errors become 502 `{ error: "unknown" }`; `AppError` carries its own status and code for the UI.
- Never announce every route page to IndexNow each night: only the changed ones (cron comment).
