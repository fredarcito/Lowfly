-- Limits the admin can change without a deploy. Only the server reads and writes them, with the secret key:
-- no access for visitors, signed in or not.

-- App-wide settings, one row per setting: { key: "itineraries_per_day", value: 5 }
create table public.app_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- How many AI itineraries an account may make a day by default (the app's own default, 5, until changed)
insert into public.app_settings (key, value) values ('itineraries_per_day', '5');

-- One account's own daily limit, instead of the app-wide one. Gone with the account.
create table public.user_limits (
  user_id uuid primary key references auth.users (id) on delete cascade,
  itineraries_per_day integer not null check (itineraries_per_day >= 0),
  updated_at timestamptz not null default now()
);

alter table public.app_settings enable row level security;
alter table public.user_limits enable row level security;

-- No policies: only the secret key (which skips RLS). The project's default privileges grant everything.
revoke all on public.app_settings from anon, authenticated;
revoke all on public.user_limits from anon, authenticated;
