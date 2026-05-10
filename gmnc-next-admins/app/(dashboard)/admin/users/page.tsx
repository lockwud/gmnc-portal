import UserPage from "@/components/admin/UsersPage";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function AdminUsersPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <UserPage />
    </ProtectedRoute>
  );
}