'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, GraduationCap } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Home', href: '#hero' },
  { label: 'Programme', href: '#versatility' },
  { label: 'Curriculum', href: '#curriculum' },
  { label: 'FAQ', href: '#faq' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-navy-950/95 backdrop-blur border-b border-navy-800">
      <nav className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-white font-bold">
          <span className="bg-white text-navy-950 rounded-lg p-1.5">
            <GraduationCap size={20} />
          </span>
          <span className="leading-tight">
            <span className="block text-sm tracking-wide">MASTERMIND</span>
            <span className="block text-[10px] text-navy-300 tracking-widest">LEARNING</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-navy-100 hover:text-white transition-colors"
            >
              {link.label}
            </a>
          ))}
          <Link
            href="/login"
            className="text-sm text-navy-100 hover:text-white transition-colors"
          >
            Login
          </Link>
          <Link
            href="/request-access"
            className="bg-white text-navy-950 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-navy-100 transition-colors"
          >
            Request Access
          </Link>
        </div>

        {/* Hamburger button (mobile only) */}
        <button
          type="button"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          className="md:hidden text-white p-2 -mr-2"
        >
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </nav>

      {/* Mobile slide-down menu */}
      {open && (
        <div className="md:hidden bg-navy-950 border-t border-navy-800 px-5 py-4 flex flex-col gap-1">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="text-navy-100 hover:text-white py-3 text-base border-b border-navy-800/60"
            >
              {link.label}
            </a>
          ))}
          <Link
            href="/login"
            onClick={() => setOpen(false)}
            className="text-navy-100 hover:text-white py-3 text-base border-b border-navy-800/60"
          >
            Login
          </Link>
          <Link
            href="/request-access"
            onClick={() => setOpen(false)}
            className="bg-white text-navy-950 font-semibold text-center px-4 py-3 rounded-lg mt-3"
          >
            Request Access
          </Link>
        </div>
      )}
    </header>
  );
}
