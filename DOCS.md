# Melody Frontend Documentation

## Overview

Melody's frontend is a **Next.js 16** application with **React 19**, **Tailwind CSS v4**, and **shadcn/ui** components. It provides a music-based social discovery/dating experience with real-time WebSocket chat.

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| Next.js | 16 | React framework with App Router |
| React | 19 | UI library |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 4 | Utility-first styling |
| shadcn/ui | — | Accessible UI primitives |
| Lucide React | — | Icons |
| Sonner | — | Toast notifications |

## Quick Start

```bash
cd frontend
npm install
npm run dev    # :3000
```

The frontend expects the backend at `http://localhost:8080`.

## Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx            # Login/Signup (phone OTP + Google)
│   │   ├── layout.tsx          # Root layout
│   │   ├── globals.css         # Tailwind v4 + dark theme
│   │   ├── feed/
│   │   │   └── page.tsx        # Music swipe feed
│   │   ├── matches/
│   │   │   └── page.tsx        # Discover + Connections tabs
│   │   ├── chat/
│   │   │   ├── page.tsx        # Conversation list
│   │   │   └── [userId]/
│   │   │       └── page.tsx    # Real-time chat room
│   │   ├── onboarding/
│   │   │   ├── profile/
│   │   │   │   └── page.tsx    # Profile setup (name, age, etc.)
│   │   │   └── music/
│   │   │       └── page.tsx    # Music taste selection
│   │   ├── premium/
│   │   │   └── page.tsx        # Premium subscription page
│   │   ├── profile/
│   │   │   ├── page.tsx        # Profile placeholder
│   │   │   └── [userId]/
│   │   │       └── page.tsx    # User profile + Taste Ring
│   │   └── admin/
│   │       └── reports/
│   │           └── page.tsx    # Admin moderation panel
│   ├── components/
│   │   ├── SwipeCard.tsx       # Tinder-style swipe card
│   │   ├── TasteRing.tsx       # SVG compatibility ring chart
│   │   ├── ReportModal.tsx     # Report user modal
│   │   └── ui/                 # shadcn/ui components
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── select.tsx
│   │       └── sonner.tsx
│   ├── hooks/
│   │   ├── useAuth.ts          # Auth state, login, logout
│   │   └── useChat.ts          # WebSocket chat connection
│   ├── lib/
│   │   ├── api.ts              # HTTP client with JWT auto-refresh
│   │   └── utils.ts            # cn() utility (clsx + tailwind-merge)
│   └── types/
│       └── index.ts            # TypeScript interfaces
├── public/                     # Static assets
├── DOCS.md                     # This file
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
├── postcss.config.mjs
├── eslint.config.mjs
└── components.json             # shadcn/ui config
```

## Page Guide

### `/` — Login / Signup

Two authentication methods:
1. **Phone OTP**: Enter phone → receive code → enter 6-digit code → authenticate
   - In dev mode, code is printed to backend terminal with `[SMS]` prefix
   - Universal fallback code `123456` always works
2. **Google Sign-In**: One-click Google auth (mocked in dev mode)

On success, redirects to `/onboarding/profile` (new users) or `/feed` (returning users).

**Components used:** `Button`, `Input`, `Card`, `Label`

### `/onboarding/profile` — Profile Setup

Required fields:
- **Full Name** (required)
- **Age** (13-120)
- **Gender**: Male / Female / Non-Binary / Prefer not to say
- **Interested In**: Men / Women / Everyone
- **Bio** (optional, max 500 chars)
- **Location**: Latitude / Longitude

On submit, navigates to `/onboarding/music` with profile data as query params.

### `/onboarding/music` — Music Taste Setup

Three sections:
1. **Favorite Genres**: Toggle chips from all available genres
2. **Favorite Artists**: Search via pg_trgm fuzzy search, add/remove artists
3. **Taste Questions**: 7 questions with likert-scale/single-choice options

Completes the profile via `POST /api/user/onboard`, then navigates to `/feed`.

### `/feed` — Music Discovery Feed

Swipe through audio clips with:
- Album art / placeholder
- Title + artist name
- Duration badge
- Genre tags
- HTML5 audio player (when `file_url` available)
- X (dislike) and ✓ (like) buttons

Features pagination (loads more clips via infinite scroll).
Uses genre-weighted recommendation algorithm. No clips → "Caught Up!" screen.

### `/matches` — Discover + Connections

Two tabs:
**Discover**: Browse potential matches with:
- Profile photo, name, age, distance
- Taste Meter compatibility ring
- Common genres and artists
- Like / Pass buttons
- Premium Spark and Love (disabled in dev — De Comment when goes to production)

**Connections**: List of mutual matches with compatibility scores.
Click a connection → navigate to their profile.

### `/chat` — Conversations

List all matched conversations with:
- Other user's photo / initial
- Name
- Last message text preview
- Date

Empty state: "No messages yet" → links to `/matches`.

### `/chat/[userId]` — Chat Room

Real-time messaging via WebSocket:
- Messages appear instantly
- Typing indicators (3-second timeout)
- Supports text and clip_share message types
- Loads message history from REST API on mount

**WebSocket flow:**
1. Connect to `ws://localhost:8080/ws`
2. Send `{ type: "auth", token: "eyJ..." }` as first message
3. Send/receive messages with `{ type: "message", to: "...", data: { content: "..." } }`

### `/profile/[userId]` — User Profile

Full user view with:
- Profile photo, name, age, gender, location
- Bio text
- **Music Compatibility Ring** (TasteRing SVG)
- Shared genres and artists
- Report / Block / Mute actions

### `/premium` — Premium Subscription

Marketing page with two tiers:
- **Monthly**: $9.99 — Unlimited likes, Spark/Love, who-liked-you, boosts, read receipts
- **Yearly**: $79.99 (save 33%) — Same + 2 months free

**De Comment when goes to production** — currently all features are free in dev mode.

### `/admin/reports` — Moderation Panel

Admin-only page to:
- View reports filtered by status (pending / reviewed / resolved)
- Apply moderation actions: Warn, Restrict, Suspend, Ban
- Reports show reporter/reported IDs truncated for privacy

## Components

### `SwipeCard.tsx`

Reusable Tinder-style card container with X/✓ action buttons. Wraps children in a styled card with pass/like buttons below.

**Props:**
```typescript
interface SwipeCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;   // dislike
  onSwipeRight?: () => void;  // like
}
```

### `TasteRing.tsx`

SVG ring chart showing compatibility percentage. Displays:
- Circular progress ring (animated)
- Score percentage in center
- Match label (color-coded)
- Optional breakdown bars (Genre, Artist, Swipes, Discovery, Activity, Serendipity)

**Props:**
```typescript
interface TasteRingProps {
  score: number;
  breakdown?: TasteBreakdown;
  label: string;
  size?: number;  // default 120
}
```

**Label colors:** Soulmates (violet), Strong Match (emerald), Potential Match (amber), Low Compatibility (gray)

### `ReportModal.tsx`

Modal for reporting users with:
- 6 reason options (Harassment, Bullying, Hate Speech, Spam, Fake Profile, Inappropriate Content)
- Optional description text (max 500 chars)
- Submit confirmation state

## Hooks

### `useAuth()`

```typescript
const {
  user,             // User | null
  loading,          // boolean
  sendOTP,          // (phone: string) => Promise<{ sid: string }>
  verifyOTP,        // (phone: string, code: string) => Promise<AuthTokens>
  googleSignIn,     // (idToken: string) => Promise<AuthTokens>
  logout,           // () => Promise<void>
  onboard,          // (data: OnboardRequest) => Promise<User>
  refreshProfile,   // () => Promise<User | null>
  isAuthenticated,  // boolean
  isNewUser,        // boolean
} = useAuth();
```

**Flow:**
1. On mount: checks localStorage for tokens, fetches user profile
2. `sendOTP` → POST `/api/auth/phone/send-otp`
3. `verifyOTP` → POST `/api/auth/phone/verify-otp` → stores tokens
4. `googleSignIn` → POST `/api/auth/google` → stores tokens
5. `logout` → POST `/api/auth/logout` → clears tokens → redirects to `/`

### `useChat(userId, otherUserId?)`

```typescript
const {
  messages,       // ChatMessage[]
  isTyping,       // boolean
  connected,      // boolean (WebSocket status)
  sendMessage,    // (content: string, type?: 'text' | 'clip_share', clipId?: string) => void
  sendTyping,     // () => void
  loadHistory,    // (partnerId: string) => Promise<void>
  setMessages,    // Dispatch<SetStateAction<ChatMessage[]>>
} = useChat(userId, otherUserId);
```

**Features:**
- Auto-connects WebSocket on mount (auth via first message)
- Auto-reconnects after 3-second delay on disconnect
- Typing indicator with 3-second debounce
- Optimistic message adds (client-side before server confirms)

## API Client (`src/lib/api.ts`)

Centralized HTTP client with:
- Automatic JWT injection from localStorage
- 401 auto-refresh with token rotation
- Retry original request after refresh
- Methods: `apiGet`, `apiPost`, `apiPut`, `apiDelete`

```typescript
// Tokens are stored in localStorage
localStorage.setItem("access_token", tokens.access_token);
localStorage.setItem("refresh_token", tokens.refresh_token);
```

## TypeScript Types

```typescript
User, Genre, Artist, Question, OptionItem,
UserGenre, UserArtist, UserAnswer, AuthTokens,
OnboardRequest, TasteMatch, TasteBreakdown, CommonItems,
TasteProfileSummary, TopItem, ErrorResponse
```

See `src/types/index.ts` for the full definitions.

## Dev vs Production

| Feature | Dev | Production |
|---|---|---|
| API URL | `http://localhost:8080` | Configurable via `NEXT_PUBLIC_API_URL` |
| WebSocket URL | `ws://localhost:8080/ws` | Configurable via `NEXT_PUBLIC_WS_URL` |
| OTP | Terminal-printed code + "123456" fallback | Real SMS via Twilio |
| Google Auth | Mock token | Firebase Auth SDK |
| Premium | All features free | Stripe/App Store payments |

## Styling

Uses Tailwind CSS v4 with a dark theme:

```css
/* globals.css - Dark theme variables */
:root {
  --background: #09090b;       /* zinc-950 */
  --foreground: #f4f4f5;       /* zinc-100 */
  --card: #18181b;             /* zinc-900 */
  --primary: #8b5cf6;          /* violet-500 */
  /* ... more CSS variables */
}
```

The app uses a dark zinc palette with violet accent colors throughout.
