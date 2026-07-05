"use client";

import { usePathname, useRouter } from "next/navigation";
import { Music, Search, MessageCircle, User, Crown } from "lucide-react";
import { useUIStore } from "@/store/ui";

const tabs = [
  { route: "/feed", icon: Music, label: "Feed" },
  { route: "/matches", icon: Search, label: "Discover" },
  { route: "/chat", icon: MessageCircle, label: "Messages" },
  { route: "/profile", icon: User, label: "Profile" },
  { route: "/premium", icon: Crown, label: "Premium" },
] as const;

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const unreadCount = useUIStore((s) => s.unreadCount);

  const isActive = (route: string) => {
    if (route === "/feed") return pathname === "/feed";
    return pathname.startsWith(route);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur supports-[backdrop-filter]:bg-zinc-950/80">
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-1">
        {tabs.map(({ route, icon: Icon, label }) => {
          const active = isActive(route);
          return (
            <button
              key={route}
              onClick={() => router.push(route)}
              className="relative flex flex-col items-center gap-0.5 px-3 py-2 transition-colors"
              aria-label={label}
            >
              <div
                className={`rounded-lg p-1.5 transition-colors ${
                  active ? "bg-violet-500/15 text-violet-400" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <span
                className={`text-[10px] font-medium transition-colors ${
                  active ? "text-violet-400" : "text-zinc-600"
                }`}
              >
                {label}
              </span>
              {label === "Messages" && unreadCount > 0 && (
                <span className="absolute -right-0.5 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-violet-600 px-1 text-[9px] font-bold text-white">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
              {active && (
                <span className="absolute -bottom-1 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-violet-500" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
