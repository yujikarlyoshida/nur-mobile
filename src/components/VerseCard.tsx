import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { VerseRecommendation } from '../types';
import { ArabicText } from './ArabicText';
import { AudioPlayer } from './AudioPlayer';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../constants/theme';

function getAudioUrl(surahNumber: number, ayahNumber: number): string {
  const s = String(surahNumber).padStart(3, '0');
  const a = String(ayahNumber).padStart(3, '0');
  return `https://verses.quran.com/Alafasy/mp3/${s}${a}.mp3`;
}

const SURAH_NAMES: Record<number, string> = {
  1: 'Al-Fatihah',
  2: 'Al-Baqarah',
  3: 'Ali Imran',
  4: 'An-Nisa',
  5: 'Al-Maidah',
  6: 'Al-Anam',
  7: 'Al-Araf',
  9: 'At-Tawbah',
  10: 'Yunus',
  12: 'Yusuf',
  13: 'Ar-Rad',
  14: 'Ibrahim',
  17: 'Al-Isra',
  18: 'Al-Kahf',
  19: 'Maryam',
  20: 'Ta-Ha',
  24: 'An-Nur',
  25: 'Al-Furqan',
  29: 'Al-Ankabut',
  33: 'Al-Ahzab',
  36: 'Ya-Sin',
  39: 'Az-Zumar',
  40: 'Ghafir',
  47: 'Muhammad',
  49: 'Al-Hujurat',
  55: 'Ar-Rahman',
  56: 'Al-Waqiah',
  57: 'Al-Hadid',
  59: 'Al-Hashr',
  62: 'Al-Jumuah',
  65: 'At-Talaq',
  67: 'Al-Mulk',
  73: 'Al-Muzzammil',
  76: 'Al-Insan',
  78: 'An-Naba',
  89: 'Al-Fajr',
  93: 'Ad-Duhah',
  94: 'Ash-Sharh',
  112: 'Al-Ikhlas',
};

function getSurahName(surahNumber: number, surahName?: string): string {
  if (surahName) return surahName;
  return SURAH_NAMES[surahNumber] || `Surah ${surahNumber}`;
}

interface VerseCardProps {
  verse: VerseRecommendation;
  onPress: () => void;
  onSave: () => void;
  isSaved: boolean;
}

export const VerseCard: React.FC<VerseCardProps> = ({
  verse,
  onPress,
  onSave,
  isSaved,
}) => {
  const surahName = getSurahName(verse.surah_number, verse.surah_name);

  const handleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    onSave();
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
      onPress={onPress}
    >
      {/* Header: reference + save */}
      <View style={styles.header}>
        <View style={styles.reference}>
          <View style={styles.refBadge}>
            <Text style={styles.refText}>
              {surahName} {verse.surah_number}:{verse.ayah_number}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name={isSaved ? 'bookmark' : 'bookmark-outline'}
            size={20}
            color={isSaved ? Colors.accent : Colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* Arabic text */}
      {verse.arabic_text ? (
        <View style={styles.arabicContainer}>
          <ArabicText
            text={verse.arabic_text}
            size="md"
            style={styles.arabicText}
            numberOfLines={3}
          />
        </View>
      ) : null}

      {/* Translation */}
      <Text style={styles.translation} numberOfLines={3}>
        {verse.translation}
      </Text>

      {/* Audio player */}
      <View style={styles.audioContainer}>
        <AudioPlayer
          audioUrl={getAudioUrl(verse.surah_number, verse.ayah_number)}
          reciterName="Mishary Alafasy"
          autoLoad={false}
        />
      </View>

      {/* Personalized note */}
      {verse.personalized_note ? (
        <View style={styles.noteChip}>
          <Ionicons name="sparkles" size={12} color={Colors.accent} />
          <Text style={styles.noteText} numberOfLines={2}>
            {verse.personalized_note}
          </Text>
        </View>
      ) : null}

      {/* Tap hint */}
      <View style={styles.footer}>
        <Text style={styles.tapHint}>Tap to read more</Text>
        <Ionicons name="chevron-forward" size={14} color={Colors.textTertiary} />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  cardPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  reference: {
    flex: 1,
  },
  refBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${Colors.primary}15`,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    alignSelf: 'flex-start',
  },
  refText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.primary,
    fontWeight: Typography.fontWeight.semibold,
  },
  saveButton: {
    padding: Spacing.xs,
  },
  arabicContainer: {
    backgroundColor: `${Colors.primary}08`,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderRightWidth: 3,
    borderRightColor: Colors.accent,
  },
  arabicText: {
    lineHeight: 40,
  },
  translation: {
    fontSize: Typography.fontSize.md,
    color: Colors.text,
    lineHeight: Typography.fontSize.md * 1.6,
    marginBottom: Spacing.md,
  },
  audioContainer: {
    marginBottom: Spacing.md,
  },
  noteChip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: `${Colors.accent}18`,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
    borderLeftWidth: 2,
    borderLeftColor: Colors.accent,
  },
  noteText: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    color: Colors.text,
    lineHeight: Typography.fontSize.sm * 1.5,
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: Spacing.xs,
  },
  tapHint: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textTertiary,
  },
});

export default VerseCard;
