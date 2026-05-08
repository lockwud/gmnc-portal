"use client";

import React from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ProviderSettings } from '@/components/dashboards/provider/ProviderSettings';

export default function ProviderSettingsPage() {
  return (
    <ProtectedRoute requiredRole="provider">
      <ProviderSettings />
    </ProtectedRoute>
  );
}
