"use client";

import React from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { SystemSettings } from '@/components/dashboards/admin/SystemSettings';

export default function SettingsPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <SystemSettings />
    </ProtectedRoute>
  );
}
