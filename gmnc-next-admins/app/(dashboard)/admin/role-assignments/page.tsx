"use client";
import RoleAssignmentsPage from "@/components/admin/roles-assignments/page";
import  ProtectedRoute  from "@/components/auth/ProtectedRoute";

export default function Page() {
  return (
    <ProtectedRoute requiredRole="admin">
      <RoleAssignmentsPage />
    </ProtectedRoute>
  );
}