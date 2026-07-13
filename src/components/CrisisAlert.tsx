import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Animated,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../constants/theme';

interface Hotline {
  name: string;
  number: string;
  url?: string;
}

interface CrisisAlertProps {
  message?: string;
  hotlines?: Hotline[];
  onDismiss?: () => void;
}

const DEFAULT_HOTLINES: Hotline[] = [
  { name: 'Crisis Text Line', number: 'Text HOME to 741741', url: 'https://www.crisistextline.org' },
  { name: 'National Suicide Prevention Lifeline', number: '988', url: 'tel:988' },
  { name: 'SAMHSA National Helpline', number: '1-800-662-4357', url: 'tel:18006624357' },
  { name: 'Islamic Help Line (UK)', number: '0800 999 2220', url: 'tel:08009992220' },
];

const DEFAULT_MESSAGE =
  "We noticed you may be going through something very difficult right now. You are not alone — Allah is always near. Please consider reaching out to a professional for support.";

export const CrisisAlert: React.FC<CrisisAlertProps> = ({
  message = DEFAULT_MESSAGE,
  hotlines = DEFAULT_HOTLINES,
  onDismiss,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const slideAnim = useRef(new Animated.Value(-120)).current;
  const expandAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 80,
      friction: 10,
    }).start();
  }, [slideAnim]);

  useEffect(() => {
    Animated.timing(expandAnim, {
      toValue: expanded ? 1 : 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [expanded, expandAnim]);

  const handleDismiss = () => {
    Animated.timing(slideAnim, {
      toValue: -200,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setDismissed(true);
      onDismiss?.();
    });
  };

  const handleCall = (hotline: Hotline) => {
    if (hotline.url) {
      Linking.openURL(hotline.url).catch(() => {});
    }
  };

  if (dismissed) return null;

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY: slideAnim }] }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="heart" size={18} color={Colors.surface} />
          <Text style={styles.headerTitle}>You Matter</Text>
        </View>
        <TouchableOpacity onPress={handleDismiss} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="close" size={20} color={Colors.surface} />
        </TouchableOpacity>
      </View>

      <Text style={styles.message}>{message}</Text>

      <Text style={styles.ayah}>
        "Verily, with hardship comes ease." — Quran 94:6
      </Text>

      <TouchableOpacity
        style={styles.expandButton}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.8}
      >
        <Text style={styles.expandButtonText}>
          {expanded ? 'Hide resources' : 'View support resources'}
        </Text>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={14}
          color={Colors.accentLight}
        />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.hotlines}>
          {hotlines.map((hotline, index) => (
            <TouchableOpacity
              key={index}
              style={styles.hotlineRow}
              onPress={() => handleCall(hotline)}
              activeOpacity={0.7}
            >
              <View style={styles.hotlineInfo}>
                <Text style={styles.hotlineName}>{hotline.name}</Text>
                <Text style={styles.hotlineNumber}>{hotline.number}</Text>
              </View>
              <Ionicons name="call-outline" size={16} color={Colors.accentLight} />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#8B1A1A',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginHorizontal: Spacing.screen,
    marginVertical: Spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: Colors.accent,
    ...Shadows.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  headerTitle: {
    color: Colors.surface,
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
  },
  message: {
    color: '#FFD6D6',
    fontSize: Typography.fontSize.sm,
    lineHeight: Typography.fontSize.sm * 1.6,
    marginBottom: Spacing.md,
  },
  ayah: {
    color: Colors.accentLight,
    fontSize: Typography.fontSize.sm,
    fontStyle: 'italic',
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    alignSelf: 'center',
  },
  expandButtonText: {
    color: Colors.accentLight,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    textDecorationLine: 'underline',
  },
  hotlines: {
    marginTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    paddingTop: Spacing.md,
    gap: Spacing.sm,
  },
  hotlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  hotlineInfo: {
    flex: 1,
  },
  hotlineName: {
    color: Colors.surface,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  hotlineNumber: {
    color: '#FFB3B3',
    fontSize: Typography.fontSize.xs,
    marginTop: 2,
  },
});

export default CrisisAlert;
