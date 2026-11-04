---
paths: ["src/app/[lang]/guides/**"]
---
# guides

## Purpose
The city guides (`/es/guias/roma-3-dias`, `/en/guides/rome-3-days`) and their index: day-by-day itineraries for
search engines and visitors.

## Map
- Public API: `src/app/[lang]/guides/[guide]/page.js`, `src/app/[lang]/guides/page.js`
- Files: 2. Most imported: `src/app/[lang]/guides/[guide]/page.js`, `src/app/[lang]/guides/page.js`
- Used by: nothing outside the module
- Depends on: src/components (11), src/server (5), src/i18n (3), src/constants (2), src/providers (2), src/utils (2)
- `[guide]/page.js`: one guide, built at build time for every language; JSON-LD (breadcrumbs, TouristTrip, FAQ);
  links to the multi-city route pages that include the guide (`routePagesWithGuide`).
- `page.js`: every guide with its photo (its own, or its city's).
- Data: `src/data/cityGuides.json` via `src/server/cityGuides`; views: `src/components/guides/*`.

## How it works
`scripts/city-guides.mjs` writes the guides once (calling `/api/city-guides` with `CRON_SECRET`) into
`src/data/cityGuides.json`. The pages only read that file; only the photos are read again daily (`revalidate`).
A guide's slug in the other language redirects permanently to this language's; any other slug is a 404.

## Decisions
- 2026-10-18: guides are generated once by a script and kept in the repo, never on a visit (api/city-guides comment).

## Traps
- Text in the guides follows the written-copy rules in CLAUDE.md (Spanish and English, no brochure phrases).
- The folder is `guides/`; `/es/guias` reaches it through `src/proxy.js`.
