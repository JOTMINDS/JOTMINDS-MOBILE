import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenBackground from '../../components/ScreenBackground';
import AppIcon from '../../components/AppIcon';
import { colors, radii, spacing, Palette } from '../../theme';
import { useTheme, useThemedStyles } from '../../context/ThemeContext';

const STEPS = [
  { icon: '🎯', label: 'Focus Score', sub: 'Rate your focus from 1–5' },
  { icon: '⏳', label: 'Decision Delay', sub: 'Did you delay decisions today?' },
  { icon: '💭', label: 'Emotional State', sub: 'Pick your current emotion' },
];

export default function DailyCheckIntroScreen({ navigation }: any) {
  const colors = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <ScreenBackground>
      <View style={styles.container}>
        <LinearGradient
          colors={['#14136E', '#2C2E83']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <AppIcon name="🧠" size={52} color="#FFFFFF" style={styles.heroIcon} />
          <Text style={styles.heroTitle}>Daily Mind Check</Text>
          <Text style={styles.heroSub}>
            3 quick questions to track your cognitive performance today.
          </Text>
        </LinearGradient>

        <View style={styles.steps}>
          {STEPS.map((s, i) => (
            <View key={s.label} style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{i + 1}</Text>
              </View>
              <AppIcon name={s.icon} size={24} color={colors.cyan} style={styles.stepIcon} />
              <View style={styles.stepText}>
                <Text style={styles.stepLabel}>{s.label}</Text>
                <Text style={styles.stepSub}>{s.sub}</Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.disclaimer}>
          Takes less than 60 seconds. Data stays private to you.
        </Text>

        <TouchableOpacity
          style={styles.startBtn}
          onPress={() => navigation.navigate('DailyCheckQuestions')}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['#6E4D9C', '#3D52C9']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.startBtnGradient}
          >
            <Text style={styles.startBtnText}>Start Check-In →</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.skipBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.skipText}>Maybe Later</Text>
        </TouchableOpacity>
      </View>
    </ScreenBackground>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  container: { flex: 1, paddingHorizontal: spacing.xl, paddingTop: 12, paddingBottom: 40 },
  hero: {
    borderRadius: radii.xl,
    padding: 28,
    alignItems: 'center',
    marginBottom: 32,
  },
  heroIcon: { fontSize: 52, marginBottom: 16 },
  heroTitle: { fontSize: 24, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.5, marginBottom: 10 },
  heroSub: { fontSize: 14, color: 'rgba(255,255,255,0.65)', textAlign: 'center', lineHeight: 21 },
  steps: { gap: 16, marginBottom: 28 },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 16,
    gap: 14,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.purple,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: { fontSize: 13, fontWeight: '800', color: '#FFFFFF' },
  stepIcon: { fontSize: 24 },
  stepText: { flex: 1 },
  stepLabel: { fontSize: 15, fontWeight: '700', color: colors.text },
  stepSub: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  disclaimer: { fontSize: 12, color: colors.textSubtle, textAlign: 'center', marginBottom: 28, lineHeight: 18 },
  startBtn: { borderRadius: radii.md, overflow: 'hidden', marginBottom: 14 },
  startBtnGradient: { paddingVertical: 18, alignItems: 'center' },
  startBtnText: { fontSize: 17, fontWeight: '700', color: '#FFFFFF' },
  skipBtn: { alignItems: 'center', paddingVertical: 12 },
  skipText: { fontSize: 14, color: colors.textMuted, fontWeight: '500' },
});
