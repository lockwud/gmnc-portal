"use client";

import { CaregiverDashboard } from "@/components/dashboards/CaregiverDashboard";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function CaregiverDashboardPage() {
  return (
    <ProtectedRoute requiredRole="caregiver">
      <CaregiverDashboard />
    </ProtectedRoute>
  );
}