// ─── Auth Service (optional cloud sync) ────────────────────────────────────
//
// Thin wrapper around Supabase Auth. Every function here fails soft —
// returns `{ error }` instead of throwing, and treats "not configured"
// the same as "not signed in" — so nothing in the existing local-only
// experience (storage.ts / HomeScreen / JournalScreen etc.) has to change
// or guard against this being wired up.
//
// ─────────────────────────────────────────────────────────────────────────────

import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { getQueryParams } from 'expo-auth-session/build/QueryParams';
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

// Lets the in-app browser tab used for OAuth close itself and hand control
// back to the app once Google redirects to our deep link. Safe to call at
// module load even when auth isn't configured — it's a no-op until a
// signInWithGoogle() flow is actually started.
WebBrowser.maybeCompleteAuthSession();

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

// ─── Google OAuth ────────────────────────────────────────────────────────────
//
// Standard Supabase + Expo pattern: open the provider's consent screen in an
// in-app browser tab, catch the redirect back to our custom URL scheme
// (`nurquran://auth-callback`, see app.json's `scheme`), pull the tokens out
// of the redirect URL, and hand them to supabase.auth.setSession().
//
// Requires Google OAuth to be enabled in the Supabase dashboard (Authentication
// -> Providers -> Google, with a Google Cloud OAuth client ID/secret) — that's
// project configuration, not something this code can do. Until it's enabled,
// Supabase returns an error here and the caller shows it like any other failed
// sign-in attempt; nothing crashes.

async function createSessionFromUrl(url: string): Promise<AuthResult> {
  const supabase = getSupabase();
  if (!supabase) return { user: null, error: NOT_CONFIGURED_ERROR };

  const { params, errorCode } = getQueryParams(url);
  if (errorCode) return { user: null, error: errorCode };

  const { access_token, refresh_token } = params;
  if (!access_token || !refresh_token) {
    return { user: null, error: 'Google sign-in did not return a valid session.' };
  }

  const { data, error } = await supabase.auth.setSession({ access_token, refresh_token });
  if (error) return { user: null, error: error.message };
  return { user: data.user, error: null };
}

export async function signInWithGoogle(): Promise<AuthResult> {
  const supabase = getSupabase();
  if (!supabase) return { user: null, error: NOT_CONFIGURED_ERROR };

  const redirectTo = Linking.createURL('auth-callback');

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo, skipBrowserRedirect: true },
  });

  if (error || !data?.url) {
    return { user: null, error: error?.message ?? 'Could not start Google sign-in.' };
  }

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

  if (result.type !== 'success' || !result.url) {
    // User closed the browser tab or cancelled — not really an "error" to
    // alarm anyone with, but the caller needs to know nothing happened.
    return { user: null, error: null };
  }

  return createSessionFromUrl(result.url);
}

// ─── Phone Number Sign-In (SMS OTP) ────────────────────────────────────────
//
// Two-step flow: request a code, then verify it. Requires an SMS provider
// (Twilio, MessageBird, Vonage, etc.) configured in the Supabase dashboard
// (Authentication -> Providers -> Phone) — that's a paid third-party service
// tied to the user's own account, not something this code can provision.
// Until it's configured, Supabase returns an error on signInWithPhone and
// the UI surfaces it the same way as any other failed send.

export async function signInWithPhone(phone: string): Promise<{ error: string | null }> {
  const supabase = getSupabase();
  if (!supabase) return { error: NOT_CONFIGURED_ERROR };

  const { error } = await supabase.auth.signInWithOtp({ phone });
  return { error: error?.message ?? null };
}

export async function verifyPhoneOtp(phone: string, code: string): Promise<AuthResult> {
  const supabase = getSupabase();
  if (!supabase) return { user: null, error: NOT_CONFIGURED_ERROR };

  const { data, error } = await supabase.auth.verifyOtp({ phone, token: code, type: 'sms' });
  if (error) return { user: null, error: error.message };
  return { user: data.user, error: null };
}
