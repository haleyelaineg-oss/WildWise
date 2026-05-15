-- Add finder_notes field for case updates
-- Run this in the Supabase SQL Editor

alter table public.wildlife_cases
  add column if not exists finder_notes text[] default '{}';

-- Create a table for finder note updates with timestamps
create table if not exists public.wildlife_case_notes (
  id            uuid        primary key default gen_random_uuid(),
  created_at    timestamptz not null    default now(),
  case_id       uuid        not null    references public.wildlife_cases(id) on delete cascade,
  note          text        not null,
  note_type     text        not null    check (note_type in ('finder_update', 'rehabber_note', 'system_note')),
  author_name   text,
  author_contact text
);

-- Add RLS policies
alter table public.wildlife_case_notes enable row level security;

-- Anyone can read notes for any case (for public case lookup)
create policy "Anyone can read case notes"
  on public.wildlife_case_notes
  for select
  to anon, authenticated
  using (true);

-- Anyone can add finder notes (for public case updates)
create policy "Anyone can add finder notes"
  on public.wildlife_case_notes
  for insert
  to anon, authenticated
  with check (note_type = 'finder_update');

-- Only authenticated users can add rehabber/system notes
create policy "Authenticated users can add internal notes"
  on public.wildlife_case_notes
  for insert
  to authenticated
  with check (note_type in ('rehabber_note', 'system_note'));

-- Indexes
create index wildlife_case_notes_case_id_idx on public.wildlife_case_notes (case_id);
create index wildlife_case_notes_created_at_idx on public.wildlife_case_notes (created_at desc);