import ProtectedRoute from '@/components/auth/ProtectedRoute';
import SettingsPage from "@/components/settings/SettingsPage";

export default function SettingsRoute() {
  return (
    <ProtectedRoute requiredRole={["admin", "provider"]}>
      <SettingsPage />
    </ProtectedRoute>
  );
}
