-- One row per AI itinerary made by a signed-in person, to limit how many they make a day (the AI costs money
-- per call). The API (app/api/itinerary) counts the last 24 hours and adds a row after each itinerary, with the
-- person's own session: they can only see and add their own rows, never change or delete them (so the count
-- cannot be reset).
create table public.itinerary_requests (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index itinerary_requests_user_recent on public.itinerary_requests (user_id, created_at desc);

alter table public.itinerary_requests enable row level security;

create policy "Owners read their itinerary requests" on public.itinerary_requests
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Owners add itinerary requests" on public.itinerary_requests
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

-- Only reading and adding, only signed in (the project's default privileges grant everything)
revoke all on public.itinerary_requests from anon, authenticated;
grant select, insert on public.itinerary_requests to authenticated;
