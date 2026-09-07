import { createClient } from '@/lib/supabase/server';
import AnnouncementsManager from '@/components/admin/AnnouncementsManager';
import type { Course } from '@/lib/types';

export default async function AdminAnnouncementsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: announcements }, { data: courses }] = await Promise.all([
    supabase.from('announcements').select('*').order('created_at', { ascending: false }),
    supabase.from('courses').select('*').order('position'),
  ]);

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Announcements</h1>
        <p className="text-navy-500 mt-1">Post updates to all students or to one course.</p>
      </div>
      <AnnouncementsManager
        initialAnnouncements={announcements ?? []}
        courses={(courses ?? []) as Course[]}
        userId={user!.id}
      />
    </div>
  );
}
