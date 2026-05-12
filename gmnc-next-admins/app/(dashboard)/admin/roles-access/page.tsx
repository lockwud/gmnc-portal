'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import RolesAccessPage from '@/components/admin/roles-access/page';

export default function Page() {
  return (
    <ProtectedRoute requiredRole="admin">
      <RolesAccessPage />
    </ProtectedRoute>
  );
}