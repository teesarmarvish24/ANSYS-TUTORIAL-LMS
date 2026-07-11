'use client';

import { useState } from 'react';
import type { Module, Profile } from '@/lib/types';

interface TrackingRow {
  student_id: string;
  module_id: string;
  total_seconds: number;
  last_active_at: string;
  profiles?: Profile;
  modules?: Module;
}

function formatDuration(seconds: number) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hrs > 0) return `${hrs}h ${mins}m`;
  if (mins > 0) return `${mins}m`;
  return `${seconds}s`;
}

export default function AnalyticsDashboard({
  tracking,
  modules,
}: {
  tracking: TrackingRow[];
  modules: Module[];
}) {
  const [moduleFilter, setModuleFilter] = useState<string>('all');

  const filtered =
    moduleFilter === 'all' ? tracking : tracking.filter((t) => t.module_id === moduleFilter);

  // Aggregate total time per student across the filtered rows
  const byStudent = new Map<string, { profile?: Profile; total: number }>();
  for (const row of filtered) {
    const existing = byStudent.get(row.student_id) ?? { profile: row.profiles, total: 0 };
    existing.total += row.total_seconds;
    byStudent.set(row.student_id, existing);
  }
  const studentTotals = Array.from(byStudent.values()).sort((a, b) => b.total - a.total);

  const totalEngagementSeconds = filtered.reduce((sum, r) => sum + r.total_seconds, 0);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-navy-900">Analytics</h1>
        <select
          value={moduleFilter}
          onChange={(e) => setModuleFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="all">All modules</option>
          {modules.map((m) => (
            <option key={m.id} value={m.id}>
              {m.title}
            </option>
          ))}
        </select>
      </div>
      <p className="text-gray-500 mt-1">
        Time students have spent actively watching class recordings.
      </p>

      <div className="grid sm:grid-cols-2 gap-5 mt-6">
        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          <p className="text-3xl font-bold text-navy-900">{studentTotals.length}</p>
          <p className="text-sm text-gray-500 mt-1">Students with tracked activity</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          <p className="text-3xl font-bold text-navy-900">
            {formatDuration(totalEngagementSeconds)}
          </p>
          <p className="text-sm text-gray-500 mt-1">Total time watched</p>
        </div>
      </div>

      <div className="mt-6 bg-white border border-gray-100 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              <th className="px-5 py-3 font-medium">Student</th>
              <th className="px-5 py-3 font-medium">Time spent</th>
            </tr>
          </thead>
          <tbody>
            {studentTotals.map(({ profile, total }, i) => (
              <tr key={profile?.id ?? i} className="border-t border-gray-100">
                <td className="px-5 py-3 text-navy-900">{profile?.full_name ?? 'Unknown'}</td>
                <td className="px-5 py-3 text-gray-600">{formatDuration(total)}</td>
              </tr>
            ))}

            {studentTotals.length === 0 && (
              <tr>
                <td colSpan={2} className="px-5 py-6 text-center text-gray-500">
                  No activity tracked yet. Data appears once students start watching recordings.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
