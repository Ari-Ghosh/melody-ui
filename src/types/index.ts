export interface User {
  id: string;
  phone?: string;
  email?: string;
  full_name: string;
  age: number;
  gender: "male" | "female" | "non_binary" | "prefer_not_to_say";
  interested_in: "men" | "women" | "everyone";
  location?: { lat: number; lng: number };
  bio?: string;
  profile_pics: string[];
  is_premium: boolean;
  status: string;
  role?: string;
  created_at: string;
  updated_at: string;
  genres?: UserGenre[];
  artists?: UserArtist[];
  answers?: UserAnswer[];
}

export interface Genre {
  id: string;
  name: string;
  slug: string;
  parent_id?: string;
}

export interface Artist {
  id: string;
  name: string;
  slug: string;
  genres: string[];
  spotify_id?: string;
}

export interface Question {
  id: string;
  key: string;
  category: "discovery" | "activity";
  question_text: string;
  answer_type: "likert_scale" | "single_choice" | "multi_choice";
  options: OptionItem[];
}

export interface OptionItem {
  label: string;
  value: number;
}

export interface UserGenre {
  user_id: string;
  genre_id: string;
  weight: number;
  genre?: Genre;
}

export interface UserArtist {
  user_id: string;
  artist_id: string;
  weight: number;
  artist?: Artist;
}

export interface UserAnswer {
  user_id: string;
  question_id: string;
  value: number;
  question?: Question;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  is_new_user: boolean;
  user_id: string;
}

export interface OnboardRequest {
  full_name: string;
  age: number;
  gender: User["gender"];
  interested_in: User["interested_in"];
  location: { lat: number; lng: number };
  bio?: string;
  profile_pics: string[];
  genre_ids: string[];
  artist_ids: string[];
  answers: { question_id: string; value: number }[];
}

export interface TasteMatch {
  score: number;
  breakdown: TasteBreakdown;
  match_label: string;
  common_items: CommonItems;
}

export interface TasteBreakdown {
  genre: number;
  artist: number;
  swipe: number;
  discovery: number;
  activity: number;
  serendipity: number;
}

export interface CommonItems {
  genres: string[];
  artists: string[];
  songs: string[];
}

export interface TasteProfileSummary {
  user_id: string;
  top_genres: TopItem[];
  top_artists: TopItem[];
  total_swipes: number;
  total_likes: number;
  total_dislikes: number;
}

export interface TopItem {
  label: string;
  value: number;
}

export interface ErrorResponse {
  code: string;
  message: string;
}
