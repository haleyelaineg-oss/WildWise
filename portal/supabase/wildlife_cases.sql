-- Run this in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/ztggpdglncbmgtvhoaiu/sql/new

create table if not exists public.wildlife_cases (
  id            uuid        primary key default gen_random_uuid(),
  created_at    timestamptz not null    default now(),

  -- Animal
  animal_species  text,
  animal_detail   text,   -- species detail (e.g. 'coyote') or free-text description for 'other'
  animal_age      text,   -- 'infant' | 'very_young' | 'adult'

  -- Conditions (multi-select)
  conditions      text[]  not null default '{}',
  injury_symptoms text[]  not null default '{}',
  no_mom_time     text,
  condition_desc  text,

  -- Location
  found_zip       text    not null,
  current_zip     text,

  -- Derived fields
  is_urgent       boolean not null default false,
  status          text    not null default 'open'
                    check (status in ('open', 'in_progress', 'resolved', 'closed')),

  -- Optionally linked to an account (null = anonymous submission)
  user_id         uuid    references auth.users(id) on delete set null
);

-- Row Level Security
alter table public.wildlife_cases enable row level security;

-- Anyone (including anonymous visitors) can submit a case
create policy "Anyone can submit a wildlife case"
  on public.wildlife_cases
  for insert
  to anon, authenticated
  with check (true);

-- Logged-in users can view cases they submitted
create policy "Users can view their own cases"
  on public.wildlife_cases
  for select
  to authenticated
  using (user_id = auth.uid());

-- Indexes for dashboard queries
create index wildlife_cases_created_at_idx on public.wildlife_cases (created_at desc);
create index wildlife_cases_status_idx     on public.wildlife_cases (status);
create index wildlife_cases_urgent_idx     on public.wildlife_cases (is_urgent) where is_urgent = true;
