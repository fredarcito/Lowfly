-- Saved trips of each account ("My trips"). A trip is the same object the app keeps in the browser
-- (store/trips.js): a saved flight or a trip planned by hand, with its itinerary, kept whole in `data`.
-- Its id is only unique within an account (the same flight saved by two people has the same id).
create table public.trips (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  id text not null,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

-- Each person only sees and changes their own trips
alter table public.trips enable row level security;

create policy "Owners read their trips" on public.trips
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Owners add trips" on public.trips
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Owners change their trips" on public.trips
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Owners delete their trips" on public.trips
  for delete to authenticated
  using ((select auth.uid()) = user_id);

-- Only signed-in people reach the table through the Data API, and RLS limits them to their own rows.
-- Visitors without an account (anon) get nothing. The project's default privileges grant everything
-- (TRUNCATE included, which skips RLS), so they are taken back first.
revoke all on public.trips from anon, authenticated;
grant select, insert, update, delete on public.trips to authenticated;
