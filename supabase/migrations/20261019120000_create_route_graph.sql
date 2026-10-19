-- The route graph (docs/stopovers.md): which airport each airline flies to from each airport. A single row, written
-- once a week by the cron (app/api/cron/route-graph), so the searches and the destination picker never ask the
-- airlines where they fly. Only the server reads and writes it, with the secret key.
create table public.route_graph (
  -- Always 1: there is one graph
  id smallint primary key default 1 check (id = 1),
  -- Every route: { "MLA": { "FCO": ["ryanair", "wizz"], … }, … }
  routes jsonb not null,
  -- How many routes each airline has in it: { "ryanair": 5315, "wizz": 3441 }
  counts jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.route_graph enable row level security;

-- No policies: only the secret key (which skips RLS). The project's default privileges grant everything.
revoke all on public.route_graph from anon, authenticated;
