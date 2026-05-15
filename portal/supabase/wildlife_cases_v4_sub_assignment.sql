-- Run this in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/ztggpdglncbmgtvhoaiu/sql/new

-- ── 1. Sub-assignment column ──────────────────────────────────────────────

alter table public.wildlife_cases
  add column if not exists sub_assigned_to uuid references public.profiles(id) on delete set null;

create index if not exists wildlife_cases_sub_assigned_to_idx
  on public.wildlife_cases (sub_assigned_to);

-- ── 2. RLS — sub-permittees can view their assigned cases ─────────────────

drop policy if exists "Sub-permittees can view their cases" on public.wildlife_cases;
create policy "Sub-permittees can view their cases"
  on public.wildlife_cases
  for select
  to authenticated
  using (sub_assigned_to = auth.uid());

-- ── 3. RLS — sub-permittees can update their assigned cases ───────────────

drop policy if exists "Sub-permittees can update their cases" on public.wildlife_cases;
create policy "Sub-permittees can update their cases"
  on public.wildlife_cases
  for update
  to authenticated
  using (
    sub_assigned_to = auth.uid()
    and exists (
      select 1 from public.profiles
      where id = auth.uid()
        and role = 'sub_permittee'
        and approved = true
    )
  )
  with check (true);
