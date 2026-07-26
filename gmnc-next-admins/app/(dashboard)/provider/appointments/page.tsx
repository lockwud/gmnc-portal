import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AppointmentsPage  from '@/components/provider/appointments/AppointmentsPage'
export default function AppointmentPage() {
  return (
    <ProtectedRoute requiredRole={["admin", "provider"]}>
      <AppointmentsPage />
    </ProtectedRoute>
  );
}
