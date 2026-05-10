import { Suspense } from "react";
import AuthErrorPage from "@/components/auth/AuthErrorPage";

export default function AuthErrorRoute() {
  return (
    <Suspense>
      <AuthErrorPage />
    </Suspense>
  );
}
