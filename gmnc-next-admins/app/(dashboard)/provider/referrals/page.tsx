import ProtectedRoute from '@/components/auth/ProtectedRoute';
import ReferralsPage from '@/components/provider/referrals/ReferralsPage';

export default function ProviderReferralsRoute() {
  return (
    <ProtectedRoute requiredRole="provider">
      <ReferralsPage />
    </ProtectedRoute>
  );
}
