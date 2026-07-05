"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import BottomNav from "./BottomNav";

const noNavRoutes = ["/", "/onboarding/profile", "/onboarding/music"];

interface AuthenticatedLayoutProps {
  children: ReactNode;
}

export default function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/");
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Check if user needs onboarding
  if (user && !user.full_name && typeof window !== "undefined") {
    const path = window.location.pathname;
    if (path !== "/onboarding/profile" && path !== "/onboarding/music") {
      router.push("/onboarding/profile");
      return null;
    }
  }

  const showNav = !noNavRoutes.includes(
    typeof window !== "undefined" ? window.location.pathname : ""
  );

  return (
    <>
      <div className={showNav ? "pb-20" : ""}>{children}</div>
      {showNav && <BottomNav />}
    </>
  );
}
