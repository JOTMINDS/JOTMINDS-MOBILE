import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import ScreenBackground from '../../components/ScreenBackground';
import GlassCard from '../../components/GlassCard';
import { calculateClassDevelopmentIntelligence } from '../../utils/preschoolEngine';
import { DEVELOPMENTAL_BANDS, DEVELOPMENTAL_DOMAINS, DevelopmentalBand } from '../../types/preschoolDevelopmental';
import { useTheme, useThemedStyles } from '../../context/ThemeContext';
import type { ScreenProps } from '../../navigation/types';
import { makeStyles, usePreschoolData } from './shared';

const ALL = '__all__';

/** Cohort view for a teacher: band mix, per-domain averages, shared strengths, gaps and suggested classroom focus. */
export default function PreschoolClassInsightsScreen(_props: ScreenProps<'PreschoolClassInsights'>) {
  const colors = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { loading, children, events } = usePreschoolData();
  const [classKey, setClassKey] = useState(ALL);

  const classes = useMemo(() => {
    const m = new Map<string, string>();
    children.forEach((c) => m.set(c.classId || c.className || 'none', c.className || 'Unassigned'));
    return [...m.entries()].map(([key, name]) => ({ key, name }));
  }, [children]);

  const insights = useMemo(() => {
    const kids = classKey === ALL ? children : children.filter((c) => (c.classId || c.className || 'none') === classKey);
    if (kids.length === 0) return null;
    const name = classKey === ALL ? 'All Pre-school children' : classes.find((c) => c.key === classKey)?.name ?? '';
    const ids = new Set(kids.map((c) => c.id));
    // Scope events to this cohort only (the engine also matches by classId, so pass an id no event carries).
    return calculateClassDevelopmentIntelligence(kids, events.filter((e) => ids.has(e.childId)), `cohort:${classKey}`, name);
  }, [children, events, classKey, classes]);

  if (loading) return <ScreenBackground><View style={styles.centered}><ActivityIndicator color={colors.purple} /></View></ScreenBackground>;

  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.h1}>Class insights</Text>

        {!insights ? (
          <GlassCard padding={20} style={styles.card}>
            <Text style={styles.text}>No Pre-school children yet. Insights appear once children are in your classes and you have recorded observations.</Text>
          </GlassCard>
        ) : (
          <>
            {classes.length > 1 && (
              <View style={styles.chipWrap}>
                {[{ key: ALL, name: 'All' }, ...classes].map((c) => (
                  <TouchableOpacity key={c.key} style={[styles.chip, classKey === c.key && styles.chipOn]} onPress={() => setClassKey(c.key)}>
                    <Text style={[styles.chipText, classKey === c.key && styles.chipTextOn]}>{c.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            <Text style={[styles.meta, { marginTop: 10 }]}>
              {insights.className} · {insights.totalChildren} child{insights.totalChildren === 1 ? '' : 'ren'} · {insights.activeObservations} observation{insights.activeObservations === 1 ? '' : 's'}
            </Text>

            {insights.activeObservations === 0 && (
              <GlassCard padding={16} style={styles.card}>
                <Text style={styles.text}>No observations recorded yet. Record some from the Children screen and this page will fill in.</Text>
              </GlassCard>
            )}

            <GlassCard padding={16} style={styles.card}>
              <Text style={styles.cardTitle}>Age bands</Text>
              <View style={[styles.chipWrap, { marginTop: 10 }]}>
                {(Object.keys(DEVELOPMENTAL_BANDS) as DevelopmentalBand[]).map((b) => (
                  <View key={b} style={[styles.pill, { backgroundColor: `${DEVELOPMENTAL_BANDS[b].color}33` }]}>
                    <Text style={[styles.pillText, { color: DEVELOPMENTAL_BANDS[b].color }]}>{b} · {DEVELOPMENTAL_BANDS[b].ageRange}: {insights.bandDistribution[b]}</Text>
                  </View>
                ))}
              </View>
            </GlassCard>

            {insights.activeObservations > 0 && (
              <>
                <GlassCard padding={16} style={styles.card}>
                  <Text style={styles.cardTitle}>Domain averages</Text>
                  {insights.domainAverages.map((d) => (
                    <View key={d.domainCode} style={{ marginTop: 12 }}>
                      <View style={styles.spread}>
                        <Text style={styles.chipText}>{DEVELOPMENTAL_DOMAINS[d.domainCode]?.shortName ?? d.domainName}</Text>
                        <Text style={styles.muted}>
                          {d.emergingCount} emerging · {d.developingCount} developing · {d.achievingCount + d.extendingCount} achieving+
                        </Text>
                      </View>
                      <View style={[styles.row, { marginTop: 4 }]}>
                        <View style={styles.track}>
                          <View style={[styles.fill, { width: `${Math.max(2, (d.averageStage / 4) * 100)}%`, backgroundColor: DEVELOPMENTAL_DOMAINS[d.domainCode]?.accentColor }]} />
                        </View>
                      </View>
                    </View>
                  ))}
                </GlassCard>

                {insights.cohortStrengths.length > 0 && (
                  <GlassCard padding={16} style={styles.card}>
                    <Text style={styles.cardTitle}>Cohort strengths</Text>
                    {insights.cohortStrengths.map((s, i) => <Text key={i} style={[styles.text, { marginTop: 4 }]}>• {s}</Text>)}
                  </GlassCard>
                )}

                {insights.cohortDevelopmentGaps.length > 0 && (
                  <>
                    <Text style={styles.label}>WHERE CHILDREN NEED SUPPORT</Text>
                    {insights.cohortDevelopmentGaps.map((g, i) => (
                      <GlassCard key={i} padding={14} style={styles.card}>
                        <Text style={styles.cardTitle}>{g.clusterName}</Text>
                        <Text style={styles.muted}>{DEVELOPMENTAL_DOMAINS[g.domainCode]?.shortName} · {g.childrenNeedingSupport} child{g.childrenNeedingSupport === 1 ? '' : 'ren'}</Text>
                        <Text style={[styles.text, { marginTop: 6 }]}>{g.description}</Text>
                        <Text style={[styles.text, { marginTop: 6 }]}>Focus: {g.recommendedClassroomFocus}</Text>
                      </GlassCard>
                    ))}
                  </>
                )}

                {insights.teachingInsightRecommendations.length > 0 && (
                  <>
                    <Text style={styles.label}>SUGGESTED CLASSROOM STRATEGIES</Text>
                    {insights.teachingInsightRecommendations.map((r, i) => (
                      <GlassCard key={i} padding={14} style={styles.card}>
                        <Text style={styles.cardTitle}>{r.title}</Text>
                        <Text style={[styles.text, { marginTop: 6 }]}>{r.instructionalStrategy}</Text>
                        <Text style={[styles.muted, { marginTop: 6 }]}>Station: {r.suggestedStationSetup}</Text>
                      </GlassCard>
                    ))}
                  </>
                )}

                {insights.readinessSummary && insights.readinessSummary.evaluatedCount > 0 && (
                  <GlassCard padding={16} style={styles.card}>
                    <Text style={styles.cardTitle}>School readiness (ages 5–6)</Text>
                    <Text style={[styles.text, { marginTop: 6 }]}>
                      {insights.readinessSummary.evaluatedCount} evaluated · {insights.readinessSummary.highReadinessCount} high · {insights.readinessSummary.moderateReadinessCount} moderate · {insights.readinessSummary.supportRequiredCount} need support
                    </Text>
                  </GlassCard>
                )}
              </>
            )}
          </>
        )}
      </ScrollView>
    </ScreenBackground>
  );
}
