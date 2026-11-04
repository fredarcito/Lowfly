---
paths: ["src/app/[lang]/flights/**"]
---
# flights

## Purpose
The SEO route pages: every airport (`/es/flights`), an airport's destinations (`/es/flights/malta`) and one route
(`/es/flights/malta-barcelona`), with prices the cron saved. Meant to bring visitors from search engines.

## Map
- Public API: `src/app/[lang]/flights/[route]/opengraph-image.js`, `src/app/[lang]/flights/[route]/page.js`, `src/app/[lang]/flights/page.js`
- Files: 3. Most imported: `src/app/[lang]/flights/[route]/opengraph-image.js`, `src/app/[lang]/flights/[route]/page.js`, `src/app/[lang]/flights/page.js`
- Used by: nothing outside the module
- Depends on: src/components (14), src/server (10), src/utils (4), src/i18n (3), src/constants (2), src/providers (2)
- `[route]/page.js`: one slug is either an airport (`findOrigin`) or a route (`findRoute`); `load()` decides and
  builds the page data, with breadcrumbs and FAQ as JSON-LD.
- `[route]/opengraph-image.js`: the preview with route, airlines and lowest price; cached a day.
- `page.js`: the airports index by country, linked from every footer.
- Data: `src/server/flightRoutes/*` (routes, prices, snapshots, refresh); views: `src/components/flightRoutes/*`.

## How it works
`/api/cron/flight-routes` writes prices once a day (from the airlines, to snapshots). A page is built on its first
visit from those snapshots, served from the CDN, and rebuilt after a day or when the cron writes new prices
(`revalidatePath`). The page never asks the airlines.

## Decisions
- 2026-10-16: no page is built at build time; `generateStaticParams` returns `[]` so Next keeps the pages built on a
  visit (without it every visit would rebuild the page) (page comment).

## Traps
- `generateStaticParams = () => []` looks useless but is required (see above). Don't remove it.
- The same `[route]` segment serves two kinds of page; check `data.kind` ("origin" or "route").
- The folder is `flights/`; the Spanish URL comes from `constants/sections` through `src/proxy.js`.
