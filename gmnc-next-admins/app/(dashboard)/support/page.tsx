'use client';

import React from 'react';
import { SupportDashboard } from '@/components/dashboards/SupportDashboard';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function SupportPage() {
  return (
    <ProtectedRoute requiredPermission="support.read">
      <SupportDashboard />
    </ProtectedRoute>
  );
}
