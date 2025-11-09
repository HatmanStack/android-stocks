/**
 * Color Palette
 * Material Design 3 inspired colors with sentiment-specific additions
 */

export const colors = {
  // Primary colors
  primary: '#1976D2',
  primaryLight: '#4FC3F7',
  primaryDark: '#0D47A1',

  // Secondary colors
  secondary: '#424242',
  secondaryLight: '#757575',
  secondaryDark: '#212121',

  // Sentiment colors
  positive: '#4CAF50',
  positiveLight: '#81C784',
  positiveDark: '#388E3C',

  negative: '#F44336',
  negativeLight: '#E57373',
  negativeDark: '#D32F2F',

  neutral: '#9E9E9E',
  neutralLight: '#BDBDBD',
  neutralDark: '#616161',

  // Background colors
  background: '#FFFFFF',
  backgroundSecondary: '#F5F5F5',
  backgroundTertiary: '#EEEEEE',

  // Surface colors
  surface: '#FFFFFF',
  surfaceVariant: '#F5F5F5',

  // Text colors
  text: '#212121',
  textSecondary: '#757575',
  textTertiary: '#9E9E9E',
  textInverse: '#FFFFFF',

  // Border colors
  border: '#E0E0E0',
  borderLight: '#F5F5F5',
  borderDark: '#BDBDBD',

  // Status colors
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',

  // Overlay colors
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  overlayDark: 'rgba(0, 0, 0, 0.7)',

  // Transparent
  transparent: 'transparent',
};

export type ColorName = keyof typeof colors;
