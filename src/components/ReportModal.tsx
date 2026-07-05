"use client";

import { useState } from "react";
import { apiPost } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ReportModalProps {
  targetUserId: string;
  targetName: string;
  onClose: () => void;
}

const REASONS = [
  { value: "harassment", label: "Harassment" },
  { value: "bullying", label: "Bullying" },
  { value: "hate_speech", label: "Hate Speech" },
  { value: "spam", label: "Spam" },
  { value: "fake_profile", label: "Fake Profile" },
  { value: "inappropriate_content", label: "Inappropriate Content" },
];

export default function ReportModal({ targetUserId, targetName, onClose }: ReportModalProps) {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!reason) { setError("Select a reason"); return; }
    setSubmitting(true);
    setError("");
    try {
      await apiPost(`/api/safety/report/${targetUserId}`, { reason, description });
      setDone(true);
    } catch {
      setError("Failed to submit report");
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900 p-6 space-y-4">
        {done ? (
          <div className="text-center space-y-3">
            <div className="text-4xl">✓</div>
            <h2 className="text-lg font-semibold text-zinc-200">Report Submitted</h2>
            <p className="text-sm text-zinc-400">We&apos;ll review your report against {targetName}.</p>
            <Button onClick={onClose} className="w-full bg-violet-600 hover:bg-violet-700">
              Done
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-200">Report {targetName}</h2>
              <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 text-xl leading-none">&times;</button>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-zinc-400 uppercase tracking-wide">Reason</p>
              <div className="grid grid-cols-2 gap-2">
                {REASONS.map((r) => (
                  <button
                    key={r.value}
                    onClick={() => setReason(r.value)}
                    className={`rounded-lg px-3 py-2 text-xs border transition-colors ${
                      reason === r.value
                        ? "border-violet-500 bg-violet-500/20 text-violet-300"
                        : "border-zinc-700 text-zinc-400 hover:border-zinc-600"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-zinc-400 uppercase tracking-wide">Description (optional)</p>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={500}
                rows={3}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-100 px-3 py-2 text-sm resize-none"
                placeholder="Tell us more..."
              />
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <div className="flex gap-2">
              <Button onClick={onClose} variant="outline" className="flex-1 border-zinc-700 text-zinc-300">
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={submitting || !reason}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                {submitting ? "Submitting..." : "Submit Report"}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
