import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenBackground from '../../components/ScreenBackground';
import GlassCard from '../../components/GlassCard';
import AppIcon from '../../components/AppIcon';
import { generatePersonalizedReport, RoleCognitiveDemand } from '../../utils/roleFitEngine';
import { colors, radii, spacing, Palette } from '../../theme';
import { useTheme, useThemedStyles } from '../../context/ThemeContext';

const DIMENSION_ACTIONS: Record<keyof RoleCognitiveDemand, { focus: string; icon: string; actions: string[] }> = {
  analyticalDepth: {
    focus: 'Analytical Depth',
    icon: '🔍',
    actions: [
      'Practice breaking a complex problem into a structured list of sub-questions before answering it.',
      'Ask "what evidence would change my mind here?" before finalizing a judgment call.',
    ],
  },
  ambiguityTolerance: {
    focus: 'Ambiguity Tolerance',
    icon: '🌫️',
    actions: [
      'Practice making one decision this week with intentionally incomplete information.',
      'Set a firm decision deadline for an ambiguous choice and stick to it.',
    ],
  },
  emotionalLaborLoad: {
    focus: 'Emotional Labor',
    icon: '❤️',
    actions: [
      'Build a short decompression ritual for after emotionally demanding conversations.',
      'Practice naming what you need before entering a high-emotion interaction.',
    ],
  },
  decisionSpeed: {
    focus: 'Decision Speed',
    icon: '⚡',
    actions: [
      'Practice the 10-10-10 framework (how will this feel in 10 minutes, 10 months, 10 years) on low-stakes choices.',
      'Time-box small decisions and notice when more deliberation stops adding value.',
    ],
  },
  stakeholderComplexity: {
    focus: 'Stakeholder Complexity',
    icon: '👥',
    actions: [
      'Before a decision, map out everyone it affects and what each of them actually needs.',
      'Practice summarizing each competing viewpoint in a single sentence before responding.',
    ],
  },
  repetitionVsInnovation: {
    focus: 'Repetition vs. Innovation',
    icon: '🔁',
    actions: [
      'Notice one moment this week you defaulted to the familiar solution — try an alternative instead.',
      'Block time for a genuinely novel problem, even a small one, at least once a week.',
    ],
  },
  socialExposure: {
    focus: 'Social Exposure',
    icon: '🗣️',
    actions: [
      'Practice brief, low-stakes social check-ins to build comfort incrementally.',
      'Schedule recovery time after high-exposure days rather than stacking them back to back.',
    ],
  },
  detailSensitivity: {
    focus: 'Detail Sensitivity',
    icon: '🔬',
    actions: [
      'Build a personal review checklist for the type of detail-heavy work this role involves.',
      'Practice a deliberate "second pass" before submitting anything important.',
    ],
  },
  autonomyRequired: {
    focus: 'Autonomy',
    icon: '🧭',
    actions: [
      'Make one decision independently this week that you\'d normally check in about first.',
      'Ask directly where you do — and don\'t — need sign-off, to reduce unnecessary hesitation.',
    ],
  },
  cognitiveLoadVolatility: {
    focus: 'Cognitive Load Management',
    icon: '🌊',
    actions: [
      'Build in a buffer between your most intense tasks instead of stacking them.',
      'Notice your own early signs of overload and protect one low-demand block in your day.',
    ],
  },
};

export default function AdaptationScreen({ route, navigation }: any) {
  const colors = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { result, roleName } = route.params;
  const score = result?.fitScore ?? 0;

  const gapMap = result?.gapMap ?? {};
  const weakestDimensions = (Object.keys(gapMap) as (keyof RoleCognitiveDemand)[])
    .filter((key) => DIMENSION_ACTIONS[key])
    .sort((a, b) => gapMap[a].gap - gapMap[b].gap)
    .slice(0, 3);

  const report = result ? generatePersonalizedReport(result, roleName, true) : null;

  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Adaptation Plan</Text>
          <Text style={styles.subtitle}>
            Built from your real gap areas for{'\n'}
            <Text style={styles.roleName}>{roleName}</Text>
          </Text>
        </View>

        <LinearGradient
          colors={['#14136E', '#2C2E83']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.bannerCard}
        >
          <Text style={styles.bannerLabel}>STARTING POINT</Text>
          <Text style={styles.bannerScore}>{score}/100 Fit Score</Text>
          <Text style={styles.bannerSub}>
            {report?.struggles ?? 'Focus on the areas below where your profile has the biggest gap from this role\'s demands.'}
          </Text>
        </LinearGradient>

        {weakestDimensions.length === 0 ? (
          <GlassCard style={styles.phaseCard}>
            <Text style={styles.actionText}>No significant gaps detected — your profile is well aligned with this role.</Text>
          </GlassCard>
        ) : (
          weakestDimensions.map((dim, i) => {
            const { focus, icon, actions } = DIMENSION_ACTIONS[dim];
            const gap = gapMap[dim];
            const phaseColor = [colors.cyan, colors.purple, colors.success][i] ?? colors.cyan;
            return (
              <GlassCard key={dim} style={styles.phaseCard}>
                <View style={styles.phaseHeader}>
                  <View style={[styles.phaseIconWrap, { backgroundColor: `${phaseColor}22` }]}>
                    <AppIcon name={icon} size={22} color={phaseColor} />
                  </View>
                  <View style={styles.phaseInfo}>
                    <Text style={[styles.phaseWeek, { color: phaseColor }]}>PRIORITY {i + 1}</Text>
                    <Text style={styles.phaseFocus}>{focus}</Text>
                  </View>
                  <View style={styles.phaseNum}>
                    <Text style={styles.phaseNumText}>Gap: {gap.gap}</Text>
                  </View>
                </View>
                {actions.map((action, j) => (
                  <View key={j} style={styles.actionRow}>
                    <View style={[styles.actionDot, { backgroundColor: phaseColor }]} />
                    <Text style={styles.actionText}>{action}</Text>
                  </View>
                ))}
              </GlassCard>
            );
          })
        )}

        <GlassCard style={styles.mindCard}>
          <View style={styles.mindTitleRow}>
            <AppIcon name="📌" size={16} color={colors.text} />
            <Text style={styles.mindTitle}>Remember</Text>
          </View>
          <Text style={styles.mindText}>
            Cognitive profiles evolve with deliberate practice. Completing your Daily Mind Check
            regularly is the fastest way to track your adaptation progress.
          </Text>
        </GlassCard>

        <TouchableOpacity
          style={styles.checkInBtn}
          onPress={() => navigation.navigate('Main', { screen: 'MindHome' })}
        >
          <LinearGradient
            colors={['#6E4D9C', '#3D52C9']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.checkInBtnGradient}
          >
            <Text style={styles.checkInBtnText}>Start Daily Check-In →</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </ScreenBackground>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  scroll: { paddingTop: 8, paddingHorizontal: spacing.xl, paddingBottom: 120 },
  backBtn: { marginBottom: 20 },
  backText: { fontSize: 15, color: colors.cyan, fontWeight: '600' },
  header: { marginBottom: 24 },
  title: { fontSize: 28, fontWeight: '800', color: colors.textPrimary, letterSpacing: -1, marginBottom: 8 },
  subtitle: { fontSize: 14, color: colors.textMuted, lineHeight: 21 },
  roleName: { color: colors.cyan, fontWeight: '700' },
  bannerCard: { borderRadius: radii.xl, padding: 24, marginBottom: 24, alignItems: 'center' },
  bannerLabel: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.5)', letterSpacing: 1.5, marginBottom: 8 },
  bannerScore: { fontSize: 28, fontWeight: '800', color: '#FFFFFF', marginBottom: 8 },
  bannerSub: { fontSize: 13, color: 'rgba(255,255,255,0.6)', textAlign: 'center', lineHeight: 20 },
  phaseCard: { marginBottom: 16 },
  phaseHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  phaseIconWrap: { width: 44, height: 44, borderRadius: 13, justifyContent: 'center', alignItems: 'center' },
  phaseIcon: { fontSize: 22 },
  phaseInfo: { flex: 1 },
  phaseWeek: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5, marginBottom: 2 },
  phaseFocus: { fontSize: 16, fontWeight: '700', color: colors.text },
  phaseNum: { backgroundColor: colors.bgTertiary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radii.pill },
  phaseNumText: { fontSize: 11, fontWeight: '700', color: colors.textSubtle },
  actionRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  actionDot: { width: 7, height: 7, borderRadius: 4, marginTop: 6 },
  actionText: { flex: 1, fontSize: 13, color: colors.textSecondary, lineHeight: 21 },
  mindCard: { marginBottom: 20 },
  mindTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  mindTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  mindText: { fontSize: 13, color: colors.textMuted, lineHeight: 21 },
  checkInBtn: { borderRadius: radii.md, overflow: 'hidden' },
  checkInBtnGradient: { paddingVertical: 18, alignItems: 'center' },
  checkInBtnText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
});
