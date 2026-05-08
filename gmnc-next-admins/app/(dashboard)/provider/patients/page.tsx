"use client";

import React from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { PatientList } from '@/components/dashboards/provider/PatientList';

export default function ProviderPatientsPage() {
  return (
    <ProtectedRoute requiredRole="provider">
      <PatientList />
    </ProtectedRoute>
  );
}
