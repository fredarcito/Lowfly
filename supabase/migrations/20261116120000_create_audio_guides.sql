-- Audio guides of historic places (docs/audio-guide.md): one per Wikipedia article and language, shared by every
-- trip that visits the place. Made the first time someone asks for it (the AI writes the steps, Google reads them);
-- the audio lives in the public bucket "audio-guides". Only the server touches the table (secret key).
create table public.audio_guides (
  id text primary key,
  lang text not null check (lang in ('es', 'en')),
  article_url text not null,
  title text not null,
  steps jsonb not null,
  provider text,
  model text,
  voice text,
  -- What it cost: the AI's token usage, and the characters read aloud (Google bills per character)
  usage jsonb,
  characters integer,
  reviewed boolean not null default false,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index audio_guides_created_by_idx on public.audio_guides (created_by, created_at);

-- RLS on and no policies: visitors never reach the table through the Data API
alter table public.audio_guides enable row level security;
revoke all on public.audio_guides from anon, authenticated;

-- The mp3 files: anyone may listen (public URLs), only the server writes
insert into storage.buckets (id, name, public, allowed_mime_types)
values ('audio-guides', 'audio-guides', true, array['audio/mpeg'])
on conflict (id) do nothing;
