import Link from 'next/link';
import { BookOpen, ClipboardList, Users2, Megaphone } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import StatCard from '@/components/StatCard';
import EmptyState from '@/components/EmptyState';
import CourseCard from '@/components/CourseCard';
import { formatDate } from '@/lib/format';
import type { Course } from '@/lib/types';

export default async function DashboardOverviewPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user!.id)
    .single();

  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('course:courses(*)')
    .eq('user_id', user!.id)
    .eq('status', 'active');

  const courses = (enrollments ?? [])
    .map((e) => e.course)
    .filter(Boolean) as unknown as Course[];
  const courseIds = courses.map((c) => c.id);

  const { data: assignments } = courseIds.length
    ? await supabase
        .from('assignments')
        .select('id, title, due_at, course_id')
        .in('course_id', courseIds)
        .order('due_at', { ascending: true })
        .limit(5)
    : { data: [] };

  const { data: announcements } = await supabase
    .from('announcements')
    .select('id, title, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">
          Welcome back{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}
        </h1>
        <p className="text-navy-500 mt-1">Here&apos;s what&apos;s happening with your learning.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={BookOpen} label="Enrolled courses" value={courses.length} />
        <StatCard icon={ClipboardList} label="Upcoming assignments" value={assignments?.length ?? 0} />
        <StatCard icon={Megaphone} label="Recent announcements" value={announcements?.length ?? 0} />
        <StatCard icon={Users2} label="Group projects" value="View" />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-navy-900 text-lg">My courses</h2>
          <Link href="/dashboard/courses" className="text-sm font-semibold text-navy-700 hover:underline">
            View all →
          </Link>
        </div>
        {courses.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {courses.slice(0, 3).map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={BookOpen}
            title="You're not enrolled in any course yet"
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

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white border border-navy-100 rounded-2xl p-6">
          <h2 className="font-semibold text-navy-900 mb-4">Upcoming assignments</h2>
          {assignments && assignments.length > 0 ? (
            <ul className="space-y-3">
              {assignments.map((a) => (
                <li key={a.id} className="flex items-center justify-between text-sm">
                  <span className="text-navy-800">{a.title}</span>
                  <span className="text-navy-500">{formatDate(a.due_at)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-navy-500">No assignments due right now.</p>
          )}
        </div>

        <div className="bg-white border border-navy-100 rounded-2xl p-6">
          <h2 className="font-semibold text-navy-900 mb-4">Latest announcements</h2>
          {announcements && announcements.length > 0 ? (
            <ul className="space-y-3">
              {announcements.map((a) => (
                <li key={a.id} className="flex items-center justify-between text-sm">
                  <span className="text-navy-800">{a.title}</span>
                  <span className="text-navy-500">{formatDate(a.created_at)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-navy-500">No announcements yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
