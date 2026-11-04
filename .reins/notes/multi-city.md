---
paths: ["src/app/[lang]/multi-city/**"]
---
# multi-city

## Purpose
A multi-city route's own page (`/es/recorridos/<route>`, `/en/multi-city/classic-italy`) for search engines:
the route town by town, with what to see and an FAQ.

## Map
- Public API: `src/app/[lang]/multi-city/[route]/page.js`
- Files: 1. Most imported: `src/app/[lang]/multi-city/[route]/page.js`
- Used by: nothing outside the module
- Depends on: src/components (5), src/i18n (2), src/constants (1), src/providers (1), src/server (1), src/utils (1)
- `[route]/page.js`: built at build time for every language; JSON-LD (breadcrumbs, TouristTrip with each town, FAQ).
- Data: `src/data/multiCityPages/<route>.json` via `src/server/multiCity/pages`; views: `src/components/multiCity/RoutePage`.
- The "Recorridos" search itself is not here: it is a search page (see the search note). Full map in `docs/multi-city.md`.

## How it works
The page reads the route's JSON (written by hand, never on a visit) and renders it inside the `TripsPage` frame.
A slug in the other language redirects permanently to this language's; any other slug is a 404. The language
switch goes to the same route under its name in the other language.

## Decisions
- 2026-10-21: a folder of its own, outside the `(search)` group: no search form on these pages, only the link to it (page comment).

## Traps
- `/es/recorridos` (no route) is the search page, through `src/proxy.js`; only `/[route]` lands here.
- Page text follows CLAUDE.md's written-copy rules; pages stay `"reviewed": false` until someone checks the facts.
