import { notFound } from 'next/navigation';
import { CheckCircle2, Clock, BarChart3, Layers } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import EnrollButton from '@/components/EnrollButton';
import { createClient } from '@/lib/supabase/server';
import { formatNaira } from '@/lib/format';
import type { Course, CourseModule } from '@/lib/types';

export default async function CourseDetailPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();

  const { data: course } = await supabase
    .from('courses')
    .select('*')
    .eq('slug', params.slug)
    .eq('is_published', true)
    .single();

  if (!course) notFound();

  const typedCourse = course as Course;

  const { data: modules } = await supabase
    .from('course_modules')
    .select('*')
    .eq('course_id', typedCourse.id)
    .order('position', { ascending: true });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isEnrolled = false;
  if (user) {
    const { data: enrollment } = await supabase
      .from('enrollments')
      .select('status')
      .eq('user_id', user.id)
      .eq('course_id', typedCourse.id)
      .maybeSingle();
    isEnrolled = enrollment?.status === 'active';
  }

  return (
    <main>
      <Navbar />

      <section className="bg-gradient-to-br from-navy-950 to-navy-800 text-white">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
          <span className="bg-white/10 text-navy-100 text-xs font-semibold px-3 py-1 rounded-full">
            {typedCourse.level}
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold mt-5 max-w-3xl">{typedCourse.title}</h1>
          {typedCourse.subtitle && (
            <p className="mt-4 text-navy-200 text-lg max-w-2xl">{typedCourse.subtitle}</p>
          )}
          <div className="flex flex-wrap items-center gap-6 mt-8 text-sm text-navy-200">
            {typedCourse.duration_hours != null && (
              <span className="flex items-center gap-2">
                <Clock size={16} /> {typedCourse.duration_hours} hours of content
              </span>
            )}
            <span className="flex items-center gap-2">
              <BarChart3 size={16} /> {typedCourse.level} level
            </span>
            <span className="flex items-center gap-2">
              <Layers size={16} /> {modules?.length ?? 0} modules
            </span>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-5 sm:px-8 py-16 grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-10">
          {typedCourse.description && (
            <div>
              <h2 className="text-xl font-bold text-navy-900 mb-3">About this course</h2>
              <p className="text-navy-600 whitespace-pre-line leading-relaxed">
                {typedCourse.description}
              </p>
            </div>
          )}

          {modules && modules.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-navy-900 mb-4">Curriculum</h2>
              <ul className="space-y-3">
                {(modules as CourseModule[]).map((mod, i) => (
                  <li
                    key={mod.id}
                    className="flex items-center gap-3 border border-navy-100 rounded-xl px-4 py-3.5"
                  >
                    <span className="w-8 h-8 rounded-full bg-navy-100 text-navy-800 text-sm font-semibold flex items-center justify-center flex-shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-navy-800 font-medium">{mod.title}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <h2 className="text-xl font-bold text-navy-900 mb-4">What&apos;s included</h2>
            <ul className="grid sm:grid-cols-2 gap-3">
              {[
                'Recorded video lessons',
                'Graded assignments',
                'Collaborative group projects',
                'Progress analytics on your dashboard',
                'Course announcements',
                'WhatsApp learner community',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-navy-700">
                  <CheckCircle2 size={18} className="text-navy-700 flex-shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div>
          <div className="sticky top-24 border border-navy-100 rounded-2xl p-6 shadow-sm">
            <p className="text-3xl font-bold text-navy-950">
              {typedCourse.price_kobo > 0 ? formatNaira(typedCourse.price_kobo) : 'Free'}
            </p>
            <p className="text-sm text-navy-500 mt-1">One-time payment · lifetime access</p>
            <div className="mt-6">
              <EnrollButton
                courseId={typedCourse.id}
                courseSlug={typedCourse.slug}
                isFree={typedCourse.price_kobo <= 0}
                isLoggedIn={!!user}
                isEnrolled={isEnrolled}
              />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
