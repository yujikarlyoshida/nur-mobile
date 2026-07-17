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
// Configure via the EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY
// env vars (see .env.production / .env.example) — not app.json's `expo.extra`,
// which was found to never actually get embedded in a plain `expo export -p web`
// build (see api.ts for the full explanation; same underlying issue applies
// here). Until those env vars are set, `isSupabaseConfigured()` returns false
// and every auth screen shows a clear "not configured" state instead of
// crashing.
//
// ─────────────────────────────────────────────────────────────────────────────

import 'react-native-url-polyfill/auto';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

function getConfig(): { url: string; anonKey: string } {
  // Must stay pure, unwrapped `process.env.EXPO_PUBLIC_X` dot notation on each
  // line — see the detailed comment on api.ts's API_BASE_URL for exactly why.
  return {
    // @ts-expect-error EXPO_PUBLIC_SUPABASE_URL is inlined by Metro at build time — not a real ambient ProcessEnv key
    url: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
    // @ts-expect-error EXPO_PUBLIC_SUPABASE_ANON_KEY is inlined by Metro at build time — not a real ambient ProcessEnv key
    anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
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
