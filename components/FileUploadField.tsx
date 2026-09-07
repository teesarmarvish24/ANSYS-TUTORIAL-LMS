'use client';

import { useRef, useState } from 'react';
import { Paperclip, Loader2, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function FileUploadField({
  pathPrefix,
  value,
  onChange,
  accept,
}: {
  pathPrefix: string;
  value: string | null;
  onChange: (path: string | null) => void;
  accept?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError('');
    const supabase = createClient();
    const path = `${pathPrefix}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

    const { error: uploadError } = await supabase.storage
      .from('attachments')
      .upload(path, file, { upsert: true });

    setUploading(false);

    if (uploadError) {
      setError('Upload failed. Please try again.');
      return;
    }
    onChange(path);
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      {value ? (
        <div className="flex items-center gap-2 text-sm border border-navy-200 rounded-lg px-3 py-2">
          <Paperclip size={16} className="text-navy-500 flex-shrink-0" />
          <span className="text-navy-700 truncate flex-1">{value.split('/').pop()}</span>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-navy-400 hover:text-red-600"
            aria-label="Remove attachment"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full flex items-center justify-center gap-2 border border-dashed border-navy-300 rounded-lg py-2.5 text-sm text-navy-600 hover:bg-navy-50 disabled:opacity-60"
        >
          {uploading ? <Loader2 size={16} className="animate-spin" /> : <Paperclip size={16} />}
          {uploading ? 'Uploading…' : 'Attach a file'}
        </button>
      )}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
