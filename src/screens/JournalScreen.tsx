import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../navigation/types';
import { EmotionBadge } from '../components/EmotionBadge';
import { getJournalEntries } from '../services/storage';
import { getSavedVerses } from '../services/storage';
import { JournalEntry, SavedVerse } from '../types';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../constants/theme';

type Nav = NativeStackNavigationProp<RootStackParamList>;

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface JournalEntryCardProps {
  entry: JournalEntry;
}

const JournalEntryCard: React.FC<JournalEntryCardProps> = ({ entry }) => (
  <View style={styles.entryCard}>
    <View style={styles.entryHeader}>
      <View style={styles.entryDateGroup}>
        <Text style={styles.entryDate}>{formatDate(entry.date)}</Text>
        <Text style={styles.entryTime}>{formatTime(entry.date)}</Text>
      </View>
      <EmotionBadge emotion={entry.emotion} intensity={entry.intensity} showIntensity size="sm" />
    </View>

    {entry.text_input && (
      <Text style={styles.entryText} numberOfLines={2}>
        "{entry.text_input}"
      </Text>
    )}

    <View style={styles.entryFooter}>
      <View style={styles.entryStats}>
        <View style={styles.statItem}>
          <Ionicons name="book-outline" size={13} color={Colors.textSecondary} />
          <Text style={styles.statText}>
            {entry.verses_received} verse{entry.verses_received !== 1 ? 's' : ''} received
          </Text>
        </View>
      </View>
    </View>
  </View>
);

interface SavedVerseSectionProps {
  verses: SavedVerse[];
}

const SavedVersesSection: React.FC<SavedVerseSectionProps> = ({ verses }) => {
  if (verses.length === 0) return null;

  return (
    <View style={styles.savedSection}>
      <View style={styles.sectionHeader}>
        <Ionicons name="bookmark" size={18} color={Colors.accent} />
        <Text style={styles.sectionTitle}>Saved Verses</Text>
        <Text style={styles.sectionCount}>{verses.length}</Text>
      </View>
      {verses.slice(0, 3).map((verse) => (
        <View key={verse.verse_key} style={styles.savedVerseCard}>
          <View style={styles.savedVerseRef}>
            <Text style={styles.savedVerseKey}>{verse.verse_key}</Text>
            {verse.surah_name && (
              <Text style={styles.savedVerseSurah}>{verse.surah_name}</Text>
            )}
          </View>
          <Text style={styles.savedVerseTranslation} numberOfLines={2}>
            {verse.translation}
          </Text>
          {verse.personal_note && (
            <Text style={styles.savedVerseNote} numberOfLines={1}>
              Note: {verse.personal_note}
            </Text>
          )}
        </View>
      ))}
      {verses.length > 3 && (
        <Text style={styles.moreVerses}>+{verses.length - 3} more saved verses</Text>
      )}
    </View>
  );
};

export default function JournalScreen() {
  const navigation = useNavigation<Nav>();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [savedVerses, setSavedVerses] = useState<SavedVerse[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    const [journalData, versesData] = await Promise.all([
      getJournalEntries(),
      getSavedVerses(),
    ]);
    setEntries(journalData);
    setSavedVerses(versesData);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  // Group entries by date
  const groupedEntries: Record<string, JournalEntry[]> = {};
  entries.forEach((entry) => {
    const dateKey = new Date(entry.date).toDateString();
    if (!groupedEntries[dateKey]) groupedEntries[dateKey] = [];
    groupedEntries[dateKey].push(entry);
  });

  const isEmpty = entries.length === 0 && savedVerses.length === 0;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Spiritual Journal</Text>
        {entries.length > 0 && (
          <View style={styles.headerStats}>
            <Text style={styles.headerStatText}>
              {entries.length} check-in{entries.length !== 1 ? 's' : ''}
            </Text>
          </View>
        )}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, isEmpty && styles.contentCentered]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        {loading ? null : isEmpty ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📖</Text>
            <Text style={styles.emptyTitle}>Your spiritual journal is empty</Text>
            <Text style={styles.emptySubtext}>
              Start a check-in to begin tracking your emotional and spiritual journey with the Quran.
            </Text>
            <TouchableOpacity
              style={styles.startCheckinButton}
              onPress={() => navigation.navigate('MainTabs')}
            >
              <Ionicons name="add-circle-outline" size={18} color={Colors.surface} />
              <Text style={styles.startCheckinText}>Start a Check-in</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Summary card */}
            {entries.length > 0 && (
              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Your Journey</Text>
                <View style={styles.summaryStats}>
                  <View style={styles.summaryStatItem}>
                    <Text style={styles.summaryStatNumber}>{entries.length}</Text>
                    <Text style={styles.summaryStatLabel}>Check-ins</Text>
                  </View>
                  <View style={styles.summarySeparator} />
                  <View style={styles.summaryStatItem}>
                    <Text style={styles.summaryStatNumber}>{savedVerses.length}</Text>
                    <Text style={styles.summaryStatLabel}>Saved Verses</Text>
                  </View>
                  <View style={styles.summarySeparator} />
                  <View style={styles.summaryStatItem}>
                    <Text style={styles.summaryStatNumber}>
                      {entries.reduce((sum, e) => sum + e.verses_received, 0)}
                    </Text>
                    <Text style={styles.summaryStatLabel}>Verses Received</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Saved verses */}
            <SavedVersesSection verses={savedVerses} />

            {/* Journal entries */}
            {entries.length > 0 && (
              <View>
                <View style={styles.sectionHeader}>
                  <Ionicons name="time-outline" size={18} color={Colors.primary} />
                  <Text style={styles.sectionTitle}>Check-in History</Text>
                </View>
                {Object.entries(groupedEntries).map(([dateKey, dayEntries]) => (
                  <View key={dateKey} style={styles.dayGroup}>
                    <Text style={styles.dayLabel}>
                      {new Date(dateKey).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </Text>
                    {dayEntries.map((entry) => (
                      <JournalEntryCard key={entry.id} entry={entry} />
                    ))}
                  </View>
                ))}
              </View>
            )}
          </>
        )}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  headerTitle: {
    fontSize: Typography.fontSize.xxxl,
    color: Colors.primary,
    fontWeight: Typography.fontWeight.bold,
  },
  headerStats: {
    backgroundColor: `${Colors.primary}15`,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  headerStatText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.primary,
    fontWeight: Typography.fontWeight.medium,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.screen,
    paddingBottom: Spacing.section + Spacing.xxxl,
  },
  contentCentered: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.lg,
  },
  emptyIcon: {
    fontSize: 64,
  },
  emptyTitle: {
    fontSize: Typography.fontSize.xl,
    color: Colors.text,
    fontWeight: Typography.fontWeight.bold,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: Typography.fontSize.md * 1.65,
  },
  startCheckinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
    marginTop: Spacing.md,
    ...Shadows.sm,
  },
  startCheckinText: {
    fontSize: Typography.fontSize.md,
    color: Colors.surface,
    fontWeight: Typography.fontWeight.semibold,
  },
  summaryCard: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
    ...Shadows.md,
  },
  summaryTitle: {
    fontSize: Typography.fontSize.lg,
    color: Colors.surface,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.lg,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  summaryStatItem: {
    alignItems: 'center',
  },
  summaryStatNumber: {
    fontSize: Typography.fontSize.xxxl,
    color: Colors.accent,
    fontWeight: Typography.fontWeight.bold,
  },
  summaryStatLabel: {
    fontSize: Typography.fontSize.xs,
    color: 'rgba(255,255,255,0.75)',
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  summarySeparator: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  savedSection: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.xl,
    color: Colors.text,
    fontWeight: Typography.fontWeight.bold,
    flex: 1,
  },
  sectionCount: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    backgroundColor: Colors.surfaceAlt,
    paddingHorizontal: Spacing.md,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  savedVerseCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    borderLeftWidth: 3,
    borderLeftColor: Colors.accent,
  },
  savedVerseRef: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  savedVerseKey: {
    fontSize: Typography.fontSize.xs,
    color: Colors.primary,
    fontWeight: Typography.fontWeight.bold,
    backgroundColor: `${Colors.primary}15`,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  savedVerseSurah: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
  },
  savedVerseTranslation: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text,
    lineHeight: Typography.fontSize.sm * 1.6,
  },
  savedVerseNote: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginTop: Spacing.sm,
  },
  moreVerses: {
    fontSize: Typography.fontSize.sm,
    color: Colors.secondary,
    textAlign: 'center',
    paddingVertical: Spacing.md,
    fontWeight: Typography.fontWeight.medium,
  },
  dayGroup: {
    marginBottom: Spacing.xl,
  },
  dayLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  entryCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  entryDateGroup: {
    gap: 2,
  },
  entryDate: {
    fontSize: Typography.fontSize.md,
    color: Colors.text,
    fontWeight: Typography.fontWeight.semibold,
  },
  entryTime: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textTertiary,
  },
  entryText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    lineHeight: Typography.fontSize.sm * 1.6,
    fontStyle: 'italic',
    marginBottom: Spacing.md,
  },
  entryFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  entryStats: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
  },
});
