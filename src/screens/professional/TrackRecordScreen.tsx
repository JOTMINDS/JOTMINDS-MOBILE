import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import ScreenBackground from '../../components/ScreenBackground';
import GlassCard from '../../components/GlassCard';
import { useAuth } from '../../context/AuthContext';
import { getAllAssessmentResults } from '../../utils/api';
import { normalizeAssessmentResult, assessmentLabel } from '../../utils/scoring';
import { loadEntries } from '../../utils/professionalCognitiveStore';
import { buildTrackRecord, TrackRecordItem } from '../../utils/trackRecord';
import { rs } from '../../utils/responsive';
import { spacing, Palette } from '../../theme';
import { useTheme, useThemedStyles } from '../../context/ThemeContext';
import type { ScreenProps } from '../../navigation/types';

/** Chronological history of the person's assessments, with how their styles have changed between attempts. */
export default function TrackRecordScreen({ navigation }: ScreenProps<'TrackRecord'>) {
  const colors = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { user } = useAuth();
  const [items, setItems] = useState<TrackRecordItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [server, local] = await Promise.all([
        getAllAssessmentResults().catch(() => ({ results: [] })),
        user?.id ? loadEntries(user.id) : Promise.resolve([]),
      ]);
      const serverRows = (server?.results ?? []).map((r: any) => {
        const n = r.results ? normalizeAssessmentResult(r.results) : null;
        return {
          id: `srv_${r.assessmentType}_${r.completedAt ?? r.createdAt ?? ''}`,
          source: 'server' as const,
          at: r.completedAt ?? r.createdAt ?? '',
          label: assessmentLabel(r.assessmentType),
          headline: n?.primaryStyle || '',
          assessmentType: r.assessmentType as string,
        };
      });
      const localRows = local.map((e) => ({
        id: e.id, source: 'professional' as const, at: e.at, label: 'Professional Cognitive Assessment',
        headline: e.profile.overallProfile,
        styles: { Learning: e.profile.learning.style, Thinking: e.profile.thinking.style, 'Decision-making': e.profile.decisionMaking.style },
      }));
      setItems(buildTrackRecord([...serverRows, ...localRows]));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => { void load(); }, [load]);

  if (loading) {
    return <ScreenBackground><View style={styles.centered}><ActivityIndicator size="large" color={colors.purple} /></View></ScreenBackground>;
  }

  return (
    <ScreenBackground>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); void load(); }} tintColor={colors.purple} />}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Track Record</Text>
        <Text style={styles.sub}>Your assessments over time</Text>
        {items.length === 0 ? (
          <GlassCard variant="dark" padding={24}><Text style={styles.text}>Nothing here yet. Complete an assessment and it will appear in your track record.</Text></GlassCard>
        ) : (
          items.map((it) => (
            <GlassCard
              key={it.id}
              variant="dark"
              padding={16}
              style={styles.card}
              onPress={() => (it.source === 'professional'
                ? navigation.navigate('ProfessionalReport', { entryId: it.id })
                : navigation.navigate('AssessmentResults', { assessmentType: (it as any).assessmentType }))}
            >
              <Text style={styles.date}>{it.at ? new Date(it.at).toLocaleDateString() : 'Date unknown'}</Text>
              <Text style={styles.label}>{it.label}</Text>
              {!!it.headline && <Text style={styles.headline}>{it.headline}</Text>}
              {it.changes.map((c) => (
                <Text key={c.dimension} style={styles.change}>↻ {c.dimension}: {c.from} → {c.to}</Text>
              ))}
              {it.isRetake && it.changes.length === 0 && <Text style={styles.same}>No change from your previous attempt</Text>}
            </GlassCard>
          ))
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
  card: { marginBottom: spacing.md },
  date: { fontSize: rs(11), color: colors.textMuted, fontWeight: '700' },
  label: { fontSize: rs(15), fontWeight: '800', color: colors.text, marginTop: 2 },
  headline: { fontSize: rs(13), color: colors.purpleSoft, marginTop: 2, fontWeight: '700' },
  change: { fontSize: rs(12), color: colors.success, marginTop: 4 },
  same: { fontSize: rs(12), color: colors.textMuted, marginTop: 4 },
  text: { fontSize: rs(13), lineHeight: rs(19), color: colors.textSecondary },
});
