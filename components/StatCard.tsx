import type { LucideIcon } from 'lucide-react';

export default function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
}) {
  return (
    <div className="bg-white border border-navy-100 rounded-2xl p-5 flex items-center gap-4">
      <div className="bg-navy-950 text-white w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0">
        <Icon size={20} />
      </div>
      <div>
        <p className="text-2xl font-bold text-navy-900">{value}</p>
        <p className="text-xs text-navy-500">{label}</p>
      </div>
    </div>
  );
}
