import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import CourseDetailsForm from '@/components/admin/CourseDetailsForm';
import ModulesManager from '@/components/admin/ModulesManager';
import RecordingsManager from '@/components/admin/RecordingsManager';
import AssignmentsManager from '@/components/admin/AssignmentsManager';
import GroupProjectsManager from '@/components/admin/GroupProjectsManager';
import type { Course, CourseModule, Recording, Assignment, GroupProject } from '@/lib/types';

export default async function AdminCourseDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: course } = await supabase.from('courses').select('*').eq('id', params.id).single();
  if (!course) notFound();

  const [{ data: modules }, { data: recordings }, { data: assignments }, { data: projects }] =
    await Promise.all([
      supabase.from('course_modules').select('*').eq('course_id', params.id).order('position'),
      supabase.from('recordings').select('*').eq('course_id', params.id).order('position'),
      supabase.from('assignments').select('*').eq('course_id', params.id).order('due_at'),
      supabase.from('group_projects').select('*').eq('course_id', params.id).order('due_at'),
    ]);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href="/admin/courses" className="inline-flex items-center gap-1.5 text-sm text-navy-600 hover:text-navy-900">
        <ArrowLeft size={16} /> Back to courses
      </Link>

      <h1 className="text-2xl font-bold text-navy-900">{(course as Course).title}</h1>

      <CourseDetailsForm course={course as Course} />
      <ModulesManager courseId={params.id} initialModules={(modules ?? []) as CourseModule[]} />
      <RecordingsManager
        courseId={params.id}
        modules={(modules ?? []) as CourseModule[]}
        initialRecordings={(recordings ?? []) as Recording[]}
      />
      <AssignmentsManager
        courseId={params.id}
        modules={(modules ?? []) as CourseModule[]}
        initialAssignments={(assignments ?? []) as Assignment[]}
      />
      <GroupProjectsManager courseId={params.id} initialProjects={(projects ?? []) as GroupProject[]} />
    </div>
  );
}
