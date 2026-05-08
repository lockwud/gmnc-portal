"use client";

import React from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { QAConsole } from '@/components/dashboards/tester/QAConsole';

export default function TesterQAPage() {
  return (
    <ProtectedRoute requiredRole="tester">
      <QAConsole />
    </ProtectedRoute>
  );
}
