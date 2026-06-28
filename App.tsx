import React, { useEffect, useState } from 'react';
import { Text, TextInput, View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { AccessibilityProvider } from './src/context/AccessibilityContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { ToastProvider } from './src/context/ToastContext';
import { initOutboxSync } from './src/utils/outbox';
import ErrorBoundary from './src/components/ErrorBoundary';
import AppNavigator from './src/navigation/AppNavigator';

// ── Global text accessibility ────────────────────────────────────────────────
// Honour the OS "Larger Text" / Dynamic Type setting everywhere, but cap the
// multiplier so very large settings enlarge text without shattering layouts.
const TextAny = Text as any;
const TextInputAny = TextInput as any;
TextAny.defaultProps = { ...(TextAny.defaultProps || {}), allowFontScaling: true, maxFontSizeMultiplier: 1.8 };
TextInputAny.defaultProps = { ...(TextInputAny.defaultProps || {}), allowFontScaling: true, maxFontSizeMultiplier: 1.8 };

// Status bar adapts to the active theme (dark text on light bg, light on dark).
function ThemedStatusBar() {
  const colors = useTheme();
  const isLight = colors.bgPrimary === '#F4F6FB';
  return <StatusBar style={isLight ? 'dark' : 'light'} />;
}

export default function App() {
  // Preload the vector-icon fonts so every <AppIcon> renders (avoids blank/▢ icons).
  const [fontsLoaded, fontError] = useFonts({
    ...Ionicons.font,
    ...MaterialCommunityIcons.font,
  });
  // Fail-safe: never block the whole app on font loading. In release builds the
  // font load can stall or error — if so we proceed anyway (icons fall back to
  // their raw glyphs) so the app can never get stuck on a blank screen.
  const [fontTimeout, setFontTimeout] = useState(false);

  // Replay any queued offline writes on launch + whenever connectivity returns.
  useEffect(() => initOutboxSync(), []);
  useEffect(() => {
    const t = setTimeout(() => setFontTimeout(true), 2500);
    return () => clearTimeout(t);
  }, []);

  const ready = fontsLoaded || !!fontError || fontTimeout;
  if (!ready) {
    // Brief, visible loading state (not a blank screen) while fonts load.
    return (
      <View style={{ flex: 1, backgroundColor: '#0F172B', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#7C5CFF" />
      </View>
    );
  }

  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
}
