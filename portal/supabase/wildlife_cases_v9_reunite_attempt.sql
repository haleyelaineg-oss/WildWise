-- Add reunite_pending and reunite_attempt_failed to the wildlife_cases status constraint
-- Run this in the Supabase SQL Editor

do $$
declare
  _name text;
begin
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
    'reunite_pending',
    'reunite_attempt_failed',
    'unreleasable',
    'deceased',
    'resolved',
    'closed'
  ));
