-- Schema for aligning registration -> approval -> profile flow
-- Run this in Supabase SQL editor.

-- 1) Pending registrations table (stores data collected at Register before approval)
create extension if not exists pgcrypto;
create table if not exists public.pending_registrations (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  first_name text,
  last_name text,
  phone text,
  course text,
  batch_year int,
  graduation_year int,
  current_job text,
  company text,
  address text,
  city text,
  country text,
  student_id text,
  profile_image_url text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now(),
  processed_at timestamptz
);

-- 2) Recommended columns on users (only if missing)
-- alter table public.users add column if not exists approval_status text default 'pending';
-- alter table public.users add column if not exists is_verified boolean default false;
-- alter table public.users add column if not exists registration_date timestamptz;
-- alter table public.users add column if not exists approved_at timestamptz;
-- alter table public.users add column if not exists last_login timestamptz;

-- 3) Recommended columns on user_profiles (only if missing)
-- alter table public.user_profiles add column if not exists user_id uuid references public.users(id) on delete cascade;
-- alter table public.user_profiles add column if not exists course text;
-- alter table public.user_profiles add column if not exists batch_year int;
-- alter table public.user_profiles add column if not exists graduation_year int;
-- alter table public.user_profiles add column if not exists date_of_birth date;
-- alter table public.user_profiles add column if not exists current_job text;
-- alter table public.user_profiles add column if not exists company text;
-- alter table public.user_profiles add column if not exists phone text;
-- alter table public.user_profiles add column if not exists address text;
-- alter table public.user_profiles add column if not exists city text;
-- alter table public.user_profiles add column if not exists country text;
-- alter table public.user_profiles add column if not exists postal_code text;
-- alter table public.user_profiles add column if not exists profile_image_url text;
-- alter table public.user_profiles add column if not exists updated_at timestamptz;

-- 4) View used by AdminDashboard (users + profiles)
create or replace view public.user_management_view as
select
  u.id,
  u.first_name,
  u.last_name,
  u.email,
  u.created_at as user_created_at,
  u.registration_date,
  u.role,
  u.approval_status,
  up.course,
  up.graduation_year,
  up.current_job,
  up.company,
  up.phone,
  up.address,
  up.city,
  up.country,
  up.profile_image_url
from public.users u
left join public.user_profiles up on up.user_id = u.id;

-- 5) RLS for pending_registrations
alter table public.pending_registrations enable row level security;

-- Allow anyone to submit (insert) a pending registration
drop policy if exists pending_registrations_insert_anyone on public.pending_registrations;
create policy pending_registrations_insert_anyone
on public.pending_registrations for insert
to anon, authenticated
with check (true);

-- Allow authenticated users (e.g. admins) to read
drop policy if exists pending_registrations_select_auth on public.pending_registrations;
create policy pending_registrations_select_auth
on public.pending_registrations for select
to authenticated
using (true);

-- Allow authenticated users to update status (admin app enforces role)
drop policy if exists pending_registrations_update_auth on public.pending_registrations;
create policy pending_registrations_update_auth
on public.pending_registrations for update
to authenticated
using (true)
with check (true);

-- 6) Storage bucket
-- Create a bucket named "alumni-profiles" (public) in Supabase Storage UI.
-- Configure public read; authenticated users can write. Files uploaded during registration go to temp/<file>.
-- During approval/first login, files are copied to <userId>/<file> and old temp files removed.
