import React from 'react';
import { Search, Filter } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import type { AppointmentFilters as AppointmentFiltersState } from './types';

interface AppointmentFiltersProps {
  filters: AppointmentFiltersState;
  onFilterChange: (filters: AppointmentFiltersState) => void;
}

export default function AppointmentFilters({
  filters,
  onFilterChange,
}: AppointmentFiltersProps) {
  return (
    <Card className="p-6 mb-6">
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-64">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search appointments..."
              value={filters.searchTerm}
              onChange={(e) =>
                onFilterChange({
                  ...filters,
                  searchTerm: e.target.value,
                })
              }
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <select
          value={filters.status}
          onChange={(e) =>
            onFilterChange({
              ...filters,
              status: e.target.value,
            })
          }
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="RESCHEDULED">Rescheduled</option>
          <option value="CANCELLED">Cancelled</option>
        </select>

        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition">
          <Filter size={18} />
          More Filters
        </button>
      </div>
    </Card>
  );
}
