import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Share,
  Alert,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, RouteProp } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

import { RootStackParamList } from '../navigation/types';
import { ArabicText } from '../components/ArabicText';
import { AudioPlayer } from '../components/AudioPlayer';
import { useSavedVerses } from '../hooks/useSavedVerses';
import { updateVerseNote } from '../services/storage';
import { getVerseAudioUrl } from '../services/quranApi';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../constants/theme';

type Route = RouteProp<RootStackParamList, 'VerseDetail'>;

const SURAH_NAMES: Record<number, string> = {
  1: 'Al-Fatihah', 2: 'Al-Baqarah', 3: 'Ali Imran', 4: 'An-Nisa',
  5: 'Al-Maidah', 6: 'Al-Anam', 7: 'Al-Araf', 9: 'At-Tawbah',
  10: 'Yunus', 12: 'Yusuf', 13: 'Ar-Rad', 14: 'Ibrahim',
  17: 'Al-Isra', 18: 'Al-Kahf', 19: 'Maryam', 20: 'Ta-Ha',
  24: 'An-Nur', 25: 'Al-Furqan', 29: 'Al-Ankabut', 33: 'Al-Ahzab',
  36: 'Ya-Sin', 39: 'Az-Zumar', 55: 'Ar-Rahman', 56: 'Al-Waqiah',
  57: 'Al-Hadid', 67: 'Al-Mulk', 93: 'Ad-Duhah', 94: 'Ash-Sharh',
  112: 'Al-Ikhlas',
};

function getSurahName(num: number, override?: string): string {
  return override || SURAH_NAMES[num] || `Surah ${num}`;
}

export default function VerseDetailScreen() {
  const route = useRoute<Route>();
  const { verse, audioUrl: initialAudioUrl } = route.params;
  const { saveVerse, unsaveVerse, isSaved } = useSavedVerses();

  const [showTransliteration, setShowTransliteration] = useState(false);
  const [showTafsir, setShowTafsir] = useState(false);
  const [personalReflection, setPersonalReflection] = useState('');
  const [reflectionSaved, setReflectionSaved] = useState(false);
  const [audioUrl, setAudioUrl] = useState(initialAudioUrl || '');
  const [audioLoading, setAudioLoading] = useState(!initialAudioUrl);

  const saved = isSaved(verse.verse_key);
  const surahName = getSurahName(verse.surah_number, verse.surah_name);

  useEffect(() => {
    if (!initialAudioUrl) {
      getVerseAudioUrl(verse.verse_key)
        .then((url) => {
          setAudioUrl(url);
          setAudioLoading(false);
        })
        .catch(() => setAudioLoading(false));
    }
  }, [verse.verse_key, initialAudioUrl]);

  const handleSaveToggle = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    if (saved) {
      unsaveVerse(verse.verse_key);
    } else {
      saveVerse(verse);
    }
  }, [saved, verse, saveVerse, unsaveVerse]);

  const handleShare = useCallback(async () => {
    const shareText = [
      `"${verse.translation}"`,
      '',
      `— Quran, ${surahName} ${verse.surah_number}:${verse.ayah_number}`,
      '',
      'Shared via Nur - Quranic Wellbeing',
    ].join('\n');

    try {
      await Share.share({ message: shareText, title: `Quran ${verse.verse_key}` });
    } catch {
      // User dismissed
    }
  }, [verse, surahName]);

  const handleSaveReflection = useCallback(async () => {
    if (!personalReflection.trim()) return;
    await updateVerseNote(verse.verse_key, personalReflection.trim());
    setReflectionSaved(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setTimeout(() => setReflectionSaved(false), 2500);
  }, [verse.verse_key, personalReflection]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Reference badge */}
        <View style={styles.referenceRow}>
          <View style={styles.referenceBadge}>
            <Text style={styles.referenceText}>
              {surahName} · {verse.surah_number}:{verse.ayah_number}
            </Text>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
              <Ionicons name="share-outline" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, saved && styles.actionButtonActive]}
              onPress={handleSaveToggle}
            >
              <Ionicons
                name={saved ? 'bookmark' : 'bookmark-outline'}
                size={20}
                color={saved ? Colors.accent : Colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Arabic text */}
        <View style={styles.arabicCard}>
          <ArabicText text={verse.arabic_text} size="xl" style={styles.arabicText} />
        </View>

        {/* Transliteration toggle */}
        {verse.transliteration && (
          <TouchableOpacity
            style={styles.toggleRow}
            onPress={() => setShowTransliteration(!showTransliteration)}
          >
            <Ionicons
              name={showTransliteration ? 'eye-off-outline' : 'eye-outline'}
              size={15}
              color={Colors.secondary}
            />
            <Text style={styles.toggleText}>
              {showTransliteration ? 'Hide' : 'Show'} transliteration
            </Text>
          </TouchableOpacity>
        )}

        {showTransliteration && verse.transliteration && (
          <View style={styles.transliterationCard}>
            <Text style={styles.transliterationText}>{verse.transliteration}</Text>
          </View>
        )}

        {/* Translation */}
        <View style={styles.translationCard}>
          <Text style={styles.translationText}>"{verse.translation}"</Text>
        </View>

        {/* Personalized note */}
        {verse.personalized_note ? (
          <View style={styles.personalNoteCard}>
            <View style={styles.personalNoteHeader}>
              <Ionicons name="sparkles" size={14} color={Colors.accent} />
              <Text style={styles.personalNoteLabel}>Personalized insight</Text>
            </View>
            <Text style={styles.personalNoteText}>{verse.personalized_note}</Text>
          </View>
        ) : null}

        {/* Audio player */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Listen</Text>
          {audioLoading ? (
            <View style={styles.audioLoading}>
              <ActivityIndicator color={Colors.primary} size="small" />
              <Text style={styles.audioLoadingText}>Loading recitation...</Text>
            </View>
          ) : audioUrl ? (
            <AudioPlayer audioUrl={audioUrl} reciterName="Mishary Rashid Alafasy" autoLoad={false} />
          ) : (
            <View style={styles.audioUnavailable}>
              <Ionicons name="musical-notes-outline" size={20} color={Colors.textTertiary} />
              <Text style={styles.audioUnavailableText}>Audio unavailable</Text>
            </View>
          )}
        </View>

        {/* Tafsir section */}
        {verse.tafsir_summary && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.tafsirHeader}
              onPress={() => setShowTafsir(!showTafsir)}
              activeOpacity={0.8}
            >
              <View>
                <Text style={styles.sectionLabel}>Tafsir</Text>
                <Text style={styles.tafsirSubLabel}>Scholarly commentary</Text>
              </View>
              <Ionicons
                name={showTafsir ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={Colors.textSecondary}
              />
            </TouchableOpacity>
            {showTafsir && (
              <View style={styles.tafsirContent}>
                <Text style={styles.tafsirText}>{verse.tafsir_summary}</Text>
              </View>
            )}
          </View>
        )}

        {/* Personal reflection */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Your Reflection</Text>
          <Text style={styles.reflectionPrompt}>
            How does this verse speak to you in this moment?
          </Text>
          <View style={styles.reflectionInputContainer}>
            <TextInput
              style={styles.reflectionInput}
              placeholder="Write your thoughts here..."
              placeholderTextColor={Colors.textTertiary}
              multiline
              numberOfLines={4}
              value={personalReflection}
              onChangeText={(text) => {
                setPersonalReflection(text);
                setReflectionSaved(false);
              }}
              textAlignVertical="top"
              maxLength={500}
            />
          </View>
          <TouchableOpacity
            style={[
              styles.saveReflectionButton,
              reflectionSaved && styles.saveReflectionButtonSuccess,
            ]}
            onPress={handleSaveReflection}
            disabled={!personalReflection.trim() || reflectionSaved}
          >
            <Ionicons
              name={reflectionSaved ? 'checkmark-circle' : 'save-outline'}
              size={16}
              color={reflectionSaved ? Colors.success : Colors.primary}
            />
            <Text
              style={[
                styles.saveReflectionText,
                reflectionSaved && styles.saveReflectionTextSuccess,
              ]}
            >
              {reflectionSaved ? 'Reflection saved' : 'Save reflection'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Related verses placeholder */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Related Verses</Text>
          <View style={styles.relatedPlaceholder}>
            <Ionicons name="book-outline" size={24} color={Colors.textTertiary} />
            <Text style={styles.relatedPlaceholderText}>
              Related verse recommendations coming soon
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.section + Spacing.xxxl,
  },
  referenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  referenceBadge: {
    backgroundColor: `${Colors.primary}15`,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  referenceText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.primary,
    fontWeight: Typography.fontWeight.semibold,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonActive: {
    backgroundColor: `${Colors.accent}20`,
    borderColor: Colors.accent,
  },
  arabicCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRightWidth: 4,
    borderRightColor: Colors.accent,
    ...Shadows.sm,
  },
  arabicText: {
    lineHeight: 60,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    alignSelf: 'flex-start',
  },
  toggleText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.secondary,
    fontWeight: Typography.fontWeight.medium,
  },
  transliterationCard: {
    backgroundColor: `${Colors.secondary}10`,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  transliterationText: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: Typography.fontSize.md * 1.8,
    textAlign: 'center',
  },
  translationCard: {
    marginBottom: Spacing.xl,
  },
  translationText: {
    fontSize: Typography.fontSize.xl,
    color: Colors.text,
    lineHeight: Typography.fontSize.xl * 1.65,
    fontWeight: Typography.fontWeight.medium,
  },
  personalNoteCard: {
    backgroundColor: `${Colors.accent}12`,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
    borderLeftWidth: 3,
    borderLeftColor: Colors.accent,
  },
  personalNoteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  personalNoteLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.accent,
    fontWeight: Typography.fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  personalNoteText: {
    fontSize: Typography.fontSize.md,
    color: Colors.text,
    lineHeight: Typography.fontSize.md * 1.65,
    fontStyle: 'italic',
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionLabel: {
    fontSize: Typography.fontSize.lg,
    color: Colors.text,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.sm,
  },
  audioLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  audioLoadingText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  audioUnavailable: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: BorderRadius.lg,
  },
  audioUnavailableText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textTertiary,
  },
  tafsirHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  tafsirSubLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  tafsirContent: {
    marginTop: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tafsirText: {
    fontSize: Typography.fontSize.md,
    color: Colors.text,
    lineHeight: Typography.fontSize.md * 1.7,
  },
  reflectionPrompt: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    fontStyle: 'italic',
  },
  reflectionInputContainer: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  reflectionInput: {
    fontSize: Typography.fontSize.md,
    color: Colors.text,
    lineHeight: Typography.fontSize.md * 1.7,
    minHeight: 100,
  },
  saveReflectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    alignSelf: 'flex-end',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  saveReflectionButtonSuccess: {
    borderColor: Colors.success,
    backgroundColor: `${Colors.success}15`,
  },
  saveReflectionText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.primary,
    fontWeight: Typography.fontWeight.medium,
  },
  saveReflectionTextSuccess: {
    color: Colors.success,
  },
  relatedPlaceholder: {
    alignItems: 'center',
    padding: Spacing.xxxl,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  relatedPlaceholderText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
});
