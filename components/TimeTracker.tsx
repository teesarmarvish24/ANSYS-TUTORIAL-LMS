'use client';

import { useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

const HEARTBEAT_SECONDS = 20;

// Silently accumulates today's watch-time for one recording. Renders nothing.
// Pauses counting when the browser tab is hidden/backgrounded.
export default function TimeTracker({
  recordingId,
  courseId,
}: {
  recordingId: string;
  courseId: string;
}) {
  const activeRef = useRef(true);

  useEffect(() => {
    function handleVisibility() {
      activeRef.current = document.visibilityState === 'visible';
    }
    document.addEventListener('visibilitychange', handleVisibility);

    const today = new Date().toISOString().slice(0, 10);

    const interval = setInterval(async () => {
      if (!activeRef.current) return;

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: existing } = await supabase
        .from('recording_time_logs')
        .select('seconds_watched')
        .eq('student_id', user.id)
        .eq('recording_id', recordingId)
        .eq('log_date', today)
        .maybeSingle();

      const newTotal = (existing?.seconds_watched ?? 0) + HEARTBEAT_SECONDS;

      await supabase.from('recording_time_logs').upsert(
        {
          student_id: user.id,
          recording_id: recordingId,
          course_id: courseId,
          log_date: today,
          seconds_watched: newTotal,
        },
        { onConflict: 'student_id,recording_id,log_date' }
      );
    }, HEARTBEAT_SECONDS * 1000);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [recordingId, courseId]);

  return null;
}
