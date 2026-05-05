'use client';

import React from 'react';
import { AdminDashboard } from '@/components/dashboards/AdminDashboard';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function AdminPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminDashboard />
    </ProtectedRoute>
  );
}
