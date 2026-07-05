"use client";

import { usePathname } from "next/navigation";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import type { ReactNode } from "react";

export default function AuthGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // Public routes that don't need authentication
  const publicRoutes = ["/", "/onboarding/profile", "/onboarding/music"];

  if (publicRoutes.includes(pathname)) {
    return <>{children}</>;
  }

  return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
}
