import ProtectedRoute from '@/components/auth/ProtectedRoute';
import SettingsPage from "@/components/settings/SettingsPage";

export default function SettingsRoute() {
  return (
    <ProtectedRoute requiredRole="provider">
      <SettingsPage />
    </ProtectedRoute>
  );
}
