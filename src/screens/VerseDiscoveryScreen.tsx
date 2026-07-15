import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList, MainTabParamList } from '../navigation/types';
import { VerseCard } from '../components/VerseCard';
import { ActivityCard } from '../components/ActivityCard';
import { EmotionBadge } from '../components/EmotionBadge';
import { CrisisAlert } from '../components/CrisisAlert';
import { useSavedVerses } from '../hooks/useSavedVerses';
import { getVersesByEmotion } from '../services/api';
import { CheckinResponse, EmotionState, VerseRecommendation } from '../types';
import { EMOTIONS } from '../constants/emotions';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../constants/theme';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'VerseDiscovery'>;

// When used as a tab screen (no checkin response), show browse by emotion
type TabRoute = RouteProp<MainTabParamList, 'Discovery'>;

interface ExpandableReasoningProps {
  profile: CheckinResponse['emotional_profile'];
}

const ExpandableReasoning: React.FC<ExpandableReasoningProps> = ({ profile }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.reasoningCard}>
      <TouchableOpacity
        style={styles.reasoningHeader}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.8}
      >
        <Text style={styles.reasoningTitle}>Why these verses?</Text>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={Colors.textSecondary}
        />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.reasoningContent}>
          <Text style={styles.reasoningText}>{profile.reasoning}</Text>
          <View style={styles.profileDetails}>
            <View style={styles.profileRow}>
              <Text style={styles.profileLabel}>Spiritual Need</Text>
              <Text style={styles.profileValue}>{profile.spiritual_need}</Text>
            </View>
            {profile.life_domain && (
              <View style={styles.profileRow}>
                <Text style={styles.profileLabel}>Life Domain</Text>
                <Text style={styles.profileValue}>{profile.life_domain}</Text>
              </View>
            )}
            {profile.themes && profile.themes.length > 0 && (
              <View style={styles.profileRow}>
                <Text style={styles.profileLabel}>Themes</Text>
                <View style={styles.themeChips}>
                  {profile.themes.map((theme) => (
                    <View key={theme} style={styles.themeChip}>
                      <Text style={styles.themeChipText}>{theme}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

function BrowseByEmotion() {
  const navigation = useNavigation<Nav>();
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionState | null>(null);
  const [verses, setVerses] = useState<VerseRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { saveVerse, unsaveVerse, isSaved } = useSavedVerses();

  const loadVersesByEmotion = async (emotion: EmotionState) => {
    setSelectedEmotion(emotion);
    setLoading(true);
    setError(null);
    try {
      const result = await getVersesByEmotion(emotion);
      setVerses(result);
    } catch {
      setError('Unable to load verses. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const emotionKeys = Object.keys(EMOTIONS) as EmotionState[];

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.browseTitle}>Browse by Emotion</Text>
      <Text style={styles.browseSubtitle}>
        Select an emotional state to discover relevant Quranic guidance.
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.emotionScroll}
      >
        {emotionKeys.map((emotion) => {
          const config = EMOTIONS[emotion];
          const isSelected = selectedEmotion === emotion;
          return (
            <TouchableOpacity
              key={emotion}
              style={[
                styles.emotionChip,
                isSelected && {
                  backgroundColor: config.color,
                  borderColor: config.color,
                },
              ]}
              onPress={() => loadVersesByEmotion(emotion)}
            >
              <Text style={styles.emotionChipIcon}>{config.icon}</Text>
              <Text
                style={[
                  styles.emotionChipText,
                  isSelected && styles.emotionChipTextSelected,
                ]}
              >
                {config.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {loading && (
        <View style={styles.loadingCenter}>
          <ActivityIndicator color={Colors.primary} size="large" />
          <Text style={styles.loadingText}>Finding verses...</Text>
        </View>
      )}

      {error && (
        <View style={styles.errorCard}>
          <Ionicons name="wifi-outline" size={24} color={Colors.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {!loading && verses.length > 0 && (
        <View>
          <Text style={styles.resultsHeader}>
            {verses.length} verses for{' '}
            <Text style={{ color: EMOTIONS[selectedEmotion!]?.color }}>
              {EMOTIONS[selectedEmotion!]?.label}
            </Text>
          </Text>
          {verses.map((verse) => (
            <VerseCard
              key={verse.verse_key}
              verse={verse}
              onPress={() => navigation.navigate('VerseDetail', { verse })}
              onSave={() => isSaved(verse.verse_key) ? unsaveVerse(verse.verse_key) : saveVerse(verse)}
              isSaved={isSaved(verse.verse_key)}
            />
          ))}
        </View>
      )}

      {!loading && !error && selectedEmotion && verses.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📖</Text>
          <Text style={styles.emptyTitle}>No verses found</Text>
          <Text style={styles.emptySubtext}>Try a different emotion or start a check-in for personalized recommendations.</Text>
        </View>
      )}
    </ScrollView>
  );
}

type VibeFilter = 'all' | 'quiet' | 'lively';

export default function VerseDiscoveryScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute();
  const { saveVerse, unsaveVerse, isSaved } = useSavedVerses();
  const [vibeFilter, setVibeFilter] = useState<VibeFilter>('all');

  // Check if we have a checkin response in params
  const params = route.params as { checkinResponse?: CheckinResponse } | undefined;
  const checkinResponse = params?.checkinResponse;

  if (!checkinResponse) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Verse Discovery</Text>
        </View>
        <BrowseByEmotion />
      </SafeAreaView>
    );
  }

  const { emotional_profile, recommendations, crisis_resources, activity_suggestions } =
    checkinResponse;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Crisis alert (shown at top if crisis detected) */}
        {emotional_profile.crisis && (
          <CrisisAlert
            message={crisis_resources?.message}
            hotlines={crisis_resources?.hotlines}
          />
        )}

        {/* Emotion profile summary */}
        <View style={styles.profileCard}>
          <Text style={styles.profileCardLabel}>We detected</Text>
          <View style={styles.emotionRow}>
            <EmotionBadge
              emotion={emotional_profile.primary_emotion}
              intensity={emotional_profile.intensity}
              showIntensity
              size="lg"
            />
          </View>
          <Text style={styles.spiritualNeed}>
            Spiritual need: {emotional_profile.spiritual_need}
          </Text>
        </View>

        {/* Recommendations header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recommended for you</Text>
          <Text style={styles.sectionCount}>
            {recommendations.length} verse{recommendations.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {/* Verse cards */}
        {recommendations.map((verse) => (
          <VerseCard
            key={verse.verse_key}
            verse={verse}
            onPress={() => navigation.navigate('VerseDetail', { verse })}
            onSave={() =>
              isSaved(verse.verse_key)
                ? unsaveVerse(verse.verse_key)
                : saveVerse(verse)
            }
            isSaved={isSaved(verse.verse_key)}
          />
        ))}

        {/* Why these verses */}
        <ExpandableReasoning profile={emotional_profile} />

        {/* Real-world activity suggestions (only present if location was shared) */}
        {activity_suggestions && activity_suggestions.length > 0 && (() => {
          const filtered = activity_suggestions.filter((a) => {
            if (vibeFilter === 'all') return true;
            if (vibeFilter === 'quiet') return a.vibe === 'quiet' || a.vibe === 'moderate' || !a.vibe;
            return a.vibe === 'lively' || a.vibe === 'moderate' || !a.vibe;
          });

          return (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Something you could do</Text>
                <Text style={styles.sectionCount}>
                  {filtered.length} idea{filtered.length !== 1 ? 's' : ''}
                </Text>
              </View>

              <View style={styles.vibeToggleRow}>
                {(['quiet', 'lively'] as const).map((option) => {
                  const active = vibeFilter === option;
                  return (
                    <TouchableOpacity
                      key={option}
                      style={[styles.vibePill, active && styles.vibePillActive]}
                      onPress={() => setVibeFilter(active ? 'all' : option)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.vibePillText, active && styles.vibePillTextActive]}>
                        {option === 'quiet' ? 'Quiet' : 'Lively'}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {filtered.map((activity) => (
                <ActivityCard key={activity.id} activity={activity} />
              ))}
            </>
          );
        })()}

        {/* New check-in FAB area */}
        <View style={styles.newCheckinArea}>
          <TouchableOpacity
            style={styles.newCheckinButton}
            onPress={() => navigation.navigate('MainTabs')}
            activeOpacity={0.85}
          >
            <Ionicons name="refresh-outline" size={18} color={Colors.surface} />
            <Text style={styles.newCheckinText}>New Check-in</Text>
          </TouchableOpacity>
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
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.section + Spacing.xxxl,
  },
  profileCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  profileCardLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontWeight: Typography.fontWeight.semibold,
  },
  emotionRow: {
    marginBottom: Spacing.md,
  },
  spiritualNeed: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    lineHeight: Typography.fontSize.sm * 1.6,
    fontStyle: 'italic',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.xl,
    color: Colors.text,
    fontWeight: Typography.fontWeight.bold,
  },
  sectionCount: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    backgroundColor: Colors.surfaceAlt,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  vibeToggleRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  vibePill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  vibePillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  vibePillText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeight.medium,
  },
  vibePillTextActive: {
    color: Colors.textOnPrimary,
    fontWeight: Typography.fontWeight.semibold,
  },
  reasoningCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  reasoningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.xl,
  },
  reasoningTitle: {
    fontSize: Typography.fontSize.lg,
    color: Colors.text,
    fontWeight: Typography.fontWeight.semibold,
  },
  reasoningContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  reasoningText: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
    lineHeight: Typography.fontSize.md * 1.65,
    marginBottom: Spacing.md,
  },
  profileDetails: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  profileRow: {
    gap: Spacing.xs,
  },
  profileLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontWeight: Typography.fontWeight.semibold,
  },
  profileValue: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text,
    fontWeight: Typography.fontWeight.medium,
  },
  themeChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  themeChip: {
    backgroundColor: `${Colors.primary}15`,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  themeChipText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.primary,
    fontWeight: Typography.fontWeight.medium,
  },
  newCheckinArea: {
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  newCheckinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondary,
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
    ...Shadows.sm,
  },
  newCheckinText: {
    fontSize: Typography.fontSize.md,
    color: Colors.surface,
    fontWeight: Typography.fontWeight.semibold,
  },
  // Browse by emotion styles
  browseTitle: {
    fontSize: Typography.fontSize.xxxl,
    color: Colors.primary,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.sm,
  },
  browseSubtitle: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
    lineHeight: Typography.fontSize.md * 1.6,
    marginBottom: Spacing.xl,
  },
  emotionScroll: {
    paddingRight: Spacing.xl,
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
    flexDirection: 'row',
    flexWrap: 'nowrap',
  },
  emotionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    gap: Spacing.xs,
  },
  emotionChipIcon: {
    fontSize: 16,
  },
  emotionChipText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text,
    fontWeight: Typography.fontWeight.medium,
  },
  emotionChipTextSelected: {
    color: Colors.surface,
  },
  loadingCenter: {
    alignItems: 'center',
    paddingVertical: Spacing.xxxl,
    gap: Spacing.md,
  },
  loadingText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  errorCard: {
    alignItems: 'center',
    padding: Spacing.xxxl,
    gap: Spacing.md,
  },
  errorText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.error,
    textAlign: 'center',
  },
  resultsHeader: {
    fontSize: Typography.fontSize.lg,
    color: Colors.text,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxxl,
    gap: Spacing.md,
  },
  emptyIcon: {
    fontSize: 48,
  },
  emptyTitle: {
    fontSize: Typography.fontSize.xl,
    color: Colors.text,
    fontWeight: Typography.fontWeight.semibold,
  },
  emptySubtext: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: Typography.fontSize.sm * 1.6,
    paddingHorizontal: Spacing.xl,
  },
});
