import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import ScreenBackground from '../../components/ScreenBackground';
import AppIcon from '../../components/AppIcon';
import {
  getShuffledJTIAQuestionSet,
  jtiaDomainDescriptions,
  JTIADomain,
  JTIAQuestion,
} from '../../data/jtiaQuestions';
import { calculateJTIAScore } from '../../utils/jtiaScoring';
import { recordAssessmentCompletion } from '../../utils/gamificationApi';
import { markJTIADone } from '../../utils/jtiaStatus';
import { submitAssessment } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { rs } from '../../utils/responsive';
import { radii, spacing, Palette } from '../../theme';
import { useTheme, useThemedStyles } from '../../context/ThemeContext';

// Same 5-point scale as the webapp's JTIAAssessmentTaking.
const SCALE = [
  { value: 5, label: 'Consistently', hint: 'Exemplary standard in my practice', tint: '#10B981' },
  { value: 4, label: 'Frequently', hint: 'Consistently applies in my practice', tint: '#3D52C9' },
  { value: 3, label: 'Moderately', hint: 'Applies sometimes', tint: '#8A97B2' },
  { value: 2, label: 'Occasionally', hint: 'Applies inconsistently', tint: '#6E4D9C' },
  { value: 1, label: 'Seldom', hint: 'Rarely applies in my practice', tint: '#EC4899' },
];

const FORMATS = [
  { count: 12, badge: 'Quick Snapshot', title: 'Brief Overview', blurb: 'Fast diagnostic across key teaching scenarios.', mins: '~3 min' },
  { count: 60, badge: 'Standard', title: 'Standard Profile', blurb: 'Balanced assessment with deep domain insights.', mins: '~12 min' },
  { count: 120, badge: 'Comprehensive', title: 'Comprehensive Profile', blurb: 'Complete evaluation of every sub-competency.', mins: '~25 min' },
];

const DOMAIN_ICON: Record<JTIADomain, string> = {
  'Cognitive Intelligence': '🧠',
  'Instructional Intelligence': '📖',
  'Classroom Leadership': '🧭',
  'Relationship Intelligence': '🤝',
  'Professional Intelligence': '🎖️',
};

export default function JTIAAssessmentScreen({ navigation }: any) {
  const colors = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { user } = useAuth();
  const toast = useToast();

  const [session, setSession] = useState<JTIAQuestion[] | null>(null);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);

  const start = (count: number) => {
    setSession(getShuffledJTIAQuestionSet({ totalQuestions: count, useFullBank: true }));
    setIndex(0);
    setAnswers({});
  };

  const responsesArray = useMemo(
    () => (session ? session.map((q) => answers[q.id] ?? 0) : []),
    [session, answers],
  );

  const finish = async (finalAnswers: Record<number, number>) => {
    if (!session) return;
    setSubmitting(true);
    const responses = session.map((q) => finalAnswers[q.id] ?? 0);
    const report = calculateJTIAScore(responses, session);

    // Persist locally (fast completion checks + results screen fallback).
    await markJTIADone(report);
    if (user?.id) recordAssessmentCompletion(user.id).catch(() => {});

    // Sync to the backend in the same shape the webapp stores JTIA:
    // under the `teaching-style` key with a `{ jtia: report }` payload.
    try {
      await submitAssessment(
        'teaching-style',
        responses.map((val, i) => ({ questionId: i + 1, value: val })),
        { jtia: report },
        [], [], [],
      );
    } catch {
      // Non-fatal — the local copy still lets the user see their results.
    }

    setSubmitting(false);
    navigation.replace('JTIAResults', { report });
  };

  const choose = (value: number) => {
    if (!session) return;
    const q = session[index];
    const updated = { ...answers, [q.id]: value };
    setAnswers(updated);
    if (index < session.length - 1) {
      setTimeout(() => setIndex((i) => i + 1), 120);
    }
  };

  // ── Format selector ──────────────────────────────────────────────────────
  if (!session) {
    return (
      <ScreenBackground>
        <ScrollView contentContainerStyle={styles.selectScroll} showsVerticalScrollIndicator={false}>
          <View style={styles.topBar}>
            <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12} accessibilityRole="button" accessibilityLabel="Back">
              <AppIcon name="✕" size={22} color={colors.textMuted} />
            </TouchableOpacity>
            <Text style={styles.framework}>JTIA</Text>
            <View style={{ width: 22 }} />
          </View>

          <Text style={styles.selectTitle}>Teacher Intelligence Assessment</Text>
          <Text style={styles.selectBlurb}>
            Choose the depth that fits your schedule. Every option samples evenly across the
            five core teacher domains.
          </Text>

          <View style={styles.domainRow}>
            {(Object.keys(jtiaDomainDescriptions) as JTIADomain[]).map((d) => (
              <View key={d} style={styles.domainChip}>
                <Text style={styles.domainChipIcon}>{DOMAIN_ICON[d]}</Text>
                <Text style={styles.domainChipText}>{d.replace(' Intelligence', '')}</Text>
              </View>
            ))}
          </View>

          {FORMATS.map((f) => (
            <TouchableOpacity
              key={f.count}
              activeOpacity={0.85}
              style={styles.formatCard}
              onPress={() => start(f.count)}
              accessibilityRole="button"
              accessibilityLabel={`${f.title}, ${f.count} questions, ${f.mins}`}
            >
              <View style={styles.formatHeaderRow}>
                <Text style={styles.formatBadge}>{f.badge}</Text>
                <Text style={styles.formatMins}>{f.mins}</Text>
              </View>
              <Text style={styles.formatTitle}>{f.title}</Text>
              <Text style={styles.formatBlurb}>{f.blurb}</Text>
              <Text style={styles.formatCount}>{f.count} items  →</Text>
            </TouchableOpacity>
          ))}

          <View style={styles.notice}>
            <AppIcon name="🛡️" size={14} color={colors.success} />
            <Text style={styles.noticeText}>
              Designed for development, not ranking. Your answers generate personalized growth pathways.
            </Text>
          </View>
        </ScrollView>
      </ScreenBackground>
    );
  }

  // ── Question flow ────────────────────────────────────────────────────────
  const question = session[index];
  const total = session.length;
  const answered = responsesArray.filter((r) => r > 0).length;
  const progress = ((index + 1) / total) * 100;
  const isLast = index === total - 1;
  const currentValue = answers[question.id];

  return (
    <ScreenBackground>
      <View style={styles.container}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12} accessibilityRole="button" accessibilityLabel="Exit assessment">
            <AppIcon name="✕" size={22} color={colors.textMuted} />
          </TouchableOpacity>
          <Text style={styles.framework}>JTIA · {answered}/{total}</Text>
          <View style={{ width: 22 }} />
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>

        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          <Text style={styles.counter}>
            {question.domain.replace(' Intelligence', '').toUpperCase()} · {question.subCompetency}
          </Text>
          <Text style={styles.question}>{question.text}</Text>

          <View style={styles.options}>
            {SCALE.map((opt) => {
              const isSel = currentValue === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  activeOpacity={0.85}
                  style={[styles.option, isSel && { borderColor: opt.tint, backgroundColor: `${opt.tint}22` }]}
                  onPress={() => choose(opt.value)}
                  accessibilityRole="button"
                  accessibilityLabel={`${opt.label}. ${opt.hint}`}
                >
                  <View style={[styles.dot, { borderColor: opt.tint }, isSel && { backgroundColor: opt.tint }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.optionText, isSel && { color: colors.text, fontWeight: '700' }]}>{opt.label}</Text>
                    <Text style={styles.optionHint}>{opt.hint}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          {index > 0 ? (
            <TouchableOpacity onPress={() => setIndex((i) => i - 1)} hitSlop={10} accessibilityRole="button" accessibilityLabel="Previous question">
              <Text style={styles.footerBtn}>← Previous</Text>
            </TouchableOpacity>
          ) : <View />}

          {isLast ? (
            <TouchableOpacity
              onPress={() => finish(answers)}
              disabled={submitting}
              accessibilityRole="button"
              accessibilityLabel="Complete assessment"
            >
              <Text style={[styles.footerBtn, { color: colors.success, fontWeight: '800' }]}>
                {submitting ? 'Scoring…' : 'Complete ✓'}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => setIndex((i) => Math.min(total - 1, i + 1))} hitSlop={10} accessibilityRole="button" accessibilityLabel="Next question">
              <Text style={styles.footerBtn}>Skip →</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScreenBackground>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  container: { flex: 1, paddingHorizontal: spacing.xl, paddingTop: 8 },
  selectScroll: { paddingHorizontal: spacing.xl, paddingTop: 8, paddingBottom: 40 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  framework: { fontSize: rs(13), fontWeight: '700', color: colors.textMuted, letterSpacing: 0.3 },

  selectTitle: { fontSize: rs(26), fontWeight: '800', color: colors.text, letterSpacing: -0.5, marginTop: 8, marginBottom: 10 },
  selectBlurb: { fontSize: rs(14), color: colors.textMuted, lineHeight: rs(21), marginBottom: 20 },
  domainRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  domainChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 7, paddingHorizontal: 12, borderRadius: radii.md,
    backgroundColor: colors.glassMedium, borderWidth: 1, borderColor: colors.borderLight,
  },
  domainChipIcon: { fontSize: rs(13) },
  domainChipText: { fontSize: rs(12), fontWeight: '600', color: colors.textSecondary },

  formatCard: {
    borderRadius: radii.lg, backgroundColor: colors.glassMedium,
    borderWidth: 1.5, borderColor: colors.borderLight, padding: 18, marginBottom: 14,
  },
  formatHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  formatBadge: { fontSize: rs(11), fontWeight: '800', color: colors.cyan, letterSpacing: 1 },
  formatMins: { fontSize: rs(12), color: colors.textMuted, fontWeight: '600' },
  formatTitle: { fontSize: rs(18), fontWeight: '800', color: colors.text, marginBottom: 4 },
  formatBlurb: { fontSize: rs(13), color: colors.textMuted, lineHeight: rs(19), marginBottom: 12 },
  formatCount: { fontSize: rs(13), fontWeight: '700', color: colors.textSecondary },

  notice: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8,
    padding: 12, borderRadius: radii.md,
    backgroundColor: colors.glassMedium, borderWidth: 1, borderColor: colors.borderLight,
  },
  noticeText: { flex: 1, fontSize: rs(12), color: colors.textMuted, lineHeight: rs(17) },

  progressTrack: { height: 4, backgroundColor: colors.bgTertiary, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 2, backgroundColor: colors.success },
  body: { flexGrow: 1, justifyContent: 'center', paddingVertical: 24 },
  counter: { fontSize: rs(12), fontWeight: '700', color: colors.success, letterSpacing: 1, marginBottom: 16, textAlign: 'center' },
  question: {
    fontSize: rs(21), fontWeight: '800', color: colors.text, textAlign: 'center',
    lineHeight: rs(29), letterSpacing: -0.4, marginBottom: 32, paddingHorizontal: 4,
  },
  options: { gap: 10 },
  option: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingVertical: 15, paddingHorizontal: 16, borderRadius: radii.lg,
    backgroundColor: colors.glassMedium, borderWidth: 1.5, borderColor: colors.borderLight,
  },
  dot: { width: 20, height: 20, borderRadius: 10, borderWidth: 2 },
  optionText: { fontSize: rs(15), color: colors.textSecondary, fontWeight: '600' },
  optionHint: { fontSize: rs(11), color: colors.textMuted, marginTop: 2 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 18, minHeight: 58 },
  footerBtn: { fontSize: rs(15), color: colors.textMuted, fontWeight: '600' },
});
