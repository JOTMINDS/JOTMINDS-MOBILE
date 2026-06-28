// Dark Premium Theme for JotMinds
// Inspired by modern dark UI with JotMinds brand colors

export const darkColors = {
  // Base backgrounds
  bgPrimary: '#020618',
  bgSecondary: '#0F172B',
  bgTertiary: '#1E293B',

  // Glassmorphic surfaces
  glassDark: 'rgba(15, 23, 43, 0.8)',
  glassMedium: 'rgba(2, 6, 24, 0.5)',
  glassLight: 'rgba(30, 41, 59, 0.6)',

  // JotMinds brand colors as accents
  primary: '#6E4D9C', // Purple
  primaryDark: '#5A3E82',
  secondary: '#3D52C9', // Cyan
  secondaryDark: '#2E3FA8',
  accent: '#EC4899', // Coral
  accentDark: '#DB2777',
  success: '#10B981',
  successDark: '#059669',

  // Text colors
  textPrimary: '#FFFFFF',
  textSecondary: '#CAD5E2',
  textMuted: '#90A1B9',
  textSubtle: '#62748E',
  textDisabled: '#475569',

  // Borders
  border: '#1D293D',
  borderLight: '#314158',
  borderGlow: 'rgba(124, 58, 237, 0.2)',

  // Special
  error: '#EF4444',
  warning: '#F59E0B',
  overlay: 'rgba(2, 6, 24, 0.8)',

  // Gradients
  gradientPurple: ['#6E4D9C', '#5A3E82'] as [string, string],
  gradientCyan: ['#3D52C9', '#2E3FA8'] as [string, string],
  gradientCoral: ['#EC4899', '#DB2777'] as [string, string],
  gradientSuccess: ['#10B981', '#059669'] as [string, string],
  gradientIndigo: ['#4F46E5', '#3730A3'] as [string, string],
  gradientOverlay: ['rgba(2, 6, 24, 0)', 'rgba(2, 6, 24, 0.8)', '#020618'] as [string, string, string],
};

export const darkRadii = {
  xs: 8,
  sm: 10,
  md: 14,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};

export const darkSpacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const darkShadow = {
  glow: {
    shadowColor: '#6E4D9C',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  glowCyan: {
    shadowColor: '#3D52C9',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.25,
    shadowRadius: 50,
    elevation: 12,
  },
  subtle: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
};

export const darkTypography = {
  fontFamily: {
    regular: 'Inter',
    medium: 'Inter-Medium',
    semiBold: 'Inter-SemiBold',
    bold: 'Inter-Bold',
    extraBold: 'Inter-ExtraBold',
    black: 'Inter-Black',
  },
  fontSize: {
    xs: 11,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    huge: 36,
  },
};
