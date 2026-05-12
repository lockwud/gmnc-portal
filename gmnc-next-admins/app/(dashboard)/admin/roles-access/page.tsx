import RolesAccessPage from "@/components/admin/roles-access/page";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function AdminRolesAccessPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <RolesAccessPage />
    </ProtectedRoute>
  );
}