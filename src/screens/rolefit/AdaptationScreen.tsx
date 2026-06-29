import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenBackground from '../../components/ScreenBackground';
import GlassCard from '../../components/GlassCard';
import AppIcon from '../../components/AppIcon';
import { colors, radii, spacing, Palette } from '../../theme';
import { useTheme, useThemedStyles } from '../../context/ThemeContext';

const DEFAULT_RECS = [
  {
    week: 'Week 1–2',
    focus: 'Awareness',
    icon: '👁️',
    color: colors.cyan,
    actions: [
      'Shadow someone in this role for 2 hours',
      'Journal daily on where you felt cognitively stretched',
      'Take the full Decision Style assessment if not completed',
    ],
  },
  {
    week: 'Week 3–4',
    focus: 'Skill Building',
    icon: '🏋️',
    color: colors.purple,
    actions: [
      'Complete one structured problem-solving exercise per day',
      'Practice the 10-10-10 decision framework on low-stakes choices',
      'Seek feedback on a recent project deliverable',
    ],
  },
  {
    week: 'Week 5–8',
    focus: 'Integration',
    icon: '🔗',
    color: colors.success,
    actions: [
      'Apply your cognitive strengths in a stretch project',
      'Set a 90-day performance goal aligned to this role',
      'Re-run the Role Fit match to track improvement',
    ],
  },
];

export default function AdaptationScreen({ route, navigation }: any) {
  const colors = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { result, roleName } = route.params;
  const score = result?.fit_score ?? 0;

  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Adaptation Plan</Text>
          <Text style={styles.subtitle}>
            Personalised steps to bridge your gap for{'\n'}
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
            Follow this 8-week plan to strengthen your cognitive alignment
          </Text>
        </LinearGradient>

        {DEFAULT_RECS.map((phase, i) => (
          <GlassCard key={phase.week} style={styles.phaseCard}>
            <View style={styles.phaseHeader}>
              <View style={[styles.phaseIconWrap, { backgroundColor: `${phase.color}22` }]}>
                <AppIcon name={phase.icon} size={22} color={phase.color} />
              </View>
              <View style={styles.phaseInfo}>
                <Text style={[styles.phaseWeek, { color: phase.color }]}>{phase.week}</Text>
                <Text style={styles.phaseFocus}>{phase.focus}</Text>
              </View>
              <View style={styles.phaseNum}>
                <Text style={styles.phaseNumText}>Phase {i + 1}</Text>
              </View>
            </View>
            {phase.actions.map((action, j) => (
              <View key={j} style={styles.actionRow}>
                <View style={[styles.actionDot, { backgroundColor: phase.color }]} />
                <Text style={styles.actionText}>{action}</Text>
              </View>
            ))}
          </GlassCard>
        ))}

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
