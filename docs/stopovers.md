# Stopovers: flights with a connection or an "escapada"

Status (agreed 2026-10-19). Update this file as the pieces land.
- Phase 1, route graph + `getDestinations` reading it: **done**.
- Phase 2, the stopover engine (`src/server/stopovers/`, `GET /api/stopovers`): **done**.
- Phase 3, search integration (picker offers one-stop places, stopovers asked alongside the country search): **done**.
- Phase 4, results UI (kind chips, stopover card and list): **done**.
- Saving a stopover trip ("Guardar viaje") with its towns, and its itinerary over all of them: **done**.
- Stopovers on flexible dates: **done** (`outTo` / `backFrom`).
- Throttling protection: **done** by `src/server/airlineGuard.js` (shared Redis cache, one request for many visitors,
  a per-second limit per airline across instances, pause and stale answers after a block).
- Pending: longer freshness for stopover legs if blocks show up (`docs/multi-city.md` 3b); stopovers in weekend
  searches.

## Why

The search only knows direct flights from the origin. `airportsIn` (`src/server/flights.js`) keeps the destinations
of `getDestinations(origin)`, so Malta → Bosnia answers `noRoutes`, and Bosnia is not even offered in the destination
picker (`useDestinationCountries`). Yet Malta → Rome (Ryanair) + Rome → Sarajevo (Wizz) exists and is cheap.

Stopovers join two separate tickets through a hub, in two variants:

- **Same-day connection** ("Con escala"): the second flight leaves the same day, with a safe margin.
- **Escapada** ("Con escapada"): 1–3 nights in the hub, to visit it, then on to the destination. It removes the risk
  of missing the connection and turns the stop into part of the trip.

## Scope

In:
- Destination-chosen searches only (country / city, and flexible dates). Not "A cualquier sitio" (too many calls).
- One intermediate stop (one hub).
- Return: direct if it exists; otherwise through the same hub (same-day connection or a night there).
- Airlines can be mixed per leg (Ryanair one leg, Wizz the other).

Out, for now (but the design must allow them later):
- Multi-city trips (several stops chosen by the user).
- Open-jaw (fly into one city, back from another).
- "Volver desde otra ciudad" field.
- Automatic routes with 2+ hubs.

## Architecture

### 1. Route graph (which routes exist)

Airports are nodes, routes are edges: `{ "MLA": { "FCO": ["ryanair", "wizz"], … }, … }`, plus each airport's data
(city, countryCode, coordinates, time zone) from `getAirports`.

Why: finding hubs needs to know where every candidate hub flies. Without the graph that means calling
`getDestinations` (Ryanair, Wizz, Travelpayouts) for each candidate hub on every search. With it, origin → hub →
destination is worked out in memory, with no calls. It saves the *discovery* calls only: prices change daily and are
still asked live (see Leg prices), but only for the few hubs the graph picked.

Why weekly is enough: routes change little, and a stale graph fails harmlessly both ways. A new route missing from
it is just an option not offered until the next refresh. A cancelled route still in it costs one price request
that finds no flights, and the combination drops out.

Code:
- `src/server/ryanair.js` `routes()` and `src/server/wizz.js` `routes()`: every route of the airline as `[[from, to]]`.
- `src/server/routeGraph/build.js` `buildGraph()`: asks both, merges, saves. An airline that fails, or answers with
  less than half its last route count, keeps its routes from the last graph (`kept`). Both failing: nothing saved.
- `src/server/routeGraph/store.js`: reads / writes the `route_graph` table
  (`supabase/migrations/20261019120000_create_route_graph.sql`: one row, `routes` + `counts` + `updated_at`).
- `src/server/routeGraph/index.js` `getGraph()` / `routesFrom(origin)`: the graph for the searches, kept in memory
  one hour per server instance (5 minutes after a failed read). `routesFrom` gives null when the graph is missing or
  does not know the airport: callers then ask the airlines as before.
- `src/app/api/cron/route-graph/route.js`: the cron (secret checked by `src/server/cron.js`).
- `e2e/route-graph.spec.js`: the cron's secret, and a real build (@live).

- Sources (checked 2026-10-19):
  - Ryanair: `https://www.ryanair.com/api/views/locate/3/aggregate/all/en`, every airport with its `routes`, in one
    request (~300 KB, ~5,300 routes). Only `airport:XXX` entries are routes; `airport:XXX|Air Malta` (operated by
    another airline) is left out; `city:` / `country:` / `region:` entries are groupings.
  - Wizz: the route map `cities()` (`/asset/map`), one request (~3,000 routes once the metropolitan "fake stations"
    like ROM are swapped for their real airports). Every connection there is `isDirectFlight: true`.
  - Travelpayouts airlines (easyJet, Vueling…) are not in the graph: their routes come from recent searches
    (`more.destinations`, still asked live by `getDestinations`).
- Building takes ~2 seconds, so the cron has no throttling risk.
- Refresh: a weekly Vercel cron, **Monday 02:00 UTC** (`0 2 * * 1` in `vercel.json`). The flight-routes crons
  run daily at 03:00–05:00 UTC; do not overlap them (both call Ryanair). Monday catches the IATA season changes
  (last Sunday of March and October). On failure, the previous graph stays.
- The graph says a route *exists in the bookable horizon*, not that it flies on given days: prices decide that.
- `getDestinations` reads the graph too (part of this first phase, it helps the whole product, not only stopovers).
  Today it asks the airlines "where do you fly from X?" every time: `ryanair.cheapest` (a 180-day *price* request,
  used just to list destinations), `wizz.destinations` and `more.destinations` (Travelpayouts), cached only
  10 minutes per origin. It runs on every destination picker load, inside every country / city / flexible search
  (`airportsIn`), in "A cualquier sitio" and in the flight-routes cron. Reading the graph instead:
  - Faster: the picker and the searches no longer wait for Ryanair to know the destinations.
  - Fewer calls: less risk of being throttled, which protects the calls that matter (prices).
  - Sturdier: if Ryanair fails for a while, its destinations still show (today they vanish from the picker).
  - "A cualquier sitio" still calls `ryanair.cheapest`, for its prices; it only drops the duplicate destinations call.
  - Watch out: `ryanair.cheapest` only lists destinations with flights on sale in the next 180 days. If the routes
    source includes routes with nothing on sale, the picker would offer destinations that then answer "no prices".
    Checked: from Malta the graph has 71 Ryanair routes and the 180-day fares 70; the extra one (PMO) is a new route
    with nothing on sale yet. Accepted for now; if it bothers, drop such routes when building.
  - Measured: `/api/destinations?origin=MLA` answers in ~0.09 s from the graph.
- Later: the picker can also offer destinations reachable with one stop (marked as such).

### 2. Generic trip model (built for multi-city later)

A trip is a list of stops with night ranges; a stopover is just the one-hub case.

```js
{ stops: [
    { code: "MLA" },
    { code: "FCO", nights: { min: 1, max: 3 } }, // escapada; { min: 0, max: 0 } = same-day connection
    { code: "SJJ", nights: { min: 5, max: 7 } },
    { code: "MLA" },
] }
```

A fare is a list of legs, not a fixed `out` / `ret`:

```js
{ legs: [{ from, to, airline, day, time, arrive, price, cur, cached? }, …], price, via: "FCO", kind: "direct" | "connection" | "escapada" }
```

Saved and shared trips with the old `out` / `ret` shape must keep reading (convert on read).

### 3. Pieces (each one independent) — phase 2, done

Code in `src/server/stopovers/`; tests with fixed flights and a live search in `e2e/stopovers.spec.js`.

1. **Hub chooser** (`hubs.js` `chooseHubs`): from the graph alone, no requests. Hub *cities* (so Rome groups Fiumicino
   and Ciampino) with a flight from the origin (`arrivals`) and an airport with a flight to a destination airport
   (`departures`). Drops the origin's city, the destination airports and hubs whose way is more than 1.8 times the
   straight distance; sorts by that detour, then by how many airlines; keeps `MAX_HUBS` = 3. Later the same place
   takes user-chosen stops (multi-city) or another return city (open-jaw).
2. **Leg prices** (`index.js` `routeFares`): per-day prices with the `DAILY` functions (`src/server/dailyPrices.js`,
   shared with `server/flights`, together with `pool`), each route and airline asked once over the widest dates, 3 at a
   time, through the 10-minute fetch cache. Travelpayouts airlines only on the first leg (the one
   `more.destinations(origin)` says they fly). Malta → Bosnia, one way, a month: about a dozen requests.
3. **Combiner** (`combine.js` `combineLegs`): pure. Takes each leg's flights, the nights allowed at each stop and a
   `canFollow(previous, next, nights)` rule; for each first flight, the cheapest whole trip. Works for any number of
   legs (a return through a hub is 4).
   - `canFollow`: 0 nights → `connects` (below); 1+ nights → the same city (Fiumicino in, Ciampino out is fine).
4. **Connection checker** (`connection.js`, same-day only):
   - At least `MIN_CONNECTION_MINUTES` = 150 (2.5 h, hand luggage) and at most 12 h; the same airport; live fares only
     (Travelpayouts' `cached` fares never connect).
   - Ryanair's day fare has its arrival. **Wizz's real flight search (`/search/search`) answers 429 to servers** (checked
     2026-10-19), so its exact flights cannot be verified. Its timetable gives every departure of the day but no
     arrival, and the price may be any of those flights. So the check takes the worst case: arriving on Wizz, the
     latest departure plus a flight time estimated from the distance (`km / 780 * 60 + 35` min) plus 30 min; leaving
     on Wizz, every departure of the day must make it.
   - Time zones: the airport's own (Ryanair's airports), else its country's when it has only one
     (`Intl.Locale("und-BA").timeZones`); unknown → no same-day connection.
5. **Orchestrator** (`index.js` `stopoverTrips` / `stopoversTo`): builds the legs, runs the combiner once per kind
   and keeps the cheapest trip of each kind per departure day. The kind is decided by the time in the hub's city on
   the way there, one stay at a time (agreed 2026-10-19):
   - **escapada** (getaway): 1–3 nights and a whole day or more there (`MIN_GETAWAY_MINUTES` = 24 h,
     `isGetaway`: the latest landing to the earliest departure, `stayMinutes`; without the times, 2 nights count as
     a day).
   - **connection**: the same day (`connects`), or a **long stop**: a night with less than 24 h there (landing at
     23:10, leaving at 05:50). The way back's stops do not change the kind.
   - Each stop carries `type`: "connection" (same day), "layover" (a night, under a day) or "stay" (a day or more, and
     the destination), and `minutes`. Only "stay" towns go to the planner and to a saved trip.
   - One way: `[origin → hub, hub → destination]`; the second flight may leave up to 3 nights after `to`.
   - Return (`stay`, nights at the destination): straight home when the graph has the route, otherwise back through
     one of the chosen hubs, the same day or after a night (`RETURN_HUB_NIGHTS`). The way back may use another of the
     chosen hubs than the way out (it costs no extra requests and can be cheaper).
   - Answer: `{ trips: [{ kind, price, day, code, city, country, via: { city, country, nights, minutes? }, nights?,
     legs: [{ from, to, airline, day, time, times?, arrive?, price, cached? }] }], hubs, failed }`.
   - `GET /api/stopovers` takes the country search's parameters (`origin`, `country`, `city`, `from`, `to`, `trip`,
     `minN`, `maxN`, `lang`).

### 4. Search integration and results UI — phases 3 and 4, done

- Picker: `/api/destinations?stopovers=1` (only the picker asks it, `src/api/flights.js`) adds the airports reached
  with one stop and no direct flight (`oneStopDestinations` in `hubs.js`, same detour rule as the hubs), as
  `{ stopover: true, airlines: [] }`. `countriesOf` marks a country / city `stopover` when none of its airports is
  direct; the picker shows "Con escala". "A cualquier sitio", `airportsIn` and the route pages' cron never get them.
- Search (`useFlightSearch`): a country / city search (not a weekend away) asks `/api/stopovers` at the same time as
  `/api/country`; flexible dates too (`stopoverParamsOf`: from ida − flex to vuelta + flex, leaving by ida + flex
  `outTo`, flying home from vuelta − flex `backFrom`; the engine keeps those limits when picking the flights).
  `FlexibleResults` shows them under the flexible table, or as a destination search does (CountryResults) with no
  direct flight. The destination field's hint says "Con escala desde …" for a place reached with a stop only
  (`isStopoverOnly`).
- Nights shown count from the day a flight lands (`landingDay`; a 22:00 flight landing at 00:25 is a night fewer);
  legs landing after midnight carry `arriveDay`, which the planner and saved trips use. The direct results show first, `result.stopovers` ({ status, data }) arrives after. When the direct
  search answers `noRoutes` / `noPrices`, it waits for the stopovers: with trips, `result.data` is null and only they
  show; otherwise the usual error. Answers of an older search are dropped (`latest` ref).
- Results (`CountryResults`):
  - `hooks/useTripKind.js`: the cheapest fare of each kind (direct, connection, escapada) and the one highlighted:
    the cheapest, but the direct one stays unless a stop saves ≥ 25 % or ≥ €30. Chips (`KindChips`) switch it.
  - Direct highlighted: `components/DirectBest` (BestPrice, as before). A stopover: `StopoverBest`:
    - Title "Basilea con escapada a Zagreb" / "… con escala en Roma", dates, the destination's guide.
    - `components/WaySummary`: each way through its cities ("Malta → Zagreb → Basilea"), what happens at the hub
      ("2 noches en Zagreb · 58 h para conocerla", "Escala de 3 h 50 min", "1 noche en Zagreb antes de volver",
      "Vuelo directo") and the stay at the destination.
    - Price, "4 vuelos · Ryanair + Wizz Air", the button folding the flights (open by default, the card's main
      button) and "Guardar viaje".
    - `components/PlanTrip` (getaways only): opens the planner with every town of the trip where you spend a night
      or more, with its flights' days and times (`plannerStopsOf` in `src/utils/stopovers.js` →
      `ROUTES.plannedTrip`, `?stops=ZAG,2026-11-26,07:55,2026-11-28,17:55;BSL,…`). The planner page reads it
      (`stopsFromParam`, times rounded to its half hours: arrivals up, departures down). Hidden when the trip does not
      fit the planner (5 towns, 10 days).
    - `components/TripFlights`: "Tus 4 vuelos", each flight with its own "Comprar en …" (`FlightLeg` `action`), the
      stops between them, "N billetes separados" and the baggage estimate folded.
  - The direct calendar and other dates (`components/DirectDates`) and airports (`components/AirportList`) only with a
    direct flight. `StopoverResults`: up to 10 trips with a filter (all / connection / escapada); each row
    (`ResultRow`, which opens `StopoverDetails` for a fare with `legs`) shows its flights.
  - The opened rows (`StopoverDetails`) are made of the same shared pieces as the highlighted card, so both look
    alike: `shared/WaySummary`, `shared/EscapadaBox` (getaways), `shared/StopoverFlights` (each flight with its stub:
    the price and "Comprar en …", `FlightLeg` `action`; Wizz arrivals estimated, "≈ 07:05",
    `arriveEstimate` from `estimatedArrival`) with `shared/SeparateTickets`, and "Guardar viaje". The row itself says
    the dates and the total.
- Fares with `legs` are understood by `airlinesOf`, `isCachedFare`, `bagExtra` (every flight) and
  `format.legLinks` (one link per flight). Direct fares keep `out` / `ret`; saved and shared trips are unchanged.
- "Guardar viaje" (the card and each opened row): `saveTrip(origin, fare, stops)` keeps a fare with `legs` like a
  trip planned by hand — `{ manual: true, stopover: true, stops, flights: fare, fare: summary }` — with its towns from
  `useStopoverStops` (`savedStopsOf`: every town with a night or more, the flights' exact times; one way, the
  destination is left the day you land). So My trips, its multi-city itinerary, sharing and the account copy work as
  for a trip by hand; `TripDetail` also shows its flights (`shared/StopoverFlights`) and `useTripActions` books each
  flight. Its id comes from its flights (`stopover-mla-mlazag2026-11-26-…`), so saving it twice does not duplicate it.

### 5. Tests

`e2e/stopovers.spec.js`: the connection rules and the combiner on fixed flights; `/api/stopovers` Malta → Bosnia
(@live); the picker offering Bosnia "Con escala" and its search showing the stopover card, links and list (@live).
`e2e/route-graph.spec.js`: the cron.

## Cost and risks

- Money: about none. Airline APIs are free, the graph is a small table, the weekly cron fits Vercel's plan, no AI.
- Risk: being throttled by Wizz (503) or Ryanair for too many calls. Mitigations: hubs from the graph (no discovery
  calls), 2–3 hubs per search, Wizz verification only for the best candidates, the fetch cache, a spaced-out cron.
