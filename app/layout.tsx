import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Ansys Simulation Mastery | Mastermind Learning',
  description:
    'A comprehensive programme covering FEA, CFD, and Advanced Computational Solid Mechanics using Ansys — designed for engineering professionals and students.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-navy-900 antialiased">{children}</body>
    </html>
  );
}
