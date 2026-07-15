import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../navigation/types';
import {
  isAuthAvailable,
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  signInWithPhone,
  verifyPhoneOtp,
} from '../services/auth';
import { getMfaStatus } from '../services/mfa';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../constants/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'SignIn'>;
type Method = 'email' | 'phone';

export default function SignInScreen({ navigation }: Props) {
  const [method, setMethod] = useState<Method>('email');
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneCode, setPhoneCode] = useState('');
  const [phoneCodeSent, setPhoneCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const available = isAuthAvailable();

  /**
   * Shared "what happens after any primary auth method succeeds" step.
   * Supabase may report that this account has TOTP MFA enabled and the
   * session hasn't cleared that second factor yet (aal1 -> aal2 required)
   * — in that case we route to the challenge screen instead of treating
   * the user as fully signed in.
   */
  const proceedAfterPrimaryAuth = async () => {
    const { needsChallenge, factorId } = await getMfaStatus();
    if (needsChallenge && factorId) {
      navigation.replace('TwoFactorVerify', { factorId });
      return;
    }
    navigation.goBack();
  };

  const handleSubmit = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Missing info', 'Please enter both an email and a password.');
      return;
    }

    setLoading(true);
    const result =
      mode === 'signIn'
        ? await signInWithEmail(email.trim(), password)
        : await signUpWithEmail(email.trim(), password);
    setLoading(false);

    if (result.error) {
      Alert.alert(mode === 'signIn' ? 'Sign in failed' : 'Sign up failed', result.error);
      return;
    }

    if (mode === 'signUp' && !result.user?.confirmed_at) {
      Alert.alert(
        'Check your email',
        'We sent a confirmation link — verify your email, then sign in.',
      );
      setMode('signIn');
      return;
    }

    await proceedAfterPrimaryAuth();
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    const result = await signInWithGoogle();
    setGoogleLoading(false);

    if (result.error) {
      Alert.alert('Google sign-in failed', result.error);
      return;
    }
    if (!result.user) return; // cancelled — no error to show

    await proceedAfterPrimaryAuth();
  };

  const handleSendPhoneCode = async () => {
    if (!phone.trim()) {
      Alert.alert('Missing info', 'Enter your phone number, including country code (e.g. +1...).');
      return;
    }

    setLoading(true);
    const { error } = await signInWithPhone(phone.trim());
    setLoading(false);

    if (error) {
      Alert.alert('Could not send code', error);
      return;
    }

    setPhoneCodeSent(true);
  };

  const handleVerifyPhoneCode = async () => {
    if (phoneCode.trim().length < 4) {
      Alert.alert('Enter your code', 'Enter the code we texted you.');
      return;
    }

    setLoading(true);
    const result = await verifyPhoneOtp(phone.trim(), phoneCode.trim());
    setLoading(false);

    if (result.error) {
      Alert.alert('Verification failed', result.error);
      return;
    }

    await proceedAfterPrimaryAuth();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>
            {method === 'email' && mode === 'signUp' ? 'Create an account' : 'Welcome back'}
          </Text>
          <Text style={styles.subtitle}>
            Sync your saved verses and journal across devices. Everything still works fully
            offline without this.
          </Text>

          {!available && (
            <View style={styles.notConfiguredCard}>
              <Ionicons name="information-circle-outline" size={18} color={Colors.textSecondary} />
              <Text style={styles.notConfiguredText}>
                Account sync isn't configured on this build yet (no Supabase project connected).
                This screen is ready to go the moment `supabaseUrl` / `supabaseAnonKey` are set in
                app.json.
              </Text>
            </View>
          )}

          {/* Google — the fastest path, shown above the method tabs */}
          <TouchableOpacity
            style={[styles.googleButton, (!available || googleLoading) && styles.submitButtonDisabled]}
            onPress={handleGoogleSignIn}
            disabled={!available || googleLoading}
            activeOpacity={0.85}
          >
            {googleLoading ? (
              <ActivityIndicator color={Colors.primary} />
            ) : (
              <>
                <Ionicons name="logo-google" size={18} color={Colors.text} />
                <Text style={styles.googleButtonText}>Continue with Google</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Method tabs: email/password vs phone */}
          <View style={styles.methodTabs}>
            <TouchableOpacity
              style={[styles.methodTab, method === 'email' && styles.methodTabActive]}
              onPress={() => setMethod('email')}
            >
              <Text style={[styles.methodTabText, method === 'email' && styles.methodTabTextActive]}>
                Email
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.methodTab, method === 'phone' && styles.methodTabActive]}
              onPress={() => setMethod('phone')}
            >
              <Text style={[styles.methodTabText, method === 'phone' && styles.methodTabTextActive]}>
                Phone
              </Text>
            </TouchableOpacity>
          </View>

          {method === 'email' ? (
            <View style={styles.form}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor={Colors.textTertiary}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                editable={available && !loading}
              />

              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor={Colors.textTertiary}
                secureTextEntry
                editable={available && !loading}
              />

              <TouchableOpacity
                style={[styles.submitButton, (!available || loading) && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={!available || loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color={Colors.surface} />
                ) : (
                  <Text style={styles.submitText}>
                    {mode === 'signIn' ? 'Sign In' : 'Sign Up'}
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.switchModeButton}
                onPress={() => setMode(mode === 'signIn' ? 'signUp' : 'signIn')}
                disabled={loading}
              >
                <Text style={styles.switchModeText}>
                  {mode === 'signIn'
                    ? "Don't have an account? Sign up"
                    : 'Already have an account? Sign in'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.form}>
              <Text style={styles.label}>Phone number</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="+1 555 555 5555"
                placeholderTextColor={Colors.textTertiary}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="phone-pad"
                editable={available && !loading && !phoneCodeSent}
              />

              {phoneCodeSent && (
                <>
                  <Text style={styles.label}>Verification code</Text>
                  <TextInput
                    style={styles.input}
                    value={phoneCode}
                    onChangeText={setPhoneCode}
                    placeholder="123456"
                    placeholderTextColor={Colors.textTertiary}
                    keyboardType="number-pad"
                    maxLength={6}
                    editable={available && !loading}
                  />
                </>
              )}

              <TouchableOpacity
                style={[styles.submitButton, (!available || loading) && styles.submitButtonDisabled]}
                onPress={phoneCodeSent ? handleVerifyPhoneCode : handleSendPhoneCode}
                disabled={!available || loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color={Colors.surface} />
                ) : (
                  <Text style={styles.submitText}>
                    {phoneCodeSent ? 'Verify Code' : 'Send Code'}
                  </Text>
                )}
              </TouchableOpacity>

              {phoneCodeSent && (
                <TouchableOpacity
                  style={styles.switchModeButton}
                  onPress={() => {
                    setPhoneCodeSent(false);
                    setPhoneCode('');
                  }}
                  disabled={loading}
                >
                  <Text style={styles.switchModeText}>Use a different number</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          <TouchableOpacity style={styles.skipButton} onPress={() => navigation.goBack()}>
            <Text style={styles.skipText}>Continue without an account</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  content: {
    flexGrow: 1,
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.xxxl,
    paddingBottom: Spacing.xxxl,
    justifyContent: 'center',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingVertical: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadows.sm,
  },
  googleButtonText: {
    fontSize: Typography.fontSize.md,
    color: Colors.text,
    fontWeight: Typography.fontWeight.semibold,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.divider,
  },
  dividerText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textTertiary,
  },
  methodTabs: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: BorderRadius.lg,
    padding: 4,
    marginBottom: Spacing.lg,
  },
  methodTab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: BorderRadius.md,
  },
  methodTabActive: {
    backgroundColor: Colors.surface,
    ...Shadows.sm,
  },
  methodTabText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeight.medium,
  },
  methodTabTextActive: {
    color: Colors.primary,
    fontWeight: Typography.fontWeight.semibold,
  },
  title: {
    fontSize: Typography.fontSize.xxxl,
    color: Colors.primary,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: Typography.fontSize.md * 1.6,
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.md,
  },
  notConfiguredCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.xl,
  },
  notConfiguredText: {
    flex: 1,
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    lineHeight: Typography.fontSize.xs * 1.6,
  },
  form: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.xl,
    ...Shadows.sm,
  },
  label: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.xs,
  },
  input: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: Typography.fontSize.md,
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitText: {
    fontSize: Typography.fontSize.lg,
    color: Colors.surface,
    fontWeight: Typography.fontWeight.semibold,
  },
  switchModeButton: {
    marginTop: Spacing.lg,
    alignItems: 'center',
  },
  switchModeText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.primary,
    fontWeight: Typography.fontWeight.medium,
  },
  skipButton: {
    marginTop: Spacing.xl,
    alignItems: 'center',
    padding: Spacing.md,
  },
  skipText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
});
