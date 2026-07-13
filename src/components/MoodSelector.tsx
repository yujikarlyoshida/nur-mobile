import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { EmotionState } from '../types';
import { EMOTIONS, EMOTION_ORDER } from '../constants/emotions';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/theme';

interface MoodSelectorProps {
  selected?: EmotionState;
  onSelect: (emotion: EmotionState) => void;
}

interface EmotionItemProps {
  emotion: EmotionState;
  isSelected: boolean;
  onPress: () => void;
}

const EmotionItem: React.FC<EmotionItemProps> = ({ emotion, isSelected, onPress }) => {
  const config = EMOTIONS[emotion];
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSpring(0.92, { damping: 15, stiffness: 400 }, () => {
      scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    });
    onPress();
  };

  return (
    <Animated.View style={[styles.itemWrapper, animatedStyle]}>
      <TouchableOpacity
        style={[
          styles.item,
          isSelected && {
            borderColor: config.color,
            borderWidth: 2,
            backgroundColor: `${config.color}18`,
          },
        ]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <View
          style={[
            styles.iconCircle,
            {
              backgroundColor: isSelected ? config.color : `${config.color}30`,
            },
          ]}
        >
          <Text style={styles.icon}>{config.icon}</Text>
        </View>
        <Text
          style={[
            styles.label,
            { color: isSelected ? config.color : Colors.text },
          ]}
          numberOfLines={1}
        >
          {config.label}
        </Text>
        <Text style={styles.labelAr} numberOfLines={1}>
          {config.labelAr}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export const MoodSelector: React.FC<MoodSelectorProps> = ({ selected, onSelect }) => {
  const handleSelect = useCallback(
    (emotion: EmotionState) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      onSelect(emotion);
    },
    [onSelect]
  );

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {EMOTION_ORDER.map((emotion) => (
          <EmotionItem
            key={emotion}
            emotion={emotion}
            isSelected={selected === emotion}
            onPress={() => handleSelect(emotion)}
          />
        ))}
      </View>
    </View>
  );
};

const ITEM_MARGIN = Spacing.sm;

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xs,
  },
  itemWrapper: {
    width: '30%',
    marginBottom: Spacing.md,
  },
  item: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    minHeight: 90,
    justifyContent: 'center',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  icon: {
    fontSize: 20,
  },
  label: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    textAlign: 'center',
    marginBottom: 2,
  },
  labelAr: {
    fontSize: 10,
    color: Colors.textSecondary,
    textAlign: 'center',
    writingDirection: 'rtl',
    fontFamily: Typography.fontFamily.arabic,
  },
});

export default MoodSelector;
