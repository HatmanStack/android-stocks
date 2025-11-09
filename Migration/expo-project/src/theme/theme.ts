/**
 * Theme Configuration
 * Complete theme object combining colors, typography, and spacing
 */

import { MD3LightTheme } from 'react-native-paper';
import { colors } from './colors';
import { typography } from './typography';

/**
 * Spacing scale (in pixels)
 * Based on 8px grid system
 */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

/**
 * Border radius scale
 */
export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

/**
 * Shadows
 */
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2.0,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4.0,
    elevation: 5,
  },
};

/**
 * Main theme object
 * Extends React Native Paper's MD3LightTheme
 */
export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    primaryContainer: colors.primaryLight,
    secondary: colors.secondary,
    secondaryContainer: colors.secondaryLight,
    surface: colors.surface,
    surfaceVariant: colors.surfaceVariant,
    background: colors.background,
    error: colors.error,
    onPrimary: colors.textInverse,
    onSecondary: colors.textInverse,
    onSurface: colors.text,
    onBackground: colors.text,
    onError: colors.textInverse,
    // Custom sentiment colors
    positive: colors.positive,
    negative: colors.negative,
    neutral: colors.neutral,
  },
  // Custom theme additions
  custom: {
    colors,
    typography,
    spacing,
    borderRadius,
    shadows,
  },
};

// Type augmentation for TypeScript
declare module 'react-native-paper' {
  interface ThemeColors {
    positive: string;
    negative: string;
    neutral: string;
  }
}

export type AppTheme = typeof theme;
