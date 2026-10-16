-- One row per AI call that plans an itinerary (a trip through several towns makes one call per town, grouped by
-- request_id), kept for good: what the app really spends on AI, which model answered (Claude steps in when
-- Gemini is busy), and which destinations people plan. Visitors without an account too (user_id null).
-- Only the server writes and reads it, with the secret key: no access for visitors, signed in or not.
create table public.itinerary_usage (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  request_id uuid not null,
  -- The account is deleted: its rows stay, without who made them
  user_id uuid references auth.users (id) on delete set null,
  kind text not null check (kind in ('flight', 'stops')),
  lang text not null,
  city text not null,
  country text,
  -- Destination airport, for a saved flight
  airport text,
  days integer not null,
  preferences jsonb,
  provider text not null,
  model text not null,
  input_tokens integer,
  output_tokens integer,
  thinking_tokens integer,
  -- The provider's own usage, as it came
  usage jsonb,
  duration_ms integer not null
);

create index itinerary_usage_created on public.itinerary_usage (created_at desc);
create index itinerary_usage_user on public.itinerary_usage (user_id);

alter table public.itinerary_usage enable row level security;

-- No policies: only the secret key (which skips RLS). The project's default privileges grant everything.
revoke all on public.itinerary_usage from anon, authenticated;
