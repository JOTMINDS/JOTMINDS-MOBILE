import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getAssessmentResults } from '../../utils/api';
import ScreenBackground from '../../components/ScreenBackground';
import AppIcon from '../../components/AppIcon';
import GlassCard from '../../components/GlassCard';
import GradientButton from '../../components/GradientButton';
import RadarChart from '../../components/RadarChart';
import { SkeletonCard, Skeleton } from '../../components/Skeleton';
import { STYLE_DESCRIPTIONS } from '../../utils/scoring';
import { rs } from '../../utils/responsive';
import { colors, radii, shadow, spacing, Palette } from '../../theme';
import { useTheme, useThemedStyles } from '../../context/ThemeContext';

const typeGradient: Record<string, [string, string, string]> = {
  learning: ['#3D52C9', '#2E3FA8', '#14136E'],
  thinking: ['#6E4D9C', '#5A3E82', '#14136E'],
  decision: ['#EC4899', '#DB2777', '#14136E'],
};

export default function AssessmentResultsScreen({ route, navigation }: any) {
  const colors = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { assessmentType } = route.params;
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await getAssessmentResults(assessmentType);
        // Backend returns the stored result object under `results` (plural).
        setResults(data.results ?? data.result);
      } catch (e) {
        console.error('[AssessmentResults]', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [assessmentType]);

  if (loading) {
    return (
      <ScreenBackground>
        <View style={{ paddingTop: 8, paddingHorizontal: spacing.xl }}>
          <Skeleton width={'40%'} height={14} style={{ marginBottom: 10 }} />
          <Skeleton width={'60%'} height={28} radius={6} style={{ marginBottom: 24 }} />
          <Skeleton height={150} radius={20} style={{ marginBottom: 20 }} />
          <SkeletonCard lines={4} />
          <SkeletonCard lines={3} />
        </View>
      </ScreenBackground>
    );
  }

  if (!results) {
    return (
      <ScreenBackground>
        <View style={styles.centered}>
          <Text style={styles.emptyTitle}>No results yet</Text>
          <Text style={styles.emptyText}>Take the assessment to view your results.</Text>
          <GradientButton
            label="Take Assessment"
            onPress={() => navigation.navigate('AssessmentTaking', { assessmentType })}
            style={{ marginTop: spacing.lg }}
          />
        </View>
      </ScreenBackground>
    );
  }

  const gradient = typeGradient[assessmentType] || typeGradient.thinking;

  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>{assessmentType.toUpperCase()} RESULTS</Text>
          <Text style={styles.title}>Your Profile</Text>
          <Text style={styles.date}>
            Completed on {new Date(results.completedAt ?? results.createdAt ?? Date.now()).toLocaleDateString()}
          </Text>
        </View>

        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <Text style={styles.heroLabel}>PRIMARY STYLE</Text>
          <Text style={styles.heroValue}>{results.results?.primaryStyle || 'N/A'}</Text>
          {STYLE_DESCRIPTIONS[results.results?.primaryStyle] ? (
            <Text style={styles.heroDesc}>{STYLE_DESCRIPTIONS[results.results.primaryStyle]}</Text>
          ) : null}
          {results.results?.secondaryStyle ? (
            <View style={styles.heroSecondaryRow}>
              <Text style={styles.heroSecondaryLabel}>Secondary</Text>
              <Text style={styles.heroSecondary}>{results.results.secondaryStyle}</Text>
            </View>
          ) : null}
        </LinearGradient>

        {results.results?.scores && Object.keys(results.results.scores).length >= 3 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cognitive Profile</Text>
            <GlassCard padding={16}>
              <RadarChart
                data={Object.entries(results.results.scores).map(([label, value]: any) => ({ label, value }))}
              />
            </GlassCard>
          </View>
        )}

        {results.results?.scores && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Detailed Scores</Text>
            <GlassCard padding={20}>
              {Object.entries(results.results.scores).map(([key, value]: any, i, arr) => {
                const n = Math.max(0, Math.min(100, Math.round(Number(value) || 0)));
                return (
                <View key={key} style={[styles.scoreRow, i === arr.length - 1 && { marginBottom: 0 }]}>
                  <View style={styles.scoreHeader}>
                    <Text style={styles.scoreLabel}>
                      {String(key).charAt(0).toUpperCase() + String(key).slice(1)}
                    </Text>
                    <Text style={styles.scoreValue}>{n}/100</Text>
                  </View>
                  <View style={styles.scoreBar}>
                    <LinearGradient
                      colors={[gradient[0], gradient[1]]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[styles.scoreBarFill, { width: `${n}%` }]}
                    />
                  </View>
                </View>
                );
              })}
            </GlassCard>
          </View>
        )}

        {results.strengths?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Strengths</Text>
            {results.strengths.map((s: string, i: number) => (
              <GlassCard key={i} padding={16} style={styles.listCard}>
                <View style={styles.listRow}>
                  <View style={[styles.listBadge, { backgroundColor: colors.successSoft }]}>
                    <AppIcon name="✓" size={14} color={colors.success} />
                  </View>
                  <Text style={styles.listText}>{s}</Text>
                </View>
              </GlassCard>
            ))}
          </View>
        )}

        {results.weaknesses?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Areas for Growth</Text>
            {results.weaknesses.map((w: string, i: number) => (
              <GlassCard key={i} padding={16} style={styles.listCard}>
                <View style={styles.listRow}>
                  <View style={[styles.listBadge, { backgroundColor: colors.cyanSoft }]}>
                    <Text style={[styles.listBadgeText, { color: '#2E3FA8' }]}>→</Text>
                  </View>
                  <Text style={styles.listText}>{w}</Text>
                </View>
              </GlassCard>
            ))}
          </View>
        )}

        {results.recommendations?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recommendations</Text>
            {results.recommendations.map((r: string, i: number) => (
              <GlassCard key={i} padding={16} style={[styles.listCard, styles.recCard]}>
                <View style={styles.listRow}>
                  <AppIcon name="💡" size={22} style={styles.recIcon} />
                  <Text style={styles.recText}>{r}</Text>
                </View>
              </GlassCard>
            ))}
          </View>
        )}

        <GradientButton
          label="Retake Assessment"
          onPress={() => navigation.navigate('AssessmentTaking', { assessmentType })}
          gradient={[gradient[0], gradient[1]]}
          style={{ marginTop: spacing.md }}
        />
      </ScrollView>
    </ScreenBackground>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  scroll: { paddingTop: 8, paddingHorizontal: spacing.xl, paddingBottom: 120 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  header: { marginBottom: spacing.lg },
  eyebrow: { fontSize: 12, color: colors.textSubtle, letterSpacing: 1.4, fontWeight: '700' },
  title: { fontSize: rs(28), fontWeight: '700', color: colors.textPrimary, marginTop: 4, letterSpacing: -0.6 },
  date: { fontSize: 14, color: colors.textMuted, marginTop: 4 },
  heroCard: { borderRadius: radii.xl, padding: spacing.xxl, marginBottom: spacing.xxl, ...shadow.glow },
  heroLabel: { color: 'rgba(255,255,255,0.75)', fontSize: 11, letterSpacing: 1.6, fontWeight: '700' },
  heroValue: { color: '#FFF', fontSize: rs(32), fontWeight: '800', marginTop: 8, letterSpacing: -0.5 },
  heroDesc: { color: 'rgba(255,255,255,0.85)', fontSize: 14, lineHeight: 21, marginTop: 10 },
  heroSecondaryRow: {
    marginTop: spacing.lg, paddingTop: spacing.md,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.2)',
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  heroSecondaryLabel: { color: 'rgba(255,255,255,0.75)', fontSize: 13 },
  heroSecondary: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  section: { marginBottom: spacing.xxl },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.md, letterSpacing: -0.4 },
  scoreRow: { marginBottom: spacing.lg },
  scoreHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  scoreLabel: { fontSize: 14, fontWeight: '600', color: colors.text },
  scoreValue: { fontSize: 14, fontWeight: '700', color: colors.textMuted },
  scoreBar: { height: 8, backgroundColor: '#E5EEFF', borderRadius: 4, overflow: 'hidden' },
  scoreBarFill: { height: '100%', borderRadius: 4 },
  listCard: { marginBottom: spacing.md },
  listRow: { flexDirection: 'row', alignItems: 'center' },
  listBadge: {
    width: 32, height: 32, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
    marginRight: spacing.md,
  },
  listBadgeText: { fontSize: 16, fontWeight: '800' },
  listText: { flex: 1, fontSize: 14, color: colors.text, lineHeight: 20 },
  recCard: { backgroundColor: '#FEF3C7', borderColor: '#FCD34D' },
  recIcon: { fontSize: 22, marginRight: spacing.md },
  recText: { flex: 1, fontSize: 14, color: '#78350F', lineHeight: 20 },
  emptyTitle: { fontSize: 22, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.sm },
  emptyText: { fontSize: 14, color: colors.textMuted, textAlign: 'center' },
});
