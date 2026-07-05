"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useApi } from "@/hooks/useApi";
import { useOnboardingStore } from "@/store/onboarding";
import { apiGet } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import type { Genre, Artist, Question } from "@/types";

export default function OnboardingMusicPage() {
  const router = useRouter();
  const { onboard } = useAuth();
  const { profile, music, setMusic, setStep, reset } = useOnboardingStore();
  const onboardApi = useApi();

  const [genres, setGenres] = useState<Genre[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [artistQuery, setArtistQuery] = useState("");
  const [artistResults, setArtistResults] = useState<Artist[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState("");
  const [answerMap, setAnswerMap] = useState<Record<string, number>>({});

  useEffect(() => {
    Promise.all([
      apiGet<Genre[]>("/api/music/genres").then(setGenres).catch(() => {}),
      apiGet<Question[]>("/api/music/questions").then(setQuestions).catch(() => {}),
    ]).finally(() => setDataLoading(false));
  }, []);

  const searchArtists = useCallback(async (q: string) => {
    if (q.length < 2) {
      setArtistResults([]);
      return;
    }
    try {
      const results = await apiGet<Artist[]>(
        `/api/music/artists/search?q=${encodeURIComponent(q)}`
      );
      setArtistResults(results);
    } catch {
      setArtistResults([]);
    }
  }, []);

  const toggleGenre = (id: string) => {
    const next = music.genre_ids.includes(id)
      ? music.genre_ids.filter((g) => g !== id)
      : [...music.genre_ids, id];
    setMusic({ genre_ids: next });
  };

  const addArtist = (artist: Artist) => {
    if (!music.artist_ids.includes(artist.id)) {
      setMusic({ artist_ids: [...music.artist_ids, artist.id] });
    }
    setArtistQuery("");
    setArtistResults([]);
  };

  const removeArtist = (id: string) => {
    setMusic({ artist_ids: music.artist_ids.filter((a) => a !== id) });
  };

  const handleSubmit = async () => {
    setError("");
    if (music.genre_ids.length === 0) {
      setError("Select at least one genre");
      return;
    }
    if (!profile.full_name || !profile.age) {
      toast.error("Profile data missing. Go back and fill in your profile.");
      return;
    }
    try {
      await onboard({
        full_name: profile.full_name,
        age: profile.age,
        gender: profile.gender,
        interested_in: profile.interested_in,
        location: { lat: profile.lat, lng: profile.lng },
        bio: profile.bio || undefined,
        profile_pics: [],
        genre_ids: music.genre_ids,
        artist_ids: music.artist_ids,
        answers: Object.entries(answerMap).map(([question_id, value]) => ({
          question_id,
          value,
        })),
      });
      reset();
      toast.success("Profile created! Let's find your matches.");
      router.push("/feed");
    } catch {
      setError("Failed to save profile");
    }
  };

  if (dataLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-zinc-900 to-zinc-950 px-4">
        <Card className="w-full max-w-lg border-zinc-800 bg-zinc-900/80">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </CardHeader>
          <CardContent className="space-y-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-zinc-900 to-zinc-950 px-4 py-8">
      <Card className="w-full max-w-lg border-zinc-800 bg-zinc-900/80 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-zinc-100">Your Music Taste</CardTitle>
          <CardDescription className="text-zinc-400">
            This is how we match you with people
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Genres */}
          <div className="space-y-2">
            <Label className="text-zinc-300 text-sm font-medium">Favorite Genres</Label>
            <div className="flex flex-wrap gap-2">
              {genres.map((genre) => (
                <button
                  key={genre.id}
                  onClick={() => toggleGenre(genre.id)}
                  className={`rounded-full px-3 py-1 text-xs border transition-colors ${
                    music.genre_ids.includes(genre.id)
                      ? "border-violet-500 bg-violet-500/20 text-violet-300"
                      : "border-zinc-700 text-zinc-400 hover:border-zinc-600"
                  }`}
                >
                  {genre.name}
                </button>
              ))}
            </div>
          </div>

          {/* Artists */}
          <div className="space-y-2">
            <Label className="text-zinc-300 text-sm font-medium">Favorite Artists</Label>
            <Input
              placeholder="Search artists..."
              value={artistQuery}
              onChange={(e) => {
                setArtistQuery(e.target.value);
                searchArtists(e.target.value);
              }}
              className="border-zinc-700 bg-zinc-800 text-zinc-100 placeholder:text-zinc-500"
            />
            {artistResults.length > 0 && (
              <div className="border border-zinc-700 rounded-md max-h-32 overflow-y-auto">
                {artistResults.map((artist) => (
                  <button
                    key={artist.id}
                    onClick={() => addArtist(artist)}
                    className="w-full text-left px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800 border-b border-zinc-800 last:border-0"
                  >
                    {artist.name}
                  </button>
                ))}
              </div>
            )}
            {music.artist_ids.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {music.artist_ids.map((id) => {
                  const artist = artistResults.find((a) => a.id === id);
                  return (
                    <span
                      key={id}
                      className="rounded-full bg-violet-500/20 text-violet-300 px-2 py-0.5 text-xs flex items-center gap-1"
                    >
                      {artist?.name || id.slice(0, 8)}
                      <button onClick={() => removeArtist(id)} className="hover:text-red-400">
                        ×
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          {/* Questions */}
          {questions.map((q) => (
            <div key={q.id} className="space-y-2">
              <Label className="text-zinc-300 text-sm font-medium">{q.question_text}</Label>
              <div className="flex gap-2">
                {q.options.map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() =>
                      setAnswerMap((prev) => ({ ...prev, [q.id]: opt.value }))
                    }
                    className={`flex-1 rounded-md px-2 py-1.5 text-xs border transition-colors ${
                      answerMap[q.id] === opt.value
                        ? "border-violet-500 bg-violet-500/20 text-violet-300"
                        : "border-zinc-700 text-zinc-400 hover:border-zinc-600"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {error && <p className="text-sm text-red-400">{error}</p>}

          <Button
            onClick={handleSubmit}
            disabled={onboardApi.loading}
            className="w-full bg-violet-600 hover:bg-violet-700 text-white"
          >
            {onboardApi.loading ? "Creating Profile..." : "Complete Profile"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
