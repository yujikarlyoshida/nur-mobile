import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { EmotionState } from '../types';
import { EMOTIONS } from '../constants/emotions';
import { Typography, BorderRadius, Spacing } from '../constants/theme';

interface EmotionBadgeProps {
  emotion: EmotionState;
  intensity?: number;
  showIntensity?: boolean;
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

export const EmotionBadge: React.FC<EmotionBadgeProps> = ({
  emotion,
  intensity,
  showIntensity = false,
  size = 'md',
  style,
}) => {
  const config = EMOTIONS[emotion];
  if (!config) return null;

  const sizeStyles = {
    sm: { paddingH: Spacing.sm, paddingV: 3, fontSize: Typography.fontSize.xs },
    md: { paddingH: Spacing.md, paddingV: Spacing.xs, fontSize: Typography.fontSize.sm },
    lg: { paddingH: Spacing.lg, paddingV: Spacing.sm, fontSize: Typography.fontSize.md },
  };

  const { paddingH, paddingV, fontSize } = sizeStyles[size];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: `${config.color}22`,
          borderColor: `${config.color}55`,
          paddingHorizontal: paddingH,
          paddingVertical: paddingV,
        },
        style,
      ]}
    >
      <Text style={styles.icon}>{config.icon}</Text>
      <Text style={[styles.label, { color: config.color, fontSize }]}>
        {config.label}
      </Text>
      {showIntensity && intensity !== undefined && (
        <Text style={[styles.intensity, { color: config.color, fontSize: fontSize - 2 }]}>
          {' '}·{' '}{intensity}/10
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  icon: {
    fontSize: 13,
    marginRight: 4,
  },
  label: {
    fontWeight: Typography.fontWeight.semibold,
  },
  intensity: {
    fontWeight: Typography.fontWeight.regular,
  },
});

export default EmotionBadge;
