import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  SafeAreaView,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import { getUserProfile, updateUserProfile, deleteAllUserData } from '../services/storage';
import { UserProfile } from '../types';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../constants/theme';

const APP_VERSION = '1.0.0';

const LANGUAGES = [
  { code: 'en' as const, label: 'English', native: 'English' },
  { code: 'ar' as const, label: 'Arabic', native: 'العربية' },
  { code: 'ur' as const, label: 'Urdu', native: 'اردو' },
  { code: 'ms' as const, label: 'Malay', native: 'Bahasa Melayu' },
];

const TRANSLATIONS = [
  { id: 'sahih_international', label: 'Sahih International' },
  { id: 'pickthall', label: 'Pickthall' },
  { id: 'yusuf_ali', label: 'Yusuf Ali' },
  { id: 'clear_quran', label: 'The Clear Quran' },
];

interface SectionHeaderProps {
  title: string;
  icon?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, icon }) => (
  <View style={styles.sectionHeader}>
    {icon && <Ionicons name={icon as any} size={14} color={Colors.textSecondary} />}
    <Text style={styles.sectionHeaderText}>{title}</Text>
  </View>
);

interface SettingsRowProps {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  right?: React.ReactNode;
  danger?: boolean;
}

const SettingsRow: React.FC<SettingsRowProps> = ({
  icon,
  label,
  value,
  onPress,
  right,
  danger = false,
}) => (
  <TouchableOpacity
    style={styles.settingsRow}
    onPress={onPress}
    disabled={!onPress && !right}
    activeOpacity={onPress ? 0.7 : 1}
  >
    <View style={[styles.rowIcon, danger && styles.rowIconDanger]}>
      <Ionicons
        name={icon as any}
        size={18}
        color={danger ? Colors.error : Colors.primary}
      />
    </View>
    <View style={styles.rowContent}>
      <Text style={[styles.rowLabel, danger && styles.rowLabelDanger]}>{label}</Text>
      {value && <Text style={styles.rowValue}>{value}</Text>}
    </View>
    {right || (onPress && !right ? (
      <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
    ) : null)}
  </TouchableOpacity>
);

export default function ProfileScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);
  const [showTranslationPicker, setShowTranslationPicker] = useState(false);

  const loadProfile = useCallback(async () => {
    const p = await getUserProfile();
    setProfile(p);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile])
  );

  const handleNotificationsToggle = async (value: boolean) => {
    await updateUserProfile({ notifications_enabled: value });
    setProfile((prev) => prev ? { ...prev, notifications_enabled: value } : null);
  };

  const handleLanguageSelect = async (code: 'en' | 'ar' | 'ur' | 'ms') => {
    await updateUserProfile({ language: code });
    setProfile((prev) => prev ? { ...prev, language: code } : null);
    setShowLanguagePicker(false);
  };

  const handleTranslationSelect = async (id: string) => {
    await updateUserProfile({ translation: id });
    setProfile((prev) => prev ? { ...prev, translation: id } : null);
    setShowTranslationPicker(false);
  };

  const handleDeleteData = () => {
    Alert.alert(
      'Delete All Data',
      'This will permanently delete your journal entries, saved verses, and all preferences. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Everything',
          style: 'destructive',
          onPress: async () => {
            await deleteAllUserData();
            await loadProfile();
            Alert.alert('Data Deleted', 'All your data has been removed from this device.');
          },
        },
      ]
    );
  };

  const currentLanguage = LANGUAGES.find((l) => l.code === profile?.language);
  const currentTranslation = TRANSLATIONS.find((t) => t.id === profile?.translation);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar / Name */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>☪</Text>
          </View>
          <Text style={styles.profileName}>{profile?.name || 'Dear Friend'}</Text>
          <Text style={styles.profileTagline}>Nur - Quranic Wellbeing</Text>
        </View>

        {/* Language & Translation */}
        <SectionHeader title="Language & Translation" icon="globe-outline" />
        <View style={styles.card}>
          <SettingsRow
            icon="language-outline"
            label="Language"
            value={currentLanguage?.native || 'English'}
            onPress={() => setShowLanguagePicker(!showLanguagePicker)}
          />
          {showLanguagePicker && (
            <View style={styles.picker}>
              {LANGUAGES.map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.pickerOption,
                    profile?.language === lang.code && styles.pickerOptionSelected,
                  ]}
                  onPress={() => handleLanguageSelect(lang.code)}
                >
                  <Text style={[
                    styles.pickerOptionNative,
                    profile?.language === lang.code && styles.pickerOptionNativeSelected,
                  ]}>
                    {lang.native}
                  </Text>
                  <Text style={styles.pickerOptionLabel}>{lang.label}</Text>
                  {profile?.language === lang.code && (
                    <Ionicons name="checkmark" size={16} color={Colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={styles.rowDivider} />

          <SettingsRow
            icon="book-outline"
            label="Translation"
            value={currentTranslation?.label || 'Sahih International'}
            onPress={() => setShowTranslationPicker(!showTranslationPicker)}
          />
          {showTranslationPicker && (
            <View style={styles.picker}>
              {TRANSLATIONS.map((tr) => (
                <TouchableOpacity
                  key={tr.id}
                  style={[
                    styles.pickerOption,
                    profile?.translation === tr.id && styles.pickerOptionSelected,
                  ]}
                  onPress={() => handleTranslationSelect(tr.id)}
                >
                  <Text style={[
                    styles.pickerOptionNative,
                    profile?.translation === tr.id && styles.pickerOptionNativeSelected,
                  ]}>
                    {tr.label}
                  </Text>
                  {profile?.translation === tr.id && (
                    <Ionicons name="checkmark" size={16} color={Colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Notifications */}
        <SectionHeader title="Notifications" icon="notifications-outline" />
        <View style={styles.card}>
          <SettingsRow
            icon="bell-outline"
            label="Daily Reminders"
            right={
              <Switch
                value={profile?.notifications_enabled ?? true}
                onValueChange={handleNotificationsToggle}
                trackColor={{ false: Colors.border, true: `${Colors.primary}60` }}
                thumbColor={profile?.notifications_enabled ? Colors.primary : Colors.surface}
              />
            }
          />
        </View>

        {/* Privacy */}
        <SectionHeader title="Privacy & Data" icon="shield-outline" />
        <View style={styles.card}>
          <View style={styles.privacyNotice}>
            <Ionicons name="lock-closed-outline" size={16} color={Colors.primary} />
            <Text style={styles.privacyNoticeText}>
              All your check-ins, journal entries, and saved verses are stored locally on your device. Nothing is shared without your consent.
            </Text>
          </View>
          <View style={styles.rowDivider} />
          <SettingsRow
            icon="trash-outline"
            label="Delete All My Data"
            onPress={handleDeleteData}
            danger
          />
        </View>

        {/* About */}
        <SectionHeader title="About" icon="information-circle-outline" />
        <View style={styles.card}>
          <SettingsRow
            icon="apps-outline"
            label="App Version"
            value={APP_VERSION}
          />
          <View style={styles.rowDivider} />
          <SettingsRow
            icon="people-outline"
            label="Scholar Advisory"
            value="Reviewed by qualified scholars"
          />
          <View style={styles.rowDivider} />
          <SettingsRow
            icon="globe-outline"
            label="Quran Data"
            value="Quran.com API"
            onPress={() => Linking.openURL('https://quran.com').catch(() => {})}
          />
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimerCard}>
          <Ionicons name="information-circle-outline" size={18} color={Colors.textSecondary} />
          <Text style={styles.disclaimerText}>
            Nur is a spiritual wellness tool, not a substitute for professional mental health care. Always seek qualified guidance for religious rulings and clinical concerns.
          </Text>
        </View>

        <Text style={styles.copyright}>
          © 2024 Nur - Quranic Wellbeing{'\n'}
          Bismillah ir-Rahman ir-Raheem
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  headerTitle: {
    fontSize: Typography.fontSize.xxxl,
    color: Colors.primary,
    fontWeight: Typography.fontWeight.bold,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.screen,
    paddingBottom: Spacing.section + Spacing.xxxl,
  },
  profileCard: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xxl,
    padding: Spacing.xxxl,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.full,
    backgroundColor: `${Colors.primary}15`,
    borderWidth: 2,
    borderColor: `${Colors.primary}30`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  avatarText: {
    fontSize: 36,
    color: Colors.primary,
  },
  profileName: {
    fontSize: Typography.fontSize.xl,
    color: Colors.text,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.xs,
  },
  profileTagline: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.xs,
  },
  sectionHeaderText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    backgroundColor: `${Colors.primary}12`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowIconDanger: {
    backgroundColor: `${Colors.error}12`,
  },
  rowContent: {
    flex: 1,
  },
  rowLabel: {
    fontSize: Typography.fontSize.md,
    color: Colors.text,
    fontWeight: Typography.fontWeight.medium,
  },
  rowLabelDanger: {
    color: Colors.error,
  },
  rowValue: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  rowDivider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginLeft: Spacing.lg + 36 + Spacing.md,
  },
  picker: {
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.background,
    gap: Spacing.xs,
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.md,
  },
  pickerOptionSelected: {
    backgroundColor: `${Colors.primary}10`,
  },
  pickerOptionNative: {
    flex: 1,
    fontSize: Typography.fontSize.md,
    color: Colors.text,
  },
  pickerOptionNativeSelected: {
    color: Colors.primary,
    fontWeight: Typography.fontWeight.semibold,
  },
  pickerOptionLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  privacyNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    padding: Spacing.lg,
    backgroundColor: `${Colors.primary}08`,
  },
  privacyNoticeText: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    lineHeight: Typography.fontSize.sm * 1.6,
  },
  disclaimerCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    marginTop: Spacing.xl,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  disclaimerText: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    lineHeight: Typography.fontSize.sm * 1.65,
    fontStyle: 'italic',
  },
  copyright: {
    textAlign: 'center',
    fontSize: Typography.fontSize.xs,
    color: Colors.textTertiary,
    marginTop: Spacing.xl,
    lineHeight: Typography.fontSize.xs * 1.8,
  },
});
