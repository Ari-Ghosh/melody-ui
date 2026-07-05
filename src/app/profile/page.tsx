"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { apiGet, apiPut } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import SkeletonProfile from "@/components/skeletons/SkeletonProfile";
import TasteRing from "@/components/TasteRing";
import PhotoUploader from "@/components/PhotoUploader";
import { toast } from "sonner";
import { Settings, LogOut, Music, PenLine, Check, X } from "lucide-react";
import type { TasteProfileSummary } from "@/types";

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, refreshProfile } = useAuth();

  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<string>("prefer_not_to_say");
  const [interestedIn, setInterestedIn] = useState<string>("everyone");

  const [tasteSummary, setTasteSummary] = useState<TasteProfileSummary | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  // Sync editable form fields when the loaded user changes (no effect needed).
  const [prevUser, setPrevUser] = useState(user);
  if (user !== prevUser) {
    setPrevUser(user);
    if (user) {
      setFullName(user.full_name || "");
      setBio(user.bio || "");
      setAge(user.age ? String(user.age) : "");
      setGender(user.gender || "prefer_not_to_say");
      setInterestedIn(user.interested_in || "everyone");
    }
  }

  useEffect(() => {
    if (!user) return;
    let active = true;
    apiGet<TasteProfileSummary>("/api/taste/my-score")
      .then((s) => {
        if (active) setTasteSummary(s);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setDataLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user]);

  const handleSave = async () => {
    if (!fullName.trim()) {
      toast.error("Name is required");
      return;
    }
    try {
      await apiPut("/api/user/me", {
        full_name: fullName,
        bio: bio || undefined,
        age: parseInt(age) || undefined,
        gender,
        interested_in: interestedIn,
      });
      await refreshProfile();
      setEditing(false);
      toast.success("Profile updated");
    } catch {
      toast.error("Failed to update profile");
    }
  };

  const handleCancel = () => {
    if (!user) return;
    setFullName(user.full_name || "");
    setBio(user.bio || "");
    setAge(user.age ? String(user.age) : "");
    setGender(user.gender || "prefer_not_to_say");
    setInterestedIn(user.interested_in || "everyone");
    setEditing(false);
  };

  if (dataLoading && !user) {
    return (
      <main className="min-h-screen bg-zinc-950">
        <SkeletonProfile />
      </main>
    );
  }

  const genderLabels: Record<string, string> = {
    male: "Male",
    female: "Female",
    non_binary: "Non-Binary",
    prefer_not_to_say: "Prefer not to say",
  };

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8">
      <div className="mx-auto max-w-lg space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-zinc-100">Profile</h1>
          <div className="flex gap-2">
            <button
              onClick={() => router.push("/settings")}
              className="rounded-lg border border-zinc-800 p-2 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700 transition-colors"
              aria-label="Settings"
            >
              <Settings className="h-4 w-4" />
            </button>
            <button
              onClick={() => logout()}
              className="rounded-lg border border-zinc-800 p-2 text-zinc-500 hover:text-red-400 hover:border-red-500/30 transition-colors"
              aria-label="Log out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Profile Card */}
        <Card className="border-zinc-800 bg-zinc-900/80">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="relative shrink-0">
                {user?.profile_pics?.[0] ? (
                  <div className="relative">
                    <img
                      src={user.profile_pics[0]}
                      alt=""
                      className="h-20 w-20 rounded-full object-cover ring-2 ring-zinc-700"
                    />
                    <label
                      htmlFor="photo-upload"
                      className="absolute -bottom-1 -right-1 cursor-pointer rounded-full bg-violet-600 p-1.5 text-white shadow-lg hover:bg-violet-700 transition-colors"
                      aria-label="Change photo"
                    >
                      <PenLine className="h-3 w-3" />
                    </label>
                    <PhotoUploader
                      onUploadComplete={() => refreshProfile()}
                    />
                  </div>
                ) : (
                  <PhotoUploader
                    onUploadComplete={() => refreshProfile()}
                  />
                )}
              </div>

              <div className="flex-1 min-w-0">
                {editing ? (
                  <div className="space-y-3">
                    <Input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="border-zinc-700 bg-zinc-800 text-zinc-100"
                      placeholder="Full name"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="number"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        className="border-zinc-700 bg-zinc-800 text-zinc-100"
                        placeholder="Age"
                      />
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="rounded-md border border-zinc-700 bg-zinc-800 text-zinc-100 px-2 py-1.5 text-sm"
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="non_binary">Non-Binary</option>
                        <option value="prefer_not_to_say">Prefer not to say</option>
                      </select>
                    </div>
                    <div className="flex gap-2">
                      {(["men", "women", "everyone"] as const).map((v) => (
                        <button
                          key={v}
                          onClick={() => setInterestedIn(v)}
                          className={`flex-1 rounded-md px-2 py-1 text-xs border transition-colors ${
                            interestedIn === v
                              ? "border-violet-500 bg-violet-500/20 text-violet-300"
                              : "border-zinc-700 text-zinc-400"
                          }`}
                        >
                          {v.charAt(0).toUpperCase() + v.slice(1)}
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      maxLength={500}
                      rows={2}
                      className="w-full rounded-md border border-zinc-700 bg-zinc-800 text-zinc-100 px-3 py-2 text-sm resize-none"
                      placeholder="Your bio..."
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSave}
                        size="sm"
                        className="flex-1 bg-violet-600 hover:bg-violet-700 text-white"
                      >
                        <Check className="h-3 w-3 mr-1" /> Save
                      </Button>
                      <Button
                        onClick={handleCancel}
                        size="sm"
                        variant="outline"
                        className="flex-1 border-zinc-700 text-zinc-300"
                      >
                        <X className="h-3 w-3 mr-1" /> Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between">
                      <div className="min-w-0">
                        <h2 className="text-lg font-semibold text-zinc-100 truncate">
                          {user?.full_name}
                        </h2>
                        <p className="text-sm text-zinc-400">
                          {user?.age} · {genderLabels[user?.gender || ""] || user?.gender}
                        </p>
                        {user?.location && (
                          <p className="text-xs text-zinc-500">
                            {user.location.lat.toFixed(2)}, {user.location.lng.toFixed(2)}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => setEditing(true)}
                        className="shrink-0 rounded-lg border border-zinc-700 p-2 text-zinc-400 hover:text-zinc-200 hover:border-zinc-600 transition-colors"
                        aria-label="Edit profile"
                      >
                        <PenLine className="h-4 w-4" />
                      </button>
                    </div>
                    {user?.bio && (
                      <p className="mt-3 text-sm text-zinc-300 leading-relaxed">{user.bio}</p>
                    )}
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Music Taste Summary */}
        {tasteSummary ? (
          <Card className="border-zinc-800 bg-zinc-900/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-zinc-400 uppercase tracking-wide">
                <Music className="h-4 w-4" />
                Music Taste
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {tasteSummary.top_genres.length > 0 && (
                <div>
                  <p className="text-xs text-zinc-500 mb-2">Top Genres</p>
                  <div className="space-y-1">
                    {tasteSummary.top_genres.slice(0, 5).map((g) => (
                      <div
                        key={g.label}
                        className="flex items-center gap-2 text-xs"
                      >
                        <span className="w-24 truncate text-zinc-300">{g.label}</span>
                        <div className="flex-1 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-violet-500"
                            style={{ width: `${Math.min(100, g.value * 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {tasteSummary.top_artists.length > 0 && (
                <div>
                  <p className="text-xs text-zinc-500 mb-2">Top Artists</p>
                  <div className="flex flex-wrap gap-1">
                    {tasteSummary.top_artists.slice(0, 8).map((a) => (
                      <span
                        key={a.label}
                        className="rounded-full border border-zinc-700 text-zinc-400 px-2 py-0.5 text-xs"
                      >
                        {a.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-4 text-xs text-zinc-500 pt-2 border-t border-zinc-800">
                <span>{tasteSummary.total_swipes} swipes</span>
                <span className="text-emerald-400">{tasteSummary.total_likes} likes</span>
                <span className="text-red-400">{tasteSummary.total_dislikes} dislikes</span>
              </div>
            </CardContent>
          </Card>
        ) : dataLoading ? (
          <Card className="border-zinc-800 bg-zinc-900/80">
            <CardContent className="p-6 space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </CardContent>
          </Card>
        ) : null}

        {/* Premium Status */}
        <Card className="border-zinc-800 bg-zinc-900/80">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-200">
                {user?.is_premium ? "Premium Member" : "Free Member"}
              </p>
              <p className="text-xs text-zinc-500">
                {user?.is_premium
                  ? "All features unlocked"
                  : "Upgrade to unlock unlimited likes"}
              </p>
            </div>
            {!user?.is_premium && (
              <Button
                onClick={() => router.push("/premium")}
                size="sm"
                className="bg-violet-600 hover:bg-violet-700 text-white"
              >
                Upgrade
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="text-center pb-4">
          <button
            onClick={logout}
            className="text-sm text-zinc-500 hover:text-red-400 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </main>
  );
}
