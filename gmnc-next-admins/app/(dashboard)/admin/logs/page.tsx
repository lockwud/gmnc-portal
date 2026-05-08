"use client";

import React from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AuditLogs } from '@/components/dashboards/admin/AuditLogs';

export default function AuditLogsPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AuditLogs />
    </ProtectedRoute>
  );
}
