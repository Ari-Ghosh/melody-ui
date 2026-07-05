import { create } from "zustand";

export type Gender = "male" | "female" | "non_binary" | "prefer_not_to_say";
export type InterestedIn = "men" | "women" | "everyone";

export interface ProfileData {
  full_name: string;
  age: number;
  gender: Gender;
  interested_in: InterestedIn;
  bio: string;
  lat: number;
  lng: number;
}

export interface MusicData {
  genre_ids: string[];
  artist_ids: string[];
  answers: { question_id: string; value: number }[];
}

export type OnboardingStep = "profile" | "music" | "complete";

interface OnboardingState {
  step: OnboardingStep;
  profile: ProfileData;
  music: MusicData;
  setStep: (step: OnboardingStep) => void;
  setProfile: (data: Partial<ProfileData>) => void;
  setMusic: (data: Partial<MusicData>) => void;
  reset: () => void;
}

const defaultProfile: ProfileData = {
  full_name: "",
  age: 0,
  gender: "prefer_not_to_say",
  interested_in: "everyone",
  bio: "",
  lat: 0,
  lng: 0,
};

const defaultMusic: MusicData = {
  genre_ids: [],
  artist_ids: [],
  answers: [],
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
  step: "profile",
  profile: defaultProfile,
  music: defaultMusic,
  setStep: (step) => set({ step }),
  setProfile: (data) => set((s) => ({ profile: { ...s.profile, ...data } })),
  setMusic: (data) => set((s) => ({ music: { ...s.music, ...data } })),
  reset: () => set({ step: "profile", profile: defaultProfile, music: defaultMusic }),
}));
