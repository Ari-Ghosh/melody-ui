"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { apiGet, apiPost } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import TasteRing from "@/components/TasteRing";
import MatchedModal from "@/components/MatchedModal";
import { SkeletonList } from "@/components/skeletons/SkeletonListItem";
import { toast } from "sonner";
import { X, Heart, Zap, Sparkles } from "lucide-react";

interface Candidate {
  id: string;
  full_name: string;
  age: number;
  gender: string;
  bio: string;
  profile_pic: string;
  location_lat: number;
  location_lng: number;
  distance_km: number;
  score: number;
  match_label: string;
  common_genres: string[];
  common_artists: string[];
}

interface Connection {
  id: string;
  full_name: string;
  age: number;
  profile_pic: string;
  compatibility_score: number;
  matched_at: string;
}

export default function MatchesPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();
  const [tab, setTab] = useState<"discover" | "connections">("discover");
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [candidatePage, setCandidatePage] = useState(1);
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [fetching, setFetching] = useState(true);
  const [noMoreCandidates, setNoMoreCandidates] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [matchModal, setMatchModal] = useState<{ name: string; id: string } | null>(null);

  useEffect(() => {
    if (!loading && !isAuthenticated) router.push("/");
    if (isAuthenticated && user && !user.full_name) router.push("/onboarding/profile");
  }, [loading, isAuthenticated, user, router]);

  const fetchCandidates = useCallback(async (pageNum: number) => {
    setFetching(true);
    try {
      const data = await apiGet<{ candidates: Candidate[]; page: number }>(
        `/api/match/potential?page=${pageNum}`
      );
      if (data.candidates.length === 0) {
        setNoMoreCandidates(true);
      } else {
        setCandidates((prev) => (pageNum === 1 ? data.candidates : [...prev, ...data.candidates]));
      }
    } catch {
      toast.error("Failed to load candidates");
    }
    setFetching(false);
    setInitialLoading(false);
  }, []);

  const fetchConnections = useCallback(async () => {
    try {
      const data = await apiGet<{ connections: Connection[] }>("/api/match/connections");
      setConnections(data.connections);
    } catch {
      // silent fail on connections reload
    }
  }, []);

  // Initial load — setState only in async callbacks to avoid cascading renders.
  useEffect(() => {
    let active = true;
    const loadCandidates = async () => {
      try {
        const data = await apiGet<{ candidates: Candidate[]; page: number }>(
          `/api/match/potential?page=1`
        );
        if (!active) return;
        if (data.candidates.length === 0) setNoMoreCandidates(true);
        else setCandidates(data.candidates);
      } catch {
        if (active) toast.error("Failed to load candidates");
      } finally {
        if (!active) return;
        setFetching(false);
        setInitialLoading(false);
      }
    };
    const loadConnections = async () => {
      try {
        const data = await apiGet<{ connections: Connection[] }>("/api/match/connections");
        if (active) setConnections(data.connections);
      } catch {
        // silent fail on connections reload
      }
    };
    loadCandidates();
    loadConnections();
    return () => {
      active = false;
    };
  }, []);

  const loadMoreCandidates = useCallback(() => {
    if (noMoreCandidates || fetching) return;
    const nextPage = candidatePage + 1;
    setCandidatePage(nextPage);
    fetchCandidates(nextPage);
  }, [noMoreCandidates, fetching, candidatePage, fetchCandidates]);

  const { sentinelRef } = useInfiniteScroll({
    onLoadMore: loadMoreCandidates,
    hasMore: !noMoreCandidates,
    loading: fetching,
  });

  const advanceIndex = useCallback(() => {
    const next = candidateIndex + 1;
    setCandidateIndex(next);
    if (next >= candidates.length - 3 && !fetching && !noMoreCandidates) {
      loadMoreCandidates();
    }
  }, [candidateIndex, candidates.length, fetching, noMoreCandidates, loadMoreCandidates]);

  const handleAction = useCallback(
    async (targetId: string, type: "like" | "spark" | "love") => {
      try {
        const res = await apiPost<{ status: string; is_match?: boolean; compatibility?: number }>(
          `/api/match/${type}/${targetId}`
        );
        if (res.is_match) {
          const current = candidates[candidateIndex];
          setMatchModal({
            name: current?.full_name || "Someone",
            id: targetId,
          });
          fetchConnections();
        }
        advanceIndex();
      } catch {
        toast.error(`${type} failed`);
      }
    },
    [candidates, candidateIndex, advanceIndex, fetchConnections]
  );

  const handlePass = useCallback(
    async (targetId: string) => {
      try {
        await apiPost(`/api/match/pass/${targetId}`);
        advanceIndex();
      } catch {
        toast.error("Pass failed");
      }
    },
    [advanceIndex]
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  const current = candidates[candidateIndex];

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8">
      <div className="mx-auto max-w-md">
        {/* Tab bar */}
        <div className="flex rounded-lg bg-zinc-900 border border-zinc-800 p-1 mb-6">
          <button
            onClick={() => setTab("discover")}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
              tab === "discover"
                ? "bg-violet-600 text-white"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Discover
          </button>
          <button
            onClick={() => setTab("connections")}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
              tab === "connections"
                ? "bg-violet-600 text-white"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Connections ({connections.length})
          </button>
        </div>

        {tab === "discover" ? (
          <div>
            {initialLoading ? (
              <SkeletonList count={1} />
            ) : current ? (
              <div className="space-y-6">
                {/* Candidate card */}
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden">
                  <div className="aspect-[3/4] bg-zinc-800 flex items-center justify-center overflow-hidden">
                    {current.profile_pic ? (
                      <img src={current.profile_pic} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-6xl text-zinc-700">♫</span>
                    )}
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-lg font-semibold text-zinc-100">{current.full_name}</h2>
                        <p className="text-sm text-zinc-400">
                          {current.age} · {current.distance_km}km away
                        </p>
                      </div>
                      {current.score > 0 && (
                        <TasteRing score={current.score} label={current.match_label} size={80} />
                      )}
                    </div>
                    {current.bio && (
                      <p className="text-sm text-zinc-300 leading-relaxed">{current.bio}</p>
                    )}
                    {current.common_genres.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {current.common_genres.map((g) => (
                          <span
                            key={g}
                            className="rounded-full bg-violet-500/15 text-violet-300 px-2 py-0.5 text-xs"
                          >
                            {g}
                          </span>
                        ))}
                      </div>
                    )}
                    {current.common_artists.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {current.common_artists.map((a) => (
                          <span
                            key={a}
                            className="rounded-full border border-zinc-700 text-zinc-400 px-2 py-0.5 text-xs"
                          >
                            {a}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* 4-action button bar */}
                <div className="flex items-center justify-center gap-4">
                  {/* Pass */}
                  <button
                    onClick={() => handlePass(current.id)}
                    className="group flex h-14 w-14 items-center justify-center rounded-full border-2 border-zinc-700 bg-zinc-900 transition-all hover:border-red-500/50 hover:bg-red-500/10"
                    aria-label="Pass"
                  >
                    <X className="h-6 w-6 text-zinc-400 transition-colors group-hover:text-red-400" />
                  </button>

                  {/* Like */}
                  <button
                    onClick={() => handleAction(current.id, "like")}
                    className="group flex h-16 w-16 items-center justify-center rounded-full border-2 border-emerald-500/50 bg-zinc-900 transition-all hover:bg-emerald-500/10 hover:shadow-lg hover:shadow-emerald-500/20"
                    aria-label="Like"
                  >
                    <Heart className="h-7 w-7 text-emerald-400 transition-all group-hover:scale-110" />
                  </button>

                  {/* Spark (premium) */}
                  <button
                    onClick={() => handleAction(current.id, "spark")}
                    className="group flex h-14 w-14 items-center justify-center rounded-full border-2 border-violet-500/30 bg-zinc-900 transition-all hover:border-violet-400 hover:bg-violet-500/10"
                    aria-label="Spark (premium)"
                  >
                    <Zap className="h-6 w-6 text-violet-400" />
                  </button>

                  {/* Love (premium) */}
                  <button
                    onClick={() => handleAction(current.id, "love")}
                    className="group flex h-14 w-14 items-center justify-center rounded-full border-2 border-pink-500/30 bg-zinc-900 transition-all hover:border-pink-400 hover:bg-pink-500/10"
                    aria-label="Love (premium)"
                  >
                    <Sparkles className="h-6 w-6 text-pink-400" />
                  </button>
                </div>

                {/* Infinite scroll sentinel */}
                <div ref={sentinelRef} className="h-4" />
              </div>
            ) : (
              <Card className="border-zinc-800 bg-zinc-900/80">
                <CardContent className="p-8 text-center">
                  <div className="mb-4 text-5xl">🎵</div>
                  <h2 className="mb-2 text-lg font-semibold text-zinc-200">
                    {fetching ? "Finding matches..." : "No more matches"}
                  </h2>
                  <p className="text-sm text-zinc-500">
                    {fetching
                      ? "We're looking for people who share your taste."
                      : "Check back later or expand your preferences."}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          /* Connections tab */
          <div className="space-y-3">
            {connections.length === 0 ? (
              <Card className="border-zinc-800 bg-zinc-900/80">
                <CardContent className="p-8 text-center">
                  <h2 className="text-lg font-semibold text-zinc-200">No connections yet</h2>
                  <p className="text-sm text-zinc-500 mt-1">Like people to create matches!</p>
                </CardContent>
              </Card>
            ) : (
              connections.map((conn) => (
                <button
                  key={conn.id}
                  onClick={() => router.push(`/profile/${conn.id}`)}
                  className="w-full text-left"
                >
                  <Card className="border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800/80 transition-colors">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="h-14 w-14 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 overflow-hidden">
                        {conn.profile_pic ? (
                          <img src={conn.profile_pic} className="h-14 w-14 object-cover" alt="" />
                        ) : (
                          <span className="text-xl text-zinc-600">♫</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-zinc-200 truncate">{conn.full_name}</p>
                        <p className="text-xs text-zinc-500">{conn.age}</p>
                      </div>
                      {conn.compatibility_score > 0 && (
                        <div className="text-right">
                          <span className="text-sm font-bold text-violet-400">
                            {Math.round(conn.compatibility_score)}%
                          </span>
                          <p className="text-[10px] text-zinc-600">Match</p>
                        </div>
                      )}
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-zinc-600"
                      >
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </CardContent>
                  </Card>
                </button>
              ))
            )}
          </div>
        )}
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
