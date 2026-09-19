import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import ScreenBackground from '../../components/ScreenBackground';
import GlassCard from '../../components/GlassCard';
import { useAuth } from '../../context/AuthContext';
import { rs } from '../../utils/responsive';
import { radii, spacing, Palette } from '../../theme';
import { useTheme, useThemedStyles } from '../../context/ThemeContext';
import type { ScreenProps } from '../../navigation/types';
import { humanizeKey } from '../../utils/professionalV2Logic';
import {
  PV2ConstructResult, PV2Insight, PV2Profile, deleteSession, generateProfile, getProfile, savePointer,
} from '../../utils/professionalV2Api';

const CONFIDENCE_LABEL = { low: 'Low confidence', moderate: 'Moderate confidence', high: 'High confidence' } as const;
const CAPABILITY_LABEL = {
  insufficient: 'Not enough evidence yet', emerging: 'Emerging', moderate: 'Moderate', strong: 'Strong',
} as const;

/**
 * The structured profile is computed server-side from scored evidence and is
 * shown as-is. The AI only adds narrative, blind spots and development
 * priorities on top; if that step fails the structured profile still shows.
 */
export default function ProfessionalV2ResultsScreen({ route, navigation }: ScreenProps<'ProfessionalV2Results'>) {
  const { sessionId } = route.params;
  const colors = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { user } = useAuth();
  const [profile, setProfile] = useState<PV2Profile | null>(null);
  const [insights, setInsights] = useState<PV2Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let res = await getProfile(sessionId);
      if (!res || res.profile.status !== 'interpreted') res = await generateProfile(sessionId);
      setProfile(res.profile);
      setInsights(res.insights);
    } catch (e: any) {
      setError(e?.message ?? 'Could not load your profile.');
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => { void load(); }, [load]);

  const withdraw = () => {
    Alert.alert(
      'Erase this attempt?',
      'This permanently deletes your responses, results and profile from this assessment. It cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Erase', style: 'destructive',
          onPress: async () => {
            try {
              await deleteSession(sessionId);
              if (user?.id) await savePointer(user.id, null);
              navigation.popToTop();
            } catch (e: any) {
              Alert.alert('Could not erase', e?.message ?? 'Please try again.');
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <ScreenBackground>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.purple} />
          <Text style={styles.centeredText}>Building your profile…</Text>
        </View>
      </ScreenBackground>
    );
  }

  if (error || !profile) {
    return (
      <ScreenBackground>
        <View style={styles.centered}>
          <Text style={styles.title}>Couldn’t load your profile</Text>
          <Text style={styles.centeredText}>{error}</Text>
          <TouchableOpacity onPress={load} style={{ marginTop: 16 }}><Text style={styles.link}>Try again</Text></TouchableOpacity>
        </View>
      </ScreenBackground>
    );
  }

  const domains = profile.structured_summary?.domains ?? [];
  const narrativeFor = (domainKey: string) =>
    insights.find((i) => i.insight_type === 'domain_narrative' && i.structured_evidence?.domainKey === domainKey);
  const blindSpots = insights.filter((i) => i.insight_type === 'blind_spot');
  const priorities = insights.filter((i) => i.insight_type === 'development_priority');
  const constructName = (key: string) =>
    domains.flatMap((d) => d.constructs).find((c) => c.constructKey === key)?.name ?? humanizeKey(key);

  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.eyebrow}>PROFESSIONAL INTELLIGENCE</Text>
        <Text style={styles.title}>Your profile</Text>
        <Text style={styles.sub}>
          Overall evidence confidence: {CONFIDENCE_LABEL[profile.overall_confidence] ?? profile.overall_confidence}.
          This describes how you tend to think and work — it is not a score, ranking or hiring decision.
        </Text>

        {profile.status === 'interpretation_failed' && (
          <GlassCard variant="dark" padding={14} style={styles.card}>
            <Text style={styles.cardText}>
              The written interpretation isn’t available right now, but your structured profile is below.
            </Text>
            <TouchableOpacity onPress={load} style={{ marginTop: 8 }}><Text style={styles.link}>Retry interpretation</Text></TouchableOpacity>
          </GlassCard>
        )}

        {domains.map((d) => (
          <GlassCard key={d.domainKey} variant="dark" padding={16} style={styles.card}>
            <View style={styles.domainHead}>
              <Text style={styles.cardTitle}>{d.name}</Text>
              <Chip text={CONFIDENCE_LABEL[d.confidence] ?? d.confidence} styles={styles} />
            </View>
            {!!narrativeFor(d.domainKey) && <Text style={styles.narrative}>{narrativeFor(d.domainKey)!.generated_text}</Text>}
            {d.constructs.map((c) => <ConstructRow key={c.constructKey} c={c} styles={styles} />)}
          </GlassCard>
        ))}

        {priorities.length > 0 && (
          <GlassCard variant="dark" padding={16} style={styles.card}>
            <Text style={styles.cardTitle}>🎯 Development priorities</Text>
            {priorities.map((p, i) => (
              <InsightRow key={i} i={p} nameOf={constructName} styles={styles} />
            ))}
          </GlassCard>
        )}

        {blindSpots.length > 0 && (
          <GlassCard variant="dark" padding={16} style={styles.card}>
            <Text style={styles.cardTitle}>👁 Possible blind spots</Text>
            {blindSpots.map((b, i) => (
              <InsightRow key={i} i={b} nameOf={constructName} styles={styles} />
            ))}
          </GlassCard>
        )}

        <TouchableOpacity style={styles.doneBtn} onPress={() => navigation.popToTop()} accessibilityRole="button">
          <Text style={styles.doneText}>Done</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={withdraw} style={styles.eraseBtn} accessibilityRole="button">
          <Text style={styles.eraseText}>Erase this attempt</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenBackground>
  );
}

function Chip({ text, styles }: { text: string; styles: ReturnType<typeof makeStyles> }) {
  return <View style={styles.chip}><Text style={styles.chipText}>{text}</Text></View>;
}

function ConstructRow({ c, styles }: { c: PV2ConstructResult; styles: ReturnType<typeof makeStyles> }) {
  let detail: string;
  if (c.evidenceCount === 0) detail = 'Not enough evidence yet';
  else if (c.constructType === 'capability') detail = CAPABILITY_LABEL[c.capabilityLevel ?? 'insufficient'];
  else if (c.constructType === 'preference') detail = c.preferenceSignalKey ? `Tends toward: ${humanizeKey(c.preferenceSignalKey)}` : 'No clear preference';
  else if (c.constructType === 'meta' && c.metaValue != null) {
    const v = typeof c.metaValue === 'object' ? (c.metaValue.average ?? c.metaValue.value ?? null) : c.metaValue;
    detail = v == null ? 'Recorded' : `Recorded: ${typeof v === 'number' ? Math.round(v * 10) / 10 : String(v)}`;
  } else detail = 'Recorded';
  return (
    <View style={styles.construct}>
      <View style={{ flex: 1 }}>
        <Text style={styles.constructName}>{c.name}</Text>
        <Text style={styles.constructDetail}>{detail}</Text>
      </View>
      {c.evidenceCount > 0 && <Chip text={CONFIDENCE_LABEL[c.confidence] ?? c.confidence} styles={styles} />}
    </View>
  );
}

function InsightRow({
  i, nameOf, styles,
}: { i: PV2Insight; nameOf: (k: string) => string; styles: ReturnType<typeof makeStyles> }) {
  const keys = i.structured_evidence?.constructKeys ?? [];
  return (
    <View style={styles.insight}>
      {keys.length > 0 && <Text style={styles.insightTag}>{keys.map(nameOf).join(' · ')}</Text>}
      <Text style={styles.cardText}>{i.generated_text}</Text>
    </View>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  scroll: { padding: spacing.xl, paddingBottom: 60 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  centeredText: { marginTop: 14, color: colors.textSecondary, fontSize: rs(14), textAlign: 'center' },
  eyebrow: { fontSize: rs(11), fontWeight: '800', letterSpacing: 1.4, color: colors.purpleSoft, marginBottom: 8 },
  title: { fontSize: rs(24), fontWeight: '800', color: colors.text, marginBottom: 8 },
  sub: { fontSize: rs(13), lineHeight: rs(19), color: colors.textSecondary, marginBottom: spacing.xl },
  card: { marginBottom: spacing.lg },
  cardTitle: { fontSize: rs(15), fontWeight: '800', color: colors.text },
  cardText: { fontSize: rs(13), lineHeight: rs(19), color: colors.textSecondary },
  domainHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 8 },
  narrative: { fontSize: rs(13), lineHeight: rs(19), color: colors.textSecondary, marginBottom: 10 },
  construct: {
    flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.borderSoft,
  },
  constructName: { fontSize: rs(13), fontWeight: '700', color: colors.text },
  constructDetail: { fontSize: rs(12), color: colors.textMuted, marginTop: 2 },
  chip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radii.pill, backgroundColor: colors.bgTertiary },
  chipText: { fontSize: rs(10), fontWeight: '700', color: colors.textSecondary },
  insight: { marginTop: 10 },
  insightTag: { fontSize: rs(11), fontWeight: '800', color: colors.purpleSoft, marginBottom: 3 },
  link: { color: colors.success, fontWeight: '800' },
  doneBtn: { backgroundColor: colors.success, borderRadius: radii.xl, paddingVertical: 16, alignItems: 'center', marginTop: spacing.md },
  doneText: { color: '#FFFFFF', fontSize: rs(15), fontWeight: '800' },
  eraseBtn: { alignItems: 'center', paddingVertical: 16 },
  eraseText: { color: colors.error, fontSize: rs(13), fontWeight: '700' },
});
