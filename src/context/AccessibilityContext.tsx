import React, { createContext, useContext, useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Appearance = 'system' | 'light' | 'dark';

interface AccessibilityState {
  highContrast: boolean;
  reduceMotion: boolean;
  largeText: boolean;
  appearance: Appearance;
  ready: boolean;
  setHighContrast: (v: boolean) => void;
  setReduceMotion: (v: boolean) => void;
  setLargeText: (v: boolean) => void;
  setAppearance: (v: Appearance) => void;
}

const STORAGE_KEY = 'jotminds.accessibility';

const AccessibilityContext = createContext<AccessibilityState | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [highContrast, setHC] = useState(false);
  const [reduceMotion, setRM] = useState(false);
  const [largeText, setLT] = useState(false);
  const [appearance, setAppr] = useState<Appearance>('dark');
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
          if (p.appearance) setAppr(p.appearance);
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

  const persist = (next: Partial<{ highContrast: boolean; reduceMotion: boolean; largeText: boolean; appearance: Appearance }>) => {
    const merged = { highContrast, reduceMotion, largeText, appearance, ...next };
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(merged)).catch(() => {});
  };

  const setHighContrast = (v: boolean) => { setHC(v); persist({ highContrast: v }); };
  const setReduceMotion = (v: boolean) => { setRM(v); persist({ reduceMotion: v }); };
  const setLargeText = (v: boolean) => { setLT(v); persist({ largeText: v }); };
  const setAppearance = (v: Appearance) => { setAppr(v); persist({ appearance: v }); };

  return (
    <AccessibilityContext.Provider
      value={{ highContrast, reduceMotion, largeText, appearance, ready, setHighContrast, setReduceMotion, setLargeText, setAppearance }}
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
      highContrast: false, reduceMotion: false, largeText: false, appearance: 'dark', ready: true,
      setHighContrast: () => {}, setReduceMotion: () => {}, setLargeText: () => {}, setAppearance: () => {},
    };
  }
  return ctx;
};
