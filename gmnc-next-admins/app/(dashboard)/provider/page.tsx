'use client';

import React from 'react';
import { ProviderDashboard } from '@/components/dashboards/ProviderDashboard';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function ProviderPage() {
  return (
    <ProtectedRoute requiredPermission="appointment.read">
      <ProviderDashboard />
    </ProtectedRoute>
  );
}
