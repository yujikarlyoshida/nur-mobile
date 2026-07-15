// ─── Ads Service (AdMob) — native (iOS/Android) ────────────────────────────
//
// Thin wrapper around react-native-google-mobile-ads. This file is only
// ever bundled for iOS/Android — see ads.web.ts for the web counterpart.
// Metro picks *.web.ts over this file when building for web (same
// mechanism used for BannerAdSlot.tsx / BannerAdSlot.web.tsx), so the
// native ads SDK's JS is never even resolved into the web bundle. Without
// that split, a static import of a native-only module can crash at import
// time on web, not just when actually used.
//
// Placement policy (deliberately not just "wherever there's room"): ads
// only appear on Journal and Profile — screens the user visits to browse or
// manage settings, not screens tied to emotional vulnerability. They are
// never shown on Home, Verse Discovery, or Verse Detail (check-in flow,
// crisis resources, and scripture reading), and never on Sign In or
// Two-Factor screens. See JournalScreen.tsx / ProfileScreen.tsx for the
// only two places <BannerAdSlot /> is used, and README.md for the
// reasoning.
//
// Test ad unit IDs (Google's own public test IDs, safe to ship as
// defaults) are used automatically in development so real ads are never
// requested, clicked, or billed while iterating. Swap app.json's
// admobAndroidBannerId / admobIosBannerId for real production ad unit IDs
// (and the react-native-google-mobile-ads plugin's App IDs) before a real
// release — see README.md.
//
// ─────────────────────────────────────────────────────────────────────────────

import { Platform } from 'react-native';
import Constants from 'expo-constants';
import mobileAds, { TestIds } from 'react-native-google-mobile-ads';

/** True on platforms where the native ads module can plausibly work. */
export function isAdsPlatformSupported(): boolean {
  return true; // this file only loads on iOS/Android — see the header note
}

function getConfiguredBannerId(): string | undefined {
  const extra = Constants.expoConfig?.extra ?? {};
  const key = Platform.OS === 'ios' ? 'admobIosBannerId' : 'admobAndroidBannerId';
  return extra[key] as string | undefined;
}

/**
 * Returns the banner ad unit ID to use — Google's public test ID in
 * development (so dev builds never request/click/bill real ads), the
 * configured production ID otherwise. Returns undefined if nothing is
 * configured, meaning "don't render an ad."
 */
export function getBannerAdUnitId(): string | undefined {
  if (__DEV__) return TestIds.BANNER;
  return getConfiguredBannerId();
}

let initialized = false;

/**
 * Initializes the Mobile Ads SDK once, on app start. Safe to call multiple
 * times (no-ops after the first). Call from App.tsx.
 */
export async function initializeAds(): Promise<void> {
  if (initialized) return;
  try {
    await mobileAds().initialize();
    initialized = true;
  } catch {
    // Native module not available in this runtime (e.g. Expo Go without a
    // custom dev client) — ads simply won't render. Never crash app start
    // over this.
  }
}
