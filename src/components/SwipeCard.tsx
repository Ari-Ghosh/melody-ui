"use client";

import { useCallback, useRef } from "react";
import { useDrag } from "@use-gesture/react";
import { animated, useSpring, config } from "@react-spring/web";

interface SwipeCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  disabled?: boolean;
}

const SWIPE_THRESHOLD = 0.4;
const ROTATE_FACTOR = 15;

export default function SwipeCard({ children, onSwipeLeft, onSwipeRight, disabled }: SwipeCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const swipedRef = useRef(false);

  const [{ x, y, rotate }, api] = useSpring(() => ({
    x: 0,
    y: 0,
    rotate: 0,
    config: config.stiff,
  }));

  const bind = useDrag(
    ({ active, movement: [mx], velocity: [vx], direction: dir }) => {
      if (disabled || swipedRef.current) return;

      const isSwiping = active;
      const dx = (dir as number[] | undefined)?.[0] ?? 0;

      if (isSwiping) {
        const rotation = (mx / window.innerWidth) * ROTATE_FACTOR * 2;
        api.start({ x: mx, rotate: rotation, immediate: true, config: { tension: 400, friction: 30 } });
      } else {
        // Check if past threshold
        const trigger = Math.abs(mx) > window.innerWidth * SWIPE_THRESHOLD || Math.abs(vx) > 0.5;
        if (trigger && dx !== 0) {
          swipedRef.current = true;
          const direction = dx > 0 ? 1 : -1;
          api.start({
            x: direction * window.innerWidth * 1.5,
            rotate: direction * ROTATE_FACTOR * 2,
            config: { tension: 200, friction: 20 },
            onRest: () => {
              if (direction > 0) onSwipeRight?.();
              else onSwipeLeft?.();
              api.start({ x: 0, y: 0, rotate: 0, immediate: true });
              swipedRef.current = false;
            },
          });
        } else {
          // Snap back
          api.start({ x: 0, y: 0, rotate: 0, config: { tension: 300, friction: 25 } });
        }
      }
    },
    { axis: "x" as const, rubberband: true }
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled) return;
      if (e.key === "ArrowLeft") {
        onSwipeLeft?.();
      } else if (e.key === "ArrowRight") {
        onSwipeRight?.();
      }
    },
    [disabled, onSwipeLeft, onSwipeRight]
  );

  // Normalize values for overlay opacity
  const opacityLeft = x.to({
    range: [-300, -100, 0],
    output: [1, 0.5, 0],
    extrapolate: "clamp",
  });
  const opacityRight = x.to({
    range: [0, 100, 300],
    output: [0, 0.5, 1],
    extrapolate: "clamp",
  });

  return (
    <div
      className="relative w-full max-w-sm mx-auto select-none"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="group"
      aria-label="Swipeable card. Use left/right arrow keys to swipe."
    >
      <animated.div
        ref={cardRef}
        {...bind()}
        style={{ x, y, rotate: rotate.to((r) => `${r}deg`), touchAction: "pan-y" }}
        className="relative cursor-grab active:cursor-grabbing"
      >
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden shadow-xl shadow-black/20">
          {children}
        </div>

        {/* NOPE overlay */}
        <animated.div
          className="pointer-events-none absolute left-4 top-8 z-10"
          style={{ opacity: opacityLeft }}
        >
          <span className="rounded-xl border-4 border-red-500 px-4 py-2 text-3xl font-extrabold text-red-500 -rotate-12 block">
            NOPE
          </span>
        </animated.div>

        {/* LIKE overlay */}
        <animated.div
          className="pointer-events-none absolute right-4 top-8 z-10"
          style={{ opacity: opacityRight }}
        >
          <span className="rounded-xl border-4 border-emerald-500 px-4 py-2 text-3xl font-extrabold text-emerald-500 rotate-12 block">
            LIKE
          </span>
        </animated.div>
      </animated.div>
    </div>
  );
}
