import Link from 'next/link';
import { ArrowRight, Boxes, Award, Users, Clock3, Wrench, MessageCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CourseCard from '@/components/CourseCard';
import { createClient } from '@/lib/supabase/server';
import type { Course } from '@/lib/types';

const FEATURES = [
  {
    icon: Wrench,
    title: 'Hands-on, project-based',
    desc: 'Every module is built around real engineering problems, not just theory slides.',
  },
  {
    icon: Boxes,
    title: 'Industry-relevant curriculum',
    desc: 'FEA, CFD, and Advanced Computational Solid Mechanics, taught the way practising engineers use them.',
  },
  {
    icon: Clock3,
    title: 'Learn at your pace',
    desc: 'Every class is recorded and stays on your dashboard — revisit any lesson whenever you need to.',
  },
  {
    icon: Users,
    title: 'Active learner community',
    desc: 'Join a WhatsApp community of fellow learners for support, discussion, and accountability.',
  },
  {
    icon: Award,
    title: 'Assignments & group projects',
    desc: 'Practice what you learn with graded assignments and collaborative group projects.',
  },
  {
    icon: MessageCircle,
    title: 'Direct instructor feedback',
    desc: 'Get your assignments and projects graded with real, specific feedback — not just a score.',
  },
];

const STEPS = [
  { step: '1', title: 'Browse courses', desc: 'Explore the catalogue and pick the course that matches your goals.' },
  { step: '2', title: 'Create an account', desc: 'Sign up in seconds with email or Google.' },
  { step: '3', title: 'Enroll & pay securely', desc: 'Pay online via Paystack — cards, bank transfer, or USSD.' },
  { step: '4', title: 'Start learning', desc: 'Get instant access to recordings, assignments, and projects.' },
];

const FAQS = [
  {
    q: 'Do I need prior Ansys experience?',
    a: 'No — the foundational courses start from first principles. Some familiarity with mechanics of materials is helpful but not required.',
  },
  {
    q: 'How is each course delivered?',
    a: 'Live tutorial sessions are recorded and uploaded to your personal learning dashboard, alongside assignments and group projects, so you can learn at your own pace.',
  },
  {
    q: 'How do I enroll?',
    a: 'Create a free account, open the course you want, and pay securely with Paystack. You get access immediately after payment is confirmed.',
  },
  {
    q: 'Who is this for?',
    a: 'Mechanical, aerospace, civil, biomedical, and automotive engineering students and professionals who want practical, job-ready simulation skills.',
  },
];

export default async function LandingPage() {
  const supabase = createClient();
  const { data: courses } = await supabase
    .from('courses')
    .select('*')
    .eq('is_published', true)
    .order('position', { ascending: true })
    .limit(6);

  const featuredCourses = (courses ?? []) as Course[];

  return (
    <main>
      <Navbar />

      {/* Hero */}
      <section
        id="hero"
        className="relative bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 text-white overflow-hidden"
      >
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div className="relative max-w-5xl mx-auto px-5 sm:px-8 py-24 sm:py-32 text-center">
          <p className="uppercase tracking-widest text-navy-300 text-xs sm:text-sm mb-4">
            Mastermind Learning
          </p>
          <h1 className="text-4xl sm:text-6xl font-bold leading-tight">
            Master{' '}
            <span className="bg-gradient-to-r from-sky-300 to-white bg-clip-text text-transparent">
              Structural, Fluid
            </span>{' '}
            &amp;{' '}
            <span className="bg-gradient-to-r from-sky-300 to-white bg-clip-text text-transparent">
              Computational Solid Mechanics
            </span>{' '}
            Simulation
          </h1>
          <p className="mt-6 text-navy-100 text-base sm:text-lg max-w-2xl mx-auto">
            Practical, project-based Ansys simulation courses — designed to take
            engineering professionals and students from fundamentals to real,
            job-ready competency.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/courses"
              className="w-full sm:w-auto bg-white text-navy-950 font-semibold px-7 py-3.5 rounded-lg hover:bg-navy-100 transition-colors inline-flex items-center justify-center gap-2"
            >
              Browse Courses <ArrowRight size={18} />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto border border-navy-500 text-white px-7 py-3.5 rounded-lg hover:bg-navy-800 transition-colors"
            >
              Already Enrolled? Log In
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-3 gap-6 max-w-md mx-auto">
            <div>
              <p className="text-3xl sm:text-4xl font-bold">{featuredCourses.length || 3}+</p>
              <p className="text-navy-300 text-xs sm:text-sm mt-1">Courses</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-bold">50+</p>
              <p className="text-navy-300 text-xs sm:text-sm mt-1">Hours</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-bold">100%</p>
              <p className="text-navy-300 text-xs sm:text-sm mt-1">Practical</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured courses */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-20 sm:py-28">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-navy-900">Our Courses</h2>
            <p className="mt-3 text-navy-600 max-w-2xl">
              Pick a course, enroll securely online, and start learning today.
            </p>
          </div>
          <Link
            href="/courses"
            className="hidden sm:inline-block text-sm font-semibold text-navy-700 hover:underline whitespace-nowrap"
          >
            View all courses →
          </Link>
        </div>

        {featuredCourses.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="text-center border border-dashed border-navy-200 rounded-2xl py-16 text-navy-500">
            Courses are being finalised — check back soon.
          </div>
        )}
      </section>

      {/* Features */}
      <section className="py-20 sm:py-28" style={{ backgroundColor: '#f5f7fa' }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 text-center mb-14">
            Why Learn With Us
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-white border border-navy-100 rounded-2xl p-7 card-hover">
                <div className="bg-navy-900 text-white w-12 h-12 rounded-xl flex items-center justify-center mb-5">
                  <f.icon size={22} />
                </div>
                <h3 className="font-semibold text-lg text-navy-900">{f.title}</h3>
                <p className="text-navy-600 text-sm mt-3">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="max-w-5xl mx-auto px-5 sm:px-8 py-20 sm:py-28">
        <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 text-center mb-14">
          How It Works
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {STEPS.map((s) => (
            <div key={s.step} className="text-center">
              <div className="w-11 h-11 rounded-full bg-navy-900 text-white font-bold flex items-center justify-center mx-auto mb-4">
                {s.step}
              </div>
              <h3 className="font-semibold text-navy-900">{s.title}</h3>
              <p className="text-sm text-navy-600 mt-2">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-navy-950 text-white py-20 sm:py-28">
        <div className="max-w-3xl mx-auto px-5 sm:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {FAQS.map((f) => (
              <details key={f.q} className="border border-navy-700 rounded-xl p-5 group">
                <summary className="font-semibold cursor-pointer list-none flex justify-between items-center">
                  {f.q}
                  <span className="text-navy-400 group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="text-navy-200 text-sm mt-3">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-white py-20 sm:py-24 text-center px-5">
        <h2 className="text-3xl sm:text-4xl font-bold text-navy-900">
          Ready to build real simulation skills?
        </h2>
        <Link
          href="/courses"
          className="inline-flex items-center gap-2 mt-8 bg-navy-950 text-white font-semibold px-8 py-4 rounded-lg hover:bg-navy-800 transition-colors"
        >
          Browse Courses <ArrowRight size={18} />
        </Link>
      </section>

      <Footer />
    </main>
  );
}
