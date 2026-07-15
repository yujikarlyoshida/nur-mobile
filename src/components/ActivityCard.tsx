import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ActivityCategory, ActivitySuggestion } from '../types';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../constants/theme';

const CATEGORY_ICONS: Record<ActivityCategory, keyof typeof Ionicons.glyphMap> = {
  calm_nature: 'leaf-outline',
  physical_release: 'flash-outline',
  social_gathering: 'people-outline',
  quiet_reflection: 'moon-outline',
  adventure: 'compass-outline',
  creative_or_learning: 'color-palette-outline',
  service_or_community: 'heart-outline',
  celebration: 'sparkles-outline',
};

interface ActivityCardProps {
  activity: ActivitySuggestion;
}

const VIBE_LABEL: Record<string, string> = {
  quiet: 'Quiet',
  moderate: 'Moderate',
  lively: 'Lively',
};

const PARKING_LABEL: Record<string, string> = {
  easy: 'Easy',
  moderate: 'Moderate',
  hard: 'Hard',
};

// A delay this small isn't worth calling out — only flag traffic that would
// actually change whether going is a good idea right now.
const NOTABLE_TRAFFIC_DELAY_MIN = 5;

export const ActivityCard: React.FC<ActivityCardProps> = ({ activity }) => {
  return (
    <Pressable style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
      <View style={styles.header}>
        <View style={styles.iconBadge}>
          <Ionicons
            name={CATEGORY_ICONS[activity.category]}
            size={16}
            color={Colors.primary}
          />
        </View>
        <View style={styles.headerText}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{activity.name}</Text>
            {activity.vibe && (
              <View style={styles.vibeBadge}>
                <Text style={styles.vibeBadgeText}>{VIBE_LABEL[activity.vibe]}</Text>
              </View>
            )}
          </View>
          <View style={styles.metaRow}>
            {activity.distance_km !== undefined && (
              <Text style={styles.metaText}>{activity.distance_km} km away</Text>
            )}
            {activity.typical_hours && (
              <Text style={styles.metaText}>· {activity.typical_hours}</Text>
            )}
            {activity.is_open_now !== undefined && (
              <Text style={[styles.metaText, activity.is_open_now ? styles.openText : styles.closedText]}>
                · {activity.is_open_now ? 'Open now' : 'Closed now'}
              </Text>
            )}
            {activity.special_hours_today && (
              <Text style={[styles.metaText, styles.specialHoursText]}>· Special hours today</Text>
            )}
          </View>
          {(activity.travel_time_minutes !== undefined || activity.parking_difficulty) && (
            <View style={styles.metaRow}>
              {activity.travel_time_minutes !== undefined && (
                <Text
                  style={[
                    styles.metaText,
                    (activity.traffic_delay_minutes ?? 0) >= NOTABLE_TRAFFIC_DELAY_MIN &&
                      styles.trafficDelayText,
                  ]}
                >
                  ~{activity.travel_time_minutes} min drive
                  {(activity.traffic_delay_minutes ?? 0) >= NOTABLE_TRAFFIC_DELAY_MIN
                    ? ` (+${activity.traffic_delay_minutes} min traffic)`
                    : ''}
                </Text>
              )}
              {activity.parking_difficulty && (
                <Text
                  style={[
                    styles.metaText,
                    activity.parking_difficulty === 'easy'
                      ? styles.parkingEasyText
                      : activity.parking_difficulty === 'hard'
                        ? styles.parkingHardText
                        : styles.parkingModerateText,
                  ]}
                >
                  · Parking: {PARKING_LABEL[activity.parking_difficulty]}
                </Text>
              )}
            </View>
          )}
        </View>
      </View>
      <Text style={styles.description} numberOfLines={2}>
        {activity.description}
      </Text>
      {activity.source === 'sample' && (
        <Text style={styles.sampleNote}>Sample suggestion — connect a live places API for real venues.</Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  cardPressed: {
    opacity: 0.92,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  iconBadge: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.full,
    backgroundColor: `${Colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  name: {
    fontSize: Typography.fontSize.md,
    color: Colors.text,
    fontWeight: Typography.fontWeight.semibold,
  },
  vibeBadge: {
    backgroundColor: Colors.accentLight,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  vibeBadgeText: {
    fontSize: 10,
    color: Colors.primary,
    fontWeight: Typography.fontWeight.semibold,
  },
  specialHoursText: {
    color: Colors.warning,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 2,
  },
  metaText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
  },
  openText: {
    color: Colors.primary,
  },
  closedText: {
    color: Colors.textTertiary,
  },
  trafficDelayText: {
    color: Colors.warning,
  },
  parkingEasyText: {
    color: Colors.primary,
  },
  parkingModerateText: {
    color: Colors.warning,
  },
  parkingHardText: {
    color: Colors.error,
  },
  description: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    lineHeight: Typography.fontSize.sm * 1.5,
  },
  sampleNote: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textTertiary,
    fontStyle: 'italic',
    marginTop: Spacing.xs,
  },
});

export default ActivityCard;
