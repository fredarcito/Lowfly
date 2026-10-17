-- What the route pages show (/es/flights/malta, /es/flights/malta-barcelona), one row per airport we publish
-- routes from: written once a day by the cron (app/api/cron/flight-routes), so the pages never ask the airlines
-- themselves. Only the server reads and writes it, with the secret key.
create table public.flight_route_snapshots (
  -- The airport's IATA code ("MLA")
  origin text primary key,
  -- The airport's page, per language: { es: { slug, code, city, country, countryCode }, en: { … } }
  info jsonb not null,
  -- Its routes, per language: { es: [{ slug, origin, city, country, countryCode, region, airports }], en: [ … ] }
  routes jsonb not null,
  -- Each route's prices: { "malta-barcelona": { months: [{ month, fare }], airlines, minutes } }
  prices jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.flight_route_snapshots enable row level security;

-- No policies: only the secret key (which skips RLS). The project's default privileges grant everything.
revoke all on public.flight_route_snapshots from anon, authenticated;
