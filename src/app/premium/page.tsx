"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { apiGet, apiPost } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Crown, Check, ArrowLeft, IndianRupee } from "lucide-react";

interface PremiumStatus {
  is_premium: boolean;
  daily_likes: number;
  like_limit: number;
  razorpay_key_id: string;
}

interface OrderResponse {
  status: string;
  order_id: string;
  amount: number;
  currency: string;
  razorpay_key_id: string;
  message?: string;
}

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export default function PremiumPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();
  const [status, setStatus] = useState<PremiumStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    apiGet<PremiumStatus>("/api/premium/status")
      .then(setStatus)
      .catch(() => {})
      .finally(() => setStatusLoading(false));
  }, [isAuthenticated]);

  // Load Razorpay checkout script
  useEffect(() => {
    if (typeof window === "undefined" || window.Razorpay) return;
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const isPremium = status?.is_premium || user?.is_premium || false;

  const handlePayment = useCallback(
    async (plan: "monthly" | "yearly") => {
      setProcessing(true);
      try {
        const order = await apiPost<OrderResponse>("/api/premium/create-order", { plan });

        // Dev mode: no real payment
        if (order.status === "dev_mode") {
          await apiPost("/api/premium/verify-payment", {
            razorpay_order_id: order.order_id,
            razorpay_payment_id: "dev_payment",
            razorpay_signature: "dev_signature",
            plan,
          });
          toast.success("Premium activated (dev mode)");
          setStatusLoading(true);
          apiGet<PremiumStatus>("/api/premium/status")
            .then(setStatus)
            .finally(() => setStatusLoading(false));
          setProcessing(false);
          return;
        }

        // Real Razorpay Checkout
        if (typeof window === "undefined" || !window.Razorpay) {
          toast.error("Payment system loading. Please try again.");
          setProcessing(false);
          return;
        }

        const options = {
          key: order.razorpay_key_id,
          amount: order.amount,
          currency: order.currency,
          name: "Melody",
          description: plan === "monthly" ? "Monthly Premium" : "Yearly Premium",
          order_id: order.order_id,
          prefill: {
            name: user?.full_name || "",
          },
          theme: {
            color: "#8b5cf6",
          },
          modal: {
            ondismiss: () => {
              setProcessing(false);
            },
          },
          handler: async (response: {
            razorpay_payment_id: string;
            razorpay_order_id: string;
            razorpay_signature: string;
          }) => {
            try {
              await apiPost("/api/premium/verify-payment", {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                plan,
              });
              toast.success("Welcome to Melody Premium!");
              setStatusLoading(true);
              apiGet<PremiumStatus>("/api/premium/status")
                .then(setStatus)
                .finally(() => setStatusLoading(false));
            } catch {
              toast.error("Payment verification failed. Contact support.");
            }
            setProcessing(false);
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } catch {
        toast.error("Failed to initiate payment");
        setProcessing(false);
      }
    },
    [user]
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    router.push("/");
    return null;
  }

  const plans = [
    {
      id: "monthly" as const,
      name: "Monthly",
      price: "₹799",
      period: "/month",
      badge: null,
      features: [
        "Unlimited likes",
        "Spark & Love interactions",
        "See who liked you",
        "Profile boosts",
        "Read receipts",
      ],
    },
    {
      id: "yearly" as const,
      name: "Yearly",
      price: "₹6,399",
      period: "/year",
      badge: "Save 33%",
      features: [
        "All Monthly features",
        "2 months free",
        "Priority support",
      ],
    },
  ];

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Crown className="h-6 w-6 text-violet-400" />
            <h1 className="text-3xl font-bold text-zinc-100">Melody Premium</h1>
          </div>
          <p className="text-zinc-400">Unlock the full music discovery experience</p>
        </div>

        {/* Status bar */}
        {statusLoading ? (
          <div className="mb-8">
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        ) : status && (
          <div className="mb-8 rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 text-center">
            <p className="text-sm text-zinc-400">
              {isPremium ? (
                <span className="text-violet-400 font-medium">Premium Member</span>
              ) : (
                <>
                  Today: <span className="text-zinc-200 font-medium">{status.daily_likes}</span> /{" "}
                  {status.like_limit} likes used
                </>
              )}
            </p>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`border-zinc-800 bg-zinc-900/80 relative overflow-hidden ${
                plan.badge ? "border-violet-500/30" : ""
              }`}
            >
              {plan.badge && (
                <div className="absolute top-3 right-3">
                  <span className="rounded-full bg-violet-500/20 text-violet-300 px-2 py-0.5 text-[10px] font-medium">
                    {plan.badge}
                  </span>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-zinc-100">{plan.name}</CardTitle>
                <div className="mt-2 flex items-baseline gap-1">
                  <IndianRupee className="h-5 w-5 text-violet-400" />
                  <span className="text-3xl font-bold text-violet-400">{plan.price.replace("₹", "")}</span>
                  <span className="text-zinc-500 text-sm">{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-zinc-400 space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <Check className="h-3 w-3 text-emerald-400 shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => handlePayment(plan.id)}
                  disabled={processing || isPremium}
                  className="w-full bg-violet-600 hover:bg-violet-700 text-white"
                >
                  {isPremium ? "Current Plan" : processing ? "Processing..." : `Subscribe ${plan.name}`}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            Back
          </button>
        </div>
      </div>
    </main>
  );
}
