import  ProtectedRoute  from '@/components/auth/ProtectedRoute';
import AssessmentCreatePage from '@/components/provider/assessments/AssessmentCreatePage';

export default function ProviderAssessmentCreateRoute() {
  return (
    <ProtectedRoute>
      <AssessmentCreatePage />
    </ProtectedRoute>
  );
}