import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../navigation/types';
import {
  enrollTotpMfa,
  verifyMfaEnrollment,
  listMfaFactors,
  unenrollMfaFactor,
  isMfaAvailable,
} from '../services/mfa';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../constants/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'TwoFactorSetup'>;

export default function TwoFactorSetupScreen({ navigation }: Props) {
  const [loading, setLoading] = useState(true);
  const [enrolledFactorId, setEnrolledFactorId] = useState<string | null>(null);
  const [pendingFactorId, setPendingFactorId] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const available = isMfaAvailable();

  const loadStatus = useCallback(async () => {
    setLoading(true);
    const factors = await listMfaFactors();
    const verified = factors.find((f) => f.status === 'verified');
    setEnrolledFactorId(verified?.id ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (available) loadStatus();
    else setLoading(false);
  }, [available, loadStatus]);

  const handleStartEnroll = async () => {
    setSubmitting(true);
    const result = await enrollTotpMfa();
    setSubmitting(false);

    if (result.error || !result.factorId) {
      Alert.alert('Could not start setup', result.error ?? 'Please try again.');
      return;
    }

    setPendingFactorId(result.factorId);
    setSecret(result.secret);
  };

  const handleCopySecret = async () => {
    if (!secret) return;
    await Clipboard.setStringAsync(secret);
    Alert.alert('Copied', 'Secret copied to clipboard.');
  };

  const handleConfirm = async () => {
    if (!pendingFactorId || code.trim().length !== 6) {
      Alert.alert('Enter your code', 'Enter the 6-digit code your authenticator app is showing.');
      return;
    }

    setSubmitting(true);
    const { error } = await verifyMfaEnrollment(pendingFactorId, code.trim());
    setSubmitting(false);

    if (error) {
      Alert.alert('Verification failed', error);
      return;
    }

    setEnrolledFactorId(pendingFactorId);
    setPendingFactorId(null);
    setSecret(null);
    setCode('');
    Alert.alert('Two-factor authentication enabled', 'You\'ll be asked for a code from your authenticator app on future sign-ins.');
  };

  const handleDisable = () => {
    if (!enrolledFactorId) return;
    Alert.alert(
      'Disable two-factor authentication?',
      'You\'ll only need your password (or Google/phone sign-in) to sign in after this.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disable',
          style: 'destructive',
          onPress: async () => {
            setSubmitting(true);
            const { error } = await unenrollMfaFactor(enrolledFactorId);
            setSubmitting(false);
            if (error) {
              Alert.alert('Could not disable', error);
              return;
            }
            setEnrolledFactorId(null);
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.iconBadge}>
          <Ionicons name="shield-checkmark-outline" size={28} color={Colors.primary} />
        </View>
        <Text style={styles.title}>Two-Factor Authentication</Text>
        <Text style={styles.subtitle}>
          Add a second step to sign-in using any authenticator app (Google Authenticator, Authy,
          1Password, etc.) — no phone number or extra service required.
        </Text>

        {!available && (
          <View style={styles.notConfiguredCard}>
            <Ionicons name="information-circle-outline" size={18} color={Colors.textSecondary} />
            <Text style={styles.notConfiguredText}>
              Account sync isn't configured on this build yet, so two-factor authentication isn't
              available either — both depend on the same Supabase project connection.
            </Text>
          </View>
        )}

        {available && loading && (
          <ActivityIndicator color={Colors.primary} style={styles.loader} />
        )}

        {available && !loading && enrolledFactorId && !pendingFactorId && (
          <View style={styles.card}>
            <View style={styles.enabledRow}>
              <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
              <Text style={styles.enabledText}>Two-factor authentication is enabled.</Text>
            </View>
            <TouchableOpacity
              style={styles.disableButton}
              onPress={handleDisable}
              disabled={submitting}
            >
              <Text style={styles.disableText}>Disable</Text>
            </TouchableOpacity>
          </View>
        )}

        {available && !loading && !enrolledFactorId && !pendingFactorId && (
          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
            onPress={handleStartEnroll}
            disabled={submitting}
            activeOpacity={0.85}
          >
            {submitting ? (
              <ActivityIndicator color={Colors.surface} />
            ) : (
              <Text style={styles.submitText}>Set up two-factor authentication</Text>
            )}
          </TouchableOpacity>
        )}

        {pendingFactorId && secret && (
          <View style={styles.card}>
            <Text style={styles.stepLabel}>1. Add this key to your authenticator app</Text>
            <TouchableOpacity style={styles.secretBox} onPress={handleCopySecret}>
              <Text style={styles.secretText} selectable>
                {secret}
              </Text>
              <Ionicons name="copy-outline" size={16} color={Colors.textSecondary} />
            </TouchableOpacity>
            <Text style={styles.stepHint}>
              Open your authenticator app → Add account → Enter a setup key manually → paste this.
            </Text>

            <Text style={[styles.stepLabel, styles.stepLabelSpaced]}>
              2. Enter the 6-digit code it generates
            </Text>
            <TextInput
              style={styles.codeInput}
              value={code}
              onChangeText={(t) => setCode(t.replace(/[^0-9]/g, '').slice(0, 6))}
              placeholder="000000"
              placeholderTextColor={Colors.textTertiary}
              keyboardType="number-pad"
              maxLength={6}
              editable={!submitting}
            />

            <TouchableOpacity
              style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
              onPress={handleConfirm}
              disabled={submitting}
              activeOpacity={0.85}
            >
              {submitting ? (
                <ActivityIndicator color={Colors.surface} />
              ) : (
                <Text style={styles.submitText}>Confirm</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: {
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.xxxl,
    paddingBottom: Spacing.xxxl,
    alignItems: 'center',
  },
  iconBadge: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.full,
    backgroundColor: `${Colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography.fontSize.xxl,
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
    width: '100%',
  },
  notConfiguredText: {
    flex: 1,
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    lineHeight: Typography.fontSize.xs * 1.6,
  },
  loader: {
    marginTop: Spacing.xl,
  },
  card: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.xl,
    ...Shadows.sm,
  },
  enabledRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  enabledText: {
    fontSize: Typography.fontSize.md,
    color: Colors.text,
    fontWeight: Typography.fontWeight.medium,
  },
  disableButton: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  disableText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.error,
    fontWeight: Typography.fontWeight.medium,
  },
  stepLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.sm,
  },
  stepLabelSpaced: {
    marginTop: Spacing.xl,
  },
  secretBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.sm,
  },
  secretText: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    color: Colors.text,
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
  },
  stepHint: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textTertiary,
    lineHeight: Typography.fontSize.xs * 1.6,
  },
  codeInput: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.lg,
    fontSize: Typography.fontSize.xxl,
    letterSpacing: 8,
    textAlign: 'center',
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  submitButton: {
    width: '100%',
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
  backButton: {
    marginTop: Spacing.xl,
    alignItems: 'center',
    padding: Spacing.md,
  },
  backText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
});
