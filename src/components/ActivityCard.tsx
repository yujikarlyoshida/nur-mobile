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
          <Text style={styles.name}>{activity.name}</Text>
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
          </View>
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
  name: {
    fontSize: Typography.fontSize.md,
    color: Colors.text,
    fontWeight: Typography.fontWeight.semibold,
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
