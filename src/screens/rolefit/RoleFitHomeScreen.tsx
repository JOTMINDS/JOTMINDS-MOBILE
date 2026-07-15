import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { getAllAssessmentResults } from '../../utils/api';
import ScreenBackground from '../../components/ScreenBackground';
import GlassCard from '../../components/GlassCard';
import AppIcon from '../../components/AppIcon';
import { colors, radii, spacing, Palette } from '../../theme';
import { useTheme, useThemedStyles } from '../../context/ThemeContext';
import { missingCognitiveDomains, domainLabel } from '../../utils/profileCompleteness';
import { calculateRoleFitScore, mapMobileProfileToDimensions, CognitiveRoleFitScore } from '../../utils/roleFitEngine';
import { GLOBAL_CAREERS, GlobalCareer } from '../../data/globalCareers';

const CATEGORY_COLOR: Record<string, string> = {
  'Natural Accelerator': colors.success,
  'Strong Alignment': colors.cyan,
  'Adaptable Fit': colors.warning,
  'Strain Risk': '#F97316',
  'Misalignment Risk': colors.error,
};

const CAREER_ICONS: Record<string, string> = {
  'software-engineer': '💻',
  'product-manager': '🎯',
  'counseling-psychologist': '🧠',
  'data-analyst': '📊',
  'marketing-strategist': '📣',
  'healthcare-administrator': '🏥',
  'financial-auditor': '💰',
  'creative-director': '🎨',
};

export default function RoleFitHomeScreen({ navigation }: any) {
  const colors = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { user } = useAuth();
  const [completedTypes, setCompletedTypes] = useState<string[]>(user?.assessmentsCompleted ?? []);
  const [topMatches, setTopMatches] = useState<{ career: GlobalCareer; result: CognitiveRoleFitScore }[]>([]);
  const missing = missingCognitiveDomains(completedTypes);
  const hasProfile = missing.length === 0;

  useEffect(() => {
    (async () => {
      try {
        const data = await getAllAssessmentResults();
        const results = data?.results ?? [];
        setCompletedTypes(results.map((r: any) => r.assessmentType));
        if (missingCognitiveDomains(results.map((r: any) => r.assessmentType)).length === 0) {
          const candidate = mapMobileProfileToDimensions(results);
          const scored = GLOBAL_CAREERS.map((career) => ({
            career,
            result: calculateRoleFitScore(candidate, career.demands),
          })).sort((a, b) => b.result.fitScore - a.result.fitScore);
          setTopMatches(scored.slice(0, 4));
        }
      } catch { /* leave empty on failure */ }
    })();
  }, []);

  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Role Fit</Text>
          <Text style={styles.subtitle}>Match your cognitive profile to roles</Text>
        </View>

        {/* Profile completeness banner */}
        {!hasProfile && (
          <GlassCard style={styles.alertCard}>
            <AppIcon name="⚠️" size={24} color={colors.warning} style={styles.alertIcon} />
            <View style={styles.alertText}>
              <Text style={styles.alertTitle}>Complete Your Full Profile First</Text>
              <Text style={styles.alertSub}>
                Role Fit uses your complete cognitive profile — not a quick test. Finish{' '}
                {missing.map((d) => domainLabel(d)).join(', ')} to unlock accurate matching.
              </Text>
            </View>
          </GlassCard>
        )}

        {/* Primary CTA */}
        <TouchableOpacity
          style={styles.ctaWrap}
          onPress={() => navigation.navigate('RoleDemandBuilder')}
          activeOpacity={0.88}
        >
          <LinearGradient
            colors={['#14136E', '#6E4D9C', '#3D52C9']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.ctaCard}
          >
            <AppIcon name="🎯" size={44} color="#FFFFFF" style={styles.ctaIcon} />
            <Text style={styles.ctaTitle}>Find Your Role Match</Text>
            <Text style={styles.ctaSub}>
              Build a role profile and see how your cognitive traits align
            </Text>
            <View style={styles.ctaBtn}>
              <Text style={styles.ctaBtnText}>Get Started →</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Career matches */}
        <GlassCard style={styles.careerCard} onPress={() => navigation.navigate('CareerMatches')}>
          <View style={styles.careerRow}>
            <View style={styles.careerIconWrap}>
              <AppIcon name="🚀" size={22} color={colors.cyan} />
            </View>
            <View style={styles.careerText}>
              <Text style={styles.careerTitle}>Career Matches</Text>
              <Text style={styles.careerSub}>See your top 10 career fits from your cognitive profile</Text>
            </View>
            <AppIcon name="arrow-forward" size={18} color={colors.textSubtle} />
          </View>
        </GlassCard>

        {/* What we measure */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What We Measure</Text>
          <View style={styles.dimensionsGrid}>
            {[
              { icon: '🧮', label: 'Analytical Depth' },
              { icon: '🌫️', label: 'Ambiguity Tolerance' },
              { icon: '❤️', label: 'Emotional Labor' },
              { icon: '⚡', label: 'Decision Speed' },
              { icon: '👥', label: 'Stakeholder Complexity' },
              { icon: '💡', label: 'Innovation Index' },
              { icon: '🗣️', label: 'Social Exposure' },
              { icon: '🔍', label: 'Detail Sensitivity' },
              { icon: '🧭', label: 'Autonomy Level' },
              { icon: '🌊', label: 'Cognitive Load' },
            ].map((d) => (
              <View key={d.label} style={styles.dimensionChip}>
                <AppIcon name={d.icon} size={15} color={colors.textSecondary} />
                <Text style={styles.dimensionLabel}>{d.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Real matches */}
        {hasProfile && topMatches.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Roles You Might Fit</Text>
            <Text style={styles.sectionSub}>Scored against your completed cognitive profile</Text>
            {topMatches.map(({ career, result }) => {
              const color = CATEGORY_COLOR[result.fitCategory] ?? colors.cyan;
              return (
                <GlassCard
                  key={career.id}
                  style={styles.roleCard}
                  onPress={() => navigation.navigate('RoleFitResult', { roleName: career.title, result })}
                >
                  <View style={styles.roleRow}>
                    <View style={styles.roleIconWrap}>
                      <AppIcon name={CAREER_ICONS[career.id] ?? '💼'} size={22} color={colors.textPrimary} />
                    </View>
                    <View style={styles.roleInfo}>
                      <Text style={styles.roleTitle}>{career.title}</Text>
                      <Text style={styles.roleCategory}>{career.category}</Text>
                    </View>
                    <View style={styles.roleFitCol}>
                      <Text style={[styles.roleFitScore, { color }]}>{result.fitScore}</Text>
                      <Text style={[styles.roleFitLabel, { color }]}>{result.fitCategory}</Text>
                    </View>
                  </View>
                  {/* Score bar */}
                  <View style={styles.scoreBarTrack}>
                    <View style={[styles.scoreBarFill, { width: `${result.fitScore}%`, backgroundColor: color }]} />
                  </View>
                </GlassCard>
              );
            })}
          </View>
        )}

        {/* Disclaimer */}
        <Text style={styles.disclaimer}>
          Note: Cognitive fit analysis is not a substitute for skill evaluation.
        </Text>
      </ScrollView>
    </ScreenBackground>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  scroll: { paddingTop: 8, paddingHorizontal: spacing.xl, paddingBottom: 120 },
  header: { marginBottom: 24 },
  title: { fontSize: 32, fontWeight: '800', color: colors.textPrimary, letterSpacing: -1 },
  subtitle: { fontSize: 15, color: colors.textMuted, marginTop: 4 },
  alertCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 20 },
  alertIcon: { fontSize: 24 },
  alertText: { flex: 1 },
  alertTitle: { fontSize: 14, fontWeight: '700', color: colors.warning, marginBottom: 4 },
  alertSub: { fontSize: 12, color: colors.textMuted, lineHeight: 18 },
  ctaWrap: { borderRadius: radii.xl, overflow: 'hidden', marginBottom: 28 },
  ctaCard: { padding: 28, borderRadius: radii.xl, alignItems: 'center' },
  ctaIcon: { fontSize: 44, marginBottom: 14 },
  ctaTitle: { fontSize: 22, fontWeight: '800', color: '#FFFFFF', marginBottom: 8 },
  ctaSub: { fontSize: 14, color: 'rgba(255,255,255,0.65)', textAlign: 'center', lineHeight: 21, marginBottom: 20 },
  ctaBtn: { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 24, paddingVertical: 12, borderRadius: radii.pill },
  ctaBtnText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  careerCard: { marginBottom: 28 },
  careerRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  careerIconWrap: { width: 46, height: 46, borderRadius: 14, backgroundColor: 'rgba(61,82,201,0.18)', justifyContent: 'center', alignItems: 'center' },
  careerText: { flex: 1 },
  careerTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  careerSub: { fontSize: 12, color: colors.textMuted, marginTop: 3, lineHeight: 17 },
  section: { marginBottom: 28 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: colors.textPrimary, marginBottom: 6, letterSpacing: -0.4 },
  sectionSub: { fontSize: 13, color: colors.textMuted, marginBottom: 16 },
  dimensionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  dimensionChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: colors.borderLight,
    borderRadius: radii.pill, paddingHorizontal: 12, paddingVertical: 8,
  },
  dimensionIcon: { fontSize: 14 },
  dimensionLabel: { fontSize: 12, color: colors.textSecondary, fontWeight: '500' },
  roleCard: { marginBottom: 14 },
  roleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  roleIconWrap: { width: 46, height: 46, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.07)', justifyContent: 'center', alignItems: 'center' },
  roleIconText: { fontSize: 22 },
  roleInfo: { flex: 1 },
  roleTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  roleCategory: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  roleFitCol: { alignItems: 'flex-end' },
  roleFitScore: { fontSize: 22, fontWeight: '800' },
  roleFitLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5, textAlign: 'right' },
  scoreBarTrack: { height: 6, backgroundColor: colors.bgTertiary, borderRadius: 3, overflow: 'hidden' },
  scoreBarFill: { height: '100%', borderRadius: 3 },
  disclaimer: { fontSize: 12, color: colors.textSubtle, textAlign: 'center', lineHeight: 18 },
});
