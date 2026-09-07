import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import CourseCard from '@/components/CourseCard';
import EmptyState from '@/components/EmptyState';
import type { Course } from '@/lib/types';

export default async function MyCoursesPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('course:courses(*)')
    .eq('user_id', user!.id)
    .eq('status', 'active');

  const courses = (enrollments ?? [])
    .map((e) => e.course)
    .filter(Boolean) as unknown as Course[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">My Courses</h1>
          <p className="text-navy-500 mt-1">Courses you&apos;re currently enrolled in.</p>
        </div>
        <Link
          href="/courses"
          className="bg-navy-950 text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-navy-800"
        >
          Browse more courses
        </Link>
      </div>

      {courses.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} href={`/dashboard/courses/${course.slug}`} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={BookOpen}
          title="No courses yet"
          description="Browse the catalogue and enroll in a course to get started."
          action={
            <Link
              href="/courses"
              className="inline-block bg-navy-950 text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-navy-800"
            >
              Browse courses
            </Link>
          }
        />
      )}
    </div>
  );
}
