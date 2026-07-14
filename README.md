# Nur — Mobile

React Native + Expo app for **Nur** (نور = "Light"), a Quranic wellbeing check-in app that reads a user's emotional state and recommends relevant Quran verses with personalized context.

Backend: [nur-backend](https://github.com/yujikarlyoshida/nur-backend)

## Stack

- **React Native** + **Expo** (SDK 51), TypeScript
- **React Navigation** (bottom tabs + native stack)
- **Axios** for API calls, **AsyncStorage** for local persistence
- **expo-av** for audio playback, **expo-secure-store** for secure storage
- **Supabase Auth** for optional cross-device sync (opt-in — the app is fully usable local-only without it)
- **GitHub Actions** for CI (typecheck + web export build check), **Vercel** for web hosting

## Screens

- **Onboarding** — spiritual wellness disclaimer and intro
- **Home** — mood check-in entry point (mood grid, text, or voice input)
- **Verse Discovery** — personalized verse recommendations from a check-in
- **Verse Detail** — Arabic text, translation, and tafsir summary for a single verse
- **Journal** — history of past check-ins and saved verses
- **Sign In** — optional account creation for cross-device sync (reachable from Profile → Account)
- **Profile** — user settings

## Design

- Colors: deep green `#1B4332`, gold `#D4AF37`, cream `#F8F4EF`
- 13-emotion taxonomy: anxiety, sadness, anger, loneliness, gratitude, hope, guilt, confusion, peace, overwhelmed, grief, disconnection, joy
- Built-in crisis detection UI — a `CrisisAlert` component renders automatically when a check-in response flags a crisis, surfacing real hotline resources
- Spiritual wellness tool, not a medical app — disclaimer is part of onboarding

## Getting started

```bash
npm install
npm run type-check
npx expo start        # or: npm run ios / npm run android / npm run web
```

Requires the [nur-backend](https://github.com/yujikarlyoshida/nur-backend) API running locally on port 3000 (the app's `api.ts` service defaults to `http://localhost:3000`).

### Web build & deployment

```bash
npm run build:web     # exports a static site to dist/ via Expo's web export
```

`vercel.json` is already set up — running `vercel` (or `vercel --prod`) from this directory deploys the web build with no extra config. This gives you a clickable link to the app that doesn't require an App Store install.

### Optional: cross-device sync (Supabase Auth)

The app works fully offline, no account needed, by default. To turn on optional sign-in and cross-device sync:

1. Set `supabaseUrl` / `supabaseAnonKey` in `app.json` under `expo.extra` (same Supabase project as the backend — its RLS policies in `db/schema.sql` were already written for this).
2. That's it — the "Sign In / Sync Account" row appears under Profile → Account automatically once configured (see `src/services/supabaseClient.ts`).
