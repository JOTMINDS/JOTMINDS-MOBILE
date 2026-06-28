import React, { createContext, useContext, useCallback, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View, AccessibilityInfo } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppIcon from '../components/AppIcon';
import { useAccessibility } from './AccessibilityContext';
import { colors, radii, shadow } from '../theme';

type ToastType = 'success' | 'error' | 'info';
interface ToastConfig { message: string; type: ToastType }

interface ToastContextType {
  show: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const META: Record<ToastType, { icon: string; color: string }> = {
  success: { icon: '✅', color: colors.success },
  error: { icon: '⚠️', color: colors.error },
  info: { icon: '💡', color: colors.cyan },
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const insets = useSafeAreaInsets();
  const { reduceMotion } = useAccessibility();
  const [toast, setToast] = useState<ToastConfig | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hide = useCallback(() => {
    Animated.timing(opacity, {
      toValue: 0,
      duration: reduceMotion ? 0 : 200,
      useNativeDriver: true,
    }).start(() => setToast(null));
  }, [opacity, reduceMotion]);

  const show = useCallback((message: string, type: ToastType = 'info') => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setToast({ message, type });
    AccessibilityInfo.announceForAccessibility?.(message);
    opacity.setValue(reduceMotion ? 1 : 0);
    translateY.setValue(reduceMotion ? 0 : -20);
    if (!reduceMotion) {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.spring(translateY, { toValue: 0, friction: 8, useNativeDriver: true }),
      ]).start();
    }
    hideTimer.current = setTimeout(hide, 3200);
  }, [opacity, translateY, reduceMotion, hide]);

  const api: ToastContextType = {
    show,
    success: (m) => show(m, 'success'),
    error: (m) => show(m, 'error'),
    info: (m) => show(m, 'info'),
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      {toast && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.wrap,
            { top: insets.top + 8, opacity, transform: [{ translateY }] },
          ]}
          accessibilityLiveRegion="polite"
        >
          <View style={[styles.toast, { borderLeftColor: META[toast.type].color }]}>
            <AppIcon name={META[toast.type].icon} size={18} color={META[toast.type].color} />
            <Text style={styles.text} numberOfLines={3}>{toast.message}</Text>
          </View>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // no-op fallback so calls never crash outside the provider
    const noop = () => {};
    return { show: noop, success: noop, error: noop, info: noop };
  }
  return ctx;
};

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9999,
    alignItems: 'center',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    maxWidth: 520,
    width: '100%',
    backgroundColor: colors.bgSecondary,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderLeftWidth: 4,
    borderRadius: radii.md,
    paddingVertical: 14,
    paddingHorizontal: 16,
    ...shadow.card,
  },
  text: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
    lineHeight: 19,
  },
});
