-- Trips shared by link (/es/shared/<id>): one row per shared trip, with a random id that is the link itself.
-- Only the owner sees, adds and removes their shares (removing one turns the link off). Deleting the trip
-- deletes its share too.
create table public.trip_shares (
  id text primary key default translate(encode(extensions.gen_random_bytes(9), 'base64'), '+/', '-_'),
  user_id uuid not null default auth.uid(),
  trip_id text not null,
  created_at timestamptz not null default now(),
  unique (user_id, trip_id),
  foreign key (user_id, trip_id) references public.trips (user_id, id) on delete cascade
);

alter table public.trip_shares enable row level security;

create policy "Owners read their shares" on public.trip_shares
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Owners share their trips" on public.trip_shares
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Owners stop sharing" on public.trip_shares
  for delete to authenticated
  using ((select auth.uid()) = user_id);

revoke all on public.trip_shares from anon, authenticated;
grant select, insert, delete on public.trip_shares to authenticated;

-- What anyone with the link sees: the trip (without what is only the owner's: the stops they ticked, whether
-- they booked, the share itself) and the owner's first name and photo. Nothing else of the account (no email).
-- It runs as its owner, so visitors read only this one trip and never the tables.
create function public.shared_trip(share_id text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'trip', trip.data - 'visited' - 'booked' - 'shareId' - 'savedAt',
    'owner', jsonb_build_object(
      'name', nullif(split_part(coalesce(account.raw_user_meta_data ->> 'full_name', account.raw_user_meta_data ->> 'name', ''), ' ', 1), ''),
      'avatar', account.raw_user_meta_data ->> 'avatar_url'
    )
  )
  from public.trip_shares share
  join public.trips trip on trip.user_id = share.user_id and trip.id = share.trip_id
  join auth.users account on account.id = share.user_id
  where share.id = share_id;
$$;

revoke all on function public.shared_trip(text) from public;
grant execute on function public.shared_trip(text) to anon, authenticated;
