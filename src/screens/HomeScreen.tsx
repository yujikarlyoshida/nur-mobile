import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Animated,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../navigation/types';
import { MoodSelector } from '../components/MoodSelector';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useCheckin } from '../hooks/useCheckin';
import { EmotionState } from '../types';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../constants/theme';

type Nav = NativeStackNavigationProp<RootStackParamList>;

function getHijriDate(): string {
  // Simplified Hijri date display — in production use a proper library
  const today = new Date();
  const gregorianYear = today.getFullYear();
  const hijriYear = Math.floor((gregorianYear - 622) * (33 / 32));
  const months = [
    'Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani',
    'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', 'Shaban',
    'Ramadan', 'Shawwal', "Dhu al-Qadah", "Dhu al-Hijjah",
  ];
  const monthIndex = today.getMonth();
  return `${months[monthIndex]} ${hijriYear} AH`;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 5) return 'Assalamu Alaikum';
  if (hour < 12) return 'Sabah Al-Khair';
  if (hour < 17) return 'Assalamu Alaikum';
  if (hour < 20) return 'Masa Al-Khair';
  return 'Assalamu Alaikum';
}

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { submit, loading, error } = useCheckin();

  const [selectedEmotion, setSelectedEmotion] = useState<EmotionState | undefined>();
  const [textInput, setTextInput] = useState('');
  const [inputMode, setInputMode] = useState<'mood' | 'text'>('mood');
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const switchMode = (mode: 'mood' | 'text') => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setInputMode(mode);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  };

  const canSubmit = selectedEmotion !== undefined || textInput.trim().length > 2;

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) {
      Alert.alert(
        'Share a little more',
        'Please select how you are feeling or write a few words about what is on your mind.',
        [{ text: 'OK' }]
      );
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});

    const result = await submit({
      emotion: selectedEmotion,
      text: textInput.trim() || undefined,
    });

    if (result) {
      navigation.navigate('VerseDiscovery', { checkinResponse: result });
    }
  }, [canSubmit, selectedEmotion, textInput, submit, navigation]);

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>{getGreeting()}</Text>
              <Text style={styles.subGreeting}>dear friend</Text>
            </View>
            <View style={styles.hijriContainer}>
              <Text style={styles.hijriDate}>{getHijriDate()}</Text>
            </View>
          </View>
          <View style={styles.bismillahRow}>
            <View style={styles.decorLine} />
            <Text style={styles.bismillah}>بِسْمِ اللَّهِ</Text>
            <View style={styles.decorLine} />
          </View>

          {/* Main question */}
          <Text style={styles.mainQuestion}>How are you feeling today?</Text>
          <Text style={styles.mainSubtext}>
            Share your heart — the Quran has guidance for every moment.
          </Text>

          {/* Mode switcher */}
          <View style={styles.modeSwitcher}>
            <TouchableOpacity
              style={[styles.modeTab, inputMode === 'mood' && styles.modeTabActive]}
              onPress={() => switchMode('mood')}
            >
              <Ionicons
                name="heart-outline"
                size={16}
                color={inputMode === 'mood' ? Colors.primary : Colors.textSecondary}
              />
              <Text style={[styles.modeTabText, inputMode === 'mood' && styles.modeTabTextActive]}>
                Select Mood
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeTab, inputMode === 'text' && styles.modeTabActive]}
              onPress={() => switchMode('text')}
            >
              <Ionicons
                name="pencil-outline"
                size={16}
                color={inputMode === 'text' ? Colors.primary : Colors.textSecondary}
              />
              <Text style={[styles.modeTabText, inputMode === 'text' && styles.modeTabTextActive]}>
                Write It Out
              </Text>
            </TouchableOpacity>
          </View>

          {/* Input area */}
          <Animated.View style={{ opacity: fadeAnim }}>
            {inputMode === 'mood' ? (
              <MoodSelector
                selected={selectedEmotion}
                onSelect={setSelectedEmotion}
              />
            ) : (
              <View style={styles.textInputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Tell us what's on your mind... Share freely, your words are private."
                  placeholderTextColor={Colors.textTertiary}
                  multiline
                  numberOfLines={5}
                  value={textInput}
                  onChangeText={setTextInput}
                  textAlignVertical="top"
                  returnKeyType="default"
                  maxLength={1000}
                />
                <Text style={styles.charCount}>{textInput.length}/1000</Text>
              </View>
            )}
          </Animated.View>

          {/* Voice input button */}
          <TouchableOpacity
            style={styles.voiceButton}
            activeOpacity={0.8}
            onPress={() => {
              Alert.alert(
                'Voice Input',
                'Voice check-in is coming soon. For now, please type or select your mood.',
                [{ text: 'OK' }]
              );
            }}
          >
            <View style={styles.voiceIconContainer}>
              <Ionicons name="mic-outline" size={20} color={Colors.secondary} />
            </View>
            <View>
              <Text style={styles.voiceLabel}>Speak Instead</Text>
              <Text style={styles.voiceSubLabel}>Voice check-in (coming soon)</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
          </TouchableOpacity>

          {/* Error */}
          {error && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle-outline" size={16} color={Colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Submit */}
          <TouchableOpacity
            style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <LoadingSpinner size="sm" color={Colors.surface} message="" />
            ) : (
              <>
                <Text style={styles.submitText}>Find Relevant Verses</Text>
                <Ionicons name="arrow-forward" size={18} color={Colors.surface} />
              </>
            )}
          </TouchableOpacity>

          {loading && (
            <Text style={styles.loadingHint}>
              Searching the Quran for guidance tailored to you...
            </Text>
          )}

          {/* Privacy note */}
          <Text style={styles.privacyNote}>
            Your check-ins are private and stored only on your device.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxxl + Spacing.section,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  greeting: {
    fontSize: Typography.fontSize.xxl,
    color: Colors.primary,
    fontWeight: Typography.fontWeight.bold,
  },
  subGreeting: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  hijriContainer: {
    backgroundColor: `${Colors.primary}15`,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  hijriDate: {
    fontSize: Typography.fontSize.xs,
    color: Colors.primary,
    fontWeight: Typography.fontWeight.medium,
  },
  bismillahRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xl,
    gap: Spacing.md,
  },
  decorLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  bismillah: {
    fontFamily: Typography.fontFamily.arabic,
    fontSize: Typography.fontSize.arabicSm,
    color: Colors.primary,
    writingDirection: 'rtl',
  },
  mainQuestion: {
    fontSize: Typography.fontSize.xxxl,
    color: Colors.text,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.sm,
    lineHeight: Typography.fontSize.xxxl * 1.2,
  },
  mainSubtext: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
    lineHeight: Typography.fontSize.md * 1.6,
  },
  modeSwitcher: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  modeTabActive: {
    backgroundColor: Colors.surface,
    ...Shadows.sm,
  },
  modeTabText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeight.medium,
  },
  modeTabTextActive: {
    color: Colors.primary,
    fontWeight: Typography.fontWeight.semibold,
  },
  textInputContainer: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  textInput: {
    fontSize: Typography.fontSize.md,
    color: Colors.text,
    lineHeight: Typography.fontSize.md * 1.7,
    minHeight: 120,
  },
  charCount: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textTertiary,
    textAlign: 'right',
    marginTop: Spacing.sm,
  },
  voiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  voiceIconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: `${Colors.secondary}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceLabel: {
    flex: 1,
    fontSize: Typography.fontSize.md,
    color: Colors.text,
    fontWeight: Typography.fontWeight.medium,
  },
  voiceSubLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textTertiary,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${Colors.error}15`,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: Colors.error,
  },
  errorText: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    color: Colors.error,
    lineHeight: Typography.fontSize.sm * 1.5,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.xl,
    gap: Spacing.sm,
    ...Shadows.md,
  },
  submitButtonDisabled: {
    backgroundColor: Colors.secondary,
    opacity: 0.6,
  },
  submitText: {
    fontSize: Typography.fontSize.lg,
    color: Colors.surface,
    fontWeight: Typography.fontWeight.semibold,
  },
  loadingHint: {
    marginTop: Spacing.md,
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  privacyNote: {
    marginTop: Spacing.xl,
    fontSize: Typography.fontSize.xs,
    color: Colors.textTertiary,
    textAlign: 'center',
    lineHeight: Typography.fontSize.xs * 1.8,
  },
});
