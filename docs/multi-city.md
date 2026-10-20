# Multi-city trips: suggested routes ("recorridos")

Status (built 2026-10-20). Update this file as the pieces land.
- Route data, every region (`src/data/multiCity/`, 100 routes, 274 versions) and its checker
  (`scripts/check-multi-city.mjs`): **done, drafted by AI, none reviewed yet** (`reviewed: false`); all shown.
- Engine (`src/server/multiCity/`), `GET /api/multi-city`, the "Recorridos" search mode, its results
  (`MultiCityResults`), the planner taking route towns (`?stops=italia-clasica/full/2,…`), "Guardar viaje", the link
  from "A cualquier sitio", the planner's limits raised (9 towns, 15 days, 10 a town) and `e2e/multi-city.spec.js`:
  **done** (2026-10-20).
- Also done: each card shows first the version that ranked it (`bestVersion`), "Recomendados / Más baratos" order,
  fixed photos per route, search pages per kind (`/es/recorridos`…), usage metrics in the admin (`/admin/usage`).
- Pending: "ver más" asking prices in parts (today the ~8 candidates are priced at once), the loops through the
  airlines' return-trip finders, the prices-in-advance cron, route pages (SEO), joining two routes, reviewing the
  routes (all `reviewed: false`), measuring before tuning the cache (`fresh` by how far the flight is).

## Map of the code

- Data: `src/data/multiCity/<region>.json` (`christmas.json`: seasonal). Checker: `scripts/check-multi-city.mjs`
  (needs a dev server: `--base=http://localhost:3000`). Photos: `scripts/multi-city-photos.mjs` (keeps hand-set ones).
- Engine, server only: `src/server/multiCity/` — `routes.js` (loads the JSON; add a region file there), `possible.js`
  (graph → ways to fly a route), `fit.js` (versions in the free dates, nights shared out, season), `rank.js`
  (candidates, order, variety), `index.js` (`multiCityTrips`: screening by month, per-day prices, combine, answer).
  Shared with stopovers: `server/dailyPrices.js` (`routeFares`, `legOf`), `server/stopovers/combine.js`.
- API: `src/app/api/multi-city/route.js` (5–15 free days). Constants: `src/constants/multiCity.js`.
- Search pages: `src/app/[lang]/(search)/` (layout = the search, one page per kind), `src/constants/searchPages.js`,
  names per language in `src/constants/sections.js`, `ROUTES.search(lang, mode)`; old `/es?m=…` links redirect in
  `src/proxy.js`.
- UI: `src/components/search/results/MultiCityResults/` (`QuietPicker`: order + length; `RouteCard/` with
  `RoutePhoto`, `TownChain`, `FlightPair`, `LengthPicker`, `PlanButton`), `src/components/search/MultiCityPromo`,
  helpers `src/utils/multiCity.js` (days per town, planner and saved towns, default trip).
- Planner taking route towns: `src/utils/manualTrips.js` (`isRouteTown`), `src/app/[lang]/trips/new/page.js`.
- Metrics: `src/server/metrics.js` (daily Redis counters), counted in `src/server/airlineGuard.js` and by
  `src/app/api/metrics/search/route.js`; read by `src/server/admin/usage.js`, shown by `src/components/admin/AdminUsage`.
- Tests: `e2e/multi-city.spec.js`, `e2e/search-pages.spec.js`, `e2e/usage.spec.js`.

Reviewing a route: read it with the checker's output for it (`--only=<id>`), fix stops / nights / land times /
airports in its JSON, set `reviewed: true`. Routes may start and end in the same city (a loop, `reversible: false`):
Georgia from Kutaisi, Moldova from Iași, Peloponeso from Athens.

Read `docs/stopovers.md` first: this reuses its route graph, its price fetching, its combiner and its trip / fare
shape.

## Why

Someone has free dates (a week, two) and no destination. Today "A cualquier sitio" answers with one city per
destination. People travelling a week or more want several places: fly into one city, move by land through a few
more, fly home from another one (open-jaw). Nobody offers that well with cheap flights straight to the airline.

Lowfly suggests **routes** ("recorridos"): a set of cities visited by land, with how long each one deserves, entered
through some airports and left through others. Only the flights are priced; the land legs are out of our domain
(no prices, no booking: "Bolonia → Florencia por tierra, ~40 min").

## Principles

- **Only flights have prices.** Land legs are a link between cities, shown with an approximate time and nothing else.
- **The AI never picks flights or prices.** Routes are data written once (drafted with AI, reviewed by hand); the
  search is plain code; the AI only writes the text of the final suggestions and the itinerary, as today.
- **Few requests to the airlines.** Routes are known in advance, so their entry / exit airports are too: the route
  graph says which routes are possible from an origin without asking anyone; prices are asked only for those.
- **Cheapest price, straight to the airline** (as the rest of Lowfly): Ryanair, Wizz, Travelpayouts airlines.

## Scope

In (phase 1):
- Routes prepared by us, two kinds: **classic** (the ones people already do) and **surprise** (lesser-known, cheap,
  worth it).
- One route per trip: flight in, cities by land, flight home from the last city (or the same one).
- Each route can be done in both directions when it makes sense (`reversible`).
- Variable length: each route has a **short**, a **full** and a **long** version, written by hand (a 5-day trip still
  gets "Italia clásica", in its short version; two weeks, in its long one).
- Europe only, origins from the route graph.

Later (the design must allow them):
- **Two routes joined by a flight** (two weeks or more, for variety; the long versions already cover two weeks in one
  route): Italy + Balkans through Rome → Split. At most one flight
  between routes (3 flights in all); two for three weeks or more, never more.
- Prices computed in advance for the most searched origins (cron).
- A page per route and origin (SEO): "Ruta por el norte de Italia en 7 días desde Madrid, desde 89 €".
- Routes found automatically (cities close by land, grouped by coordinates) to offer "other ideas".
- Filters "Clásicos / Sorpréndeme", season, budget.

Out:
- Land transport prices or booking (at most an affiliate link to Omio / Trainline / FlixBus, no prices of ours).
- More than one stop per flight (a route reached through a hub is a later combination with `docs/stopovers.md`).

## Architecture

### 1. Routes (data, reviewed by hand)

One JSON file per region in `src/data/multiCity/` (`italy.json`, `balkans-greece.json`…), each `{ id: route }`, so
the routes can be reviewed a region at a time. `node --env-file=.env.local scripts/check-multi-city.mjs` checks them
(see Checks below).

```js
{
  "italia-clasica": {
    kind: "classic",                         // "classic" | "surprise"
    reviewed: false,                         // true once a person has read it; tracking only: every route is shown
    name: { es: "Italia clásica", en: "Classic Italy" },
    summary: { es: "Canales, Renacimiento y ruinas: …", en: "…" }, // one sentence for its card
    countries: ["IT"],
    reversible: true,
    months: [3, 4, 5, 6, 9, 10],             // good months (ranking only, never a filter)
    versions: {
      short: {                               // 4–5 nights (sum of `ideal`)
        stops: [                             // in order; `land` is the way to the next stop (not on the last), shown only
          { city: { es: "Venecia", en: "Venice" }, countryCode: "IT", lat: 45.4408, lng: 12.3155, codes: ["VCE", "TSF"],
            nights: { min: 2, ideal: 2 }, guide: "venice-2-days", land: { minutes: 125, by: "train" } },
          { city: { es: "Florencia", en: "Florence" }, countryCode: "IT", lat: 43.7696, lng: 11.2558, codes: ["FLR", "PSA"],
            nights: { min: 2, ideal: 3 }, guide: "florence-2-days" },
        ],
      },
      full: { stops: [/* Venecia, Bolonia, Florencia, Roma: 7–9 nights */] },
      long: { stops: [/* Venecia, Bolonia, Florencia, Siena (codes: []), Roma, Nápoles: 11–13 nights */] },
    },
    note: { es: "…", en: "…" },              // optional: what the traveller should know (a car helps, ferries in summer…)
    season: { from: "11-27", to: "12-23", name: { es: "Mercadillos de Navidad", en: "Christmas markets" } },
                                             // optional: only offered when the whole trip is within these days (MM-DD;
                                             // `to` before `from` crosses the new year). Check the dates every year.
  },
}
```

- **Versions, not computed cuts.** Every route has `short` (5–6 days), `full` (8–10) and `long` (12–14). They are
  written by hand because cutting a route automatically gives bad trips (the short Italy is Venice + Florence, not
  "the first two cities"). Each version is a full list of stops, so its land legs are its own (Venice → Florence
  straight in the short one; the long one adds Siena and flies home from Naples). A version with no sense for a route is
  left out (Malta + Gozo has only a short one; the Baltics may have no long one).
- **Entry / exit airports**: the first stop's `codes` (fly in) and the last stop's (fly home); reversed when
  `reversible` and done the other way. A stop with `codes: []` is visited by land only (Mostar, Berat, Matera); it
  cannot be the first or the last.
- **When a version fits**: the sum of its `nights.min` ≤ the nights available ≤ the sum of its `nights.ideal` + 2.
  Fewer: try the shorter version. More: try the longer one; past the longest, its stays get longer, or (later) two
  routes joined.
- Several versions fit the free dates (12 days fit the short, the full and the long): every one is a candidate, each
  placed anywhere inside the dates; the card shows one and lets you switch (see 5 and 8).
- `guide`: a `cityGuides.json` key, when there is one for that city.
- `photo` (route): `{ src, width, height, page, author, license, town }`, chosen once by
  `scripts/multi-city-photos.mjs` (Wikimedia Commons, the town stayed longest in; never another route's, a panorama or
  one without author and licence) and kept in the file, so a card asks for no photo. Change it by hand for a better
  one; the script keeps it. Without one, the card shows its landing city's.
- **Seasonal routes** (`season`, in `christmas.json`…): offered only within their days, and ranked first then
  (Christmas markets from late November to December 23). Unlike `months`, `season` is a filter.
- `land.by`: "train", "bus", "ferry" or "car" ("mejor en coche": Matera → Alberobello, Sardinia, the Highlands).
- Examples to write first. Classic: Italia clásica, Centroeuropa (Praga → Viena → Bratislava → Budapest), Benelux,
  Portugal (Oporto → Coímbra → Lisboa), Bálticos, Polonia, Andalucía, Sicilia, Puglia y Matera, Escocia, Balcanes
  (Split → Mostar → Dubrovnik → Kotor). Surprise: Albania (Tirana → Berat → Riviera), Macedonia del Norte + Ocrid,
  Transilvania, Silesia, Cerdeña.
- Drafted with AI (stops, nights, land times, months, asking for the typical stops and not only the big cities),
  reviewed by hand before publishing. Land times checked once.

### 1b. The free dates: a window, not the trip

The search asks only the origin and **the dates you are free** (`from`, `to`), as people usually know them. They are
a window, not the trip's length: **every version that fits inside is offered**, short, full or long, each placed on
its cheapest days within the window. 12 free days show long trips, but also 5- and 7-day ones.

- A version fits when its `nights.min` fits between a flight in on or after `from` and a flight home on or before `to`.
- **Window of 4 nights or fewer**: no routes. The form offers the single-city searches that already exist ("A cualquier
  sitio"; the weekend search when the dates are a weekend), with a line like "Con 3 días, mejor una sola ciudad".
- **Longest window: 15 days** (the calendar does not let you pick more). Our longest versions are 13 nights, so a
  wider window would add nothing but requests. Trips longer than that (two routes joined) come later; someone free a
  whole month picks the 15 days they prefer, or uses "Fechas flexibles".
- The short versions are what keep 5–6 free days from being empty: write them for as many routes as make sense.

### 2. Which routes are possible from an origin (route graph only, no requests)

`possibleRoutes(origin, graph)`: the routes with a flight from `origin` to an entry airport and a flight from an exit
airport back to `origin`, per version and direction (both when `reversible`): entry and exit airports, stops, min and
ideal nights.

- Depends only on the graph, so it can be computed when the graph is built (weekly) and kept per origin, or computed in
  memory per search (it is cheap: a few dozen routes).
- A route in the origin's own country is kept but ranked lower (people from Madrid know Andalucía).

### 3. Prices (the only requests)

For a search `{ origin, from, to }` (the free dates; a trip length of `to - from` days, or `minN` / `maxN` nights):

1. **Screening, 2–4 requests**: `ryanair.cheapest` and `wizz.cheapest` (its fare finder) give the cheapest fare to
   every destination, both **by whole month** (1–2 with a 15-day window): every search from the same origin that
   month shares the answer, whatever its exact dates (asked by the dates, nearly every search was a request of its
   own). One fare
   per destination only (the cheapest day of the window), so they rank candidates; they cannot build the trip.
   Why not the airlines' return-trip finders, as "A cualquier sitio" does (`ryanair.roundTrip`, `wizz.cheapest` with
   a stay)? They only return from the airport you flew to (Malta → Rome → Malta). Most routes are open-jaw (into
   Venice, home from Rome): no Ryanair or Wizz finder gives that, so it is two one-way legs joined by `combineLegs`.
   **Loops are the exception**: a version starting and ending at the same airport (Islandia, Georgia, Bretaña, Duero,
   Extremadura, Cracovia + Tatras, Hungría + Balaton, Peloponeso, several short versions) fits those finders, with the
   version's nights as the stay: 1–3 requests for every destination, and no per-day prices needed for them.
2. Keep the possible routes whose entry is cheap there and with a version that fits the window: the best **~8**.
3. **Flight in, per day**: `DAILY` (`ryanair.daily`, `wizz.daily`) for those routes' entry airports, each airport and
   month once, so the days of the flight in can be joined with the flights home.
4. **Flight home, per day**: per-day prices (`routeFares`, `src/server/stopovers/index.js`) only for the exit airports of
   those routes → origin, every version that fits (the short Italia ends in Florence, the full in Rome, the long in
   Naples), each airport once, 3 at a time, through the guard.
5. **Combine**: `combineLegs([flightsIn, flightsHome], [{ min, max }], canFollow)` (`src/server/stopovers/combine.js`),
   with the nights of the whole version (min: sum of `nights.min`; max: sum of `nights.ideal` + 2, and what the dates
   allow) and `canFollow`: the flight home leaves from an exit airport of the same route, version and direction as
   the flight in.
   Two routes joined (later): three legs `[in, between, home]`, the middle one priced the same way.

**~20–35 requests** per search with an empty cache (the first visitor from that origin that month), **~0–5** with a
warm one (everyone after, for an hour): a little more than a stopover search (~12), within what the guard allows.
The first search takes ~3–6 s (Ryanair 6 / Wizz 3 requests a second). Bounded by the 15-day window (at most 2
months), ~8 candidates and each airport asked once.

### 3b. Not being blocked (fewer requests)

Ryanair and Wizz answer 403 / 429 / 503 when asked too much. Every request already goes through
`src/server/airlineGuard.js`, shared by every search and server instance through Redis:
- each answer is used for `fresh` (1 h) and kept for `keep` (12 h), for every visitor;
- the same request asked at once by several visitors goes out once (a lock; the others wait for its answer);
- at most `perSecond` requests a second across all instances (Ryanair 6, Wizz 3: `GUARD` in `ryanair.js` / `wizz.js`);
- after a block, that airline pauses (1 min, doubled while it repeats, up to 10) and the kept answers are served,
  even if old.

**Requests grow with routes, not with visitors.** Prices are asked per route and month (Ryanair's `cheapestPerDay`),
and that answer is shared: 500 people looking for routes from Madrid in November ask Rome → Madrid for November once
an hour, not 500 times. The whole set is bounded: 26 origins × ~60 exit airports × 2–3 months ≈ 4,000–5,000
route-months. More traffic means more cache hits.

What the routes search adds on top:
1. **Few candidates.** `ryanair.cheapest` + `wizz.cheapest` (2–3 requests) and the graph (none) keep the best ~8
   routes (never all of them: too many choices confuse); only their flights in and home are asked per day, **once per
   airport** (many routes share Rome, Budapest, Prague…), not once per route.
   Built: flying in, only the airlines the screening found flying there are asked; and **at most 6 Wizz routes per
   search** (`MAX_WIZZ_ROUTES`, the best placed routes first). Seen on 2026-10-20: a cold search from Madrid made
   Wizz answer 503 and its guard paused it for a minute; the search still answered, with Ryanair only.
2. **In parts.** The flights home of the best 3 routes first; the others only on "ver más".
3. **Longer freshness for these legs.** A fare three weeks ahead barely moves in a few hours, and the final price is
   confirmed on the airline's site: `fresh` 4–6 h for the routes search (its own guard options), 1 h elsewhere.
4. **Warm cache at night (later, optional).** Not needed to start: the first search of a route-month fills the cache
   for everyone after it. Only if first searches feel slow, the prices-in-advance cron (section 9) can ask them at
   night for the most searched origins.
5. **Degrade, never fail.** A blocked airline: kept fares shown as approximate ("precio aproximado"); with Wizz
   paused, the routes Ryanair alone can fly are still offered.
6. **Watch it: done.** Every airline answer is counted by the guard (`server/metrics`: from the cache, asked,
   blocked, error, paused, queue full, old price served) and every search by the browser when it ends (its kind,
   results / none / error code, dates changed from the form's), one Redis hash a day, kept 120 days. The admin's
   "Uso" page (`/admin/usage`, `server/admin/usage`) shows them. If blocks grow, lower `perSecond` before it gets
   worse.

### 4. Sharing the days out (no prices)

Given the nights between landing and the flight home, spread them over the version's stops: every stop its `min`,
then the spare nights to the stops furthest below their `ideal`, then (past every `ideal`) to the stops with the
biggest `ideal`. Pure function, tested on fixed inputs.

### 5. Ranking

For each possible route and each version that fits, its cheapest trip in the window. One card per route, showing by
default its longest version that fits (the others one tap away on the card). Sort by a score of:
- total flight price;
- how well the days fit (close to the `ideal` nights, no city rushed);
- lengths mixed: with a long window, not only long trips at the top (a 12-day window shows 12, 7 and 5-day trips);
- season (`months`);
- variety: at least one **surprise** route among the first three; at most one route per country in the top results.

Show 3 suggestions first, more on demand.

### 6. Answer shape

Reuses the trip / fare shape of `docs/stopovers.md`:

```js
{ trips: [{
    route: "italia-clasica", kind: "classic", version: "short" | "full", direction: "forward" | "reverse",
    price, cur: "EUR", day,
    legs: [{ from, to, airline, day, time, arrive?, price, … }],      // 2 flights (3 with two routes)
    stops: [{ city, code?, nights, type: "stay", land?: { minutes, by } }], // every city, in order
  }],
  failed: [airlines] }
```

- `describe` in `src/server/stopovers/index.js` assumes origin → hub → destination; make it work on a list of
  cities (or write the routes' own, sharing its helpers: `landingDay`, `estimatedArrival`, `nightsShown`).
- `GET /api/routes?origin&from&to&minN&maxN&lang` (name to decide, it must not clash with `ROUTES` / route pages).

### 7. AI (last step only)

With the trips already priced, the AI writes a short text for each of the 3 suggestions ("Vuela a Venecia por 19 €,
dos días allí, tren a Florencia…"), and the itinerary when the user opens one, with the planner as today. Cost in
cents (`ai-itinerary-cost`). Nothing the AI writes changes flights, prices or cities.

### 8. UI and saving (mostly reused)

- Entry point: **a fourth search mode, "Recorridos"** (`MODES` in `ModeTabs`, texts in `texts.modes`), not hidden
  inside "A cualquier sitio": it answers another question ("what trip do I make with these days?"), its form is
  shorter and its results are trips, not destinations. Hint: "Tienes unos días libres: te proponemos un viaje por
  varias ciudades, con los vuelos más baratos." Check the 4 tabs at phone width.
- Also a link under "A cualquier sitio" results with 5+ days: "¿Y si visitas varias ciudades? Ver recorridos con
  estas fechas" (opens the new mode with the same dates).
- Form: origin and free dates only (5–15 days; the calendar stops at 15; fewer → "A cualquier sitio"). No trip type, max price or nights: the
  routes decide the nights.
- Results: 5–10 cards (never every route: too many choices confuse), at least one surprise among the first, a filter
  by length on top ("Todos · 5–6 días · 7–10 · 12–14").
- Each card: photo, route name and kind, length ("7 días"), cities with nights and the land legs between them, the
  two flights with day and price, total "Vuelos desde X €", the other versions that fit ("También en 5 · 12 días"),
  and the main button **"Genera tu itinerario personalizado"** (the planner with the stops, nights and flight times,
  as `PlanTrip` does for stopovers; AI limits from `constants/itineraryLimits.js`, a natural place to ask for an
  account once `requireAccount` is on). Secondary: the flights (`shared/StopoverFlights`, "Comprar en …" per flight,
  `shared/SeparateTickets`) and "Guardar viaje".
- "Guardar viaje" and the planner work as for a stopover trip (`saveTrip` with `stops`, `plannerStopsOf`). The planner
  is limited to `MAX_STOPS` = 5 towns and `MAX_TRIP_DAYS` = 10 (`src/constants/manualTrips.js`), and the long
  versions need 6–7 towns and 14 days: raise them in phase 1 (check the AI itinerary's cost and length with 14 days,
  or plan it in parts), or `plannerStopsOf` hides the planner for them.
- Guides: link each city's guide when `cityGuides.json` has it.

### 9. Prices in advance (later, optional)

Not part of phase 1: the cache shared by every search (3b) already avoids asking twice. This is only to
spare the first visitor of the day the wait, and for the route pages (SEO), which need a price before anyone searched.


A daily cron (spaced from the flight-routes crons, 03:00–05:00 UTC, and the graph's, Monday 02:00 UTC) computes the
cheapest trip per route for the origins of `ROUTE_ORIGINS` over the next weeks and stores it. Searches from those
origins read it and only ask live for the exact dates chosen. The same data feeds the route pages (SEO).

## Implementation plan (phase 1)

Decided 2026-10-20: every route is shown from the start, reviewed or not (`reviewed` only tracks the review, done
little by little after launch). Each step is usable and tested before the next.

1. **Engine, server only** (`src/server/multiCity/`), pure functions tested on fixed inputs:
   - `routes.js`: reads `src/data/multiCity/*.json` (server only: never imported from the browser, ~600 KB).
   - `possible.js` `possibleRoutes(origin, graph)`: section 2.
   - `fit.js`: which versions fit a window (1b), sharing the nights out (4), the season filter.
   - `index.js` `multiCityTrips({ origin, from, to, lang })`: one `ryanair.cheapest`, the best candidates, their
     flights home through `routeFares` (exported from `src/server/stopovers/index.js` or moved to a shared module),
     `combineLegs`, ranking (5), the answer (6). The routes' own guard freshness (3b).
2. **API**: `GET /api/multi-city?origin&from&to&lang` (`handle`, `iata`, `day`, `range(from, to, 15)`; `maxDuration`
   like `/api/everywhere`).
3. **Search mode**: "Recorridos" in `MODES` / `texts.modes` (es, en), the form (origin + dates, 5–15 days),
   `useFlightSearch` asking the new API, `texts.loading`.
4. **Results** (`src/components/search/results/MultiCityResults/` with its pieces in `components/`): the cards (8),
   the length filter, the versions on a card, "ver más". Shared pieces reused: `shared/StopoverFlights`,
   `shared/SeparateTickets`, `FlightLeg`.
5. **Itinerary and saving**: "Genera tu itinerario personalizado" through `plannerStopsOf` → the planner; "Guardar
   viaje" through `saveTrip` with `stops`. Raise `MAX_STOPS` / `MAX_TRIP_DAYS` for the long versions (or hide the
   button for them until then).
6. **Link from "A cualquier sitio"** (5+ days) to the new mode with the same dates.
7. **Tests** (`e2e/multi-city.spec.js`): the pure functions on fixed data; the API from MLA (@live); the mode end to
   end: search, cards, switching a version, opening the planner, saving (temporary account). Dates from `dayFromNow`.

## Checks (scripts/check-multi-city.mjs)

Reads every file of `src/data/multiCity/`, the airports (`/api/airports` of a running server) and the route graph
(Supabase), and prints per route what fails (errors) and what to look at (warnings):
- shape: kinds, names in both languages, versions with 2+ stops, `land` between stops and not on the last one,
  `nights.min` ≤ `nights.ideal`, the first and last stop with an airport;
- length: the sum of `ideal` per version (short 4–5, full 7–9, long 11–13), each version longer than the previous one;
- airports: every code known, near its stop (< 120 km), the entry and exit ones with flights in the graph, and from how
  many origins (of `ROUTE_ORIGINS`) the route can be done;
- land legs: the time against the straight distance (too fast to be true, or suspiciously slow);
- guides: the key exists.

## Tests

- Pure, fixed inputs: `possibleRoutes` (graph fixtures, reversible routes), sharing the days out, ranking, combining
  in / home flights of the same route.
- `/api/…` with a live search from a Spanish airport (@live).
- Browser: a search with free dates shows suggestions, opens one, saves it (temporary account,
  `e2e/helpers/accounts.js`), dates from `dayFromNow`.

## Cost and risks

- Work: writing and reviewing the routes is the main effort, and what decides the product's quality.
- Throttling (Wizz 503 / 429, Ryanair): see 3b (the guard, few candidates, longer freshness, a warm cache, degrading).
- Money: about none. No paid API, and the cards' text is the routes' `summary` (no AI per search). At test stage
  nothing; ~10,000 route searches a month, under €5 of infrastructure. The AI itinerary is the only cost that grows
  with use: ~0.0045 $ a 3-day one on Haiku, so ~0.01–0.02 $ for 7–14 days.
- Land legs that change (a train line closed): the times are indicative, reviewed with the routes.

## Open questions

- Name in the product ("Recorridos", "Rutas", "Sorpréndeme") and in the URL (`ROUTES`, `sections.js`).
- Where routes live: JSON in the repo (reviewed in PRs) or a table with an admin screen (`server/admin/`).
- Mixed trips: a route reached through a hub (`docs/stopovers.md`) when the origin has no flight to any entry.
