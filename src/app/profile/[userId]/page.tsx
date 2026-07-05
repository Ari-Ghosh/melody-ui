"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiGet, apiPost } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import TasteRing from "@/components/TasteRing";
import ReportModal from "@/components/ReportModal";
import { toast } from "sonner";
import type { User, TasteMatch, TasteProfileSummary } from "@/types";

export default function ProfilePage() {
  const params = useParams<{ userId: string }>();
  const router = useRouter();
  const userId = params.userId;

  const [profile, setProfile] = useState<User | null>(null);
  const [taste, setTaste] = useState<TasteMatch | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showReport, setShowReport] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    if (!userId) return;
    let active = true;
    (async () => {
      try {
        const [profileData, tasteData] = await Promise.all([
          apiGet<User>(`/api/user/profile/${userId}`),
          apiGet<TasteMatch>(`/api/taste/compatibility/${userId}`),
        ]);
        if (!active) return;
        setProfile(profileData);
        setTaste(tasteData);
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : "Failed to load profile");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [userId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 gap-4 px-4">
        <p className="text-zinc-400">{error || "Profile not found"}</p>
        <Button onClick={() => router.back()} variant="outline" className="border-zinc-700 text-zinc-300">
          Go Back
        </Button>
      </div>
    );
  }

  const genderLabels: Record<string, string> = {
    male: "Male", female: "Female", non_binary: "Non-Binary", prefer_not_to_say: "Prefer not to say",
  };

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8">
      <div className="mx-auto max-w-lg space-y-6">
        {/* Profile card */}
        <Card className="border-zinc-800 bg-zinc-900/80">
          <CardContent className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="h-20 w-20 rounded-full bg-zinc-800 flex items-center justify-center text-3xl shrink-0">
                {profile.profile_pics?.[0] ? (
                  <img src={profile.profile_pics[0]} className="h-20 w-20 rounded-full object-cover" />
                ) : (
                  <span className="text-zinc-600">♫</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold text-zinc-100 truncate">{profile.full_name}</h1>
                <p className="text-sm text-zinc-400">
                  {profile.age} · {genderLabels[profile.gender] || profile.gender}
                </p>
                {profile.location && (
                  <p className="text-xs text-zinc-500">
                    {profile.location.lat.toFixed(2)}, {profile.location.lng.toFixed(2)}
                  </p>
                )}
              </div>
            </div>
            {profile.bio && <p className="text-sm text-zinc-300 leading-relaxed">{profile.bio}</p>}
          </CardContent>
        </Card>

        {/* Taste Meter */}
        {taste && (
          <Card className="border-zinc-800 bg-zinc-900/80">
            <CardContent className="p-6">
              <h2 className="mb-4 text-sm font-medium text-zinc-400 uppercase tracking-wide">Music Compatibility</h2>
              <TasteRing score={taste.score} breakdown={taste.breakdown} label={taste.match_label} size={160} />
              {taste.common_items.genres.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-xs text-zinc-500">Shared Genres</p>
                  <div className="flex flex-wrap gap-1">
                    {taste.common_items.genres.map((g) => (
                      <span key={g} className="rounded-full bg-violet-500/15 text-violet-300 px-2 py-0.5 text-xs">
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {taste.common_items.artists.length > 0 && (
                <div className="mt-2 space-y-2">
                  <p className="text-xs text-zinc-500">Shared Artists</p>
                  <div className="flex flex-wrap gap-1">
                    {taste.common_items.artists.map((a) => (
                      <span key={a} className="rounded-full border border-zinc-700 text-zinc-400 px-2 py-0.5 text-xs">
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Their genres */}
        {profile.genres && profile.genres.length > 0 && (
          <Card className="border-zinc-800 bg-zinc-900/80">
            <CardContent className="p-6">
              <h2 className="mb-3 text-sm font-medium text-zinc-400 uppercase tracking-wide">Genres</h2>
              <div className="flex flex-wrap gap-2">
                {profile.genres.map((ug) => (
                  <span key={ug.genre_id} className="rounded-full bg-violet-500/20 text-violet-300 px-3 py-1 text-xs">
                    {ug.genre?.name || ug.genre_id}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Their artists */}
        {profile.artists && profile.artists.length > 0 && (
          <Card className="border-zinc-800 bg-zinc-900/80">
            <CardContent className="p-6">
              <h2 className="mb-3 text-sm font-medium text-zinc-400 uppercase tracking-wide">Artists</h2>
              <div className="flex flex-wrap gap-1">
                {profile.artists.map((ua) => (
                  <span key={ua.artist_id} className="rounded-full border border-zinc-700 text-zinc-400 px-2 py-0.5 text-xs">
                    {ua.artist?.name || ua.artist_id}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={() => router.push("/matches")}
            className="flex-1 bg-violet-600 hover:bg-violet-700 text-white"
          >
            View Matches
          </Button>
          <Button
            onClick={() => router.push("/feed")}
            variant="outline"
            className="flex-1 border-zinc-700 text-zinc-300"
          >
            Discover Music
          </Button>
        </div>

        {/* Safety actions */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setShowReport(true)}
            className="rounded-lg border border-zinc-800 py-2 text-xs text-zinc-500 hover:text-red-400 hover:border-red-500/30 transition-colors"
          >
            Report
          </button>
          <button
            onClick={async () => {
              try {
                if (blocked) {
                  await apiPost(`/api/safety/unblock/${userId}`);
                  setBlocked(false);
                } else {
                  await apiPost(`/api/safety/block/${userId}`);
                  setBlocked(true);
                }
              } catch {
                toast.error("Block action failed");
              }
            }}
            className={`rounded-lg border py-2 text-xs transition-colors ${
              blocked
                ? "border-red-500/30 bg-red-500/10 text-red-400"
                : "border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700"
            }`}
          >
            {blocked ? "Unblock" : "Block"}
          </button>
          <button
            onClick={async () => {
              try {
                await apiPost(`/api/safety/mute/${userId}`);
                setMuted(!muted);
              } catch {
                toast.error("Mute action failed");
              }
            }}
            className={`rounded-lg border py-2 text-xs transition-colors ${
              muted
                ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
                : "border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700"
            }`}
          >
            {muted ? "Muted" : "Mute"}
          </button>
        </div>
      </div>

      {showReport && (
        <ReportModal
          targetUserId={userId}
          targetName={profile.full_name}
          onClose={() => setShowReport(false)}
        />
      )}
    </main>
  );
}
