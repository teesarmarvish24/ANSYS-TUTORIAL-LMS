export type Role = 'admin' | 'student';
export type ProfileStatus = 'active' | 'inactive';
export type EnrollmentStatus = 'active' | 'revoked';
export type EnrollmentSource = 'payment' | 'admin_grant';
export type PaymentStatus = 'pending' | 'success' | 'failed';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: Role;
  status: ProfileStatus;
  avatar_url: string | null;
  created_at: string;
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  level: string;
  duration_hours: number | null;
  price_kobo: number;
  currency: string;
  thumbnail_url: string | null;
  is_published: boolean;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface CourseModule {
  id: string;
  course_id: string;
  title: string;
  position: number;
  created_at: string;
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  status: EnrollmentStatus;
  source: EnrollmentSource;
  enrolled_at: string;
}

export interface Payment {
  id: string;
  user_id: string;
  course_id: string;
  amount_kobo: number;
  currency: string;
  provider: string;
  reference: string;
  status: PaymentStatus;
  paid_at: string | null;
  created_at: string;
}

export interface Recording {
  id: string;
  course_id: string;
  module_id: string | null;
  title: string;
  description: string | null;
  video_url: string;
  duration_minutes: number | null;
  position: number;
  created_at: string;
}

export interface Assignment {
  id: string;
  course_id: string;
  module_id: string | null;
  title: string;
  instructions: string | null;
  attachment_url: string | null;
  max_score: number;
  due_at: string | null;
  created_at: string;
}

export interface AssignmentSubmission {
  id: string;
  assignment_id: string;
  student_id: string;
  content: string | null;
  attachment_url: string | null;
  score: number | null;
  feedback: string | null;
  submitted_at: string;
  graded_at: string | null;
}

export interface GroupProject {
  id: string;
  course_id: string;
  title: string;
  instructions: string | null;
  attachment_url: string | null;
  max_score: number;
  due_at: string | null;
  created_at: string;
}

export interface ProjectGroup {
  id: string;
  group_project_id: string;
  name: string;
  created_at: string;
}

export interface ProjectGroupMember {
  group_id: string;
  student_id: string;
}

export interface ProjectSubmission {
  id: string;
  group_id: string;
  content: string | null;
  attachment_url: string | null;
  score: number | null;
  feedback: string | null;
  submitted_by: string | null;
  submitted_at: string;
  graded_at: string | null;
}

export interface Announcement {
  id: string;
  course_id: string | null;
  title: string;
  body: string;
  created_by: string | null;
  created_at: string;
}

export interface RecordingTimeLog {
  id: string;
  student_id: string;
  recording_id: string;
  course_id: string;
  seconds_watched: number;
  log_date: string;
}

export interface ActivityLogEntry {
  id: string;
  actor_id: string | null;
  action: string;
  target_table: string | null;
  target_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}
