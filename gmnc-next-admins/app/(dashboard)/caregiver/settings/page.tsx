"use client";

import React from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { CaregiverSettings } from '@/components/dashboards/caregiver/CaregiverSettings';

export default function CaregiverSettingsPage() {
  return (
    <ProtectedRoute requiredRole="caregiver">
      <CaregiverSettings />
    </ProtectedRoute>
  );
}
