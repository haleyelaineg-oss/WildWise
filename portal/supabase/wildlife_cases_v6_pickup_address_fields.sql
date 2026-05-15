-- Add pickup address fields to wildlife_cases
-- Run this in the Supabase SQL Editor

alter table public.wildlife_cases
  add column if not exists pickup_street text,
  add column if not exists pickup_city text,
  add column if not exists pickup_zip text;