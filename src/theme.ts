// Dark Premium Theme for JotMinds - Applied to ALL users
export const colors = {
  // Base backgrounds
  bgPrimary: '#020618',
  bgSecondary: '#0F172B',
  bgTertiary: '#1E293B',

  // Legacy aliases
  bg: '#020618',
  bgGradient: ['rgba(2, 6, 24, 0)', 'rgba(2, 6, 24, 0.8)', '#020618'] as [string, string, string],

  // Glassmorphic surfaces
  glassDark: 'rgba(15, 23, 43, 0.8)',
  glassMedium: 'rgba(2, 6, 24, 0.5)',
  glassLight: 'rgba(30, 41, 59, 0.6)',
  surface: 'rgba(15, 23, 43, 0.8)',
  surfaceMuted: 'rgba(30, 41, 59, 0.6)',

  // JotMinds brand colors
  primary: '#6E4D9C',
  primaryDark: '#5A3E82',
  secondary: '#3D52C9',
  secondaryDark: '#2E3FA8',
  accent: '#EC4899',
  accentDark: '#DB2777',

  // Color aliases for compatibility
  purple: '#6E4D9C',
  purpleSoft: '#B79BDC',
  cyan: '#3D52C9',
  cyanSoft: 'rgba(61, 82, 201, 0.2)',
  coral: '#EC4899',
  indigo: '#4F46E5',
  indigoSoft: '#6366F1',
  success: '#10B981',
  successSoft: 'rgba(16, 185, 129, 0.2)',
  successDark: '#059669',
  warning: '#F59E0B',
  error: '#EF4444',

  // Text colors
  text: '#FFFFFF',
  textPrimary: '#FFFFFF',
  textSecondary: '#CAD5E2',
  textMuted: '#90A1B9',
  textSubtle: '#8A97B2',
  textDisabled: '#475569',

  // Borders
  border: '#1D293D',
  borderSoft: 'rgba(255, 255, 255, 0.1)',
  borderLight: '#314158',
  borderGlow: 'rgba(110, 77, 156, 0.25)',

  // Special
  overlay: 'rgba(2, 6, 24, 0.8)',

  // Gradients
  gradientPurple: ['#6E4D9C', '#5A3E82'] as [string, string],
  gradientCyan: ['#3D52C9', '#2E3FA8'] as [string, string],
  gradientCoral: ['#EC4899', '#DB2777'] as [string, string],
  gradientSuccess: ['#10B981', '#059669'] as [string, string],
  gradientIndigo: ['#4F46E5', '#3730A3'] as [string, string],
};

export const radii = {
  xs: 8,
  sm: 10,
  md: 14,
  lg: 16,
  xl: 20,
  xxl: 24,
  pill: 9999,
  full: 9999,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const shadow = {
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
  raised: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 25,
    elevation: 10,
  },
  subtle: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
};

export const roleGradient: Record<string, [string, string]> = {
  student: ['#6E4D9C', '#5A3E82'],
  parent: ['#EC4899', '#DB2777'],
  teacher: ['#10B981', '#059669'],
  professional: ['#3D52C9', '#2E3FA8'],
};

// ── Theming ──────────────────────────────────────────────────────────────────
// High-contrast palette: pure-black surfaces + maximally legible text/borders.
// Brand hues are preserved. Returned by getPalette() and consumed via useTheme.
const highContrastOverrides = {
  bgPrimary: '#000000',
  bgSecondary: '#0A0A0A',
  bgTertiary: '#1A1A1A',
  bg: '#000000',
  glassDark: '#0A0A0A',
  glassMedium: '#0A0A0A',
  glassLight: '#141414',
  surface: '#0A0A0A',
  surfaceMuted: '#141414',
  text: '#FFFFFF',
  textPrimary: '#FFFFFF',
  textSecondary: '#FFFFFF',
  textMuted: '#D6DCE6',
  textSubtle: '#B9C2D2',
  border: '#5A6473',
  borderLight: '#6B7480',
  borderSoft: 'rgba(255,255,255,0.5)',
};

// Light palette — brand hues preserved; surfaces/text inverted for daylight use.
const lightOverrides = {
  bgPrimary: '#F4F6FB',
  bgSecondary: '#FFFFFF',
  bgTertiary: '#E7EAF3',
  bg: '#F4F6FB',
  bgGradient: ['rgba(244,246,251,0)', 'rgba(244,246,251,0.8)', '#F4F6FB'] as [string, string, string],
  glassDark: '#FFFFFF',
  glassMedium: '#FFFFFF',
  glassLight: '#F0F2F8',
  surface: '#FFFFFF',
  surfaceMuted: '#EEF1F7',
  text: '#1A2233',
  textPrimary: '#111827',
  textSecondary: '#374151',
  textMuted: '#5B6678',
  textSubtle: '#8A93A6',
  border: '#E2E6EE',
  borderSoft: 'rgba(17,24,39,0.08)',
  borderLight: '#D9DEE9',
  borderGlow: 'rgba(110,77,156,0.18)',
  overlay: 'rgba(17,24,39,0.4)',
  cyanSoft: 'rgba(61,82,201,0.12)',
  successSoft: 'rgba(16,185,129,0.14)',
};

export type Palette = typeof colors;
export type ThemeMode = 'light' | 'dark';

export function getPalette(mode: ThemeMode, highContrast: boolean): Palette {
  if (highContrast) return { ...colors, ...highContrastOverrides };
  return mode === 'light' ? { ...colors, ...lightOverrides } : colors;
}
