import ProtectedRoute from '@/components/auth/ProtectedRoute';
import TaskPage from '@/components/provider/tasks/TasksPage';

export default function ProviderTasksRoute() {
  return (
    <ProtectedRoute requiredRole={["admin", "provider"]}>
      <TaskPage />
    </ProtectedRoute>
  );
}
