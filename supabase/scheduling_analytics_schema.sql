-- ============================================================
-- SCHEDULING + ANALYTICS FEATURE — run after the previous migrations.
-- Safe to re-run.
-- ============================================================

-- Add optional open/close scheduling window to assessments
alter table assessments add column if not exists opens_at timestamptz;
alter table assessments add column if not exists closes_at timestamptz;

-- Tracks accumulated time-on-module per student, for the admin analytics view.
-- One row per (student, module) pair; seconds accumulate via small periodic
-- "heartbeat" updates sent from the recording page while it's open.
create table if not exists module_time_tracking (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references profiles(id) on delete cascade,
  module_id uuid references modules(id) on delete cascade,
  total_seconds int not null default 0,
  last_active_at timestamptz default now(),
  unique (student_id, module_id)
);

alter table module_time_tracking enable row level security;

drop policy if exists "Students manage own time tracking" on module_time_tracking;
drop policy if exists "Admins read all time tracking" on module_time_tracking;

create policy "Students manage own time tracking" on module_time_tracking
  for all using (auth.uid() = student_id) with check (auth.uid() = student_id);

create policy "Admins read all time tracking" on module_time_tracking
  for select using (is_admin());

grant all on module_time_tracking to anon, authenticated, service_role;

-- Also enforce the assessment open/close window at the database level,
-- not just in the UI, so it can't be bypassed by calling the API directly.
drop policy if exists "Students create own submissions" on submissions;
create policy "Students create own submissions" on submissions
  for insert with check (
    auth.uid() = student_id
    and exists (
      select 1 from assessments a
      where a.id = assessment_id
      and (a.opens_at is null or a.opens_at <= now())
      and (a.closes_at is null or a.closes_at >= now())
    )
  );
