"use client";

import React from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { TesterSettings } from '@/components/dashboards/tester/TesterSettings';

export default function TesterSettingsPage() {
  return (
    <ProtectedRoute requiredRole="tester">
      <TesterSettings />
    </ProtectedRoute>
  );
}
