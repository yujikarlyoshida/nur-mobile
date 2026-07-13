import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Colors, Typography, Spacing } from '../constants/theme';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message,
  size = 'md',
  color = Colors.primary,
  fullScreen = false,
}) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const spin = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    spin.start();
    pulse.start();

    return () => {
      spin.stop();
      pulse.stop();
    };
  }, [rotateAnim, pulseAnim]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const sizePx = { sm: 24, md: 40, lg: 56 }[size];
  const borderWidth = { sm: 2, md: 3, lg: 4 }[size];

  const spinner = (
    <View style={[styles.wrapper, fullScreen && styles.fullScreen]}>
      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        <View style={styles.crescent}>
          <Text style={[styles.crescentIcon, { fontSize: sizePx * 0.6, color }]}>☪</Text>
        </View>
        <Animated.View
          style={[
            styles.ring,
            {
              width: sizePx,
              height: sizePx,
              borderRadius: sizePx / 2,
              borderWidth,
              borderTopColor: color,
              borderRightColor: `${color}40`,
              borderBottomColor: `${color}20`,
              borderLeftColor: `${color}70`,
              transform: [{ rotate }],
            },
          ]}
        />
      </Animated.View>
      {message && (
        <Text style={[styles.message, { color }]}>{message}</Text>
      )}
    </View>
  );

  return spinner;
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  fullScreen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  crescent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  crescentIcon: {
    textAlign: 'center',
  },
  ring: {
    borderStyle: 'solid',
  },
  message: {
    marginTop: Spacing.lg,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    textAlign: 'center',
    maxWidth: 220,
    lineHeight: Typography.fontSize.sm * 1.5,
  },
});

export default LoadingSpinner;
