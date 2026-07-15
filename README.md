# Nur — Mobile

React Native + Expo app for **Nur** (نور = "Light"), a Quranic wellbeing check-in app that reads a user's emotional state and recommends relevant Quran verses with personalized context.

Backend: [nur-backend](https://github.com/yujikarlyoshida/nur-backend)

## Stack

- **React Native** + **Expo** (SDK 51), TypeScript
- **React Navigation** (bottom tabs + native stack)
- **Axios** for API calls, **AsyncStorage** for local persistence
- **expo-av** for audio playback, **expo-secure-store** for secure storage
- **expo-location** for optional real-world activity suggestions alongside verses (opt-in — check-ins work fully without location access)
- **Supabase Auth** for optional cross-device sync — email/password, Google OAuth, phone number (SMS OTP), and TOTP-based two-factor authentication (all opt-in — the app is fully usable local-only without any of it)
- **react-native-google-mobile-ads (AdMob)** for banner ads on non-sensitive screens only (see "Ads" below)
- **GitHub Actions** for CI (typecheck + web export build check), **Vercel** for web hosting

## Screens

- **Onboarding** — spiritual wellness disclaimer and intro
- **Home** — mood check-in entry point (mood grid, text, or voice input)
- **Verse Discovery** — personalized verse recommendations from a check-in, plus real-world activity suggestions ("Something you could do") when location was shared
- **Verse Detail** — Arabic text, translation, and tafsir summary for a single verse
- **Journal** — history of past check-ins and saved verses
- **Sign In** — optional account creation for cross-device sync via email/password, Google, or phone number (reachable from Profile → Account)
- **Two-Factor Setup** — enable/disable TOTP-based two-factor authentication (reachable from Profile → Security, once signed in)
- **Profile** — user settings

## Design

"Slate Mint" — a minimalist grey/white/green system, defined centrally in `src/constants/theme.ts` so every screen inherits it:

- Neutrals: background `#F4F5F5`, surface `#FFFFFF`, border `#E2E4E4`, text `#202324` / `#6B7170` / `#9AA0A0`
- Green: primary/accent emerald `#14532D`, secondary emerald `#1F7A4D`, bright mint accent `#2FAE6B`, mint tint `#DCEFE0` (used for badges like the Quiet/Lively pill)
- 13-emotion taxonomy: anxiety, sadness, anger, loneliness, gratitude, hope, guilt, confusion, peace, overwhelmed, grief, disconnection, joy (each keeps its own distinct color, unaffected by the palette above)
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
2. That's it for email/password — the "Sign In / Sync Account" row appears under Profile → Account automatically once configured (see `src/services/supabaseClient.ts`).

Sign-in supports three methods, each independently optional — the email/password form always works once step 1 above is done; Google and phone need their own provider setup in the Supabase dashboard (Authentication → Providers) before they'll do anything beyond showing an error:

- **Email/password** — works immediately, no extra setup.
- **Google** — enable the Google provider in Supabase (Authentication → Providers → Google), which needs an OAuth client ID/secret from a [Google Cloud project](https://console.cloud.google.com/apis/credentials). Add `https://<your-project>.supabase.co/auth/v1/callback` as an authorized redirect URI in Google Cloud, and this app's scheme (`nurquran://auth-callback`, see `app.json`'s `scheme`) as an additional redirect URL in Supabase's Auth settings.
- **Phone number** — enable the Phone provider in Supabase and connect an SMS service (Twilio, MessageBird, or Vonage — Supabase's dashboard walks through whichever you pick). This is the one method that costs money per SMS sent, which is why it's not configured by default.

Until a given provider is enabled, that button/tab still renders — it just returns Supabase's "provider not enabled" error instead of crashing, same fail-soft pattern as everything else optional in this app.

### Optional: two-factor authentication

Available once signed in (Profile → Security → Two-Factor Authentication). Uses TOTP — codes generated by an authenticator app (Google Authenticator, Authy, 1Password, etc.) — rather than SMS/email codes, so it works with zero extra configuration beyond Supabase Auth itself already being set up above; there's no second paid service to wire up. Setup shows a secret key to add to an authenticator app, then confirms with the 6-digit code it produces. Once enabled, future sign-ins (via any method — email, Google, or phone) prompt for that code before finishing.

### Optional: real-world activity suggestions

On check-in, the app asks for foreground location permission (see `src/services/location.ts`). If granted, the request to the backend includes coordinates and the response can include `activity_suggestions` — nearby real-world things to do, matched to the detected emotion and time of day, shown under "Something you could do" on the Verse Discovery screen.

Each suggestion (`ActivityCard`) can show a rounded `vibe` badge (Quiet / Moderate / Lively), today's regular hours, an open-now indicator, and a "Special hours today" note when the venue's holiday/current hours differ from its usual schedule — all optional fields that only render if the backend included them (live Google Places data only; the sample catalog fills in a baseline `vibe` too). The Verse Discovery screen also shows a Quiet/Lively toggle above the suggestions — tapping a pill filters the already-returned list of up to 8 suggestions client-side (no extra network request); tapping the active pill again clears the filter. See the backend README's "vibe" section for how quiet/moderate/lively is estimated and how a hard server-side filter also exists for other API consumers.

Every suggestion the mobile app receives is already halal-conscious — the backend hard-excludes bars, clubs, liquor stores, casinos, and pork/gelatin-centric food before anything is ever returned to the client. There's nothing to configure or toggle on the mobile side; see the backend README's halal filtering section for exactly what's excluded and why it's a best-effort filter rather than a certification guarantee.

`ActivityCard` also shows, when the backend included them, a real current-traffic drive time (e.g. "~18 min drive (+6 min traffic)", the traffic note only shown once the delay is actually notable) and a color-coded Parking badge (Easy/Moderate/Hard). Both exist so a suggestion doesn't quietly work against the point of suggesting it — the backend already deprioritizes high-traffic, hard-to-park venues in its ranking (see the backend README's traffic and parking section), but showing the numbers lets the user make the final call themselves.

If permission is denied, location services are off, or the user is on a platform without location support, this silently does nothing — check-ins behave exactly as before. Nothing to configure on the mobile side; the backend controls whether suggestions come from a sample catalog or a live places API (see the backend README).

### Ads (AdMob)

Nur shows a single banner ad on two screens: **Journal** (below the check-in history) and **Profile** (above the disclaimer). That's it — this is a deliberate placement policy, not an oversight:

- **Home, Verse Discovery, and Verse Detail never show ads.** Those are the check-in flow, the crisis-resources surface, and scripture reading. Putting ads there would mean monetizing the exact moments the app exists to support, or sitting an ad next to the Quran — both off the table regardless of revenue.
- **Sign In, Two-Factor, and Onboarding never show ads** — they're not places to introduce a commercial interruption.
- Journal and Profile are browsing/settings screens — the closest thing this app has to a "neutral" surface — so that's where the one banner lives.

This policy lives in code as much as in this doc: `<BannerAdSlot />` is only imported in `JournalScreen.tsx` and `ProfileScreen.tsx`; there's no generic "ad banner" wired into a shared layout that a future screen could inherit by accident.

**Setup.** `react-native-google-mobile-ads` is a native module — it doesn't run in Expo Go and has no web build. `ads.ts` / `BannerAdSlot.tsx` are the iOS/Android implementation; `ads.web.ts` / `BannerAdSlot.web.tsx` are no-op stubs that Metro resolves instead when building for web, so the native ad SDK is never pulled into the web bundle at all (verified by grepping the exported web bundle for the native module's symbols — absent). To actually see ads, you need a native build via `eas build` or a local prebuild (`npx expo prebuild`) — the plain web/Expo Go dev loop this repo otherwise supports doesn't apply here.

**Test vs. production ad units.** `app.json`'s `react-native-google-mobile-ads` plugin entry and `expo.extra.admobAndroidBannerId` / `admobIosBannerId` currently hold **Google's own public test IDs** (documented at [Test ads — AdMob](https://developers.google.com/admob/android/test-ads)), not real ad inventory. In development (`__DEV__`), `ads.ts` always uses the test banner ID regardless of what's configured, so a debug build can never accidentally request, click, or get billed for a real ad. Before a real release:

1. Create an AdMob account and app entries for iOS/Android, and swap the plugin's `androidAppId` / `iosAppId` in `app.json` for your real ones.
2. Create banner ad units for each platform and put their IDs in `expo.extra.admobAndroidBannerId` / `admobIosBannerId`.
3. Rebuild natively (`eas build`) — App IDs are baked into the native manifest at build time, not read at runtime.

**What's not built yet.** A "Pro" tier that removes ads (and a monetization strategy doc covering ad formats/placement tradeoffs/revenue projections in more depth) are deliberately out of scope for this pass — ads were prioritized first. `getBannerAdUnitId()` in `ads.ts` is the single choke point a future paid-tier check would gate (e.g. `isProUser() ? undefined : getBannerAdUnitId()`), so that flag can slot in later without touching the screens.
