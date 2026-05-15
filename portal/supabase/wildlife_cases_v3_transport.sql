-- Run this in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/ztggpdglncbmgtvhoaiu/sql/new

alter table public.wildlife_cases
  add column if not exists finder_can_transport  boolean,
  add column if not exists finder_transport_miles integer;
