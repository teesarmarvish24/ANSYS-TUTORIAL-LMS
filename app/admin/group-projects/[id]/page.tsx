import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import GroupsManager from '@/components/admin/GroupsManager';
import type { GroupProject } from '@/lib/types';

export default async function AdminGroupProjectPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: project } = await supabase.from('group_projects').select('*').eq('id', params.id).single();
  if (!project) notFound();
  const typedProject = project as GroupProject;

  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('user_id, profile:profiles(id, full_name, email)')
    .eq('course_id', typedProject.course_id)
    .eq('status', 'active');

  const enrolledStudents = (enrollments ?? [])
    .map((e) => e.profile as unknown as { id: string; full_name: string | null; email: string } | null)
    .filter(Boolean) as { id: string; full_name: string | null; email: string }[];

  const { data: groups } = await supabase
    .from('project_groups')
    .select('id, name')
    .eq('group_project_id', params.id);

  const groupIds = (groups ?? []).map((g) => g.id);

  const [{ data: memberRows }, { data: submissionRows }] = await Promise.all([
    groupIds.length
      ? supabase
          .from('project_group_members')
          .select('group_id, student_id, profile:profiles(id, full_name, email)')
          .in('group_id', groupIds)
      : Promise.resolve({ data: [] }),
    groupIds.length
      ? supabase.from('project_submissions').select('*').in('group_id', groupIds)
      : Promise.resolve({ data: [] }),
  ]);

  const membersByGroup = new Map<string, { id: string; full_name: string | null; email: string }[]>();
  for (const row of memberRows ?? []) {
    const profile = row.profile as unknown as { id: string; full_name: string | null; email: string } | null;
    if (!profile) continue;
    if (!membersByGroup.has(row.group_id)) membersByGroup.set(row.group_id, []);
    membersByGroup.get(row.group_id)!.push(profile);
  }

  const submissionByGroup = new Map((submissionRows ?? []).map((s) => [s.group_id, s]));

  const groupsWithMembers = (groups ?? []).map((g) => ({
    id: g.id,
    name: g.name,
    members: membersByGroup.get(g.id) ?? [],
    submission: submissionByGroup.get(g.id) ?? null,
  }));

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        href={`/admin/courses/${typedProject.course_id}`}
        className="inline-flex items-center gap-1.5 text-sm text-navy-600 hover:text-navy-900"
      >
        <ArrowLeft size={16} /> Back to course
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-navy-900">{typedProject.title}</h1>
        <p className="text-navy-500 mt-1">Manage groups, members, and grade submissions.</p>
      </div>

      <GroupsManager
        groupProjectId={params.id}
        maxScore={typedProject.max_score}
        enrolledStudents={enrolledStudents}
        initialGroups={groupsWithMembers}
      />
    </div>
  );
}
