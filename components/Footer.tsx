import Link from 'next/link';
import { GraduationCap } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-navy-950 text-navy-300 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-2 text-white font-bold mb-4">
            <span className="bg-white text-navy-950 rounded-lg p-1.5">
              <GraduationCap size={18} />
            </span>
            <span className="leading-tight">
              <span className="block text-sm tracking-wide">MASTERMIND</span>
              <span className="block text-[10px] text-navy-400 tracking-widest">LEARNING</span>
            </span>
          </div>
          <p className="text-sm text-navy-400">
            Practical, project-based Ansys simulation training for engineers who want
            job-ready skills.
          </p>
        </div>

        <div>
          <h4 className="text-white font-semibold text-sm mb-4">Learn</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/courses" className="hover:text-white">Browse courses</Link></li>
            <li><Link href="/signup" className="hover:text-white">Create account</Link></li>
            <li><Link href="/login" className="hover:text-white">Log in</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold text-sm mb-4">Programme</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="/#how-it-works" className="hover:text-white">How it works</a></li>
            <li><a href="/#faq" className="hover:text-white">FAQ</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold text-sm mb-4">Contact</h4>
          <p className="text-sm text-navy-400">
            Join our WhatsApp community for updates, cohort dates, and support — the
            floating button on any page will take you there.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 sm:px-8 mt-12 pt-6 border-t border-navy-800 text-xs text-navy-500 text-center">
        &copy; {new Date().getFullYear()} Ansys Simulation Mastery. All rights reserved.
      </div>
    </footer>
  );
}
