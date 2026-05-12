import  ProtectedRoute  from '@/components/auth/ProtectedRoute';
import AssessmentHubPage from '@/components/provider/assessments/AssessmentHubPage';

export default function ProviderAssessmentsRoute() {
  return (
    <ProtectedRoute>
      <AssessmentHubPage />
    </ProtectedRoute>
  );
}