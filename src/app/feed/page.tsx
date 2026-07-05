"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { apiGet, apiPost } from "@/lib/api";
import SwipeCard from "@/components/SwipeCard";
import SwipeCardSkeleton from "@/components/skeletons/SwipeCardSkeleton";
import MatchedModal from "@/components/MatchedModal";
import { toast } from "sonner";

interface Clip {
  id: string;
  title: string;
  artist_id: string;
  artist_name: string;
  genre_ids: string[];
  file_url: string;
  duration_ms: number;
  cover_url: string;
  score: number;
}

export default function FeedPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();
  const [clips, setClips] = useState<Clip[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [page, setPage] = useState(1);
  const [noMoreClips, setNoMoreClips] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [fetching, setFetching] = useState(true);
  const [matchModal, setMatchModal] = useState<{ name: string; id: string } | null>(null);

  const fetchClips = useCallback(async (pageNum: number) => {
    setFetching(true);
    try {
      const data = await apiGet<{ clips: Clip[]; page: number }>(
        `/api/feed/clips?page=${pageNum}&limit=20`
      );
      if (data.clips.length === 0) {
        setNoMoreClips(true);
      } else {
        setClips((prev) => (pageNum === 1 ? data.clips : [...prev, ...data.clips]));
      }
    } catch {
      toast.error("Failed to load clips");
    }
    setFetching(false);
    setInitialLoading(false);
  }, []);

  useEffect(() => {
    if (!loading && !isAuthenticated) router.push("/");
    if (isAuthenticated && user && !user.full_name) router.push("/onboarding/profile");
  }, [loading, isAuthenticated, user, router]);

  // Initial load — setState only in async callbacks to avoid cascading renders.
  useEffect(() => {
    let active = true;
    apiGet<{ clips: Clip[]; page: number }>(`/api/feed/clips?page=1&limit=20`)
      .then((data) => {
        if (!active) return;
        if (data.clips.length === 0) setNoMoreClips(true);
        else setClips(data.clips);
      })
      .catch(() => {
        if (active) toast.error("Failed to load clips");
      })
      .finally(() => {
        if (!active) return;
        setFetching(false);
        setInitialLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const loadMore = useCallback(() => {
    if (noMoreClips || fetching) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchClips(nextPage);
  }, [noMoreClips, fetching, page, fetchClips]);

  const { sentinelRef } = useInfiniteScroll({
    onLoadMore: loadMore,
    hasMore: !noMoreClips,
    loading: fetching,
  });

  const handleSwipe = useCallback(
    async (direction: "like" | "dislike") => {
      const clip = clips[currentIndex];
      if (!clip) return;
      try {
        const res = await apiPost<{ is_match?: boolean; matched_user?: { id: string; name: string } }>(
          "/api/feed/swipe",
          { clip_id: clip.id, direction }
        );
        if (res.is_match && res.matched_user) {
          setMatchModal({ name: res.matched_user.name, id: res.matched_user.id });
        }
      } catch {
        toast.error("Failed to record swipe");
      }
      setCurrentIndex((i) => i + 1);
    },
    [clips, currentIndex]
  );

  if (loading || initialLoading) {
    return (
      <main className="min-h-screen bg-zinc-950 px-4 py-8">
        <div className="mx-auto max-w-md">
          <div className="mb-6">
            <div className="h-8 w-24 rounded-md bg-zinc-800/50 animate-pulse" />
          </div>
          <SwipeCardSkeleton />
        </div>
      </main>
    );
  }

  const currentClip = clips[currentIndex];

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8">
      <div className="mx-auto max-w-md">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-zinc-100">Discover</h1>
          <button
            onClick={() => router.push("/matches")}
            className="text-sm text-violet-400 hover:text-violet-300 transition-colors"
          >
            Matches
          </button>
        </div>

        {currentClip ? (
          <SwipeCard
            onSwipeLeft={() => handleSwipe("dislike")}
            onSwipeRight={() => handleSwipe("like")}
            disabled={!!matchModal}
          >
            <div className="p-6 space-y-4">
              <div className="aspect-square rounded-xl bg-zinc-800 flex items-center justify-center overflow-hidden">
                {currentClip.cover_url ? (
                  <img src={currentClip.cover_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-6xl text-zinc-700">♫</span>
                )}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-zinc-100">{currentClip.title}</h2>
                <p className="text-sm text-zinc-400">{currentClip.artist_name || "Unknown Artist"}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500">
                  {(currentClip.duration_ms / 1000).toFixed(0)}s
                </span>
                {currentClip.genre_ids.map((g) => (
                  <span
                    key={g}
                    className="rounded-full bg-violet-500/15 text-violet-400 px-2 py-0.5 text-[10px]"
                  >
                    {g}
                  </span>
                ))}
              </div>
              {currentClip.file_url && (
                <audio controls className="w-full mt-2" preload="metadata">
                  <source src={currentClip.file_url} type="audio/mpeg" />
                </audio>
              )}
            </div>
          </SwipeCard>
        ) : (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center">
            <div className="mb-4 text-5xl">🎵</div>
            <h2 className="mb-2 text-lg font-semibold text-zinc-200">
              {fetching ? "Loading..." : noMoreClips ? "Caught Up!" : "No clips found"}
            </h2>
            <p className="text-sm text-zinc-500">
              {fetching
                ? "Finding music clips for you."
                : noMoreClips
                ? "Check back later for new music clips."
                : "Try updating your music preferences."}
            </p>
          </div>
        )}

        {/* Infinite scroll sentinel */}
        <div ref={sentinelRef} className="h-4" />

        <div className="mt-4 text-center">
          <span className="text-xs text-zinc-600">
            {clips.length > 0
              ? `${Math.min(currentIndex + 1, clips.length)} / ${clips.length} clips`
              : ""}
          </span>
        </div>
      </div>

      {matchModal && (
        <MatchedModal
          matchedName={matchModal.name}
          matchedId={matchModal.id}
          onClose={() => setMatchModal(null)}
        />
      )}
    </main>
  );
}
