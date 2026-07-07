-- ============================================================
-- ANSYS SIMULATION MASTERY LMS - DATABASE SCHEMA
-- Run this entire file in: Supabase Dashboard -> SQL Editor -> New query -> Run
-- Safe to re-run: uses IF NOT EXISTS / DROP ... IF EXISTS throughout.
-- ============================================================

-- Enums (guarded so this can be re-run safely)
do $$ begin
  create type user_role as enum ('admin', 'student');
exception when duplicate_object then null; end $$;

do $$ begin
  create type account_status as enum ('active', 'inactive', 'pending');
exception when duplicate_object then null; end $$;

do $$ begin
  create type request_status as enum ('pending', 'approved', 'rejected');
exception when duplicate_object then null; end $$;

-- ============================================================
-- TABLES
-- ============================================================

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  role user_role not null default 'student',
  status account_status not null default 'pending',
  phone text,
  created_at timestamptz default now()
);

create table if not exists enrollment_requests (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text,
  background text,
  note text,
  status request_status not null default 'pending',
  reviewed_by uuid references profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists modules (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text,
  sort_order int default 0
);

create table if not exists recordings (
  id uuid primary key default gen_random_uuid(),
  module_id uuid references modules(id) on delete cascade,
  title text not null,
  description text,
  video_url text not null,
  thumbnail_url text,
  duration_minutes int,
  class_date date,
  sort_order int default 0,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

create table if not exists activity_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references profiles(id),
  action text not null,
  target_table text,
  target_id uuid,
  details jsonb,
  created_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table profiles enable row level security;
alter table enrollment_requests enable row level security;
alter table modules enable row level security;
alter table recordings enable row level security;
alter table activity_log enable row level security;

-- Drop old policies first so this script is safely re-runnable
drop policy if exists "Students read own profile" on profiles;
drop policy if exists "Admins read all profiles" on profiles;
drop policy if exists "Students update own profile" on profiles;
drop policy if exists "Admins update all profiles" on profiles;

drop policy if exists "Anyone can submit enrollment request" on enrollment_requests;
drop policy if exists "Only admins view enrollment requests" on enrollment_requests;
drop policy if exists "Only admins update enrollment requests" on enrollment_requests;

drop policy if exists "Anyone active can read modules" on modules;
drop policy if exists "Only admins manage modules" on modules;

drop policy if exists "Active students read recordings" on recordings;
drop policy if exists "Only admins manage recordings" on recordings;

drop policy if exists "Only admins read activity log" on activity_log;
drop policy if exists "Only admins insert activity log" on activity_log;

-- profiles
create policy "Students read own profile" on profiles
  for select using (auth.uid() = id);

create policy "Admins read all profiles" on profiles
  for select using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "Students update own profile" on profiles
  for update using (auth.uid() = id);

create policy "Admins update all profiles" on profiles
  for update using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- enrollment_requests
create policy "Anyone can submit enrollment request" on enrollment_requests
  for insert with check (true);

create policy "Only admins view enrollment requests" on enrollment_requests
  for select using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "Only admins update enrollment requests" on enrollment_requests
  for update using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- modules (any active student or admin can read; only admin can write)
create policy "Anyone active can read modules" on modules
  for select using (
    exists (
      select 1 from profiles p where p.id = auth.uid()
      and (p.role = 'admin' or p.status = 'active')
    )
  );

create policy "Only admins manage modules" on modules
  for all using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- recordings
create policy "Active students read recordings" on recordings
  for select using (
    exists (
      select 1 from profiles p where p.id = auth.uid()
      and (p.role = 'admin' or p.status = 'active')
    )
  );

create policy "Only admins manage recordings" on recordings
  for all using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- activity_log
create policy "Only admins read activity log" on activity_log
  for select using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "Only admins insert activity log" on activity_log
  for insert with check (
    exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- ============================================================
-- SEED DATA: the 3 modules (safe to re-run - won't duplicate)
-- ============================================================

insert into modules (slug, title, description, sort_order)
values
  ('fea', 'FEA — Finite Element Analysis', 'Structural simulation fundamentals: meshing, boundary conditions, static/linear analysis, and result interpretation in Ansys.', 1),
  ('cfd', 'CFD — Computational Fluid Dynamics', 'Fluid systems: turbulence modelling, boundary layer behaviour, and practical CFD workflows in Ansys Fluent.', 2),
  ('advanced-fea', 'Advanced FEA — Computational Solid Mechanics', 'Nonlinear material behaviour, large deformation, and advanced computational solid mechanics techniques.', 3)
on conflict (slug) do nothing;
