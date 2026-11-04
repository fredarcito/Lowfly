---
paths: ["src/app/[lang]/(search)/**"]
---
# search

## Purpose
The home and each kind of search's own page (anywhere, destination, flexible dates, multi-city): where visitors
search flights. The route group exists so every one of them shares a single search.

## Map
- Public API: `src/app/[lang]/(search)/anywhere/page.js`, `src/app/[lang]/(search)/destination/page.js`, `src/app/[lang]/(search)/flexible-dates/page.js`, `src/app/[lang]/(search)/layout.js`, `src/app/[lang]/(search)/multi-city/page.js`, `src/app/[lang]/(search)/opengraph-image.js`, `src/app/[lang]/(search)/page.js`
- Files: 7. Most imported: `src/app/[lang]/(search)/anywhere/page.js`, `src/app/[lang]/(search)/destination/page.js`, `src/app/[lang]/(search)/flexible-dates/page.js`, `src/app/[lang]/(search)/layout.js`, `src/app/[lang]/(search)/multi-city/page.js`, `src/app/[lang]/(search)/opengraph-image.js`, `src/app/[lang]/(search)/page.js`
- Used by: nothing outside the module
- Depends on: src/components (8), src/utils (5), src/i18n (2), src/constants (1), src/providers (1), src/server (1)
- `layout.js`: renders `FlightSearch` (components/search) and `InstallBanner` for every page of the group. The search lives here, not in the pages.
- `*/page.js`: only `<PageTop />` plus their metadata from `utils/searchPage` (`searchPageMetadata(params, kind)`).
- `page.js`: the home; adds the site's JSON-LD (`siteOf`).
- `opengraph-image.js`: the link preview for the whole group (Positano photo, headline), as JPEG cached a week.

## How it works
A visit to any search page renders the layout's search; the page itself only adds its title and description. Moving
between search kinds (the tabs) changes the page under the same layout, so what was typed survives and nothing
reloads. The search calls the API (`src/app/api`, see the api note), never the airlines from here.

## Decisions
- 2026-10-20: the search moved into a shared layout, so switching between search kinds keeps the form (layout.js comment).

## Traps
- The folder names are English (`anywhere`, `flexible-dates`…), but the URLs are named per language
  (`constants/sections`, rewritten by `src/proxy.js`). Don't rename folders to match a Spanish URL.
- Don't put the search inside a page: it would remount on every tab change and lose its state.
