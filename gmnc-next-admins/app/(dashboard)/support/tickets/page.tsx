"use client";

import React from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { TicketManagement } from '@/components/dashboards/support/TicketManagement';

export default function SupportTicketsPage() {
  return (
    <ProtectedRoute requiredRole="support">
      <TicketManagement />
    </ProtectedRoute>
  );
}
