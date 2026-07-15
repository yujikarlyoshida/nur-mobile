// ─── BannerAdSlot — native (iOS/Android) ───────────────────────────────────
//
// Renders one AdMob banner. Only used on JournalScreen and ProfileScreen —
// see ads.ts's header note for the full placement policy and why Home,
// Verse Discovery, and Verse Detail never get one.
//
// Fails soft: if there's no ad unit ID configured, or a fill fails (no ad
// available, network error), this renders nothing rather than a broken box
// or an error. See ads.web.ts / BannerAdSlot.web.tsx for the web build,
// where this component doesn't exist at all — Metro picks that file
// instead of this one when bundling for web.
//
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { getBannerAdUnitId } from '../services/ads';
import { Spacing } from '../constants/theme';

export const BannerAdSlot: React.FC = () => {
  const [failed, setFailed] = useState(false);
  const unitId = getBannerAdUnitId();

  if (!unitId || failed) return null;

  return (
    <View style={styles.container}>
      <BannerAd
        unitId={unitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        onAdFailedToLoad={() => setFailed(true)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
});

export default BannerAdSlot;
