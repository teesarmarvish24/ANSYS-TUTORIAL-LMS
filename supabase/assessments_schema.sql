-- ============================================================
-- ASSESSMENTS FEATURE — run this in SQL Editor after schema.sql
-- Safe to re-run.
-- ============================================================

do $$ begin
  create type question_type as enum ('mcq', 'open_ended');
exception when duplicate_object then null; end $$;

do $$ begin
  create type submission_status as enum ('submitted', 'graded');
exception when duplicate_object then null; end $$;

create table if not exists assessments (
  id uuid primary key default gen_random_uuid(),
  module_id uuid references modules(id) on delete cascade,
  title text not null,
  description text,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

create table if not exists questions (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid references assessments(id) on delete cascade,
  question_text text not null,
  type question_type not null,
  options jsonb,                  -- for mcq: array of strings, e.g. ["A", "B", "C"]
  correct_option_index int,       -- for mcq only
  points int not null default 1,
  sort_order int default 0
);

create table if not exists submissions (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid references assessments(id) on delete cascade,
  student_id uuid references profiles(id) on delete cascade,
  status submission_status not null default 'submitted',
  total_score numeric,
  max_score numeric,
  submitted_at timestamptz default now(),
  graded_at timestamptz,
  unique (assessment_id, student_id)
);

create table if not exists answers (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid references submissions(id) on delete cascade,
  question_id uuid references questions(id) on delete cascade,
  selected_option_index int,      -- for mcq
  answer_text text,               -- for open_ended
  is_correct boolean,             -- for mcq, auto-set
  points_awarded numeric          -- filled automatically (mcq) or by admin (open_ended)
);

alter table assessments enable row level security;
alter table questions enable row level security;
alter table submissions enable row level security;
alter table answers enable row level security;

drop policy if exists "Active users read assessments" on assessments;
drop policy if exists "Only admins manage assessments" on assessments;
drop policy if exists "Active users read questions" on questions;
drop policy if exists "Only admins manage questions" on questions;
drop policy if exists "Students read own submissions" on submissions;
drop policy if exists "Students create own submissions" on submissions;
drop policy if exists "Admins read all submissions" on submissions;
drop policy if exists "Admins update submissions" on submissions;
drop policy if exists "Students read own answers" on answers;
drop policy if exists "Students create own answers" on answers;
drop policy if exists "Admins read all answers" on answers;
drop policy if exists "Admins update answers" on answers;

-- assessments
create policy "Active users read assessments" on assessments
  for select using (
    exists (select 1 from profiles p where p.id = auth.uid() and (p.role = 'admin' or p.status = 'active'))
  );
create policy "Only admins manage assessments" on assessments
  for all using (is_admin());

-- questions (correct_option_index is visible to students too here, kept simple;
-- grading logic lives client + server side, not hidden from the DB)
create policy "Active users read questions" on questions
  for select using (
    exists (select 1 from profiles p where p.id = auth.uid() and (p.role = 'admin' or p.status = 'active'))
  );
create policy "Only admins manage questions" on questions
  for all using (is_admin());

-- submissions
create policy "Students read own submissions" on submissions
  for select using (auth.uid() = student_id);
create policy "Students create own submissions" on submissions
  for insert with check (auth.uid() = student_id);
create policy "Admins read all submissions" on submissions
  for select using (is_admin());
create policy "Admins update submissions" on submissions
  for update using (is_admin());

-- answers
create policy "Students read own answers" on answers
  for select using (
    exists (select 1 from submissions s where s.id = submission_id and s.student_id = auth.uid())
  );
create policy "Students create own answers" on answers
  for insert with check (
    exists (select 1 from submissions s where s.id = submission_id and s.student_id = auth.uid())
  );
create policy "Admins read all answers" on answers
  for select using (is_admin());
create policy "Admins update answers" on answers
  for update using (is_admin());
