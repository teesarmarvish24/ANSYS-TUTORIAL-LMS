import { createClient } from '@/lib/supabase/server';
import StudentsManager from '@/components/admin/StudentsManager';
import type { Course } from '@/lib/types';

export default async function AdminStudentsPage() {
  const supabase = createClient();

  const [{ data: students }, { data: enrollments }, { data: courses }] = await Promise.all([
    supabase.from('profiles').select('*').eq('role', 'student').order('created_at', { ascending: false }),
    supabase.from('enrollments').select('user_id, course_id, status'),
    supabase.from('courses').select('*').order('position'),
  ]);

  const enrollmentsByStudent = new Map<string, { course_id: string; status: string }[]>();
  for (const e of enrollments ?? []) {
    if (!enrollmentsByStudent.has(e.user_id)) enrollmentsByStudent.set(e.user_id, []);
    enrollmentsByStudent.get(e.user_id)!.push({ course_id: e.course_id, status: e.status });
  }

  const rows = (students ?? []).map((s) => ({
    ...s,
    enrollments: enrollmentsByStudent.get(s.id) ?? [],
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Students</h1>
        <p className="text-navy-500 mt-1">Admit new students, manage access, and grant course enrollments.</p>
      </div>
      <StudentsManager initialStudents={rows} courses={(courses ?? []) as Course[]} />
    </div>
  );
}
