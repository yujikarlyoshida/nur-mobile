import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, Text, useWindowDimensions, Platform } from 'react-native';

import { RootNavigator } from './src/navigation/RootNavigator';
import { isOnboardingComplete } from './src/services/storage';
import { Colors } from './src/constants/theme';

export default function App() {
  const [appReady, setAppReady] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const { width } = useWindowDimensions();
  const isWide = Platform.OS === 'web' && width >= 480;

  useEffect(() => {
    async function prepare() {
      try {
        // Check if user has completed onboarding
        const onboardingDone = await isOnboardingComplete();
        setShowOnboarding(!onboardingDone);
      } catch {
        // Default to showing onboarding
        setShowOnboarding(true);
      } finally {
        setAppReady(true);
      }
    }

    prepare();
  }, []);

  if (!appReady) {
    return (
      <View style={styles.splash}>
        <Text style={styles.splashAr}>نور</Text>
        <Text style={styles.splashEn}>NUR</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" backgroundColor={isWide ? '#e8e2d9' : Colors.background} />
      {isWide ? (
        <View style={styles.desktopShell}>
          <View style={styles.phoneFrame}>
            <RootNavigator showOnboarding={showOnboarding} />
          </View>
        </View>
      ) : (
        <RootNavigator showOnboarding={showOnboarding} />
      )}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  desktopShell: {
    flex: 1,
    backgroundColor: '#e8e2d9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneFrame: {
    width: 480,
    height: '100%',
    maxHeight: 900,
    overflow: 'hidden',
    borderRadius: Platform.OS === 'web' ? 24 : 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
  },
  splash: {
    flex: 1,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  splashAr: {
    fontSize: 80,
    color: Colors.accent,
    fontWeight: 'bold',
    lineHeight: 96,
  },
  splashEn: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 10,
    fontWeight: '500',
  },
});
