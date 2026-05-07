"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import { useRouter } from "next/navigation";
import { Loader2Icon } from "lucide-react";
import { getDashboardRoute } from "@/lib/rbac";

export default function DashboardRedirectPage() {
  const { user, selectedRole, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!user) {
      router.push("/login");
      return;
    }

    const roleToUse = selectedRole || user.roles[0];
    if (roleToUse) {
      router.push(getDashboardRoute(roleToUse));
    }
  }, [user, selectedRole, isLoading, router]);

  return (
    <div className="flex h-[70vh] flex-col items-center justify-center space-y-4">
      <Loader2Icon className="h-10 w-10 animate-spin text-primary" />
      <p className="animate-pulse font-medium text-slate-400">Redirecting to your workspace...</p>
    </div>
  );
}