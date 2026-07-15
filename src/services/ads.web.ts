// ─── Ads Service (AdMob) — web stub ────────────────────────────────────────
//
// Web counterpart to ads.ts. react-native-google-mobile-ads is a native
// module with no web support, so this file exists purely so Metro resolves
// *.web.ts here instead of pulling the native SDK into the web bundle (see
// ads.ts's header note). Every export is a no-op with the same signature.
//
// ─────────────────────────────────────────────────────────────────────────────

export function isAdsPlatformSupported(): boolean {
  return false;
}

export function getBannerAdUnitId(): string | undefined {
  return undefined;
}

export async function initializeAds(): Promise<void> {
  // No-op on web.
}
