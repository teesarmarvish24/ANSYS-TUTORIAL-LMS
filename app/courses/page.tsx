import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CourseCard from '@/components/CourseCard';
import { createClient } from '@/lib/supabase/server';
import type { Course } from '@/lib/types';

export const metadata = { title: 'Courses | Ansys Simulation Mastery' };

export default async function CoursesPage() {
  const supabase = createClient();
  const { data: courses } = await supabase
    .from('courses')
    .select('*')
    .eq('is_published', true)
    .order('position', { ascending: true });

  const list = (courses ?? []) as Course[];

  return (
    <main>
      <Navbar />
      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h1 className="text-3xl sm:text-4xl font-bold text-navy-900">All Courses</h1>
          <p className="mt-4 text-navy-600">
            Practical, project-based Ansys simulation courses. Enroll online and start
            learning immediately.
          </p>
        </div>

        {list.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {list.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="text-center border border-dashed border-navy-200 rounded-2xl py-16 text-navy-500">
            Courses are being finalised — check back soon.
          </div>
        )}
      </section>
      <Footer />
    </main>
  );
}
