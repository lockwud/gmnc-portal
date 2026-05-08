"use client";

import React from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { SupportSettings } from '@/components/dashboards/support/SupportSettings';

export default function SupportSettingsPage() {
  return (
    <ProtectedRoute requiredRole="support">
      <SupportSettings />
    </ProtectedRoute>
  );
}
