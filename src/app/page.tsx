"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  const router = useRouter();
  const { sendOTP, verifyOTP, googleSignIn, isAuthenticated, loading } = useAuth();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [error, setError] = useState("");

  const handleSendOTP = async () => {
    setError("");
    if (!phone.match(/^\+?[1-9]\d{6,14}$/)) {
      setError("Enter a valid phone number (e.g., +14155552671)");
      return;
    }
    try {
      await sendOTP(phone);
      setStep("otp");
    } catch {
      setError("Failed to send verification code");
    }
  };

  const handleVerifyOTP = async () => {
    setError("");
    if (code.length < 4) {
      setError("Enter the verification code");
      return;
    }
    try {
      const tokens = await verifyOTP(phone, code);
      if (tokens.is_new_user) {
        router.push("/onboarding/profile");
      } else {
        router.push("/feed");
      }
    } catch {
      setError("Invalid code");
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      // In production, use Firebase Auth SDK to get ID token
      // For dev: mock token
      const tokens = await googleSignIn("google-dev-token");
      if (tokens.is_new_user) {
        router.push("/onboarding/profile");
      } else {
        router.push("/feed");
      }
    } catch {
      setError("Google sign-in failed");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  if (isAuthenticated) {
    router.push("/feed");
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-zinc-900 to-zinc-950 px-4">
      <Card className="w-full max-w-md border-zinc-800 bg-zinc-900/80 backdrop-blur">
        <CardHeader className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-violet-400">Melody</h1>
          <CardDescription className="text-zinc-400">
            Discover people through music
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "phone" ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-zinc-300">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+14155552671"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="border-zinc-700 bg-zinc-800 text-zinc-100 placeholder:text-zinc-500"
                />
              </div>
              {error && <p className="text-sm text-red-400">{error}</p>}
              <Button
                onClick={handleSendOTP}
                className="w-full bg-violet-600 hover:bg-violet-700 text-white"
              >
                Send Verification Code
              </Button>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-700" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-zinc-900 px-2 text-zinc-500">or</span>
                </div>
              </div>
              <Button
                onClick={handleGoogleSignIn}
                variant="outline"
                className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
              >
                Continue with Google
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-zinc-400 text-center">
                Enter the code sent to {phone}
              </p>
              <div className="space-y-2">
                <Label htmlFor="code" className="text-zinc-300">
                  Verification Code
                </Label>
                <Input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  placeholder="123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="border-zinc-700 bg-zinc-800 text-zinc-100 text-center text-2xl tracking-widest"
                />
              </div>
              {error && <p className="text-sm text-red-400">{error}</p>}
              <Button
                onClick={handleVerifyOTP}
                className="w-full bg-violet-600 hover:bg-violet-700 text-white"
              >
                Verify & Continue
              </Button>
              <button
                onClick={() => { setStep("phone"); setError(""); }}
                className="w-full text-sm text-zinc-500 hover:text-zinc-300"
              >
                Use a different number
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
