// ─── Supabase Client (mobile) ──────────────────────────────────────────────
//
// Optional auth + cross-device sync layer. The app is fully usable without
// this — everything in storage.ts (AsyncStorage) keeps working exactly as
// before, local-only, no account required. This exists purely to let a
// user opt in to syncing their saved verses / journal / check-in history
// across devices, via the `users`/`saved_verses`/`journal_entries` tables
// and Row Level Security policies already defined in the backend's
// db/schema.sql (they were written against `auth.uid()` from day one —
// this is what finally turns them on).
//
// Configure via app.json's `expo.extra.supabaseUrl` / `supabaseAnonKey`
// (see app.json). Until those are set, `isSupabaseConfigured()` returns
// false and every auth screen shows a clear "not configured" state instead
// of crashing.
//
// ─────────────────────────────────────────────────────────────────────────────

import 'react-native-url-polyfill/auto';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

function getConfig(): { url: string; anonKey: string } {
  const extra = Constants.expoConfig?.extra ?? {};
  return {
    url: (extra['supabaseUrl'] as string) ?? '',
    anonKey: (extra['supabaseAnonKey'] as string) ?? '',
  };
}

export function isSupabaseConfigured(): boolean {
  const { url, anonKey } = getConfig();
  return Boolean(url && anonKey);
}

let _client: SupabaseClient | null = null;

/**
 * Returns the Supabase client, or null if supabaseUrl/supabaseAnonKey
 * haven't been set in app.json yet. Callers (auth.ts) must check for null
 * and fail gracefully rather than throwing — this app should never crash
 * just because optional cloud sync isn't configured.
 */
export function getSupabase(): SupabaseClient | null {
  if (_client) return _client;
  if (!isSupabaseConfigured()) return null;

  const { url, anonKey } = getConfig();

  _client = createClient(url, anonKey, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });

  return _client;
}
