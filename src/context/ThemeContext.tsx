import React, { createContext, useContext, useMemo } from 'react';
import { getPalette, Palette, colors as defaultColors } from '../theme';
import { useAccessibility } from './AccessibilityContext';

/**
 * Theme system. The active palette switches with the High Contrast setting.
 *
 * Two ways to consume:
 *   const t = useTheme();                       // palette for inline styles
 *   const styles = useThemedStyles(makeStyles); // makeStyles(palette) => StyleSheet
 *
 * Screens still using the static `colors` import keep working (default/dark).
 * Migrate to useThemedStyles when you want a screen to react to High Contrast.
 */
const ThemeContext = createContext<Palette>(defaultColors);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { highContrast } = useAccessibility();
  const palette = useMemo(() => getPalette(highContrast), [highContrast]);
  return <ThemeContext.Provider value={palette}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): Palette => useContext(ThemeContext);

/** Build StyleSheet styles from the active palette; recomputed on theme change. */
export function useThemedStyles<T>(factory: (palette: Palette) => T): T {
  const palette = useTheme();
  return useMemo(() => factory(palette), [palette]);
}
