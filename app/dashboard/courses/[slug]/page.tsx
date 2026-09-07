import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { PlayCircle, ClipboardList, Users2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { formatDate, formatDuration } from '@/lib/format';
import type { Course, CourseModule, Recording, Assignment, GroupProject } from '@/lib/types';

export default async function CourseHomePage({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: course } = await supabase
    .from('courses')
    .select('*')
    .eq('slug', params.slug)
    .single();

  if (!course) notFound();
  const typedCourse = course as Course;

  const { data: enrollment } = await supabase
    .from('enrollments')
    .select('status')
    .eq('user_id', user!.id)
    .eq('course_id', typedCourse.id)
    .maybeSingle();

  if (enrollment?.status !== 'active') redirect(`/courses/${params.slug}`);

  const [{ data: modules }, { data: recordings }, { data: assignments }, { data: projects }] =
    await Promise.all([
      supabase.from('course_modules').select('*').eq('course_id', typedCourse.id).order('position'),
      supabase.from('recordings').select('*').eq('course_id', typedCourse.id).order('position'),
      supabase.from('assignments').select('*').eq('course_id', typedCourse.id).order('due_at'),
      supabase.from('group_projects').select('*').eq('course_id', typedCourse.id).order('due_at'),
    ]);

  const typedModules = (modules ?? []) as CourseModule[];
  const typedRecordings = (recordings ?? []) as Recording[];
  const typedAssignments = (assignments ?? []) as Assignment[];
  const typedProjects = (projects ?? []) as GroupProject[];

  const recordingsByModule = new Map<string | null, Recording[]>();
  for (const rec of typedRecordings) {
    const key = rec.module_id;
    if (!recordingsByModule.has(key)) recordingsByModule.set(key, []);
    recordingsByModule.get(key)!.push(rec);
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-navy-500">Course</p>
        <h1 className="text-2xl font-bold text-navy-900">{typedCourse.title}</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="font-semibold text-navy-900 text-lg">Recordings</h2>
          {typedModules.map((mod) => {
            const recs = recordingsByModule.get(mod.id) ?? [];
            if (recs.length === 0) return null;
            return (
              <div key={mod.id} className="bg-white border border-navy-100 rounded-2xl p-5">
                <h3 className="font-semibold text-navy-800 mb-3">{mod.title}</h3>
                <ul className="space-y-2">
                  {recs.map((rec) => (
                    <li key={rec.id}>
                      <Link
                        href={`/dashboard/recording/${rec.id}`}
                        className="flex items-center justify-between gap-3 border border-navy-100 rounded-xl px-4 py-3 hover:bg-navy-50 transition-colors"
                      >
                        <span className="flex items-center gap-3 text-sm font-medium text-navy-800">
                          <PlayCircle size={18} className="text-navy-700 flex-shrink-0" />
                          {rec.title}
                        </span>
                        {rec.duration_minutes != null && (
                          <span className="text-xs text-navy-500 flex-shrink-0">
                            {formatDuration(rec.duration_minutes)}
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
          {recordingsByModule.get(null)?.length ? (
            <div className="bg-white border border-navy-100 rounded-2xl p-5">
              <ul className="space-y-2">
                {recordingsByModule.get(null)!.map((rec) => (
                  <li key={rec.id}>
                    <Link
                      href={`/dashboard/recording/${rec.id}`}
                      className="flex items-center justify-between gap-3 border border-navy-100 rounded-xl px-4 py-3 hover:bg-navy-50 transition-colors"
                    >
                      <span className="flex items-center gap-3 text-sm font-medium text-navy-800">
                        <PlayCircle size={18} className="text-navy-700 flex-shrink-0" />
                        {rec.title}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {typedRecordings.length === 0 && (
            <p className="text-sm text-navy-500">No recordings uploaded for this course yet.</p>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-navy-100 rounded-2xl p-5">
            <h3 className="font-semibold text-navy-900 flex items-center gap-2 mb-3">
              <ClipboardList size={18} /> Assignments
            </h3>
            {typedAssignments.length > 0 ? (
              <ul className="space-y-2">
                {typedAssignments.map((a) => (
                  <li key={a.id}>
                    <Link
                      href={`/dashboard/assignments/${a.id}`}
                      className="flex items-center justify-between text-sm border border-navy-100 rounded-lg px-3 py-2.5 hover:bg-navy-50"
                    >
                      <span className="text-navy-800">{a.title}</span>
                      <span className="text-navy-500 text-xs">{formatDate(a.due_at)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-navy-500">No assignments yet.</p>
            )}
          </div>

          <div className="bg-white border border-navy-100 rounded-2xl p-5">
            <h3 className="font-semibold text-navy-900 flex items-center gap-2 mb-3">
              <Users2 size={18} /> Group Projects
            </h3>
            {typedProjects.length > 0 ? (
              <ul className="space-y-2">
                {typedProjects.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/dashboard/group-projects/${p.id}`}
                      className="flex items-center justify-between text-sm border border-navy-100 rounded-lg px-3 py-2.5 hover:bg-navy-50"
                    >
                      <span className="text-navy-800">{p.title}</span>
                      <span className="text-navy-500 text-xs">{formatDate(p.due_at)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-navy-500">No group projects yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
