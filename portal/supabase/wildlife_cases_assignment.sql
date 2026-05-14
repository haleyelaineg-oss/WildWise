-- Run this in the Supabase SQL Editor AFTER wildlife_cases.sql:
-- https://supabase.com/dashboard/project/ztggpdglncbmgtvhoaiu/sql/new

-- ── Assignment columns ────────────────────────────────────────────────────

alter table public.wildlife_cases
  add column if not exists assigned_to uuid references public.profiles(id) on delete set null,
  add column if not exists assigned_at  timestamptz,
  add column if not exists assigned_by  uuid references public.profiles(id) on delete set null;

-- ── Expand status to include 'accepted' ───────────────────────────────────
-- Drop any existing check constraint on status (name may vary)

do $$
declare
  _name text;
begin
  for _name in
    select conname from pg_constraint
    where conrelid = 'public.wildlife_cases'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) like '%status%'
  loop
    execute 'alter table public.wildlife_cases drop constraint ' || quote_ident(_name);
  end loop;
end;
$$;

alter table public.wildlife_cases
  add constraint wildlife_cases_status_check
  check (status in ('open', 'accepted', 'in_progress', 'resolved', 'closed'));

-- ── RLS policies ──────────────────────────────────────────────────────────

-- Approved rehabbers and admins can read open cases + cases assigned to them
create policy "Rehabbers and admins can view relevant cases"
  on public.wildlife_cases
  for select
  to authenticated
  using (
    status = 'open'
    or assigned_to = auth.uid()
    or exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Approved rehabbers can accept open cases or update their own cases;
-- admins can update any case.
create policy "Rehabbers and admins can update cases"
  on public.wildlife_cases
  for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and (
          p.role = 'admin'
          or (
            p.role = 'licensed_rehabber'
            and p.approved = true
            and (status = 'open' or assigned_to = auth.uid())
          )
        )
    )
  )
  with check (true);

-- ── Indexes ───────────────────────────────────────────────────────────────

create index if not exists wildlife_cases_assigned_to_idx
  on public.wildlife_cases (assigned_to);

create index if not exists wildlife_cases_open_idx
  on public.wildlife_cases (status)
  where status = 'open';
