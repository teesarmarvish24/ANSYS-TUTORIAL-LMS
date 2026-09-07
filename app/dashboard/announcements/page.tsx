import { Megaphone } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import EmptyState from '@/components/EmptyState';
import { formatDateTime } from '@/lib/format';

export default async function AnnouncementsPage() {
  const supabase = createClient();
  const { data: announcements } = await supabase
    .from('announcements')
    .select('*, course:courses(title)')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Announcements</h1>
        <p className="text-navy-500 mt-1">Updates from the programme and your courses.</p>
      </div>

      {announcements && announcements.length > 0 ? (
        <div className="space-y-4">
          {announcements.map((a) => {
            const course = a.course as unknown as { title: string } | null;
            return (
              <div key={a.id} className="bg-white border border-navy-100 rounded-2xl p-6">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <h2 className="font-semibold text-navy-900">{a.title}</h2>
                  <span className="text-xs text-navy-500">{formatDateTime(a.created_at)}</span>
                </div>
                {course && (
                  <span className="inline-block mt-1.5 text-xs font-semibold text-navy-600 bg-navy-50 px-2 py-0.5 rounded-full">
                    {course.title}
                  </span>
                )}
                <p className="text-navy-600 text-sm mt-3 whitespace-pre-line">{a.body}</p>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState icon={Megaphone} title="No announcements yet" />
      )}
    </div>
  );
}
