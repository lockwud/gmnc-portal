import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AssessmentReportPage from '@/components/provider/assessments/AssessmentReportPage';

export default async function AssessmentReportRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <ProtectedRoute>
      <AssessmentReportPage assessmentId={id} />
    </ProtectedRoute>
  );
}
