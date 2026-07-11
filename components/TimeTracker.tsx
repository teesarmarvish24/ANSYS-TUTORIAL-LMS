'use client';

import { useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

const HEARTBEAT_SECONDS = 20;

// Silently accumulates time-on-module for analytics. Renders nothing.
// Pauses counting when the browser tab is hidden/backgrounded.
export default function TimeTracker({ moduleId }: { moduleId: string }) {
  const activeRef = useRef(true);

  useEffect(() => {
    function handleVisibility() {
      activeRef.current = document.visibilityState === 'visible';
    }
    document.addEventListener('visibilitychange', handleVisibility);

    const interval = setInterval(async () => {
      if (!activeRef.current) return;

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: existing } = await supabase
        .from('module_time_tracking')
        .select('total_seconds')
        .eq('student_id', user.id)
        .eq('module_id', moduleId)
        .maybeSingle();

      const newTotal = (existing?.total_seconds ?? 0) + HEARTBEAT_SECONDS;

      await supabase.from('module_time_tracking').upsert(
        {
          student_id: user.id,
          module_id: moduleId,
          total_seconds: newTotal,
          last_active_at: new Date().toISOString(),
        },
        { onConflict: 'student_id,module_id' }
      );
    }, HEARTBEAT_SECONDS * 1000);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [moduleId]);

  return null;
}
