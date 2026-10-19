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
- Every page in a test fails on an uncaught error or a console error (`e2e/helpers/test.js`).
- Dates are counted from today (`dayFromNow`), never fixed. Tests that need an account create a temporary one
  and delete it (`e2e/helpers/accounts.js`; needs the Supabase secret key in `.env.local`).
- A change to a flow comes with its test, or an update to the existing one.

## Design docs
- `docs/stopovers.md`: flights with a stopover (same-day connection and "escapada") and the route graph. Read it
  before touching the flight search, the destination picker or the trip/fare shape.
