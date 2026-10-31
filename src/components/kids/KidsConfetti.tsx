import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, AccessibilityInfo, Easing, StyleSheet, View, useWindowDimensions } from 'react-native';

const COLORS = ['#F472B6', '#FBBF24', '#34D399', '#60A5FA', '#A78BFA', '#FB7185'];

/**
 * A burst of confetti for finishing something, like the webapp's kids celebrations. It plays once
 * on mount, ignores touches, and stays still for anyone who has turned motion off.
 */
export default function KidsConfetti({ count = 28, duration = 2600 }: { count?: number; duration?: number }) {
  const { width, height } = useWindowDimensions();
  const [still, setStill] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setStill).catch(() => {});
  }, []);

  const pieces = useMemo(
    () => Array.from({ length: count }, (_, i) => ({
      x: Math.random() * width,
      drift: (Math.random() - 0.5) * 120,
      delay: Math.random() * 500,
      size: 8 + Math.random() * 8,
      spin: 2 + Math.random() * 4,
      color: COLORS[i % COLORS.length],
      progress: new Animated.Value(0),
    })),
    [count, width],
  );
  const started = useRef(false);

  useEffect(() => {
    if (still || started.current) return;
    started.current = true;
    Animated.parallel(
      pieces.map((p) => Animated.timing(p.progress, {
        toValue: 1, duration, delay: p.delay, easing: Easing.out(Easing.quad), useNativeDriver: true,
      })),
    ).start();
  }, [pieces, duration, still]);

  if (still) return null;
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {pieces.map((p, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute', left: p.x, top: -20, width: p.size, height: p.size * 0.6, borderRadius: 2, backgroundColor: p.color,
            opacity: p.progress.interpolate({ inputRange: [0, 0.1, 0.85, 1], outputRange: [0, 1, 1, 0] }),
            transform: [
              { translateY: p.progress.interpolate({ inputRange: [0, 1], outputRange: [0, height * 0.9] }) },
              { translateX: p.progress.interpolate({ inputRange: [0, 1], outputRange: [0, p.drift] }) },
              { rotate: p.progress.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${p.spin * 180}deg`] }) },
            ],
          }}
        />
      ))}
    </View>
  );
}
