import React from 'react';
import { Card } from '@/components/ui/Card';
import  Badge  from '@/components/ui/Badge';
import { formatDate, formatTime } from '@/lib/utils';
import type { Appointment } from './types';

interface AppointmentListViewProps {
  appointments: Appointment[];
  isLoading: boolean;
  onRefresh?: () => void;
}

export default function AppointmentListView({
  appointments,
  isLoading,
}: AppointmentListViewProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'RESCHEDULED':
        return 'bg-blue-100 text-blue-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <Card className="p-8">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-lg" />
          ))}
        </div>
      </Card>
    );
  }

  if (!appointments || appointments.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center text-gray-500">
          <p>No appointments found</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-8">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-700">
                Date & Time
              </th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">
                Patient
              </th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">
                Provider
              </th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">
                Status
              </th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((apt) => (
              <tr
                key={apt.id}
                className="border-b border-gray-100 hover:bg-gray-50 transition"
              >
                <td className="py-3 px-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {formatDate(new Date(apt.appointmentDate))}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatTime(new Date(apt.appointmentDate))}
                    </p>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <p className="text-sm text-gray-900">{apt.patient.fullName}</p>
                </td>
                <td className="py-3 px-4">
                  <p className="text-sm text-gray-900">
                    {apt.provider.user.fullName}
                  </p>
                  <p className="text-xs text-gray-500">{apt.provider.profession}</p>
                </td>
                <td className="py-3 px-4">
                  <Badge className={getStatusColor(apt.status)}>
                    {apt.status}
                  </Badge>
                </td>
                <td className="py-3 px-4">
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
