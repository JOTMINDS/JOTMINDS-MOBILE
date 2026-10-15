import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import ScreenBackground from '../../components/ScreenBackground';
import GlassCard from '../../components/GlassCard';
import { TeachingStrategiesCard, EducationalResourcesCard } from '../../components/ai/InsightCards';
import { studentStyles, studentScores, DOMAINS, Domain } from '../../utils/classInsights';
import { diagnoseStudentRisk } from '../../utils/riskDiagnostic';
import { rs } from '../../utils/responsive';
import { radii, spacing, Palette } from '../../theme';
import { useThemedStyles } from '../../context/ThemeContext';
import type { ScreenProps } from '../../navigation/types';

const RISK_COLOR = { high: '#DC2626', medium: '#E0A020', low: '#1E8A6E', unassessed: '#9ca3af' };
const RISK_LABEL = { high: 'At risk', medium: 'Needs support', low: 'On track', unassessed: 'Not started' };
const SEVERITY_COLOR = { critical: '#DC2626', moderate: '#E0A020', low: '#6B7280', positive: '#1E8A6E' };

const LABEL: Record<Domain, string> = { learning: 'Learning style', thinking: 'Thinking style', decision: 'Decision style' };

/** One student's cognitive profile for their teacher: styles, dimension scores, AI teaching strategies, observation shortcut. */
export default function StudentDetailScreen({ route, navigation }: ScreenProps<'StudentDetail'>) {
  const styles = useThemedStyles(makeStyles);
  const { student } = route.params;
  const st = studentStyles(student);
  const scores = studentScores(student);
  const has = DOMAINS.some((d) => st[d]);
  const dx = React.useMemo(() => diagnoseStudentRisk(student, student.assessments ?? []), [student]);

  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.head}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{(student.name || '?')[0].toUpperCase()}</Text></View>
          <Text style={styles.name}>{student.name}</Text>
          {!!student.email && <Text style={styles.meta}>{student.email}</Text>}
          <Text style={styles.meta}>
            {[student.className, student.studentCode && `Code ${student.studentCode}`].filter(Boolean).join(' · ')}
          </Text>
        </View>

        <GlassCard variant="dark" padding={16} style={styles.card}>
          <Text style={styles.cardTitle}>Cognitive profile</Text>
          {!has ? (
            <Text style={styles.text}>No assessment data yet. Once this student completes an assessment, their profile appears here.</Text>
          ) : (
            DOMAINS.map((d) => (
              <View key={d} style={styles.domain}>
                <Text style={styles.domainLabel}>{LABEL[d]}</Text>
                <Text style={styles.domainValue}>{st[d] ?? 'Not taken yet'}</Text>
                {Object.entries((scores[d] ?? {}) as Record<string, number>).map(([k, v]) => {
                  const n = Number(v);
                  return Number.isFinite(n) ? (
                    <View key={k} style={styles.dimRow}>
                      <Text style={styles.dimLabel}>{k}</Text>
                      <View style={styles.track}><View style={[styles.fill, { width: `${Math.max(2, Math.min(100, n))}%` }]} /></View>
                      <Text style={styles.dimVal}>{Math.round(n)}</Text>
                    </View>
                  ) : null;
                })}
              </View>
            ))
          )}
        </GlassCard>

        <GlassCard variant="dark" padding={16} style={styles.card}>
          <View style={styles.riskHead}>
            <Text style={styles.cardTitle}>Risk diagnostic</Text>
            <View style={[styles.riskPill, { backgroundColor: RISK_COLOR[dx.riskLevel] }]}>
              <Text style={styles.riskPillText}>{RISK_LABEL[dx.riskLevel]}</Text>
            </View>
          </View>
          <Text style={styles.domainValue}>{dx.primaryRiskFactor}</Text>
          <Text style={styles.text}>{dx.pedagogicalSummary}</Text>
          <Text style={[styles.meta, styles.dxMeta]}>
            Confidence {dx.diagnosticConfidence}% · Engagement {dx.metrics.engagementScore} · {dx.metrics.completedCount}/3 assessments
          </Text>
          <Text style={[styles.meta, styles.dxMeta]}>Pathway: {dx.learningPathway}</Text>

          {dx.rootCauses.map((rc) => (
            <View key={rc.title} style={[styles.cause, { borderLeftColor: SEVERITY_COLOR[rc.severity] }]}>
              <Text style={styles.causeTitle}>{rc.title}</Text>
              <Text style={styles.text}>{rc.explanation}</Text>
              <Text style={styles.impact}>{rc.impactOnLearning}</Text>
            </View>
          ))}

          {dx.interventions.length > 0 && <Text style={styles.subHead}>Recommended actions</Text>}
          {dx.interventions.map((iv, i) => (
            <View key={i} style={styles.action}>
              <Text style={styles.actionTag}>{iv.target} · {iv.priority}</Text>
              <Text style={styles.text}>{iv.action}</Text>
            </View>
          ))}
        </GlassCard>

        {has && (
          <TeachingStrategiesCard
            studentName={student.name}
            studentData={{ name: student.name, styles: st, scores }}
          />
        )}

        {has && <EducationalResourcesCard userType="teacher" styles={st} />}

        <TouchableOpacity
          style={styles.btn}
          onPress={() => navigation.navigate('ObservationLog')}
          accessibilityRole="button"
        >
          <Text style={styles.btnText}>📋 Record an observation</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenBackground>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  scroll: { padding: spacing.xl, paddingBottom: 60 },
  head: { alignItems: 'center', marginBottom: spacing.xl },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.success, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  avatarText: { color: '#FFFFFF', fontSize: rs(26), fontWeight: '800' },
  name: { fontSize: rs(22), fontWeight: '800', color: colors.text },
  meta: { fontSize: rs(12), color: colors.textMuted, marginTop: 3 },
  card: { marginBottom: spacing.lg },
  cardTitle: { fontSize: rs(15), fontWeight: '800', color: colors.text, marginBottom: 10 },
  text: { fontSize: rs(13), lineHeight: rs(19), color: colors.textSecondary },
  domain: { marginBottom: 14 },
  domainLabel: { fontSize: rs(11), fontWeight: '800', letterSpacing: 0.8, color: colors.purpleSoft },
  domainValue: { fontSize: rs(16), fontWeight: '800', color: colors.text, marginBottom: 6 },
  dimRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  dimLabel: { width: 96, fontSize: rs(11), color: colors.textSecondary },
  dimVal: { width: 30, textAlign: 'right', fontSize: rs(11), fontWeight: '700', color: colors.text },
  track: { flex: 1, height: 8, borderRadius: 4, backgroundColor: colors.bgTertiary, overflow: 'hidden' },
  fill: { height: 8, borderRadius: 4, backgroundColor: colors.cyan },
  riskHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  riskPill: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 3, marginBottom: 10 },
  riskPillText: { color: '#FFFFFF', fontSize: rs(11), fontWeight: '800' },
  dxMeta: { marginTop: 6 },
  cause: { borderLeftWidth: 3, paddingLeft: 10, marginTop: 12 },
  causeTitle: { fontSize: rs(13), fontWeight: '800', color: colors.text, marginBottom: 2 },
  impact: { fontSize: rs(12), lineHeight: rs(18), color: colors.textMuted, marginTop: 3, fontStyle: 'italic' },
  subHead: { fontSize: rs(11), fontWeight: '800', letterSpacing: 0.8, color: colors.purpleSoft, marginTop: 16, marginBottom: 6 },
  action: { marginBottom: 8 },
  actionTag: { fontSize: rs(11), fontWeight: '800', color: colors.cyan, marginBottom: 2 },
  btn: { backgroundColor: colors.success, borderRadius: radii.xl, paddingVertical: 15, alignItems: 'center', marginTop: spacing.sm },
  btnText: { color: '#FFFFFF', fontSize: rs(14), fontWeight: '800' },
});
