'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { SearchIcon, FilterIcon, MoreVerticalIcon } from 'lucide-react';

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  title?: string;
  searchPlaceholder?: string;
  onRowClick?: (item: T) => void;
  actions?: (item: T) => React.ReactNode;
}

export function Table<T extends { id: string | number }>({
  data,
  columns,
  title,
  searchPlaceholder = 'Search...',
  onRowClick,
  actions,
}: TableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = data.filter((item) => {
    return Object.values(item).some((val) =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
        {title && <h2 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h2>}
        <div className="flex items-center gap-2">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 w-full sm:w-64 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all">
            <FilterIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded border border-slate-200 bg-white">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={cn(
                    'p-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider',
                    col.className
                  )}
                >
                  {col.header}
                </th>
              ))}
              {actions && <th className="p-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((item, rowIdx) => (
                <tr
                  key={item.id}
                  className={cn(
                    'border-b border-slate-50 hover:bg-slate-50/80 transition-colors cursor-pointer',
                    rowIdx === filteredData.length - 1 && 'border-none'
                  )}
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className={cn('p-3 text-sm text-slate-600', col.className)}>
                      {typeof col.accessor === 'function'
                        ? col.accessor(item)
                        : (item[col.accessor] as React.ReactNode)}
                    </td>
                  ))}
                  {actions && (
                    <td className="p-3 text-right">
                      {actions(item)}
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="p-12 text-center text-slate-400 text-sm font-medium"
                >
                  No matching records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
