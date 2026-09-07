import type { LucideIcon } from 'lucide-react';

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="text-center border border-dashed border-navy-200 rounded-2xl py-14 px-6">
      <Icon className="mx-auto text-navy-300" size={32} />
      <h3 className="mt-4 font-semibold text-navy-900">{title}</h3>
      {description && <p className="mt-1.5 text-sm text-navy-500 max-w-sm mx-auto">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
