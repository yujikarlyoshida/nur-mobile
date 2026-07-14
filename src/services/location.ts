// ─── Location Service (optional, for real-world activity suggestions) ──────
//
// Thin wrapper around expo-location. Fails soft everywhere — permission
// denied, location services off, or any error just resolves to `null`, the
// same "treat unconfigured/unavailable as a no-op" pattern used by
// auth.ts and supabaseClient.ts. The app never depends on this; it only
// unlocks the activity_suggestions half of a check-in response when
// available (see useCheckin.ts).
//
// ─────────────────────────────────────────────────────────────────────────────

import * as Location from 'expo-location';
import type { LocationContext } from '../types';

/**
 * Requests foreground location permission if not already granted, then
 * returns the user's current coordinates. Returns `null` (never throws) if
 * permission is denied, location services are unavailable, or the lookup
 * times out — callers should treat that exactly like "no location," not
 * an error to surface to the user.
 */
export async function getCurrentLocationContext(): Promise<LocationContext | null> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return null;
    }

    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
  } catch {
    // Permission denied, location services disabled, simulator without a
    // mock location set, timeout, etc. — all treated the same: no location.
    return null;
  }
}
