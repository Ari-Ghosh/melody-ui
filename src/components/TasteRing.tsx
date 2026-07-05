"use client";

import type { TasteBreakdown } from "@/types";

interface TasteRingProps {
  score: number;
  breakdown?: TasteBreakdown;
  label: string;
  size?: number;
}

function matchLabelColor(label: string): string {
  switch (label) {
    case "Soulmates": return "#a78bfa";  // violet-400
    case "Strong Match": return "#34d399"; // emerald-400
    case "Potential Match": return "#fbbf24"; // amber-400
    case "Low Compatibility": return "#9ca3af"; // gray-400
    default: return "#a78bfa";
  }
}

export default function TasteRing({ score, breakdown, label, size = 120 }: TasteRingProps) {
  const radius = size / 2 - 6;
  const circumference = 2 * Math.PI * radius;
  const progress = score / 100;
  const strokeDashoffset = circumference * (1 - progress);
  const color = matchLabelColor(label);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Background ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={4}
          />
          {/* Progress ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={4}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-zinc-100">{Math.round(score)}%</span>
          <span className="text-[10px] text-zinc-500">Match</span>
        </div>
      </div>
      <span className="text-xs font-medium" style={{ color }}>{label}</span>

      {breakdown && (
        <div className="w-full space-y-1 mt-1">
          <BreakdownBar label="Genre" value={breakdown.genre} max={28} color="bg-violet-500" />
          <BreakdownBar label="Artist" value={breakdown.artist} max={28} color="bg-indigo-500" />
          <BreakdownBar label="Swipes" value={breakdown.swipe} max={18} color="bg-emerald-500" />
          <BreakdownBar label="Discovery" value={breakdown.discovery} max={12} color="bg-amber-500" />
          <BreakdownBar label="Activity" value={breakdown.activity} max={8} color="bg-rose-500" />
          <BreakdownBar label="Serendipity" value={breakdown.serendipity} max={6} color="bg-cyan-500" />
        </div>
      )}
    </div>
  );
}

function BreakdownBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="flex items-center gap-2 text-[10px]">
      <span className="w-16 text-right text-zinc-500">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-8 text-zinc-400">{value.toFixed(1)}</span>
    </div>
  );
}
