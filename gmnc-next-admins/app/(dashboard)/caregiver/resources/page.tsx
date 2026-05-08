"use client";

import React from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ResourceCenter } from '@/components/dashboards/caregiver/ResourceCenter';

export default function CaregiverResourcesPage() {
  return (
    <ProtectedRoute requiredRole="caregiver">
      <ResourceCenter />
    </ProtectedRoute>
  );
}
