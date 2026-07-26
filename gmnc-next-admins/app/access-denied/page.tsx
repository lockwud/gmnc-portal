import AccessDeniedPage from "@/components/auth/AccessDeniedPage";
import MainLayout from "@/components/layout/MainLayout";

export default function AccessDeniedRoute() {
  return (
    <MainLayout>
      <AccessDeniedPage />
    </MainLayout>
  );
}
