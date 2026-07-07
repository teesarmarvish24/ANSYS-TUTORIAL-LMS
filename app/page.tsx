import Link from 'next/link';
import { Boxes, Waves, Cpu, ArrowRight } from 'lucide-react';
import Navbar from '@/components/Navbar';

const MODULES = [
  {
    icon: Boxes,
    title: 'FEA — Finite Element Analysis',
    description:
      'Build a rigorous foundation in structural simulation: meshing strategy, boundary conditions, static/linear analysis, and result interpretation in Ansys.',
    outcomes: [
      'Set up and mesh real geometries confidently',
      'Interpret stress, strain, and deformation results',
      'Validate simulation results against hand calculations',
    ],
  },
  {
    icon: Waves,
    title: 'CFD — Computational Fluid Dynamics',
    description:
      'Move into fluid systems: turbulence modelling, boundary layer behaviour, and practical CFD workflows for real engineering problems.',
    outcomes: [
      'Configure and run fluid flow simulations in Ansys Fluent',
      'Choose appropriate turbulence models for a given problem',
      'Post-process and communicate CFD findings clearly',
    ],
  },
  {
    icon: Cpu,
    title: 'Advanced FEA — Computational Solid Mechanics',
    description:
      'Go beyond linear-elastic assumptions into nonlinear material behaviour, large deformation, and advanced computational solid mechanics techniques.',
    outcomes: [
      'Model nonlinear materials and large-deformation problems',
      'Apply advanced solver settings and convergence strategies',
      'Tackle contact, plasticity, and complex loading scenarios',
    ],
  },
];

const FAQS = [
  {
    q: 'Do I need prior Ansys experience?',
    a: 'No — the FEA module starts from first principles. Some familiarity with mechanics of materials and basic mechanical engineering concepts is helpful but not required.',
  },
  {
    q: 'How is the programme delivered?',
    a: 'Live tutorial sessions are recorded and uploaded to your personal learning dashboard, so you can revisit any class at your own pace after enrollment.',
  },
  {
    q: 'How do I enroll?',
    a: 'Submit a request through the "Request Access" form. Once your commitment fee is confirmed, you will receive your login details by email.',
  },
  {
    q: 'Who is this programme for?',
    a: 'Mechanical, aerospace, civil, biomedical, and automotive engineering students and professionals who want practical, job-ready simulation skills.',
  },
];

export default function LandingPage() {
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
            Ansys Simulation Mastery
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
            A comprehensive programme spanning FEA, CFD, and Advanced Computational
            Solid Mechanics — designed to take engineering professionals and students
            from fundamentals to real, practical Ansys competency.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/request-access"
              className="w-full sm:w-auto bg-white text-navy-950 font-semibold px-7 py-3.5 rounded-lg hover:bg-navy-100 transition-colors inline-flex items-center justify-center gap-2"
            >
              Request Enrollment <ArrowRight size={18} />
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
              <p className="text-3xl sm:text-4xl font-bold">3</p>
              <p className="text-navy-300 text-xs sm:text-sm mt-1">Modules</p>
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

      {/* Versatility section */}
      <section id="versatility" className="max-w-7xl mx-auto px-5 sm:px-8 py-20 sm:py-28">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-navy-900">
            One Programme. Three Simulation Domains.
          </h2>
          <p className="mt-4 text-navy-600">
            This is what makes the programme versatile — it takes you from structural
            fundamentals, through fluid systems, to advanced nonlinear solid mechanics,
            applicable across mechanical, aerospace, civil, biomedical, and automotive
            engineering.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {MODULES.map((mod) => (
            <div
              key={mod.title}
              className="border border-navy-100 rounded-2xl p-7 hover:shadow-lg transition-shadow bg-white"
            >
              <div className="bg-navy-900 text-white w-12 h-12 rounded-xl flex items-center justify-center mb-5">
                <mod.icon size={22} />
              </div>
              <h3 className="font-semibold text-lg text-navy-900">{mod.title}</h3>
              <p className="text-navy-600 text-sm mt-3">{mod.description}</p>
              <ul className="mt-4 space-y-2">
                {mod.outcomes.map((o) => (
                  <li key={o} className="text-sm text-navy-700 flex gap-2">
                    <span className="text-navy-400 mt-0.5">•</span>
                    <span>{o}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-navy-50 bg-opacity-40 py-20 sm:py-28" style={{ backgroundColor: '#f5f7fa' }}>
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 text-center mb-14">
            How It Works
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Request Access', desc: 'Fill out the enrollment request form.' },
              { step: '2', title: 'Pay Commitment Fee', desc: 'Confirm your seat with the programme fee.' },
              { step: '3', title: 'Get Enrolled', desc: 'Receive your personal login details by email.' },
              { step: '4', title: 'Start Learning', desc: 'Access every class recording on your dashboard.' },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-11 h-11 rounded-full bg-navy-900 text-white font-bold flex items-center justify-center mx-auto mb-4">
                  {s.step}
                </div>
                <h3 className="font-semibold text-navy-900">{s.title}</h3>
                <p className="text-sm text-navy-600 mt-2">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Curriculum */}
      <section id="curriculum" className="max-w-4xl mx-auto px-5 sm:px-8 py-20 sm:py-28">
        <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 text-center mb-12">
          Curriculum Overview
        </h2>
        <div className="space-y-4">
          {MODULES.map((mod) => (
            <details
              key={mod.title}
              className="border border-navy-100 rounded-xl p-5 group open:bg-navy-50"
            >
              <summary className="font-semibold text-navy-900 cursor-pointer list-none flex justify-between items-center">
                {mod.title}
                <span className="text-navy-400 group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="text-navy-600 text-sm mt-3">{mod.description}</p>
            </details>
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
              <details
                key={f.q}
                className="border border-navy-700 rounded-xl p-5 group"
              >
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

      {/* Footer */}
      <footer className="bg-navy-900 text-navy-300 py-10">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm">
          <p>&copy; {new Date().getFullYear()} Ansys Simulation Mastery. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/login" className="hover:text-white">Login</Link>
            <Link href="/request-access" className="hover:text-white">Request Access</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
