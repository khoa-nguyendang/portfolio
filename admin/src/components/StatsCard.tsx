import type { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subtext?: string;
  color?: 'indigo' | 'green' | 'yellow' | 'red' | 'blue';
}

const colorMap = {
  indigo: {
    bg: 'bg-indigo-500/10',
    icon: 'text-indigo-400',
    ring: 'ring-indigo-500/20',
  },
  green: {
    bg: 'bg-emerald-500/10',
    icon: 'text-emerald-400',
    ring: 'ring-emerald-500/20',
  },
  yellow: {
    bg: 'bg-yellow-500/10',
    icon: 'text-yellow-400',
    ring: 'ring-yellow-500/20',
  },
  red: {
    bg: 'bg-red-500/10',
    icon: 'text-red-400',
    ring: 'ring-red-500/20',
  },
  blue: {
    bg: 'bg-blue-500/10',
    icon: 'text-blue-400',
    ring: 'ring-blue-500/20',
  },
};

export default function StatsCard({
  icon: Icon,
  label,
  value,
  subtext,
  color = 'indigo',
}: StatsCardProps) {
  const colors = colorMap[color];

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-5 transition-colors hover:border-gray-700">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-400">{label}</p>
          <p className="mt-2 text-3xl font-bold text-white">{value}</p>
          {subtext && (
            <p className="mt-1 text-xs text-gray-500">{subtext}</p>
          )}
        </div>
        <div
          className={`rounded-lg p-2.5 ring-1 ${colors.bg} ${colors.ring}`}
        >
          <Icon className={`h-5 w-5 ${colors.icon}`} />
        </div>
      </div>
    </div>
  );
}
