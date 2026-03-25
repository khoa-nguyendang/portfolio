import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (item: T) => void;
  keyField?: string;
  emptyMessage?: string;
}

type SortDirection = 'asc' | 'desc' | null;

export default function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  onRowClick,
  keyField = 'id',
  emptyMessage = 'No data found',
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortKey(null);
        setSortDirection(null);
      }
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const sortedData = useMemo(() => {
    if (!sortKey || !sortDirection) return data;

    return [...data].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return sortDirection === 'asc' ? -1 : 1;
      if (bVal == null) return sortDirection === 'asc' ? 1 : -1;

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        const cmp = aVal.localeCompare(bVal);
        return sortDirection === 'asc' ? cmp : -cmp;
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }

      return 0;
    });
  }, [data, sortKey, sortDirection]);

  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    if (sortKey !== columnKey) {
      return <ChevronsUpDown className="ml-1 inline h-3.5 w-3.5 text-gray-500" />;
    }
    return sortDirection === 'asc' ? (
      <ChevronUp className="ml-1 inline h-3.5 w-3.5 text-indigo-400" />
    ) : (
      <ChevronDown className="ml-1 inline h-3.5 w-3.5 text-indigo-400" />
    );
  };

  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-gray-800 bg-gray-900/50 py-16 text-center">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-800">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-gray-800 bg-gray-900/80">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400 ${
                  col.sortable ? 'cursor-pointer select-none hover:text-gray-200' : ''
                } ${col.className || ''}`}
                onClick={col.sortable ? () => handleSort(col.key) : undefined}
              >
                {col.header}
                {col.sortable && <SortIcon columnKey={col.key} />}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800/50">
          {sortedData.map((item, idx) => (
            <tr
              key={(item[keyField] as string) ?? idx}
              className={`bg-gray-900/30 transition-colors hover:bg-gray-800/50 ${
                onRowClick ? 'cursor-pointer' : ''
              }`}
              onClick={onRowClick ? () => onRowClick(item) : undefined}
            >
              {columns.map((col) => (
                <td key={col.key} className={`px-4 py-3 ${col.className || ''}`}>
                  {col.render
                    ? col.render(item)
                    : (item[col.key] as React.ReactNode) ?? ''}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
