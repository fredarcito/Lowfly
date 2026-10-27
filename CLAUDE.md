# Lowfly: code rules

These apply to every file of the project (except shadcn's `src/components/ui/`).

## Functions
- Always named arrow functions: components, helpers, handlers and route handlers
  (`const TripHeader = ({ trip }) => { … }; export default TripHeader;`, `export const GET = async (request) => { … }`).
- `function` only where an arrow cannot work (`this`, generators).

## Names
- Every variable has a descriptive name, also in short callbacks: `trips.filter((trip) => …)`, never `(x) => …`.
- No single letters or cryptic abbreviations (`l`, `a`, `b`, `t`, `f`, `e`…): `event`, `error`, `texts`, `format`.

## Components
- One component per file. Never several components in the same file.
- A component with smaller pieces gets its own folder; the pieces go in a `components/` folder inside it,
  each in its own folder:

  ```
  ShareTripDialog/
    index.js                  ← the main component
    components/
      SignInToShare/index.js
      ShareLink/index.js
    hooks/                    ← hooks only this component uses
      useShareLink.js
    data/ · resources/ · …    ← its constants, texts, static data…
  ```
- A piece used by several components does not live inside one of them: it goes to `src/components/shared/`.

## Hooks
- When logic is cleaner as a hook (state, effects, fetching, derived data), write the hook and keep the
  component to rendering.
- Hooks used by one component live in its `hooks/` folder; hooks used across the app live in `src/hooks/`.

## Tests
- Browser tests live in `e2e/` (Playwright): `pnpm test:e2e` runs them all, `pnpm test:e2e:quick` leaves out the
  ones tagged `@live` (real searches at Ryanair and Wizz: slow, and they depend on the airlines answering).
  `pnpm test:e2e:report` opens the last report. They use the dev server on port 3001 (started if it is not running).
- The dev server's airline guard does not use Redis (every environment shares its free commands): it keeps answers in
  Next's cache. The guard's own tests (`e2e/airline-guard.spec.js`) need `AIRLINE_GUARD_REDIS=1` on the dev server.
- Every page in a test fails on an uncaught error or a console error (`e2e/helpers/test.js`).
- Dates are counted from today (`dayFromNow`), never fixed. Tests that need an account create a temporary one
  and delete it (`e2e/helpers/accounts.js`; needs the Supabase secret key in `.env.local`).
- A change to a flow comes with its test, or an update to the existing one.

## Written copy
Every text a reader sees (route pages, guides, experiences, UI strings) is written in Spanish and English and must
read like a person wrote it, not like a model. The reference is the copy already in `src/data/multiCityPages.json`
(`italia-clasica`): short sentences, tuteo, one concrete tip per place, and an opinion where it is useful.

- Keep the shape of the file it goes in (fields, length, number of `see` bullets, `faq` entries): a new route page
  follows `italia-clasica` exactly.
- Vary the shape between places: if one city has 5 bullets and another 3, that is right. The same template for every
  place is what gives it away.
- No formulaic closers ("es la parada más corta", "merece medio día", "con una noche basta") and no tourist-brochure
  phrases ("la postal de la costa", "sumérgete en", "el corazón de", "no te lo puedes perder").
- Concrete over general: minutes, prices, which gate, which month, which line. "El rápido tarda poco más de una
  hora" beats "el tren es rápido".
- Tips have character and are not all the same kind of advice ("come en Anacapri, que es más barato", "la mochila
  delante", "compra en una tienda de productores, no en un puesto de souvenirs").
- Never invent a fact to fill a line. If a detail (a closing day, a duration) has not been checked against a source,
  write it only if it is well established, and leave the page with `"reviewed": false` until someone confirms it.
- Every fact belongs to one town and only to that town. A landmark, a dish, a station or a museum of Pompeii never
  appears in the text of Naples, and the other way round. Before writing a town's text, check which town the fact is
  about, not which town is nearby.
- A list of towns must not read as a description of the first one. "Nápoles, una ciudad romana entera bajo la ceniza y
  una costa..." makes Naples the buried town; it was Pompeii. Name each thing and give it its own words: "Nápoles,
  Pompeya entera bajo la ceniza y una costa que...". Read every list aloud and ask, for each item, what it describes.
- The same care with pronouns and possessives ("aquí", "su catedral", "en la isla"): they must point to the town of
  that paragraph, never to the one mentioned before.

## Design docs
- `docs/stopovers.md`: flights with a stopover (same-day connection and "escapada") and the route graph. Read it
  before touching the flight search, the destination picker or the trip/fare shape.
- `docs/multi-city.md`: the "Recorridos" search (routes through several cities, their data, photos and the search
  pages /es/recorridos…), plus the airline-request budget and the admin's "Uso" page. Its "Map of the code" says
  which file does what: read it before touching any of these.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
