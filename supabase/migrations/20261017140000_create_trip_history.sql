-- Every trip an account has saved, kept when the trip is deleted: how many trips each person has saved over time
-- (the admin). Written by the database itself when a trip is first saved (trips), whatever saves it. An account
-- that goes keeps its rows, without who made them. Only the server reads it, with the secret key.
create table public.trip_history (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users (id) on delete set null,
  trip_id text not null,
  kind text not null check (kind in ('flight', 'manual')),
  -- The flight's city, or the first town of a trip planned by hand
  destination text,
  saved_at timestamptz not null default now()
);

-- A trip counts once, however often it is saved again
create unique index trip_history_trip on public.trip_history (user_id, trip_id);

alter table public.trip_history enable row level security;

-- No policies: only the secret key (which skips RLS). The project's default privileges grant everything.
revoke all on public.trip_history from anon, authenticated;

create function public.record_trip_saved() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.trip_history (user_id, trip_id, kind, destination)
  values (
    new.user_id,
    new.id,
    case when (new.data ->> 'manual')::boolean then 'manual' else 'flight' end,
    coalesce(new.data -> 'fare' ->> 'city', new.data -> 'stops' -> 0 ->> 'city')
  )
  on conflict (user_id, trip_id) do nothing;
  return new;
end;
$$;

revoke execute on function public.record_trip_saved() from public, anon, authenticated;

create trigger trips_record_saved after insert on public.trips
for each row execute function public.record_trip_saved();

-- The trips kept today (the ones deleted before this left no trace), with when they were saved
insert into public.trip_history (user_id, trip_id, kind, destination, saved_at)
select
  user_id,
  id,
  case when (data ->> 'manual')::boolean then 'manual' else 'flight' end,
  coalesce(data -> 'fare' ->> 'city', data -> 'stops' -> 0 ->> 'city'),
  coalesce((data ->> 'savedAt')::timestamptz, updated_at)
from public.trips
on conflict (user_id, trip_id) do nothing;
