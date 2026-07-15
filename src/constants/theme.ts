import { Platform } from 'react-native';

// "Slate Mint" — minimalist grey/white with deep-emerald green accents.
// Every screen reads colors from this one file, so this single palette
// swap re-skins the whole app; see /docs/design-system.md (mobile README)
// for the rationale and the two variants this was chosen over.
export const Colors = {
  primary: '#14532D',       // deep emerald — primary buttons, active states
  primaryLight: '#1F7A4D',  // lighter emerald — secondary emphasis
  secondary: '#1F7A4D',     // medium emerald
  secondaryLight: '#3B9169', // light emerald
  accent: '#2FAE6B',        // bright mint — sparing highlight (bookmarks, badges)
  accentLight: '#DCEFE0',   // pale mint tint for chips/backgrounds
  background: '#F4F5F5',    // cool light grey (page background)
  surface: '#FFFFFF',       // white surface
  surfaceAlt: '#EDEFEE',    // cool light-grey surface
  text: '#202324',          // near-black, cool undertone
  textSecondary: '#6B7170', // grey
  textTertiary: '#9AA0A0',  // light grey
  textOnPrimary: '#FFFFFF', // white on emerald
  error: '#E5484D',         // red
  warning: '#F5A524',       // amber
  success: '#2FAE6B',       // mint (matches accent — one semantic green)
  border: '#E2E4E4',        // cool grey border
  divider: '#E2E4E4',       // divider
  overlay: 'rgba(0,0,0,0.5)',
  shimmer: '#E6E8E8',

  // Emotion-specific colors used in MoodSelector
  emotionAnxiety: '#E8A838',
  emotionSadness: '#5B8DD9',
  emotionAnger: '#E84040',
  emotionLoneliness: '#9B72CF',
  emotionGratitude: '#40916C',
  emotionHope: '#F4A261',
  emotionGuilt: '#7F7F7F',
  emotionConfusion: '#A8C0D6',
  emotionPeace: '#52B788',
  emotionOverwhelmed: '#E76F51',
  emotionGrief: '#6D6875',
  emotionDisconnection: '#B0B7C3',
  emotionJoy: '#FFB703',
};

export const Typography = {
  fontFamily: {
    arabic: Platform.select({
      ios: 'System',
      android: 'serif',
      default: 'serif',
    }),
    regular: Platform.select({
      ios: 'System',
      android: 'Roboto',
      default: 'System',
    }),
  },

  fontSize: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    xxxl: 28,
    display: 34,
    arabicSm: 20,
    arabicMd: 24,
    arabicLg: 28,
    arabicXl: 34,
  },

  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },

  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.8,
    arabicRelaxed: 2.0,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  section: 40,
  screen: 16,
};

export const BorderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 8,
  },
};
