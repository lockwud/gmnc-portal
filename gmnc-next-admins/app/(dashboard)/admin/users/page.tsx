import { Suspense } from "react";
import UserRegistrationPage from "@/components/admin/UsersPage";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function AdminUsersPage() {
  return (
     <ProtectedRoute requiredRole="admin">
       <Suspense fallback={null}>
         <UserRegistrationPage />
       </Suspense>
     </ProtectedRoute>
  );
}
