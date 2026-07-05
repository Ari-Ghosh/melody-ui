"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiGet, apiPost } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";

interface Report {
  id: string;
  reporter_id: string;
  reported_id: string;
  reason: string;
  description: string;
  status: string;
  created_at: string;
}

export default function AdminReportsPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [fetching, setFetching] = useState(true);
  const [actionMsg, setActionMsg] = useState("");

  const isAdmin = !!user && user.role === "admin";

  useEffect(() => {
    if (!loading && (!isAuthenticated || !isAdmin)) router.push("/");
  }, [loading, isAuthenticated, isAdmin, router]);

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) return;
    let active = true;
    apiGet<{ reports: Report[] }>(`/api/admin/reports?status=${statusFilter}`)
      .then((d) => {
        if (active) setReports(d.reports);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setFetching(false);
      });
    return () => {
      active = false;
    };
  }, [isAuthenticated, statusFilter, isAdmin]);

  const handleAction = async (reportId: string, action: "warn" | "restrict" | "suspend" | "ban") => {
    setActionMsg("");
    try {
      await apiPost(`/api/admin/reports/${reportId}/action`, { action, reason: "" });
      setActionMsg(`${action} applied`);
      setReports((prev) => prev.filter((r) => r.id !== reportId));
    } catch {
      setActionMsg("Action failed — check admin permissions");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-zinc-100">Reports</h1>
          <div className="flex gap-2">
            {["pending", "reviewed", "resolved"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`rounded-md px-3 py-1 text-xs capitalize transition-colors ${
                  statusFilter === s
                    ? "bg-violet-600 text-white"
                    : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {actionMsg && (
          <div className="mb-4 rounded-lg bg-violet-500/10 border border-violet-500/30 px-4 py-2 text-sm text-violet-300">
            {actionMsg}
          </div>
        )}

        {fetching && reports.length === 0 ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
          </div>
        ) : reports.length === 0 ? (
          <Card className="border-zinc-800 bg-zinc-900/80">
            <CardContent className="p-8 text-center">
              <p className="text-zinc-400">No {statusFilter} reports</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {reports.map((r) => (
              <Card key={r.id} className="border-zinc-800 bg-zinc-900/80">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-medium text-zinc-300 capitalize">{r.reason.replace(/_/g, " ")}</span>
                      <p className="text-[10px] text-zinc-500 mt-0.5">
                        Reporter: {r.reporter_id.slice(0, 8)}... | Reported: {r.reported_id.slice(0, 8)}...
                      </p>
                    </div>
                    <span className="text-[10px] text-zinc-600">
                      {new Date(r.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {r.description && (
                    <p className="text-xs text-zinc-400 bg-zinc-800/50 rounded-md px-3 py-2">{r.description}</p>
                  )}
                  {statusFilter === "pending" && (
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handleAction(r.id, "warn")}
                        className="rounded-md bg-amber-500/10 border border-amber-500/30 px-3 py-1 text-xs text-amber-400 hover:bg-amber-500/20 transition-colors"
                      >
                        Warn
                      </button>
                      <button
                        onClick={() => handleAction(r.id, "restrict")}
                        className="rounded-md bg-orange-500/10 border border-orange-500/30 px-3 py-1 text-xs text-orange-400 hover:bg-orange-500/20 transition-colors"
                      >
                        Restrict
                      </button>
                      <button
                        onClick={() => handleAction(r.id, "suspend")}
                        className="rounded-md bg-red-500/10 border border-red-500/30 px-3 py-1 text-xs text-red-400 hover:bg-red-500/20 transition-colors"
                      >
                        Suspend
                      </button>
                      <button
                        onClick={() => handleAction(r.id, "ban")}
                        className="rounded-md bg-red-600/10 border border-red-600/30 px-3 py-1 text-xs text-red-500 hover:bg-red-600/20 transition-colors"
                      >
                        Ban
                      </button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-6 text-center">
          <button onClick={() => router.back()} className="text-xs text-zinc-500 hover:text-zinc-300">
            Back
          </button>
        </div>
      </div>
    </main>
  );
}
