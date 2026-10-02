import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import ScreenBackground from '../../components/ScreenBackground';
import GlassCard from '../../components/GlassCard';
import { useToast } from '../../context/ToastContext';
import { calculateChildDevelopmentProfile } from '../../utils/preschoolEngine';
import { getPreschoolStore } from '../../utils/preschoolStore';
import { INDICATORS_BY_ID } from '../../data/preschoolIndicators';
import { DEVELOPMENTAL_DOMAINS, DEVELOPMENTAL_BANDS, DEVELOPMENTAL_RATINGS, getFriendlyMethodLabel } from '../../types/preschoolDevelopmental';
import { useTheme, useThemedStyles } from '../../context/ThemeContext';
import type { ScreenProps } from '../../navigation/types';
import { makeStyles, usePreschoolData, RATING_COLORS } from './shared';

/** One child's multidimensional developmental profile (never a single score) plus their recent evidence. */
export default function PreschoolChildProgressScreen({ route, navigation }: ScreenProps<'PreschoolChildProgress'>) {
  const colors = useTheme();
  const styles = useThemedStyles(makeStyles);
  const toast = useToast();
  const { child } = route.params;
  const { loading, events, reload } = usePreschoolData();

  const mine = useMemo(() => events.filter((e) => e.childId === child.id), [events, child.id]);
  const profile = useMemo(() => calculateChildDevelopmentProfile(child, mine), [child, mine]);
  const band = DEVELOPMENTAL_BANDS[profile.assignedBand];
  const recent = useMemo(() => [...mine].sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, 15), [mine]);

  const remove = (id: string) =>
    Alert.alert('Delete observation?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await getPreschoolStore().remove(id); toast.success('Observation deleted'); reload(); } },
    ]);

  if (loading) return <ScreenBackground><View style={styles.centered}><ActivityIndicator color={colors.purple} /></View></ScreenBackground>;

  const domains = Object.values(profile.domains);

  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.h1}>{child.name}</Text>
        <Text style={styles.meta}>
          {band.band} · {band.ageRange} · {band.title}{'\n'}
          {profile.totalEvidenceEvents} observation{profile.totalEvidenceEvents === 1 ? '' : 's'}
          {profile.lastObservationDate ? ` · last ${profile.lastObservationDate}` : ''}
        </Text>

        <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('PreschoolAssess', { child })} accessibilityRole="button">
          <Text style={styles.primaryBtnText}>＋ Record an observation</Text>
        </TouchableOpacity>

        {profile.totalEvidenceEvents === 0 ? (
          <GlassCard padding={16} style={styles.card}>
            <Text style={styles.text}>No evidence yet. Record a few observations and this child’s profile will build up here.</Text>
          </GlassCard>
        ) : (
          <>
            {!!profile.parentSummary?.narrativeSummary && (
              <GlassCard padding={16} style={styles.card}>
                <Text style={styles.cardTitle}>Summary</Text>
                <Text style={[styles.text, { marginTop: 6 }]}>{profile.parentSummary.narrativeSummary}</Text>
              </GlassCard>
            )}

            <GlassCard padding={16} style={styles.card}>
              <Text style={styles.cardTitle}>Developmental domains</Text>
              {domains.map((d) => (
                <View key={d.domainCode} style={{ marginTop: 12 }}>
                  <View style={styles.spread}>
                    <Text style={styles.chipText}>{d.shortName}</Text>
                    <Text style={styles.muted}>{d.observedCount}/{d.totalIndicators} observed · {d.observedCount ? d.stageLabel : 'no evidence'}</Text>
                  </View>
                  <View style={[styles.row, { marginTop: 4 }]}>
                    <View style={styles.track}>
                      <View style={[styles.fill, { width: `${Math.max(2, (d.averageStage / 4) * 100)}%`, backgroundColor: d.accentColor || DEVELOPMENTAL_DOMAINS[d.domainCode].accentColor }]} />
                    </View>
                  </View>
                </View>
              ))}
            </GlassCard>

            {profile.overallEmergingStrengths.length > 0 && (
              <GlassCard padding={16} style={styles.card}>
                <Text style={styles.cardTitle}>Emerging strengths</Text>
                {profile.overallEmergingStrengths.map((s, i) => <Text key={i} style={[styles.text, { marginTop: 4 }]}>• {s}</Text>)}
              </GlassCard>
            )}
            {profile.priorityDevelopmentAreas.length > 0 && (
              <GlassCard padding={16} style={styles.card}>
                <Text style={styles.cardTitle}>Priority areas to support</Text>
                {profile.priorityDevelopmentAreas.map((s, i) => <Text key={i} style={[styles.text, { marginTop: 4 }]}>• {s}</Text>)}
              </GlassCard>
            )}

            <Text style={styles.label}>RECENT OBSERVATIONS</Text>
            {recent.map((e) => {
              const ind = INDICATORS_BY_ID[e.indicatorId];
              return (
                <GlassCard key={e.id} padding={14} style={styles.card}>
                  <View style={styles.spread}>
                    <Text style={[styles.cardTitle, { flex: 1 }]}>{ind?.title ?? e.indicatorId}</Text>
                    <View style={[styles.pill, { backgroundColor: `${RATING_COLORS[e.rating]}33` }]}>
                      <Text style={[styles.pillText, { color: RATING_COLORS[e.rating] }]}>{DEVELOPMENTAL_RATINGS[e.rating].stage}</Text>
                    </View>
                  </View>
                  <Text style={styles.muted}>{e.date} · {DEVELOPMENTAL_DOMAINS[e.domainCode]?.shortName} · {getFriendlyMethodLabel(e.method)}{e.languageOfEvidence ? ` · ${e.languageOfEvidence}` : ''}</Text>
                  {!!e.notes && <Text style={[styles.text, { marginTop: 6 }]}>{e.notes}</Text>}
                  <TouchableOpacity onPress={() => remove(e.id)} accessibilityRole="button"><Text style={[styles.muted, { color: colors.error, marginTop: 8 }]}>Delete</Text></TouchableOpacity>
                </GlassCard>
              );
            })}
          </>
        )}
      </ScrollView>
    </ScreenBackground>
  );
}
