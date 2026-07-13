import { useState, useEffect, useRef, useCallback } from 'react';
import { Audio, AVPlaybackStatus } from 'expo-av';

interface UseAudioReturn {
  isLoading: boolean;
  isPlaying: boolean;
  isLoaded: boolean;
  position: number;   // milliseconds
  duration: number;   // milliseconds
  error: string | null;
  loadAudio: (url: string) => Promise<void>;
  play: () => Promise<void>;
  pause: () => Promise<void>;
  stop: () => Promise<void>;
  seek: (positionMs: number) => Promise<void>;
}

export function useAudio(): UseAudioReturn {
  const soundRef = useRef<Audio.Sound | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const onPlaybackStatusUpdate = useCallback((status: AVPlaybackStatus) => {
    if (!status.isLoaded) {
      if (status.error) {
        setError(`Playback error: ${status.error}`);
      }
      setIsPlaying(false);
      return;
    }

    setIsPlaying(status.isPlaying);
    setPosition(status.positionMillis);
    if (status.durationMillis) {
      setDuration(status.durationMillis);
    }

    if (status.didJustFinish) {
      setIsPlaying(false);
      setPosition(0);
    }
  }, []);

  useEffect(() => {
    // Configure audio session
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
    }).catch(() => {
      // Non-critical if audio mode setup fails
    });

    return () => {
      // Cleanup on unmount
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(() => {});
        soundRef.current = null;
      }
    };
  }, []);

  const loadAudio = useCallback(
    async (url: string) => {
      setIsLoading(true);
      setError(null);
      setIsLoaded(false);
      setIsPlaying(false);
      setPosition(0);
      setDuration(0);

      try {
        // Unload any existing sound
        if (soundRef.current) {
          await soundRef.current.unloadAsync();
          soundRef.current = null;
        }

        const { sound } = await Audio.Sound.createAsync(
          { uri: url },
          { shouldPlay: false },
          onPlaybackStatusUpdate
        );

        soundRef.current = sound;
        setIsLoaded(true);
      } catch (err) {
        setError('Unable to load audio. Please try again.');
      } finally {
        setIsLoading(false);
      }
    },
    [onPlaybackStatusUpdate]
  );

  const play = useCallback(async () => {
    if (!soundRef.current || !isLoaded) return;
    try {
      await soundRef.current.playAsync();
    } catch {
      setError('Unable to play audio.');
    }
  }, [isLoaded]);

  const pause = useCallback(async () => {
    if (!soundRef.current) return;
    try {
      await soundRef.current.pauseAsync();
    } catch {
      setError('Unable to pause audio.');
    }
  }, []);

  const stop = useCallback(async () => {
    if (!soundRef.current) return;
    try {
      await soundRef.current.stopAsync();
      await soundRef.current.setPositionAsync(0);
      setPosition(0);
    } catch {
      setError('Unable to stop audio.');
    }
  }, []);

  const seek = useCallback(async (positionMs: number) => {
    if (!soundRef.current || !isLoaded) return;
    try {
      await soundRef.current.setPositionAsync(positionMs);
    } catch {
      // Ignore seek errors
    }
  }, [isLoaded]);

  return {
    isLoading,
    isPlaying,
    isLoaded,
    position,
    duration,
    error,
    loadAudio,
    play,
    pause,
    stop,
    seek,
  };
}
