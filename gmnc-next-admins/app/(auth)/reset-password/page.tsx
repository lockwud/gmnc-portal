import { Suspense } from "react";
import ResetPasswordPage from "@/components/auth/ResetPasswordPage";

export default function ResetPasswordRoute() {
  return (
    <Suspense>
      <ResetPasswordPage />
    </Suspense>
  );
}
