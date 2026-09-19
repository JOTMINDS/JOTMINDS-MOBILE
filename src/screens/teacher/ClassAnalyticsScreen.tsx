import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import ScreenBackground from '../../components/ScreenBackground';
import GlassCard from '../../components/GlassCard';
import DistributionBars from '../../components/teacher/DistributionBars';
import { ClassroomOverviewCard } from '../../components/ai/InsightCards';
import { getStudentsForTeacher, getAllAssessmentResults } from '../../utils/api';
import { stylesFromResults } from '../../utils/profileStyles';
import {
  classStyles, styleDistribution, completionProgress, alignmentScore, alignmentInsight, DOMAINS, Domain,
} from '../../utils/classInsights';
import { rs } from '../../utils/responsive';
import { spacing, Palette } from '../../theme';
import { useTheme, useThemedStyles } from '../../context/ThemeContext';

const TITLE: Record<Domain, string> = { learning: 'Learning styles', thinking: 'Thinking styles', decision: 'Decision styles' };

/** Class-level analytics: style distributions, module completion, alignment with the teacher's own profile. */
export default function ClassAnalyticsScreen() {
  const colors = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [students, setStudents] = useState<any[]>([]);
  const [mine, setMine] = useState<ReturnType<typeof stylesFromResults>>({ scores: {} });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [s, r] = await Promise.all([
        getStudentsForTeacher(),
        getAllAssessmentResults().catch(() => ({ results: [] })),
      ]);
      setStudents(s.students ?? []);
      setMine(stylesFromResults(r?.results ?? []));
    } catch (e: any) {
      setError(e?.message ?? 'Could not load your class.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  if (loading) {
    return <ScreenBackground><View style={styles.centered}><ActivityIndicator size="large" color={colors.purple} /></View></ScreenBackground>;
  }

  const dist = styleDistribution(students);
  const progress = completionProgress(students);
  const cls = classStyles(students);
  const score = alignmentScore(mine, dist);
  const total = dist.learning.total + dist.thinking.total + dist.decision.total;

  return (
    <ScreenBackground>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); void load(); }} tintColor={colors.purple} />}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Class Analytics</Text>
        <Text style={styles.sub}>{students.length} student{students.length !== 1 ? 's' : ''} · {cls.profiled} with results</Text>
        {!!error && <Text style={styles.error}>{error}</Text>}

        {students.length === 0 ? (
          <GlassCard padding={24}><Text style={styles.text}>Your class analytics appear here once students join your class and take their assessments.</Text></GlassCard>
        ) : (
          <>
            <GlassCard variant="dark" padding={16} style={styles.card}>
              <Text style={styles.cardTitle}>Alignment with your profile</Text>
              <Text style={styles.big}>{score === null ? '—' : `${score}%`}</Text>
              <Text style={styles.text}>{alignmentInsight(score)}</Text>
            </GlassCard>

            <GlassCard variant="dark" padding={16} style={styles.card}>
              <Text style={styles.cardTitle}>Assessment completion</Text>
              {DOMAINS.map((d) => {
                const pct = progress.total ? Math.round((progress.done[d] / progress.total) * 100) : 0;
                return (
                  <View key={d} style={styles.progRow}>
                    <Text style={styles.progLabel}>{TITLE[d].replace(' styles', '')}</Text>
                    <View style={styles.track}><View style={[styles.fill, { width: `${pct}%` }]} /></View>
                    <Text style={styles.progVal}>{progress.done[d]}/{progress.total}</Text>
                  </View>
                );
              })}
            </GlassCard>

            {total === 0 ? (
              <GlassCard padding={20} style={styles.card}>
                <Text style={styles.text}>Your students haven't completed an assessment yet. Distributions will appear as results come in.</Text>
              </GlassCard>
            ) : (
              DOMAINS.map((d) => (
                <GlassCard key={d} variant="dark" padding={16} style={styles.card}>
                  <Text style={styles.cardTitle}>{TITLE[d]}</Text>
                  <DistributionBars rows={dist[d].rows} highlight={mine[d]} emptyText="No results for this module yet" />
                </GlassCard>
              ))
            )}

            {cls.profiled >= 1 && cls.dominantLearning && cls.dominantThinking && (
              <ClassroomOverviewCard
                params={{
                  className: 'your class', studentCount: students.length,
                  dominantLearning: cls.dominantLearning, dominantThinking: cls.dominantThinking, dominantDecision: cls.dominantDecision,
                }}
              />
            )}
          </>
        )}
      </ScrollView>
    </ScreenBackground>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  scroll: { padding: spacing.xl, paddingBottom: 60 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: rs(24), fontWeight: '800', color: colors.text },
  sub: { fontSize: rs(13), color: colors.textMuted, marginTop: 4, marginBottom: spacing.xl },
  error: { color: colors.error, marginBottom: 12, fontSize: rs(13) },
  card: { marginBottom: spacing.lg },
  cardTitle: { fontSize: rs(15), fontWeight: '800', color: colors.text, marginBottom: 10 },
  text: { fontSize: rs(13), lineHeight: rs(19), color: colors.textSecondary },
  big: { fontSize: rs(40), fontWeight: '800', color: colors.purpleSoft, marginBottom: 6 },
  progRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  progLabel: { width: 70, fontSize: rs(12), color: colors.textSecondary, fontWeight: '600' },
  progVal: { width: 44, textAlign: 'right', fontSize: rs(12), fontWeight: '700', color: colors.text },
  track: { flex: 1, height: 10, borderRadius: 5, backgroundColor: colors.bgTertiary, overflow: 'hidden' },
  fill: { height: 10, borderRadius: 5, backgroundColor: colors.success },
});
