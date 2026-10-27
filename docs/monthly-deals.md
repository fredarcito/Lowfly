# Cheapest flights of the month: one page a month for every airport

Status (proposed 2026-10-27): **design only, nothing built**. Build it only after an explicit "implementa".

## Why

We need something the press can quote and link to. Local papers write "vuelos baratos desde Valencia" before every
long weekend and season, and a link from a newspaper is worth months of SEO work. The data is already there: every
night the cron saves the cheapest flight of each of the next six months to every destination from 26 airports.

Why not one ranking page per airport and month: it would be the airport's page (`/es/flights/madrid`, already the
cheapest flight to each destination) sorted, and Google would take it as a duplicate. This page answers a different
search ("vuelos baratos en diciembre") and links down to the airport and route pages instead of competing with them.

## Scope

In:
- One page per month: `/es/vuelos-baratos/diciembre-2026`, `/en/cheap-flights/december-2026`.
- The next six months, the ones the cron has data for. The current month counts only fares from today on.
- Past months stay published, frozen with their last prices, with a notice and a link to the current month
  (a press article linking to "noviembre" must never land on a 404).
- An index `/es/vuelos-baratos` that sends to the current month and lists the others.
- Every airport in `ROUTE_ORIGINS` (25 Spanish + Malta).

Out (for now):
- Exact dates (a long weekend, 5–8 December): the cron keeps the cheapest fare of the whole month, so this needs new
  requests to the airlines. Only if the press asks for it.
- Return flights, more than 1 adult: Lowfly does not search them for these pages either.
- Written text per month: the page is all data. Its few sentences are built from the numbers.

## Layout

```
┌──────────────────────────────────────────────────────────────┐
│  Vuelos baratos en diciembre de 2026                          │
│  El más barato sale de Valencia: 14 € a Bolonia (3 dic,       │
│  Ryanair). Desde Madrid hay 8 países por menos de 20 €.       │
│  Precios del 27 oct · solo ida · 1 adulto · se actualizan     │
│  cada día                                                     │
├──────────────────────────────────────────────────────────────┤
│  Ir a: Madrid · Barcelona · Valencia · Málaga · …   (chips)   │
├──────────────────────────────────────────────────────────────┤
│  Los 10 más baratos de España este mes                        │
│   1  Valencia → Bolonia        3 dic   Ryanair      14 €  →   │
│   2  Madrid → Marrakech        9 dic   Ryanair      15 €  →   │
│   …                                                           │
├──────────────────────────────────────────────────────────────┤
│  Madrid  (#madrid)                                            │
│   Marrakech     9 dic   Ryanair                    15 €  →    │
│   Bérgamo      11 dic   Ryanair                    17 €  →    │
│   … 5 rows                                                    │
│   Ver los 78 destinos desde Madrid  →  (/es/flights/madrid)   │
├──────────────────────────────────────────────────────────────┤
│  Barcelona  (#barcelona) …                                    │
├──────────────────────────────────────────────────────────────┤
│  Otros meses: noviembre · enero 2027 · febrero · …            │
└──────────────────────────────────────────────────────────────┘
```

- Each row links to its route page (`/es/flights/madrid-marrakech`), not to the airline: the route page already has
  the search link with the dates.
- Each airport section has an `id` (its slug): the email to a Valencia journalist links to `…/diciembre-2026#valencia`.
- The headline sentences come from the data: the cheapest flight of the month overall, and for the airport with the
  most of them, how many countries are under 20 €. They follow the copy rules (concrete figures, no brochure phrases).
- The date of the data ("Precios del 27 oct") is always visible: a journalist must be able to say where and when.
- Airports in `ROUTE_ORIGINS` order, Malta last (the page is mostly read in Spain).
- Mobile: the table rows collapse to destination + price on top, date and airline below, like `DestinationColumns`.

## Data

All of it is in `flight_route_snapshots.prices`: for each route slug, `{ months: [{ month, fare }], airlines,
minutes }`, `fare = { day, time, arrive, price, airline, code }` (`src/server/flightRoutes/prices.js`).

For a month `M`: for each origin, the routes with an entry for `M` (and `fare.day >= today` in the current month),
sorted by price. Top 5 per airport, top 10 overall. It is one read of `flight_route_snapshots` (26 rows), the same
the sitemap already does: **no new request to the airlines**.

Freezing past months: a small table `monthly_deals` (`month` primary key, `ranking` jsonb, `updated_at`). The cron,
after writing the airports, upserts the ranking of every month it has data for. When a month is over nothing
overwrites it, and its page reads the table. One row a month, a few KB each.

The page reads the table for every month (current and past): the cron already ran, so the ranking is ready and the
page does not compute it on each render.

## SEO

- Canonical to itself, `es`/`en`/`x-default` alternates (`alternatesOf`), in the sitemap at 0.8 with `lastModified`
  from `monthly_deals.updated_at`.
- Title: "Vuelos baratos en diciembre de 2026 desde España · Lowfly". Description from the headline sentence.
- Structured data: `ItemList` with the overall top 10, `BreadcrumbList` (Inicio › Vuelos baratos › Diciembre 2026).
- The airport and route pages get a link to the current month's page ("Lo más barato de diciembre").
- Past months: still indexed (archives get searched: "vuelos baratos diciembre 2026" a year later), with their
  notice.

## Cost

- Airlines: 0 requests (it reads what the cron already saved).
- Supabase: one upsert of ≤ 6 rows a night, one read per page render.
- Vercel: ~7 pages per language, ISR like the route pages (revalidate a day, or when the cron writes).

## Tests (e2e)

`e2e/monthly-deals.spec.js`:
- The current month's page shows the headline, the overall top 10 sorted by price, and a section per airport with
  its link to the airport's page.
- `#valencia` scrolls to Valencia's section.
- The English page is at `/en/cheap-flights/<month>-<year>` and links to the Spanish one through its alternates.
- A month with no data (more than six months ahead) is a 404; a past month shows the notice and the link to the
  current one.
- The index sends to the current month.

## Map of the code (where each piece goes)

| Piece | File |
|---|---|
| Section name per language | `src/constants/sections.js` (`"cheap-flights": { es: "vuelos-baratos", en: "cheap-flights" }`) |
| Routes | `src/constants/routes.js` (`cheapFlights(lang)`, `cheapFlightsMonth(lang, slug)`) |
| Month slugs ("diciembre-2026" ⇄ "2026-12") | `src/utils/monthSlugs.js` |
| Building the ranking | `src/server/monthlyDeals/ranking.js` |
| Reading/writing `monthly_deals` | `src/server/monthlyDeals/store.js` + `supabase/migrations/` |
| Cron step | `src/app/api/cron/flight-routes` (after the last run of the night) |
| Pages | `src/app/[lang]/cheap-flights/page.js`, `src/app/[lang]/cheap-flights/[month]/page.js` |
| Components | `src/components/monthlyDeals/MonthlyDealsPage/` (`components/DealsHero`, `TopDeals`, `AirportDeals`, `OtherMonths`) |
| Texts | `src/components/monthlyDeals/data/texts.js` |
| Sitemap | `src/app/sitemap.js` |

## Open questions

- Malta: on the same page (last) or out of it? It makes the "España" in the title wrong. Proposal: in it, and the
  title says "desde España y Malta" only in the description.
- Airports with few routes (León, Vitoria): a section with 2 rows is fine, or group them at the end as "Otros
  aeropuertos"?
- The 20 € in the headline: fixed, or the airport's own median (more honest for the Canaries)?
