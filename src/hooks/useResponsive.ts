import { useWindowDimensions } from 'react-native';

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg';

const BREAKPOINTS = {
  xs: 0,    // < 480  — small phone
  sm: 480,  // 480-768 — large phone / small tablet
  md: 768,  // 768-1024 — tablet
  lg: 1024, // 1024+ — desktop
};

export function useResponsive() {
  const { width, height } = useWindowDimensions();

  const breakpoint: Breakpoint =
    width >= BREAKPOINTS.lg ? 'lg' :
    width >= BREAKPOINTS.md ? 'md' :
    width >= BREAKPOINTS.sm ? 'sm' : 'xs';

  const isMobile = width < BREAKPOINTS.sm;
  const isTablet = width >= BREAKPOINTS.sm && width < BREAKPOINTS.lg;
  const isDesktop = width >= BREAKPOINTS.lg;

  // Max content width — phone column on wider screens
  const contentMaxWidth = Math.min(width, 480);

  // Responsive horizontal padding
  const screenPadding = width < 360 ? 12 : width < 480 ? 16 : 20;

  return {
    width,
    height,
    breakpoint,
    isMobile,
    isTablet,
    isDesktop,
    contentMaxWidth,
    screenPadding,
  };
}
