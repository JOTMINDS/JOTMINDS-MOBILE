import React, { useEffect } from 'react';
import { Text, TextInput } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { AccessibilityProvider } from './src/context/AccessibilityContext';
import { ThemeProvider } from './src/context/ThemeContext';
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

export default function App() {
  // Replay any queued offline writes on launch + whenever connectivity returns.
  useEffect(() => initOutboxSync(), []);

  return (
    <SafeAreaProvider>
      <AccessibilityProvider>
        <ThemeProvider>
          <ToastProvider>
            <AuthProvider>
              {/* App is dark-themed → status bar content must be light */}
              <StatusBar style="light" />
              <AppNavigator />
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </AccessibilityProvider>
    </SafeAreaProvider>
  );
}
