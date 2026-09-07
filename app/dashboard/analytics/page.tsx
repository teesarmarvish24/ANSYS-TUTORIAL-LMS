import { BarChart3, Clock3, PlayCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import EmptyState from '@/components/EmptyState';
import StatCard from '@/components/StatCard';
import { formatSeconds } from '@/lib/format';

export default async function AnalyticsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: logs } = await supabase
    .from('recording_time_logs')
    .select('seconds_watched, course:courses(title), recording:recordings(title)')
    .eq('student_id', user!.id);

  const rows = logs ?? [];
  const totalSeconds = rows.reduce((sum, r) => sum + r.seconds_watched, 0);

  const byCourse = new Map<string, number>();
  for (const row of rows) {
    const title = (row.course as unknown as { title: string } | null)?.title ?? 'Unknown course';
    byCourse.set(title, (byCourse.get(title) ?? 0) + row.seconds_watched);
  }
  const courseBreakdown = Array.from(byCourse.entries()).sort((a, b) => b[1] - a[1]);
  const maxCourseSeconds = Math.max(1, ...courseBreakdown.map(([, s]) => s));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">My Analytics</h1>
        <p className="text-navy-500 mt-1">How much time you&apos;ve spent watching course recordings.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <StatCard icon={Clock3} label="Total watch time" value={formatSeconds(totalSeconds)} />
        <StatCard icon={PlayCircle} label="Courses watched" value={courseBreakdown.length} />
      </div>

      {courseBreakdown.length > 0 ? (
        <div className="bg-white border border-navy-100 rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-navy-900">Time by course</h2>
          {courseBreakdown.map(([title, seconds]) => (
            <div key={title}>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-navy-800">{title}</span>
                <span className="text-navy-500">{formatSeconds(seconds)}</span>
              </div>
              <div className="h-2 bg-navy-50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-navy-900 rounded-full"
                  style={{ width: `${(seconds / maxCourseSeconds) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={BarChart3}
          title="No activity yet"
          description="Start watching a recording and your progress will show up here."
        />
      )}
    </div>
  );
}
