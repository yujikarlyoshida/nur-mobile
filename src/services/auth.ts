// ─── Auth Service (optional cloud sync) ────────────────────────────────────
//
// Thin wrapper around Supabase Auth. Every function here fails soft —
// returns `{ error }` instead of throwing, and treats "not configured"
// the same as "not signed in" — so nothing in the existing local-only
// experience (storage.ts / HomeScreen / JournalScreen etc.) has to change
// or guard against this being wired up.
//
// ─────────────────────────────────────────────────────────────────────────────

import type { Session, User } from '@supabase/supabase-js';
import { getSupabase, isSupabaseConfigured } from './supabaseClient';

export interface AuthResult {
  user: User | null;
  error: string | null;
}

const NOT_CONFIGURED_ERROR =
  'Account sync isn\'t set up yet. The app works fully offline without it — ' +
  'this just enables syncing across devices.';

export function isAuthAvailable(): boolean {
  return isSupabaseConfigured();
}

export async function signUpWithEmail(email: string, password: string): Promise<AuthResult> {
  const supabase = getSupabase();
  if (!supabase) return { user: null, error: NOT_CONFIGURED_ERROR };

  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return { user: null, error: error.message };
  return { user: data.user, error: null };
}

export async function signInWithEmail(email: string, password: string): Promise<AuthResult> {
  const supabase = getSupabase();
  if (!supabase) return { user: null, error: NOT_CONFIGURED_ERROR };

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { user: null, error: error.message };
  return { user: data.user, error: null };
}

export async function signOut(): Promise<{ error: string | null }> {
  const supabase = getSupabase();
  if (!supabase) return { error: null }; // nothing to sign out of

  const { error } = await supabase.auth.signOut();
  return { error: error?.message ?? null };
}

export async function getCurrentUser(): Promise<User | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data } = await supabase.auth.getUser();
  return data.user;
}

export async function getCurrentSession(): Promise<Session | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data } = await supabase.auth.getSession();
  return data.session;
}

/**
 * Subscribes to auth state changes (sign in / sign out / token refresh).
 * Returns an unsubscribe function — call it in a useEffect cleanup.
 * No-ops (returns a harmless unsubscribe) when Supabase isn't configured.
 */
export function onAuthStateChange(
  callback: (user: User | null) => void,
): () => void {
  const supabase = getSupabase();
  if (!supabase) return () => {};

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });

  return () => subscription.unsubscribe();
}
