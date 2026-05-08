"use client";

import React from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { PatientMonitoring } from '@/components/dashboards/caregiver/PatientMonitoring';

export default function CaregiverMonitoringPage() {
  return (
    <ProtectedRoute requiredRole="caregiver">
      <PatientMonitoring />
    </ProtectedRoute>
  );
}
