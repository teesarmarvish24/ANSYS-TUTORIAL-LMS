export type UserRole = 'admin' | 'student';
export type AccountStatus = 'active' | 'inactive' | 'pending';
export type RequestStatus = 'pending' | 'approved' | 'rejected';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  status: AccountStatus;
  phone: string | null;
  created_at: string;
}

export interface EnrollmentRequest {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  background: string | null;
  note: string | null;
  status: RequestStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
}

export interface Module {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  sort_order: number;
}

export interface Recording {
  id: string;
  module_id: string;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  duration_minutes: number | null;
  class_date: string | null;
  sort_order: number;
  created_by: string | null;
  created_at: string;
}

export type QuestionType = 'mcq' | 'open_ended';
export type SubmissionStatus = 'submitted' | 'graded';

export interface Assessment {
  id: string;
  module_id: string;
  title: string;
  description: string | null;
  created_by: string | null;
  created_at: string;
  opens_at: string | null;
  closes_at: string | null;
}

export interface ModuleTimeTracking {
  id: string;
  student_id: string;
  module_id: string;
  total_seconds: number;
  last_active_at: string;
}

export interface Question {
  id: string;
  assessment_id: string;
  question_text: string;
  type: QuestionType;
  options: string[] | null;
  correct_option_index: number | null;
  points: number;
  sort_order: number;
}

export interface Submission {
  id: string;
  assessment_id: string;
  student_id: string;
  status: SubmissionStatus;
  total_score: number | null;
  max_score: number | null;
  submitted_at: string;
  graded_at: string | null;
}

export interface Answer {
  id: string;
  submission_id: string;
  question_id: string;
  selected_option_index: number | null;
  answer_text: string | null;
  is_correct: boolean | null;
  points_awarded: number | null;
}
