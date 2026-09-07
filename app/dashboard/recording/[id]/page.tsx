import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import TimeTracker from '@/components/TimeTracker';
import { getEmbedUrl, isDirectVideoFile } from '@/lib/video';
import type { Recording, Course } from '@/lib/types';

export default async function RecordingPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: recording } = await supabase
    .from('recordings')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!recording) notFound();
  const typedRecording = recording as Recording;

  const { data: course } = await supabase
    .from('courses')
    .select('id, slug, title')
    .eq('id', typedRecording.course_id)
    .single();
  const typedCourse = course as Pick<Course, 'id' | 'slug' | 'title'> | null;

  const direct = isDirectVideoFile(typedRecording.video_url);

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <Link
        href={typedCourse ? `/dashboard/courses/${typedCourse.slug}` : '/dashboard/courses'}
        className="inline-flex items-center gap-1.5 text-sm text-navy-600 hover:text-navy-900"
      >
        <ArrowLeft size={16} /> Back to {typedCourse?.title ?? 'course'}
      </Link>

      <h1 className="text-2xl font-bold text-navy-900">{typedRecording.title}</h1>

      <div className="aspect-video bg-black rounded-2xl overflow-hidden">
        {direct ? (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <video src={typedRecording.video_url} controls className="w-full h-full" />
        ) : (
          <iframe
            src={getEmbedUrl(typedRecording.video_url)}
            title={typedRecording.title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}
      </div>

      {typedRecording.description && (
        <p className="text-navy-600 whitespace-pre-line">{typedRecording.description}</p>
      )}

      <TimeTracker recordingId={typedRecording.id} courseId={typedRecording.course_id} />
    </div>
  );
}
