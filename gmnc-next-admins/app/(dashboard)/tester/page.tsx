'use client';

import React from 'react';
import { TesterDashboard } from '@/components/dashboards/TesterDashboard';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function TesterPage() {
  return (
    <ProtectedRoute requiredRole="tester">
      <TesterDashboard />
    </ProtectedRoute>
  );
}
