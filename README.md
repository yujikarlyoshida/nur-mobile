# Nur — Mobile

React Native + Expo app for **Nur** (نور = "Light"), a Quranic wellbeing check-in app that reads a user's emotional state and recommends relevant Quran verses with personalized context.

Backend: [nur-backend](https://github.com/yujikarlyoshida/nur-backend)

## Stack

- **React Native** + **Expo** (SDK 51), TypeScript
- **React Navigation** (bottom tabs + native stack)
- **Axios** for API calls, **AsyncStorage** for local persistence
- **expo-av** for audio playback, **expo-secure-store** for secure storage

## Screens

- **Onboarding** — spiritual wellness disclaimer and intro
- **Home** — mood check-in entry point (mood grid, text, or voice input)
- **Verse Discovery** — personalized verse recommendations from a check-in
- **Verse Detail** — Arabic text, translation, and tafsir summary for a single verse
- **Journal** — history of past check-ins and saved verses
- **Profile** — user settings

## Design

- Colors: deep green `#1B4332`, gold `#D4AF37`, cream `#F8F4EF`
- 13-emotion taxonomy: anxiety, sadness, anger, loneliness, gratitude, hope, guilt, confusion, peace, overwhelmed, grief, disconnection, joy
- Built-in crisis detection UI — a `CrisisAlert` component renders automatically when a check-in response flags a crisis, surfacing real hotline resources
- Spiritual wellness tool, not a medical app — disclaimer is part of onboarding

## Getting started

```bash
npm install
npx expo start        # or: npm run ios / npm run android / npm run web
```

Requires the [nur-backend](https://github.com/yujikarlyoshida/nur-backend) API running locally on port 3000 (the app's `api.ts` service defaults to `http://localhost:3000`).
