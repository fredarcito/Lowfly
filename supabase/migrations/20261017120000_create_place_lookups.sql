-- Where places are, as OpenStreetMap's search found them (server/geocode): each search is made once, so
-- itineraries do not repeat it (the same cathedral in every Palma itinerary) and keep their places on the map
-- while the search services are down. Only the server reads and writes it, with the secret key.
create table public.place_lookups (
  -- The search as asked, in lowercase ("catedral de palma, palma")
  query text not null,
  -- Where results were preferred, rounded to about 10 km ("39.6,2.7"; empty without one)
  near text not null default '',
  -- { lat, lng, name, kind }, or null when nothing was found
  result jsonb,
  source text not null check (source in ('photon', 'nominatim')),
  created_at timestamptz not null default now(),
  primary key (query, near)
);

alter table public.place_lookups enable row level security;

-- No policies: only the secret key (which skips RLS). The project's default privileges grant everything.
revoke all on public.place_lookups from anon, authenticated;
