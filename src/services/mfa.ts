// ─── Multi-Factor Authentication (TOTP) ────────────────────────────────────
//
// Thin wrapper around Supabase Auth's built-in MFA API. Uses TOTP
// (authenticator-app codes — Google Authenticator, Authy, 1Password, etc.)
// rather than SMS/email OTP codes, deliberately: TOTP works out of the box
// with any Supabase project at no extra cost, whereas a "send a code"
// 2FA flow would need the same paid SMS provider as phone sign-in (see
// auth.ts), or would double as another login method rather than a second
// factor. The 6-digit code the user enters still comes from "a verification
// code" — it's just generated on-device by their authenticator app instead
// of sent over SMS.
//
// Every function fails soft, same convention as auth.ts.
//
// ─────────────────────────────────────────────────────────────────────────────

import { getSupabase, isSupabaseConfigured } from './supabaseClient';

export interface MfaEnrollResult {
  factorId: string | null;
  /** otpauth:// URI — feed this to a QR generator, or let the user paste it manually. */
  uri: string | null;
  /** The raw secret, for manual entry into an authenticator app. */
  secret: string | null;
  error: string | null;
}

export interface MfaFactor {
  id: string;
  status: 'verified' | 'unverified';
  createdAt: string;
}

export function isMfaAvailable(): boolean {
  return isSupabaseConfigured();
}

/**
 * Starts TOTP enrollment. Returns the secret/URI to show the user — they
 * add it to an authenticator app, then call verifyMfaEnrollment() with the
 * code it generates to complete setup. Doesn't fully enable MFA on its own;
 * an unverified factor doesn't block sign-in.
 */
export async function enrollTotpMfa(): Promise<MfaEnrollResult> {
  const supabase = getSupabase();
  if (!supabase) {
    return { factorId: null, uri: null, secret: null, error: 'Account sync isn\'t set up yet.' };
  }

  const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
  if (error) return { factorId: null, uri: null, secret: null, error: error.message };

  return {
    factorId: data.id,
    uri: data.totp.uri,
    secret: data.totp.secret,
    error: null,
  };
}

/**
 * Completes enrollment: challenges the newly-created factor and verifies it
 * with the code the user's authenticator app produced. On success, this
 * factor becomes a required second step on future sign-ins.
 */
export async function verifyMfaEnrollment(
  factorId: string,
  code: string,
): Promise<{ error: string | null }> {
  const supabase = getSupabase();
  if (!supabase) return { error: 'Account sync isn\'t set up yet.' };

  const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
  if (challengeError) return { error: challengeError.message };

  const { error: verifyError } = await supabase.auth.mfa.verify({
    factorId,
    challengeId: challenge.id,
    code,
  });
  return { error: verifyError?.message ?? null };
}

/**
 * Challenges and verifies an already-enrolled factor in one call — used
 * during sign-in, after a primary auth method succeeds, when
 * getMfaStatus() reports a second factor is required.
 */
export async function verifyMfaChallenge(
  factorId: string,
  code: string,
): Promise<{ error: string | null }> {
  const supabase = getSupabase();
  if (!supabase) return { error: 'Account sync isn\'t set up yet.' };

  const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code });
  return { error: error?.message ?? null };
}

export async function listMfaFactors(): Promise<MfaFactor[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase.auth.mfa.listFactors();
  if (error || !data) return [];

  return data.totp.map((f) => ({
    id: f.id,
    status: f.status,
    createdAt: f.created_at,
  }));
}

export async function unenrollMfaFactor(factorId: string): Promise<{ error: string | null }> {
  const supabase = getSupabase();
  if (!supabase) return { error: 'Account sync isn\'t set up yet.' };

  const { error } = await supabase.auth.mfa.unenroll({ factorId });
  return { error: error?.message ?? null };
}

/**
 * Checks whether the current session still needs a second-factor challenge.
 * Call this right after a successful primary sign-in (email/password,
 * Google, or phone) — if `needsChallenge` is true, route to the 2FA
 * verification screen before treating the user as fully signed in.
 */
export async function getMfaStatus(): Promise<{
  needsChallenge: boolean;
  factorId: string | null;
}> {
  const supabase = getSupabase();
  if (!supabase) return { needsChallenge: false, factorId: null };

  const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (error || !data) return { needsChallenge: false, factorId: null };

  const needsChallenge = data.nextLevel === 'aal2' && data.currentLevel !== data.nextLevel;
  if (!needsChallenge) return { needsChallenge: false, factorId: null };

  const factors = await listMfaFactors();
  const verifiedFactor = factors.find((f) => f.status === 'verified');
  return { needsChallenge: true, factorId: verifiedFactor?.id ?? null };
}
