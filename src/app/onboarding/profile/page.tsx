"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useOnboardingStore } from "@/store/onboarding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Crosshair } from "lucide-react";

export default function OnboardingProfilePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { profile, setProfile, setStep } = useOnboardingStore();
  const geo = useGeolocation();
  const [error, setError] = useState("");

  useEffect(() => {
    if (geo.latitude && geo.longitude) {
      setProfile({ lat: geo.latitude, lng: geo.longitude });
    }
  }, [geo.latitude, geo.longitude, setProfile]);

  const handleNext = () => {
    setError("");
    if (!profile.full_name.trim()) {
      setError("Name is required");
      return;
    }
    if (profile.age < 13 || profile.age > 120) {
      setError("Age must be 13-120");
      return;
    }
    if (!profile.lat || !profile.lng) {
      if (!geo.loading) {
        setError("Enable location or enter coordinates manually");
      }
      return;
    }
    setStep("music");
    router.push("/onboarding/music");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-zinc-900 to-zinc-950 px-4 py-8">
      <Card className="w-full max-w-md border-zinc-800 bg-zinc-900/80 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-zinc-100">Create Your Profile</CardTitle>
          <CardDescription className="text-zinc-400">
            Tell people about yourself
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-zinc-300">Full Name</Label>
            <Input
              id="name"
              value={profile.full_name}
              onChange={(e) => setProfile({ full_name: e.target.value })}
              placeholder="Your name"
              className="border-zinc-700 bg-zinc-800 text-zinc-100 placeholder:text-zinc-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="age" className="text-zinc-300">Age</Label>
              <Input
                id="age"
                type="number"
                value={profile.age || ""}
                onChange={(e) => setProfile({ age: parseInt(e.target.value) || 0 })}
                placeholder="25"
                className="border-zinc-700 bg-zinc-800 text-zinc-100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender" className="text-zinc-300">Gender</Label>
              <select
                id="gender"
                value={profile.gender}
                onChange={(e) => setProfile({ gender: e.target.value as typeof profile.gender })}
                className="w-full rounded-md border border-zinc-700 bg-zinc-800 text-zinc-100 px-3 py-2 text-sm"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="non_binary">Non-Binary</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-zinc-300">Interested In</Label>
            <div className="flex gap-2">
              {(["men", "women", "everyone"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setProfile({ interested_in: v })}
                  className={`flex-1 rounded-md px-3 py-2 text-sm border transition-colors ${
                    profile.interested_in === v
                      ? "border-violet-500 bg-violet-500/20 text-violet-300"
                      : "border-zinc-700 text-zinc-400 hover:border-zinc-600"
                  }`}
                >
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio" className="text-zinc-300">Bio</Label>
            <textarea
              id="bio"
              value={profile.bio}
              onChange={(e) => setProfile({ bio: e.target.value })}
              maxLength={500}
              rows={3}
              placeholder="What makes you unique?"
              className="w-full rounded-md border border-zinc-700 bg-zinc-800 text-zinc-100 px-3 py-2 text-sm min-h-[80px] resize-none placeholder:text-zinc-500"
            />
            <p className="text-right text-[10px] text-zinc-600">{profile.bio.length}/500</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-zinc-300">Location</Label>
              <button
                onClick={geo.request}
                disabled={geo.loading}
                className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 disabled:opacity-50"
              >
                <Crosshair className="h-3 w-3" />
                {geo.loading ? "Getting location..." : "Use current location"}
              </button>
            </div>
            {geo.latitude && geo.longitude ? (
              <div className="flex items-center gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-400">
                <MapPin className="h-3 w-3 shrink-0" />
                Location set: {geo.latitude.toFixed(4)}, {geo.longitude.toFixed(4)}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Input
                    type="text"
                    value={profile.lat || ""}
                    onChange={(e) => setProfile({ lat: parseFloat(e.target.value) || 0 })}
                    placeholder="Latitude"
                    className="border-zinc-700 bg-zinc-800 text-zinc-100 placeholder:text-zinc-500"
                  />
                </div>
                <div>
                  <Input
                    type="text"
                    value={profile.lng || ""}
                    onChange={(e) => setProfile({ lng: parseFloat(e.target.value) || 0 })}
                    placeholder="Longitude"
                    className="border-zinc-700 bg-zinc-800 text-zinc-100 placeholder:text-zinc-500"
                  />
                </div>
              </div>
            )}
            {geo.error && (
              <p className="text-xs text-amber-400">{geo.error}</p>
            )}
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <Button
            onClick={handleNext}
            disabled={geo.loading}
            className="w-full bg-violet-600 hover:bg-violet-700 text-white"
          >
            {geo.loading ? "Getting location..." : "Next: Music Taste"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
