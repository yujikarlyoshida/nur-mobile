import { Platform } from 'react-native';

export const Colors = {
  primary: '#1B4332',       // deep forest green
  primaryLight: '#2D6A4F',  // lighter green
  secondary: '#40916C',     // medium green
  secondaryLight: '#52B788', // light green
  accent: '#D4AF37',        // gold
  accentLight: '#F0D060',   // light gold
  background: '#F8F4EF',    // warm cream
  surface: '#FFFFFF',       // white surface
  surfaceAlt: '#F0EBE3',    // slightly warm surface
  text: '#1C1C1E',          // near-black
  textSecondary: '#6C6C70', // gray
  textTertiary: '#AEAEB2',  // light gray
  textOnPrimary: '#FFFFFF', // white on dark green
  error: '#FF3B30',         // red
  warning: '#FF9500',       // orange
  success: '#34C759',       // green
  border: '#E5DDD5',        // warm border
  divider: '#EEE9E3',       // divider
  overlay: 'rgba(0,0,0,0.5)',
  shimmer: '#E8E1D9',

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
