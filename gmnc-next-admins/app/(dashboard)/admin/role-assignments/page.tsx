import RoleAssignmentsPage from "@/components/admin/roles-assignments/page";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function AdminRoleAssignmentsPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <RoleAssignmentsPage />
    </ProtectedRoute>
  );
}