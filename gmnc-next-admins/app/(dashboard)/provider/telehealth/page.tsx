import ProtectedRoute from '@/components/auth/ProtectedRoute';
import TelehealthPage from '@/components/provider/telehealth/TelehealthPage';
export default function TelehealthProviderPage() {
  return (
    <ProtectedRoute requiredRole="provider">
      <TelehealthPage />
    </ProtectedRoute>
  );
}