import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useAudio } from '../hooks/useAudio';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../constants/theme';

interface AudioPlayerProps {
  audioUrl: string;
  reciterName?: string;
  autoLoad?: boolean;
}

function formatTime(ms: number): string {
  if (!ms || isNaN(ms)) return '0:00';
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioUrl,
  reciterName = 'Mishary Alafasy',
  autoLoad = true,
}) => {
  const { isLoading, isPlaying, isLoaded, position, duration, error, loadAudio, play, pause, stop } =
    useAudio();

  const progressWidth = useSharedValue(0);

  useEffect(() => {
    if (autoLoad && audioUrl) {
      loadAudio(audioUrl);
    }
  }, [audioUrl, autoLoad]);

  useEffect(() => {
    if (duration > 0) {
      progressWidth.value = withTiming((position / duration) * 100, { duration: 250 });
    }
  }, [position, duration]);

  const animatedProgress = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  const handlePlayPause = useCallback(async () => {
    if (!isLoaded) {
      await loadAudio(audioUrl);
    } else if (isPlaying) {
      await pause();
    } else {
      await play();
    }
  }, [isLoaded, isPlaying, audioUrl, loadAudio, pause, play]);

  return (
    <View style={styles.container}>
      <View style={styles.reciterRow}>
        <Ionicons name="musical-notes-outline" size={14} color={Colors.textSecondary} />
        <Text style={styles.reciterName} numberOfLines={1}>
          {reciterName}
        </Text>
      </View>

      <View style={styles.controls}>
        {/* Stop Button */}
        <TouchableOpacity
          style={styles.stopButton}
          onPress={stop}
          disabled={!isLoaded}
          activeOpacity={0.7}
        >
          <Ionicons
            name="stop"
            size={16}
            color={isLoaded ? Colors.textSecondary : Colors.textTertiary}
          />
        </TouchableOpacity>

        {/* Play/Pause Button */}
        <TouchableOpacity
          style={[styles.playButton, isLoading && styles.playButtonDisabled]}
          onPress={handlePlayPause}
          disabled={isLoading}
          activeOpacity={0.85}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={Colors.surface} />
          ) : (
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={22}
              color={Colors.surface}
            />
          )}
        </TouchableOpacity>

        {/* Progress + Time */}
        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <Animated.View style={[styles.progressFill, animatedProgress]} />
          </View>
          <View style={styles.timeRow}>
            <Text style={styles.timeText}>{formatTime(position)}</Text>
            <Text style={styles.timeText}>{formatTime(duration)}</Text>
          </View>
        </View>
      </View>

      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  reciterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  reciterName: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    flex: 1,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  stopButton: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.divider,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  playButtonDisabled: {
    backgroundColor: Colors.secondary,
    opacity: 0.7,
  },
  progressSection: {
    flex: 1,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },
  timeText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
  },
  errorText: {
    marginTop: Spacing.sm,
    fontSize: Typography.fontSize.xs,
    color: Colors.error,
    textAlign: 'center',
  },
});

export default AudioPlayer;
