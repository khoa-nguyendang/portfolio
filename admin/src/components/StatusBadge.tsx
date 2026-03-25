interface StatusBadgeProps {
  status: 'published' | 'draft' | 'archived' | string;
}

const statusStyles: Record<string, string> = {
  published: 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20',
  draft: 'bg-yellow-500/10 text-yellow-400 ring-yellow-500/20',
  archived: 'bg-gray-500/10 text-gray-400 ring-gray-500/20',
  pending: 'bg-blue-500/10 text-blue-400 ring-blue-500/20',
  completed: 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20',
  failed: 'bg-red-500/10 text-red-400 ring-red-500/20',
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const style = statusStyles[status] || statusStyles.draft;

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${style}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
