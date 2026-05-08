"use client";

import React from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { TelehealthSession } from '@/components/dashboards/provider/TelehealthSession';

export default function ProviderTelehealthPage() {
  return (
    <ProtectedRoute requiredRole="provider">
      <TelehealthSession />
    </ProtectedRoute>
  );
}
