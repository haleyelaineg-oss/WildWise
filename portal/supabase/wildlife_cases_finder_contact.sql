-- Add finder contact info to wildlife_cases
-- Run this in the Supabase SQL Editor

alter table public.wildlife_cases
  add column if not exists finder_name  text,
  add column if not exists finder_phone text;
