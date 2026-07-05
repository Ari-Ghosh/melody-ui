"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface MatchModalProps {
  matchedName: string;
  matchedId: string;
  compatibility?: number;
  onClose: () => void;
}

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function Confetti() {
  const [particles] = useState(() =>
    Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: randomBetween(0, 100),
      delay: randomBetween(0, 0.5),
      duration: randomBetween(1.5, 3),
      size: randomBetween(4, 10),
      color: ["#a78bfa", "#34d399", "#fbbf24", "#f472b6", "#60a5fa", "#fb923c"][
        Math.floor(Math.random() * 6)
      ],
    }))
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: "-10px",
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            animation: `confetti-fall ${p.duration}s ease-out ${p.delay}s forwards`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(-10px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

export default function MatchModal({ matchedName, matchedId, compatibility, onClose }: MatchModalProps) {
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [visible, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <Confetti />
      <div
        className={`text-center transition-all duration-500 ${
          visible ? "scale-100 opacity-100" : "scale-50 opacity-0"
        }`}
      >
        <div className="mb-4 text-6xl animate-bounce">💞</div>
        <h2 className="mb-2 text-3xl font-bold text-white">It&apos;s a Match!</h2>
        <p className="mb-1 text-lg text-violet-300">You and {matchedName}</p>
        {compatibility !== undefined && (
          <p className="mb-6 text-sm text-zinc-400">
            {Math.round(compatibility)}% music compatibility
          </p>
        )}
        <div className="flex flex-col gap-3 px-8">
          <Button
            onClick={() => {
              onClose();
              router.push(`/chat/${matchedId}`);
            }}
            className="bg-violet-600 hover:bg-violet-700 text-white px-8"
          >
            Send a Message
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
          >
            Keep Swiping
          </Button>
        </div>
      </div>
    </div>
  );
}
