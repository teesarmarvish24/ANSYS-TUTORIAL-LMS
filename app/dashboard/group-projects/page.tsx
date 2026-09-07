import Link from 'next/link';
import { Users2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import EmptyState from '@/components/EmptyState';
import { formatDate } from '@/lib/format';

export default async function GroupProjectsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('course_id, course:courses(title)')
    .eq('user_id', user!.id)
    .eq('status', 'active');

  const courseIds = (enrollments ?? []).map((e) => e.course_id);
  const courseTitleById = new Map(
    (enrollments ?? []).map((e) => [e.course_id, (e.course as unknown as { title: string } | null)?.title ?? ''])
  );

  const { data: projects } = courseIds.length
    ? await supabase.from('group_projects').select('*').in('course_id', courseIds).order('due_at')
    : { data: [] };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Group Projects</h1>
        <p className="text-navy-500 mt-1">Collaborative projects across your enrolled courses.</p>
      </div>

      {projects && projects.length > 0 ? (
        <div className="bg-white border border-navy-100 rounded-2xl divide-y divide-navy-100">
          {projects.map((p) => (
            <Link
              key={p.id}
              href={`/dashboard/group-projects/${p.id}`}
              className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-navy-50 transition-colors"
            >
              <div>
                <p className="font-medium text-navy-900">{p.title}</p>
                <p className="text-xs text-navy-500 mt-0.5">{courseTitleById.get(p.course_id)}</p>
              </div>
              <span className="text-sm text-navy-500 flex-shrink-0">Due {formatDate(p.due_at)}</span>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState icon={Users2} title="No group projects yet" description="Group projects from your courses will show up here." />
      )}
    </div>
  );
}
