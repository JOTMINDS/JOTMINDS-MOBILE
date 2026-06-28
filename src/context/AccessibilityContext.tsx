import React, { createContext, useContext, useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AccessibilityState {
  highContrast: boolean;
  reduceMotion: boolean;
  largeText: boolean;
  ready: boolean;
  setHighContrast: (v: boolean) => void;
  setReduceMotion: (v: boolean) => void;
  setLargeText: (v: boolean) => void;
}

const STORAGE_KEY = 'jotminds.accessibility';

const AccessibilityContext = createContext<AccessibilityState | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [highContrast, setHC] = useState(false);
  const [reduceMotion, setRM] = useState(false);
  const [largeText, setLT] = useState(false);
  const [ready, setReady] = useState(false);

  // Load saved prefs; seed reduce-motion from the OS setting on first run.
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const p = JSON.parse(raw);
          setHC(!!p.highContrast);
          setRM(!!p.reduceMotion);
          setLT(!!p.largeText);
        } else {
          const osReduceMotion = await AccessibilityInfo.isReduceMotionEnabled().catch(() => false);
          setRM(!!osReduceMotion);
        }
      } catch {
        // ignore — fall back to defaults
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const persist = (next: Partial<{ highContrast: boolean; reduceMotion: boolean; largeText: boolean }>) => {
    const merged = { highContrast, reduceMotion, largeText, ...next };
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(merged)).catch(() => {});
  };

  const setHighContrast = (v: boolean) => { setHC(v); persist({ highContrast: v }); };
  const setReduceMotion = (v: boolean) => { setRM(v); persist({ reduceMotion: v }); };
  const setLargeText = (v: boolean) => { setLT(v); persist({ largeText: v }); };

  return (
    <AccessibilityContext.Provider
      value={{ highContrast, reduceMotion, largeText, ready, setHighContrast, setReduceMotion, setLargeText }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = (): AccessibilityState => {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) {
    // Safe fallback so components never crash if used outside the provider.
    return {
      highContrast: false, reduceMotion: false, largeText: false, ready: true,
      setHighContrast: () => {}, setReduceMotion: () => {}, setLargeText: () => {},
    };
  }
  return ctx;
};
