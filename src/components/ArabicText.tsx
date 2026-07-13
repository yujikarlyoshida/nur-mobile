import React from 'react';
import { Text, TextStyle, StyleSheet, I18nManager } from 'react-native';
import { Typography, Colors } from '../constants/theme';

interface ArabicTextProps {
  text: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  style?: TextStyle;
  numberOfLines?: number;
  color?: string;
}

export const ArabicText: React.FC<ArabicTextProps> = ({
  text,
  size = 'lg',
  style,
  numberOfLines,
  color,
}) => {
  const fontSizeMap: Record<string, number> = {
    sm: Typography.fontSize.arabicSm,
    md: Typography.fontSize.arabicMd,
    lg: Typography.fontSize.arabicLg,
    xl: Typography.fontSize.arabicXl,
  };

  const computedStyle: TextStyle = {
    fontSize: fontSizeMap[size],
    color: color ?? Colors.text,
    textAlign: 'right',
    writingDirection: 'rtl',
    lineHeight: fontSizeMap[size] * Typography.lineHeight.arabicRelaxed,
    fontFamily: Typography.fontFamily.arabic,
    letterSpacing: 0.5,
  };

  return (
    <Text
      style={[styles.base, computedStyle, style]}
      numberOfLines={numberOfLines}
      allowFontScaling={true}
    >
      {text}
    </Text>
  );
};

const styles = StyleSheet.create({
  base: {
    writingDirection: 'rtl',
    textAlign: 'right',
  },
});

export default ArabicText;
