import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Logo from '../../components/Logo';
import { useAccessibility } from '../../context/AccessibilityContext';
import { colors, shadow } from '../../theme';

export default function SplashScreen({ navigation }: any) {
  const { reduceMotion } = useAccessibility();
  const logoScale = new Animated.Value(reduceMotion ? 1 : 0.6);
  const logoOpacity = new Animated.Value(reduceMotion ? 1 : 0);
  const textOpacity = new Animated.Value(reduceMotion ? 1 : 0);

  useEffect(() => {
    if (!reduceMotion) {
      Animated.sequence([
        Animated.parallel([
          Animated.spring(logoScale, { toValue: 1, friction: 6, useNativeDriver: true }),
          Animated.timing(logoOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        ]),
        Animated.timing(textOpacity, { toValue: 1, duration: 300, delay: 100, useNativeDriver: true }),
      ]).start();
    }

    const timer = setTimeout(() => {
      navigation.replace('Welcome');
    }, reduceMotion ? 900 : 2200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient
      colors={['#020618', '#0F172B', '#14136E']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <Animated.View style={[styles.logoWrap, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
        <Logo size="lg" />
      </Animated.View>

      <Animated.View style={{ opacity: textOpacity, alignItems: 'center' }}>
        <Text style={styles.tagline}>Discover How You Think</Text>
      </Animated.View>

      <View style={styles.dotsRow}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={[styles.dot, i === 1 && styles.dotActive]} />
        ))}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoWrap: {
    marginBottom: 28,
  },
  logoBadge: {
    width: 96,
    height: 96,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadow.glow,
  },
  logoText: {
    fontSize: 42,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  appName: {
    fontSize: 40,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -2,
    marginBottom: 10,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  dotsRow: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 60,
    gap: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  dotActive: {
    backgroundColor: colors.cyan,
    width: 20,
    borderRadius: 3,
  },
});
