-- Add close_reason field and update status constraint
-- Run this in the Supabase SQL Editor

-- Add close_reason and closed_at columns
alter table public.wildlife_cases
  add column if not exists close_reason text,
  add column if not exists closed_at timestamptz;

-- Update status check constraint to include resolved and closed
do $$
declare
  _name text;
begin
  -- Drop existing status check constraint
  for _name in
    select conname
    from pg_constraint
    where conrelid = 'public.wildlife_cases'::regclass
      and contype = 'c'
      and conname like '%status%'
  loop
    execute 'alter table public.wildlife_cases drop constraint ' || quote_ident(_name);
  end loop;
end;
$$;

alter table public.wildlife_cases
  add constraint wildlife_cases_status_check
  check (status in (
    'open',
    'accepted',
    'pending_transport',
    'transport_secured',
    'en_route',
    'in_care',
    'assigned_to_sub_permittee',
    'pending_release',
    'unreleasable',
    'did_not_make_it',
    'resolved',
    'closed'
  ));