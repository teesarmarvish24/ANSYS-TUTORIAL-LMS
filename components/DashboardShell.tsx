'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, LogOut, GraduationCap } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface NavItem {
  label: string;
  href: string;
}

export default function DashboardShell({
  children,
  navItems,
  userLabel,
}: {
  children: React.ReactNode;
  navItems: NavItem[];
  userLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex md:flex-col w-64 bg-navy-950 text-white shrink-0">
        <div className="h-16 flex items-center gap-2 px-6 border-b border-navy-800">
          <span className="bg-white text-navy-950 rounded-lg p-1.5">
            <GraduationCap size={18} />
          </span>
          <span className="font-bold text-sm">Ansys Mastery</span>
        </div>
        <nav className="flex-1 px-3 py-6 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-3 py-2.5 rounded-lg text-sm ${
                pathname === item.href
                  ? 'bg-navy-800 text-white'
                  : 'text-navy-200 hover:bg-navy-900'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-navy-800">
          <p className="text-xs text-navy-300 truncate mb-2">{userLabel}</p>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-navy-200 hover:text-white"
          >
            <LogOut size={16} /> Log out
          </button>
        </div>
      </aside>

      {/* Mobile topbar + slide menu */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden h-16 bg-navy-950 text-white flex items-center justify-between px-5 sticky top-0 z-40">
          <span className="font-bold text-sm">Ansys Mastery</span>
          <button
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>

        {open && (
          <div className="md:hidden bg-navy-950 text-white px-5 py-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`block px-3 py-2.5 rounded-lg text-sm ${
                  pathname === item.href ? 'bg-navy-800' : 'text-navy-200'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-navy-200 py-2.5"
            >
              <LogOut size={16} /> Log out
            </button>
          </div>
        )}

        <main className="flex-1 p-5 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
