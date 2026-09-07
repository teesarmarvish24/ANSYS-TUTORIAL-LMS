import { createClient } from '@/lib/supabase/server';
import CoursesManager from '@/components/admin/CoursesManager';
import type { Course } from '@/lib/types';

export default async function AdminCoursesPage() {
  const supabase = createClient();
  const { data: courses } = await supabase.from('courses').select('*').order('position');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Courses</h1>
        <p className="text-navy-500 mt-1">Create and manage every course on the platform.</p>
      </div>
      <CoursesManager initialCourses={(courses ?? []) as Course[]} />
    </div>
  );
}
