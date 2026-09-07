-- Ansys Simulation Mastery LMS — full database schema
-- Run this once, top to bottom, in Supabase SQL Editor on a fresh/reset project.
-- Safe to re-run: it drops old objects first, then recreates everything.

-- ============================================================================
-- 0. EXTENSIONS
-- ============================================================================
create extension if not exists pgcrypto;

-- ============================================================================
-- 1. DROP OLD OBJECTS (clean slate)
-- ============================================================================
drop table if exists activity_log cascade;
drop table if exists recording_time_logs cascade;
drop table if exists announcements cascade;
drop table if exists project_submissions cascade;
drop table if exists project_group_members cascade;
drop table if exists project_groups cascade;
drop table if exists group_projects cascade;
drop table if exists assignment_submissions cascade;
drop table if exists assignments cascade;
drop table if exists recordings cascade;
drop table if exists payments cascade;
drop table if exists enrollments cascade;
drop table if exists course_modules cascade;
drop table if exists courses cascade;
drop table if exists enrollment_requests cascade;
drop table if exists student_time_logs cascade;
drop table if exists submissions cascade;
drop table if exists answers cascade;
drop table if exists questions cascade;
drop table if exists assessments cascade;
drop table if exists modules cascade;
drop table if exists profiles cascade;

drop function if exists public.is_admin() cascade;
drop function if exists public.is_enrolled(uuid) cascade;
drop function if exists public.handle_new_user() cascade;
drop function if exists public.can_access_attachment(text, boolean) cascade;

-- ============================================================================
-- 2. PROFILES (one row per auth.users row, created automatically by trigger)
-- ============================================================================
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text,
  phone text,
  role text not null default 'student' check (role in ('admin', 'student')),
  status text not null default 'active' check (status in ('active', 'inactive')),
  avatar_url text,
  created_at timestamptz not null default now()
);

-- Auto-create a profile row whenever a new auth user is created
-- (covers Google sign-in, email/password self-signup, and admin invites).
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Helper: is the current user an admin? (security definer avoids RLS recursion)
create function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ============================================================================
-- 3. COURSES + MODULES
-- ============================================================================
create table courses (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  subtitle text,
  description text,
  level text default 'Beginner',
  duration_hours numeric,
  price_kobo integer not null default 0,
  currency text not null default 'NGN',
  thumbnail_url text,
  is_published boolean not null default false,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table course_modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references courses(id) on delete cascade,
  title text not null,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- 4. ENROLLMENTS + PAYMENTS
-- ============================================================================
create table enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  course_id uuid not null references courses(id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'revoked')),
  source text not null default 'payment' check (source in ('payment', 'admin_grant')),
  enrolled_at timestamptz not null default now(),
  unique (user_id, course_id)
);

create function public.is_enrolled(target_course_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.enrollments
    where user_id = auth.uid() and course_id = target_course_id and status = 'active'
  );
$$;

create table payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  course_id uuid not null references courses(id) on delete cascade,
  amount_kobo integer not null,
  currency text not null default 'NGN',
  provider text not null default 'paystack',
  reference text unique not null,
  status text not null default 'pending' check (status in ('pending', 'success', 'failed')),
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- 5. RECORDINGS, ASSIGNMENTS, GROUP PROJECTS
-- ============================================================================
create table recordings (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references courses(id) on delete cascade,
  module_id uuid references course_modules(id) on delete set null,
  title text not null,
  description text,
  video_url text not null,
  duration_minutes numeric,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table assignments (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references courses(id) on delete cascade,
  module_id uuid references course_modules(id) on delete set null,
  title text not null,
  instructions text,
  attachment_url text,
  max_score integer not null default 100,
  due_at timestamptz,
  created_at timestamptz not null default now()
);

create table assignment_submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references assignments(id) on delete cascade,
  student_id uuid not null references profiles(id) on delete cascade,
  content text,
  attachment_url text,
  score integer,
  feedback text,
  submitted_at timestamptz not null default now(),
  graded_at timestamptz,
  unique (assignment_id, student_id)
);

create table group_projects (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references courses(id) on delete cascade,
  title text not null,
  instructions text,
  attachment_url text,
  max_score integer not null default 100,
  due_at timestamptz,
  created_at timestamptz not null default now()
);

create table project_groups (
  id uuid primary key default gen_random_uuid(),
  group_project_id uuid not null references group_projects(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create table project_group_members (
  group_id uuid not null references project_groups(id) on delete cascade,
  student_id uuid not null references profiles(id) on delete cascade,
  primary key (group_id, student_id)
);

create table project_submissions (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references project_groups(id) on delete cascade,
  content text,
  attachment_url text,
  score integer,
  feedback text,
  submitted_by uuid references profiles(id),
  submitted_at timestamptz not null default now(),
  graded_at timestamptz,
  unique (group_id)
);

-- ============================================================================
-- 6. ANNOUNCEMENTS + TIME TRACKING + ACTIVITY LOG
-- ============================================================================
create table announcements (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references courses(id) on delete cascade,
  title text not null,
  body text not null,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

create table recording_time_logs (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references profiles(id) on delete cascade,
  recording_id uuid not null references recordings(id) on delete cascade,
  course_id uuid not null references courses(id) on delete cascade,
  seconds_watched integer not null default 0,
  log_date date not null default current_date,
  unique (student_id, recording_id, log_date)
);

create table activity_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references profiles(id),
  action text not null,
  target_table text,
  target_id uuid,
  metadata jsonb,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- 7. INDEXES
-- ============================================================================
create index on course_modules (course_id);
create index on enrollments (user_id);
create index on enrollments (course_id);
create index on payments (user_id);
create index on payments (reference);
create index on recordings (course_id);
create index on assignments (course_id);
create index on assignment_submissions (assignment_id);
create index on assignment_submissions (student_id);
create index on group_projects (course_id);
create index on project_groups (group_project_id);
create index on project_submissions (group_id);
create index on announcements (course_id);
create index on recording_time_logs (student_id, course_id);

-- ============================================================================
-- 8. ROW LEVEL SECURITY
-- ============================================================================
alter table profiles enable row level security;
alter table courses enable row level security;
alter table course_modules enable row level security;
alter table enrollments enable row level security;
alter table payments enable row level security;
alter table recordings enable row level security;
alter table assignments enable row level security;
alter table assignment_submissions enable row level security;
alter table group_projects enable row level security;
alter table project_groups enable row level security;
alter table project_group_members enable row level security;
alter table project_submissions enable row level security;
alter table announcements enable row level security;
alter table recording_time_logs enable row level security;
alter table activity_log enable row level security;

-- profiles: read own row, or admin reads all. Only admin (via service role) writes.
create policy "profiles_select" on profiles for select
  using (id = auth.uid() or is_admin());
create policy "profiles_admin_update" on profiles for update
  using (is_admin());

-- courses: public catalog (published courses visible to everyone, incl. anon);
-- admins see and manage everything.
create policy "courses_select_published" on courses for select
  using (is_published = true or is_admin());
create policy "courses_admin_write" on courses for insert
  with check (is_admin());
create policy "courses_admin_update" on courses for update
  using (is_admin());
create policy "courses_admin_delete" on courses for delete
  using (is_admin());

-- course_modules: titles are part of the public course syllabus, so anyone
-- can see the module list for a published course (the recordings/assignments
-- inside each module stay gated behind enrollment). Admin-only write.
create policy "modules_select" on course_modules for select
  using (
    is_admin()
    or is_enrolled(course_id)
    or exists (select 1 from courses c where c.id = course_id and c.is_published)
  );
create policy "modules_admin_write" on course_modules for insert
  with check (is_admin());
create policy "modules_admin_update" on course_modules for update
  using (is_admin());
create policy "modules_admin_delete" on course_modules for delete
  using (is_admin());

-- enrollments: students see their own; admin sees/manages all.
create policy "enrollments_select" on enrollments for select
  using (user_id = auth.uid() or is_admin());
create policy "enrollments_admin_write" on enrollments for insert
  with check (is_admin());
create policy "enrollments_admin_update" on enrollments for update
  using (is_admin());

-- payments: students see their own; admin sees all. Writes happen server-side
-- (service role) from the Paystack API routes only.
create policy "payments_select" on payments for select
  using (user_id = auth.uid() or is_admin());

-- recordings: enrolled students or admin.
create policy "recordings_select" on recordings for select
  using (is_admin() or is_enrolled(course_id));
create policy "recordings_admin_write" on recordings for insert
  with check (is_admin());
create policy "recordings_admin_update" on recordings for update
  using (is_admin());
create policy "recordings_admin_delete" on recordings for delete
  using (is_admin());

-- assignments: enrolled students or admin.
create policy "assignments_select" on assignments for select
  using (is_admin() or is_enrolled(course_id));
create policy "assignments_admin_write" on assignments for insert
  with check (is_admin());
create policy "assignments_admin_update" on assignments for update
  using (is_admin());
create policy "assignments_admin_delete" on assignments for delete
  using (is_admin());

-- assignment_submissions: a student manages their own submission; admin sees/grades all.
create policy "submissions_select" on assignment_submissions for select
  using (student_id = auth.uid() or is_admin());
create policy "submissions_insert" on assignment_submissions for insert
  with check (
    student_id = auth.uid()
    and exists (
      select 1 from assignments a
      where a.id = assignment_id and is_enrolled(a.course_id)
    )
  );
create policy "submissions_update" on assignment_submissions for update
  using (student_id = auth.uid() or is_admin());

-- group_projects: enrolled students or admin.
create policy "group_projects_select" on group_projects for select
  using (is_admin() or is_enrolled(course_id));
create policy "group_projects_admin_write" on group_projects for insert
  with check (is_admin());
create policy "group_projects_admin_update" on group_projects for update
  using (is_admin());
create policy "group_projects_admin_delete" on group_projects for delete
  using (is_admin());

-- project_groups: visible to members of the group, or admin. Admin-only write.
create policy "project_groups_select" on project_groups for select
  using (
    is_admin()
    or exists (
      select 1 from project_group_members m
      where m.group_id = id and m.student_id = auth.uid()
    )
  );
create policy "project_groups_admin_write" on project_groups for insert
  with check (is_admin());
create policy "project_groups_admin_update" on project_groups for update
  using (is_admin());
create policy "project_groups_admin_delete" on project_groups for delete
  using (is_admin());

-- project_group_members: visible to the member themself or admin. Admin-only write.
create policy "project_members_select" on project_group_members for select
  using (student_id = auth.uid() or is_admin());
create policy "project_members_admin_write" on project_group_members for insert
  with check (is_admin());
create policy "project_members_admin_delete" on project_group_members for delete
  using (is_admin());

-- project_submissions: visible/writable by members of the group, or admin.
create policy "project_submissions_select" on project_submissions for select
  using (
    is_admin()
    or exists (
      select 1 from project_group_members m
      where m.group_id = group_id and m.student_id = auth.uid()
    )
  );
create policy "project_submissions_insert" on project_submissions for insert
  with check (
    exists (
      select 1 from project_group_members m
      where m.group_id = group_id and m.student_id = auth.uid()
    )
  );
create policy "project_submissions_update" on project_submissions for update
  using (
    is_admin()
    or exists (
      select 1 from project_group_members m
      where m.group_id = group_id and m.student_id = auth.uid()
    )
  );

-- announcements: course-scoped ones visible to enrolled students; global ones
-- (course_id is null) visible to every signed-in student. Admin sees/manages all.
create policy "announcements_select" on announcements for select
  using (is_admin() or course_id is null or is_enrolled(course_id));
create policy "announcements_admin_write" on announcements for insert
  with check (is_admin());
create policy "announcements_admin_update" on announcements for update
  using (is_admin());
create policy "announcements_admin_delete" on announcements for delete
  using (is_admin());

-- recording_time_logs: a student manages their own log rows; admin reads all.
create policy "time_logs_select" on recording_time_logs for select
  using (student_id = auth.uid() or is_admin());
create policy "time_logs_insert" on recording_time_logs for insert
  with check (student_id = auth.uid());
create policy "time_logs_update" on recording_time_logs for update
  using (student_id = auth.uid());

-- activity_log: admin only.
create policy "activity_log_select" on activity_log for select
  using (is_admin());

-- ============================================================================
-- 9. STORAGE BUCKETS (course thumbnails, assignment/submission attachments)
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('course-thumbnails', 'course-thumbnails', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('attachments', 'attachments', false)
on conflict (id) do nothing;

drop policy if exists "thumbnails_public_read" on storage.objects;
create policy "thumbnails_public_read" on storage.objects for select
  using (bucket_id = 'course-thumbnails');

drop policy if exists "thumbnails_admin_write" on storage.objects;
create policy "thumbnails_admin_write" on storage.objects for insert
  with check (bucket_id = 'course-thumbnails' and is_admin());

drop policy if exists "thumbnails_admin_update" on storage.objects;
create policy "thumbnails_admin_update" on storage.objects for update
  using (bucket_id = 'course-thumbnails' and is_admin());

drop policy if exists "thumbnails_admin_delete" on storage.objects;
create policy "thumbnails_admin_delete" on storage.objects for delete
  using (bucket_id = 'course-thumbnails' and is_admin());

-- Attachments bucket uses three path prefixes, each with its own access rule:
--   submissions/<user id>/...    -> an individual assignment submission (owner or admin)
--   groups/<group id>/...        -> a group project submission (any member of that group, or admin)
--   course-materials/<course id>/... -> admin-uploaded briefs (any student enrolled in that course, or admin)
create or replace function public.can_access_attachment(object_name text, want_write boolean)
returns boolean
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  parts text[];
  prefix text;
  scope_id text;
begin
  if is_admin() then
    return true;
  end if;

  parts := storage.foldername(object_name);
  prefix := parts[1];
  scope_id := parts[2];

  if prefix = 'submissions' then
    return scope_id = auth.uid()::text;
  elsif prefix = 'groups' then
    return exists (
      select 1 from project_group_members m
      where m.group_id = scope_id::uuid and m.student_id = auth.uid()
    );
  elsif prefix = 'course-materials' then
    if want_write then
      return false; -- only admins write course materials
    end if;
    return is_enrolled(scope_id::uuid);
  end if;

  return false;
end;
$$;

drop policy if exists "attachments_read" on storage.objects;
create policy "attachments_read" on storage.objects for select
  using (bucket_id = 'attachments' and can_access_attachment(name, false));

drop policy if exists "attachments_write" on storage.objects;
create policy "attachments_write" on storage.objects for insert
  with check (bucket_id = 'attachments' and can_access_attachment(name, true));

drop policy if exists "attachments_update" on storage.objects;
create policy "attachments_update" on storage.objects for update
  using (bucket_id = 'attachments' and can_access_attachment(name, true));

drop policy if exists "attachments_delete" on storage.objects;
create policy "attachments_delete" on storage.objects for delete
  using (bucket_id = 'attachments' and can_access_attachment(name, true));

-- ============================================================================
-- 10. SEED YOUR ADMIN ACCOUNT
-- ============================================================================
-- 1. Create your login in Supabase Dashboard -> Authentication -> Users -> Add user
--    (use your real email + a password, and tick "Auto Confirm User").
-- 2. Then run this, swapping in that same email:
--
--    update public.profiles set role = 'admin' where email = 'you@example.com';
--
-- That's it — the profile row itself was already created automatically by the
-- trigger above the moment the auth user was created.
