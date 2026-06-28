import React, { useEffect } from 'react';
import { Text, TextInput } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { AccessibilityProvider } from './src/context/AccessibilityContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { ToastProvider } from './src/context/ToastContext';
import { initOutboxSync } from './src/utils/outbox';
import AppNavigator from './src/navigation/AppNavigator';

// ── Global text accessibility ────────────────────────────────────────────────
// Honour the OS "Larger Text" / Dynamic Type setting everywhere, but cap the
// multiplier so very large settings enlarge text without shattering layouts.
const TextAny = Text as any;
const TextInputAny = TextInput as any;
TextAny.defaultProps = { ...(TextAny.defaultProps || {}), allowFontScaling: true, maxFontSizeMultiplier: 1.8 };
TextInputAny.defaultProps = { ...(TextInputAny.defaultProps || {}), allowFontScaling: true, maxFontSizeMultiplier: 1.8 };

// Keep the native splash up until we explicitly hide it (see the timer below).
SplashScreen.preventAutoHideAsync().catch(() => {});
const EXTRA_SPLASH_MS = 8000; // hold the splash ~8s longer on every launch

// Status bar adapts to the active theme (dark text on light bg, light on dark).
function ThemedStatusBar() {
  const colors = useTheme();
  const isLight = colors.bgPrimary === '#F4F6FB';
  return <StatusBar style={isLight ? 'dark' : 'light'} />;
}

export default function App() {
  // Preload the vector-icon fonts so every <AppIcon> renders (avoids blank/▢ icons).
  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
    ...MaterialCommunityIcons.font,
  });

  // Replay any queued offline writes on launch + whenever connectivity returns.
  useEffect(() => initOutboxSync(), []);

  // Once everything's ready, keep the splash on for an extra few seconds, then hide it.
  useEffect(() => {
    if (!fontsLoaded) return;
    const t = setTimeout(() => { SplashScreen.hideAsync().catch(() => {}); }, EXTRA_SPLASH_MS);
    return () => clearTimeout(t);
  }, [fontsLoaded]);

  if (!fontsLoaded) return null; // native splash stays up until fonts are ready

  return (
    <SafeAreaProvider>
      <AccessibilityProvider>
        <ThemeProvider>
          <ToastProvider>
            <AuthProvider>
              <ThemedStatusBar />
              <AppNavigator />
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </AccessibilityProvider>
    </SafeAreaProvider>
  );
}
