import { SupportDashboard } from "@/components/dashboards/SupportDashboard";
import  ProtectedRoute  from "@/components/auth/ProtectedRoute";

export default function SupportDashboardPage() {
  return (
    <ProtectedRoute requiredPermission="support.read">
      <SupportDashboard />
    </ProtectedRoute>
  );
}