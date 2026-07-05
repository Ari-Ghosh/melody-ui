"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { apiDelete, apiPut } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Save, Trash2 } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const { user, refreshProfile, logout } = useAuth();

  // Account
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [age, setAge] = useState("");

  // Preferences
  const [interestedIn, setInterestedIn] = useState("everyone");
  const [gender, setGender] = useState("prefer_not_to_say");
  const [maxDistance, setMaxDistance] = useState(50);
  const [ageMin, setAgeMin] = useState(18);
  const [ageMax, setAgeMax] = useState(60);

  const [saving, setSaving] = useState(false);

  // Sync form fields when the loaded user changes (no effect needed).
  const [prevUser, setPrevUser] = useState(user);
  if (user !== prevUser) {
    setPrevUser(user);
    if (user) {
      setFullName(user.full_name || "");
      setBio(user.bio || "");
      setAge(user.age ? String(user.age) : "");
      setInterestedIn(user.interested_in || "everyone");
      setGender(user.gender || "prefer_not_to_say");
    }
  }

  const handleSaveAccount = async () => {
    if (!fullName.trim()) {
      toast.error("Name is required");
      return;
    }
    setSaving(true);
    try {
      await apiPut("/api/user/me", {
        full_name: fullName,
        bio: bio || undefined,
        age: parseInt(age) || undefined,
        gender,
        interested_in: interestedIn,
      });
      await refreshProfile();
      toast.success("Settings saved");
    } catch {
      toast.error("Failed to save settings");
    }
    setSaving(false);
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure you want to delete your account? This cannot be undone.")) return;
    if (!confirm("Really? All your matches, messages, and data will be permanently deleted.")) return;
    try {
      await apiDelete("/api/user/me");
      toast.success("Account deleted");
      logout();
    } catch {
      toast.error("Failed to delete account");
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8">
      <div className="mx-auto max-w-lg space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="text-zinc-400 hover:text-zinc-200 transition-colors"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-zinc-100">Settings</h1>
        </div>

        {/* Account */}
        <Card className="border-zinc-800 bg-zinc-900/80">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-zinc-400 uppercase tracking-wide">
              Account
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-zinc-300">Full Name</Label>
              <Input
                id="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="border-zinc-700 bg-zinc-800 text-zinc-100"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age" className="text-zinc-300">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="border-zinc-700 bg-zinc-800 text-zinc-100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender" className="text-zinc-300">Gender</Label>
                <select
                  id="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
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
              <Label htmlFor="bio" className="text-zinc-300">Bio</Label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={500}
                rows={3}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-100 px-3 py-2 text-sm resize-none"
              />
            </div>
            <Button
              onClick={handleSaveAccount}
              disabled={saving}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card className="border-zinc-800 bg-zinc-900/80">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-zinc-400 uppercase tracking-wide">
              Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-zinc-300">Interested In</Label>
              <div className="flex gap-2">
                {(["men", "women", "everyone"] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setInterestedIn(v)}
                    className={`flex-1 rounded-md px-3 py-2 text-sm border transition-colors ${
                      interestedIn === v
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
              <Label className="text-zinc-300">
                Max Distance: {maxDistance}km
              </Label>
              <input
                type="range"
                min={5}
                max={200}
                step={5}
                value={maxDistance}
                onChange={(e) => setMaxDistance(parseInt(e.target.value))}
                className="w-full accent-violet-500"
              />
              <div className="flex justify-between text-[10px] text-zinc-600">
                <span>5km</span>
                <span>200km</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-300">
                Age Range: {ageMin} – {ageMax}
              </Label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={18}
                  max={100}
                  value={ageMin}
                  onChange={(e) => setAgeMin(Math.min(parseInt(e.target.value), ageMax))}
                  className="flex-1 accent-violet-500"
                />
                <input
                  type="range"
                  min={18}
                  max={100}
                  value={ageMax}
                  onChange={(e) => setAgeMax(Math.max(parseInt(e.target.value), ageMin))}
                  className="flex-1 accent-violet-500"
                />
              </div>
              <div className="flex justify-between text-[10px] text-zinc-600">
                <span>18</span>
                <span>100</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Safety */}
        <Card className="border-zinc-800 bg-zinc-900/80">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-zinc-400 uppercase tracking-wide">
              Safety
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="text-zinc-400">
              If someone is making you feel unsafe, you can report or block them from their profile page.
            </p>
            <p className="text-zinc-500 text-xs mt-2">
              All reports are reviewed by our moderation team.
            </p>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-500/20 bg-red-500/5">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-red-400 uppercase tracking-wide">
              Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleDeleteAccount}
              variant="outline"
              className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Account
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
