import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet, ViewStyle } from 'react-native';
import { useAccessibility } from '../context/AccessibilityContext';
import { useTheme } from '../context/ThemeContext';
import { radii } from '../theme';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  radius?: number;
  style?: ViewStyle;
}

/** A single shimmering placeholder block (respects Reduce Motion). */
export function Skeleton({ width = '100%', height = 16, radius = 8, style }: SkeletonProps) {
  const { reduceMotion } = useAccessibility();
  const colors = useTheme();
  const opacity = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    if (reduceMotion) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.45, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [reduceMotion, opacity]);

  return (
    <Animated.View
      style={[
        { width: width as any, height, borderRadius: radius, backgroundColor: colors.bgTertiary, opacity: reduceMotion ? 0.6 : opacity },
        style,
      ]}
    />
  );
}

/** A card-shaped skeleton with a few lines — drop-in for list/detail loading. */
export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  const colors = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.glassDark, borderColor: colors.borderSoft }]}>
      <Skeleton width={'55%'} height={20} radius={6} style={{ marginBottom: 14 }} />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} width={i === lines - 1 ? '70%' : '100%'} height={12} style={{ marginBottom: 10 }} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.xl,
    borderWidth: 1,
    padding: 20,
    marginBottom: 16,
  },
});
