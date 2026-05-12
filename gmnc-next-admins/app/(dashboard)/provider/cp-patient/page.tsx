import  ProtectedRoute  from "@/components/auth/ProtectedRoute";
import CpPatientsPage from "@/components/provider/cp-patient/patientTable";

export default function ProviderClientsRoute() {
  return (
    <ProtectedRoute>
      <CpPatientsPage />
    </ProtectedRoute>
  );
}