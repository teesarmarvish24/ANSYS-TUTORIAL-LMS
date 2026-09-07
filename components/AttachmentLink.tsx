'use client';

import { useEffect, useState } from 'react';
import { Paperclip, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function AttachmentLink({
  path,
  label = 'View attachment',
}: {
  path: string;
  label?: string;
}) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();
    supabase.storage
      .from('attachments')
      .createSignedUrl(path, 3600)
      .then(({ data }) => {
        if (!cancelled && data) setUrl(data.signedUrl);
      });
    return () => {
      cancelled = true;
    };
  }, [path]);

  if (!url) {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm text-navy-400">
        <Loader2 size={14} className="animate-spin" /> Loading attachment…
      </span>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-sm font-medium text-navy-700 hover:underline"
    >
      <Paperclip size={14} /> {label}
    </a>
  );
}
