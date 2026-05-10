import { Suspense } from "react";
import CheckEmailPage from "@/components/auth/CheckEmailPage";

export default function CheckEmailRoute() {
  return (
    <Suspense>
      <CheckEmailPage />
    </Suspense>
  );
}
