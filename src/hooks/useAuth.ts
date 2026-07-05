"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiPost, setTokens, clearTokens, getUserId } from "@/lib/api";
import type { AuthTokens, OnboardRequest, User } from "@/types";

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(() => getUserId() !== null);

  const fetchUserProfile = useCallback(async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/user/me`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });
    if (!res.ok) throw new Error("Failed to fetch profile");
    return res.json();
  }, []);

  useEffect(() => {
    const uid = getUserId();
    if (!uid) return;
    fetchUserProfile()
      .then(setUser)
      .catch(() => clearTokens())
      .finally(() => setLoading(false));
  }, [fetchUserProfile]);

  const sendOTP = useCallback(async (phone: string) => {
    return apiPost<{ sid: string }>("/api/auth/phone/send-otp", { phone });
  }, []);

  const verifyOTP = useCallback(async (phone: string, code: string) => {
    const tokens = await apiPost<AuthTokens>("/api/auth/phone/verify-otp", { phone, code });
    setTokens(tokens);
    localStorage.setItem("access_token", tokens.access_token);
    localStorage.setItem("refresh_token", tokens.refresh_token);
    return tokens;
  }, []);

  const googleSignIn = useCallback(async (idToken: string) => {
    const tokens = await apiPost<AuthTokens>("/api/auth/google", { id_token: idToken });
    setTokens(tokens);
    localStorage.setItem("access_token", tokens.access_token);
    localStorage.setItem("refresh_token", tokens.refresh_token);
    return tokens;
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiPost("/api/auth/logout");
    } catch {
      // ignore
    }
    clearTokens();
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
    router.push("/");
  }, [router]);

  const onboard = useCallback(async (data: OnboardRequest) => {
    const updated = await apiPost<User>("/api/user/onboard", data);
    setUser(updated);
    return updated;
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const profile = await fetchUserProfile();
      setUser(profile);
      return profile;
    } catch {
      return null;
    }
  }, [fetchUserProfile]);

  return {
    user,
    loading,
    sendOTP,
    verifyOTP,
    googleSignIn,
    logout,
    onboard,
    refreshProfile,
    isAuthenticated: !!user,
    isNewUser: !!(user && !user.full_name),
  };
}
