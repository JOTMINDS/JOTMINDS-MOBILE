import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, RefreshControl, Share } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenBackground from '../../components/ScreenBackground';
import GlassCard from '../../components/GlassCard';
import { CombinedInsightsCard, ExecutiveSummaryCard } from '../../components/ai/InsightCards';
import { useAuth } from '../../context/AuthContext';
import { getAllAssessmentResults } from '../../utils/api';
import { domainLabel, REQUIRED_DOMAINS, CognitiveDomain } from '../../utils/profileCompleteness';
import { buildCognitiveReport, reportTips, reportText, CognitiveReport } from '../../utils/cognitiveReport';
import { rs } from '../../utils/responsive';
import { radii, spacing, Palette } from '../../theme';
import { useTheme, useThemedStyles } from '../../context/ThemeContext';
import type { ScreenProps } from '../../navigation/types';

const ICON: Record<CognitiveDomain, string> = { learning: '📚', thinking: '🧠', decision: '🎯' };
const GRAD: Record<CognitiveDomain, [string, string]> = {
  learning: ['#3D52C9', '#2E3FA8'], thinking: ['#6E4D9C', '#5A3E82'], decision: ['#EC4899', '#DB2777'],
};
const TIP_COLOR = ['#3B82F6', '#8B5CF6', '#F97316'];

/**
 * The full cognitive report: learning + thinking + decision combined — style cards, dimension scores,
 * AI summary and combined insights, practical tips and career/programme fit. Mirrors the webapp's
 * "Cognitive Profile" page. Until all three assessments are done it shows what's left to take.
 */
export default function CognitiveReportScreen({ navigation }: ScreenProps<'CognitiveReport'>) {
  const colors = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { user } = useAuth();
  const [report, setReport] = useState<CognitiveReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await getAllAssessmentResults();
      setReport(buildCognitiveReport(res?.results ?? []));
    } catch (e: any) {
      setError(e?.message ?? 'Could not load your results.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
    return navigation.addListener('focus', () => { void load(); });
  }, [load, navigation]);

  if (loading) {
    return <ScreenBackground><View style={styles.centered}><ActivityIndicator size="large" color={colors.purple} /></View></ScreenBackground>;
  }

  if (!report) {
    return (
      <ScreenBackground>
        <View style={styles.centered}>
          <Text style={styles.title}>Couldn’t load your report</Text>
          <Text style={styles.text}>{error}</Text>
          <TouchableOpacity onPress={() => { setLoading(true); void load(); }} style={{ marginTop: 16 }}><Text style={styles.link}>Try again</Text></TouchableOpacity>
        </View>
      </ScreenBackground>
    );
  }

  // ── Not finished yet ────────────────────────────────────────────────────────
  if (!report.complete) {
    const done = REQUIRED_DOMAINS.length - report.missing.length;
    return (
      <ScreenBackground>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.eyebrow}>FULL COGNITIVE REPORT</Text>
          <Text style={styles.title}>Complete your profile</Text>
          <Text style={styles.sub}>
            Your full report combines how you learn, think and decide. {done} of {REQUIRED_DOMAINS.length} assessments done.
          </Text>
          {REQUIRED_DOMAINS.map((d) => {
            const has = !!report.domains[d];
            return (
              <GlassCard key={d} variant="dark" padding={16} style={styles.card}
                onPress={has ? undefined : () => navigation.navigate('AssessmentTaking', { assessmentType: d })}>
                <View style={styles.row}>
                  <Text style={styles.bigIcon}>{has ? '✅' : ICON[d]}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{domainLabel(d)}</Text>
                    <Text style={styles.text}>{has ? report.domains[d]!.style : 'Not taken yet — tap to start'}</Text>
                  </View>
                </View>
              </GlassCard>
            );
          })}
        </ScrollView>
      </ScreenBackground>
    );
  }

  const { learning, thinking, decision } = report.domains;
  const styleNames = { learning: learning!.style, thinking: thinking!.style, decision: decision!.style };
  const tips = reportTips(styleNames);
  const text = reportText(report, { name: user?.name });

  return (
    <ScreenBackground>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); void load(); }} tintColor={colors.purple} />}
      >
        <Text style={styles.eyebrow}>FULL COGNITIVE REPORT</Text>
        <Text style={styles.title}>{user?.name ? `${user.name}’s profile` : 'Your cognitive profile'}</Text>
        {!!report.latestAt && <Text style={styles.sub}>Updated {new Date(report.latestAt).toLocaleDateString()}</Text>}

        {REQUIRED_DOMAINS.map((d) => {
          const dom = report.domains[d]!;
          return (
            <LinearGradient key={d} colors={GRAD[d]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
              <Text style={styles.heroLabel}>{ICON[d]}  {domainLabel(d).toUpperCase()}</Text>
              <Text style={styles.heroStyle}>{dom.style}</Text>
              {!!dom.description && <Text style={styles.heroDesc}>{dom.description}</Text>}
              {!!dom.completedAt && <Text style={styles.heroDate}>Completed {new Date(dom.completedAt).toLocaleDateString()}</Text>}
            </LinearGradient>
          );
        })}

        <ExecutiveSummaryCard
          profile={{ name: user?.name, position: user?.position, learning: styleNames.learning, thinking: styleNames.thinking, decision: styleNames.decision }}
        />

        {REQUIRED_DOMAINS.map((d) => {
          const entries = Object.entries(report.domains[d]!.scores);
          if (entries.length === 0) return null;
          return (
            <GlassCard key={d} variant="dark" padding={16} style={styles.card}>
              <Text style={styles.cardTitle}>{domainLabel(d)} dimensions</Text>
              {entries.map(([k, v]) => {
                const n = Math.max(0, Math.min(100, Math.round(Number(v) || 0)));
                return (
                  <View key={k} style={styles.barRow}>
                    <Text style={styles.barLabel}>{k.charAt(0).toUpperCase() + k.slice(1)}</Text>
                    <View style={styles.track}><View style={[styles.fill, { width: `${Math.max(2, n)}%`, backgroundColor: GRAD[d][0] }]} /></View>
                    <Text style={styles.barVal}>{n}</Text>
                  </View>
                );
              })}
            </GlassCard>
          );
        })}

        <CombinedInsightsCard
          params={{
            userName: user?.name,
            kolbStyle: styleNames.learning, sternbergStyle: styleNames.thinking, dualProcessStyle: styleNames.decision,
            scores: { learning: learning!.scores, thinking: thinking!.scores, decision: decision!.scores },
          }}
        />

        <GlassCard variant="dark" padding={16} style={styles.card}>
          <Text style={styles.cardTitle}>Putting your profile to work</Text>
          {tips.map((t, i) => (
            <View key={t.title} style={[styles.tip, { borderLeftColor: TIP_COLOR[i] }]}>
              <Text style={styles.tipTitle}>{t.title}</Text>
              <Text style={styles.text}>{t.body}</Text>
            </View>
          ))}
        </GlassCard>

        {report.mapping && (
          <GlassCard variant="dark" padding={16} style={styles.card}>
            <Text style={styles.cardTitle}>Career & programme fit</Text>
            {report.mapping.shsTrack.length > 0 && <Fit label="SHS TRACK" value={report.mapping.shsTrack.join(', ')} styles={styles} />}
            {report.mapping.tertiaryFocus.length > 0 && <Fit label="TERTIARY FOCUS" value={report.mapping.tertiaryFocus.join(', ')} styles={styles} />}
            {report.mapping.careerSuggestions.length > 0 && <Fit label="CAREERS TO EXPLORE" value={report.mapping.careerSuggestions.join(', ')} styles={styles} />}
            {!!report.mapping.decisionTip && <Fit label="DECISION TIP" value={report.mapping.decisionTip} styles={styles} />}
          </GlassCard>
        )}

        {text && (
          <TouchableOpacity style={styles.btn} onPress={() => Share.share({ message: text }).catch(() => {})} accessibilityRole="button">
            <Text style={styles.btnText}>Share my profile 📤</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.retakeHead}>RETAKE AN ASSESSMENT</Text>
        <View style={styles.retakeRow}>
          {REQUIRED_DOMAINS.map((d) => (
            <TouchableOpacity key={d} onPress={() => navigation.navigate('AssessmentTaking', { assessmentType: d })} accessibilityRole="button" style={styles.retake}>
              <Text style={styles.retakeText}>{ICON[d]} {domainLabel(d)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </ScreenBackground>
  );
}

function Fit({ label, value, styles }: { label: string; value: string; styles: ReturnType<typeof makeStyles> }) {
  return (
    <View style={{ marginTop: 10 }}>
      <Text style={styles.fitLabel}>{label}</Text>
      <Text style={styles.text}>{value}</Text>
    </View>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  scroll: { padding: spacing.xl, paddingBottom: 60 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  eyebrow: { fontSize: rs(11), fontWeight: '800', letterSpacing: 1.4, color: colors.purpleSoft, marginBottom: 6 },
  title: { fontSize: rs(24), fontWeight: '800', color: colors.text },
  sub: { fontSize: rs(13), color: colors.textMuted, marginTop: 4, marginBottom: spacing.lg, lineHeight: rs(19) },
  text: { fontSize: rs(13), lineHeight: rs(19), color: colors.textSecondary },
  link: { color: colors.success, fontWeight: '800', fontSize: rs(13) },
  card: { marginBottom: spacing.lg },
  cardTitle: { fontSize: rs(15), fontWeight: '800', color: colors.text, marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  bigIcon: { fontSize: rs(26) },
  hero: { borderRadius: radii.xl, padding: 20, marginBottom: spacing.lg },
  heroLabel: { fontSize: rs(11), fontWeight: '800', letterSpacing: 1.2, color: 'rgba(255,255,255,0.75)' },
  heroStyle: { fontSize: rs(24), fontWeight: '800', color: '#FFFFFF', marginVertical: 4 },
  heroDesc: { fontSize: rs(13), lineHeight: rs(19), color: 'rgba(255,255,255,0.9)' },
  heroDate: { fontSize: rs(11), color: 'rgba(255,255,255,0.65)', marginTop: 8 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 9 },
  barLabel: { width: 96, fontSize: rs(12), color: colors.textSecondary, fontWeight: '600' },
  barVal: { width: 30, textAlign: 'right', fontSize: rs(12), fontWeight: '700', color: colors.text },
  track: { flex: 1, height: 9, borderRadius: 5, backgroundColor: colors.bgTertiary, overflow: 'hidden' },
  fill: { height: 9, borderRadius: 5 },
  tip: { borderLeftWidth: 4, paddingLeft: 12, marginTop: 12 },
  tipTitle: { fontSize: rs(13), fontWeight: '800', color: colors.text, marginBottom: 3 },
  fitLabel: { fontSize: rs(11), fontWeight: '800', letterSpacing: 1, color: colors.purpleSoft, marginBottom: 2 },
  btn: { backgroundColor: colors.success, borderRadius: radii.xl, paddingVertical: 15, alignItems: 'center', marginTop: spacing.sm },
  btnText: { color: '#FFFFFF', fontWeight: '800', fontSize: rs(14) },
  retakeHead: { fontSize: rs(11), fontWeight: '800', letterSpacing: 1, color: colors.textMuted, marginTop: spacing.xl, marginBottom: 8 },
  retakeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  retake: { paddingHorizontal: 12, paddingVertical: 9, borderRadius: radii.pill, backgroundColor: colors.bgTertiary },
  retakeText: { fontSize: rs(12), fontWeight: '700', color: colors.textSecondary },
});
