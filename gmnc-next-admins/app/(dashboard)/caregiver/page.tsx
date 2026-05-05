"use client";

import React from 'react';
import { CaregiverDashboard } from '@/components/dashboards/CaregiverDashboard';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function CaregiverPage() {
  return (
    <ProtectedRoute requiredRole="caregiver">
      <CaregiverDashboard />
    </ProtectedRoute>
  );
}
