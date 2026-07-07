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
