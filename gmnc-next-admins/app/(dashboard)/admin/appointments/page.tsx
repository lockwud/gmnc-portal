import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AppointmentsPage from '@/components/provider/appointments/AppointmentsPage';

export default function AdminAppointmentsPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AppointmentsPage />
    </ProtectedRoute>
  );
}
