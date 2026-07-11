import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient, getCurrentProfile } from '@/lib/supabase/server';
import DashboardShell from '@/components/DashboardShell';
import TimeTracker from '@/components/TimeTracker';

const NAV_ITEMS = [{ label: 'Overview', href: '/dashboard' }];

function toEmbedUrl(url: string): { type: 'iframe' | 'video'; src: string } {
  const youtubeMatch = url.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=|youtube\.com\/embed\/)([\w-]+)/);
  if (youtubeMatch) {
    return { type: 'iframe', src: `https://www.youtube.com/embed/${youtubeMatch[1]}` };
  }
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return { type: 'iframe', src: `https://player.vimeo.com/video/${vimeoMatch[1]}` };
  }
  return { type: 'video', src: url };
}

export default async function RecordingPage({ params }: { params: { id: string } }) {
  const profile = await getCurrentProfile();
  const supabase = createClient();

  const { data: recording } = await supabase
    .from('recordings')
    .select('*, modules(slug, title)')
    .eq('id', params.id)
    .single();

  if (!recording) notFound();

  const embed = toEmbedUrl(recording.video_url);

  return (
    <DashboardShell navItems={NAV_ITEMS} userLabel={profile?.full_name ?? ''}>
      <TimeTracker moduleId={recording.module_id} />
      <Link
        href={`/dashboard/module/${recording.modules?.slug}`}
        className="text-sm text-navy-700 hover:underline"
      >
        ← Back to {recording.modules?.title}
      </Link>

      <h1 className="text-2xl font-bold text-navy-900 mt-3">{recording.title}</h1>

      <div className="mt-6 aspect-video bg-black rounded-xl overflow-hidden">
        {embed.type === 'iframe' ? (
          <iframe
            src={embed.src}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <video src={embed.src} controls className="w-full h-full" />
        )}
      </div>

      {recording.description && (
        <p className="text-gray-600 mt-5">{recording.description}</p>
      )}
    </DashboardShell>
  );
}
