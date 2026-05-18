import React from 'react';
import { Card } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { formatDate, formatTime } from '@/lib/utils';
import type { Appointment } from './types';

interface AppointmentDetailsPanelProps {
  appointment: Appointment | null;
  isLoading: boolean;
}

export default function AppointmentDetailsPanel({
  appointment,
  isLoading,
}: AppointmentDetailsPanelProps) {
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

  if (isLoading || !appointment) {
    return (
      <Card className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded-lg w-32" />
          <div className="h-8 bg-gray-200 rounded-lg w-48" />
          <div className="h-6 bg-gray-200 rounded-lg w-60" />
          <div className="h-6 bg-gray-200 rounded-lg w-40" />
          <div className="h-8 bg-gray-200 rounded-lg w-56" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-8 sticky top-6">
      <div className="space-y-6">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-500">Date</p>
          <p className="text-lg font-semibold text-gray-900">
            {formatDate(new Date(appointment.appointmentDate))}
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-500">Time</p>
          <p className="text-lg font-semibold text-gray-900">
            {formatTime(new Date(appointment.appointmentDate))}
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-500">Patient</p>
          <p className="text-lg font-semibold text-gray-900">
            {appointment.patient.fullName}
          </p>
          <p className="text-sm text-gray-500">
            {appointment.patient.phoneNumber}
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-500">Provider</p>
          <p className="text-lg font-semibold text-gray-900">
            {appointment.provider.user.fullName}
          </p>
          <p className="text-sm text-gray-500">
            {appointment.provider.profession}
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-500">Status</p>
          <Badge className={getStatusColor(appointment.status)}>
            {appointment.status}
          </Badge>
        </div>

        {appointment.notes && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-500">Notes</p>
            <p className="text-sm text-gray-700">{appointment.notes}</p>
          </div>
        )}
      </div>
    </Card>
  );
}
