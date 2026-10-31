import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator,
} from 'react-native';
import ScreenBackground from '../../components/ScreenBackground';
import GlassCard from '../../components/GlassCard';
import AppIcon from '../../components/AppIcon';
import LessonToolsPanel from '../../components/teacher/LessonToolsPanel';
import { useToast } from '../../context/ToastContext';
import {
  generateLessonPlan, getLessonPlans, saveLessonPlan, updateLessonPlan, deleteLessonPlan,
  LessonPlan, planningStreak, getPreferredCurriculum, setPreferredCurriculum,
} from '../../utils/lessonPlannerApi';
import { CURRICULUM_FRAMEWORKS, DEFAULT_CURRICULUM, curriculumShortName } from '../../utils/curriculumFormats';
import { shareStreak } from '../../utils/streakShare';
import { rs } from '../../utils/responsive';
import { radii, spacing, Palette } from '../../theme';
import { useTheme, useThemedStyles } from '../../context/ThemeContext';

const DURATIONS = [30, 45, 60, 90];

export default function LessonPlannerScreen({ navigation }: any) {
  const colors = useTheme();
  const styles = useThemedStyles(makeStyles);
  const toast = useToast();

  const [mode, setMode] = useState<'list' | 'new' | 'view'>('list');
  const [plans, setPlans] = useState<LessonPlan[]>([]);
  const [active, setActive] = useState<LessonPlan | null>(null);
  const [generating, setGenerating] = useState(false);

  const [subject, setSubject] = useState('');
  const [gradeClass, setGradeClass] = useState('');
  const [topic, setTopic] = useState('');
  const [duration, setDuration] = useState(45);
  const [curriculum, setCurriculum] = useState<string>(DEFAULT_CURRICULUM);

  const streak = planningStreak(plans);

  useEffect(() => {
    getLessonPlans().then(setPlans);
    getPreferredCurriculum().then(setCurriculum);
  }, []);

  const generate = async () => {
    if (!subject.trim() || !topic.trim()) {
      toast.error('Subject and topic are required.');
      return;
    }
    setGenerating(true);
    const plan = await generateLessonPlan({ subject: subject.trim(), gradeClass: gradeClass.trim(), topic: topic.trim(), durationMinutes: duration, curriculum });
    setGenerating(false);
    if (!plan) {
      toast.error('Could not generate a plan right now. Try again in a moment.');
      return;
    }
    try {
      await saveLessonPlan(plan);
    } catch {
      toast.error('Could not save the plan to this device. Free up storage and try again.');
      return;
    }
    setPlans(await getLessonPlans());
    setActive(plan);
    setMode('view');
    void setPreferredCurriculum(curriculum);
    setSubject(''); setGradeClass(''); setTopic(''); setDuration(45);
  };

  const toggleDelivered = async () => {
    if (!active) return;
    const next = !active.delivered;
    await updateLessonPlan(active.id, { delivered: next });
    setActive({ ...active, delivered: next });
    setPlans(await getLessonPlans());
  };

  const remove = async (id: string) => {
    await deleteLessonPlan(id);
    setPlans(await getLessonPlans());
    if (active?.id === id) { setActive(null); setMode('list'); }
  };

  // ── New plan form ────────────────────────────────────────────────────────
  if (mode === 'new') {
    return (
      <ScreenBackground>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <TouchableOpacity onPress={() => setMode('list')} hitSlop={10} style={styles.backRow}>
            <Text style={styles.backText}>← Plans</Text>
          </TouchableOpacity>
          <Text style={styles.h1}>New lesson plan</Text>

          <Text style={styles.label}>SUBJECT</Text>
          <TextInput style={styles.input} value={subject} onChangeText={setSubject} placeholder="e.g. Integrated Science" placeholderTextColor={colors.textSubtle} />

          <Text style={styles.label}>GRADE / CLASS (optional)</Text>
          <TextInput style={styles.input} value={gradeClass} onChangeText={setGradeClass} placeholder="e.g. JHS 2" placeholderTextColor={colors.textSubtle} />

          <Text style={styles.label}>CURRICULUM</Text>
          <View style={styles.chipWrap}>
            {CURRICULUM_FRAMEWORKS.map((c) => (
              <TouchableOpacity
                key={c}
                style={[styles.chip, curriculum === c && styles.chipOn]}
                onPress={() => setCurriculum(c)}
                accessibilityRole="button"
                accessibilityState={{ selected: curriculum === c }}
              >
                <Text style={[styles.chipText, curriculum === c && styles.chipTextOn]}>{curriculumShortName(c)}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>TOPIC</Text>
          <TextInput style={styles.input} value={topic} onChangeText={setTopic} placeholder="e.g. Photosynthesis" placeholderTextColor={colors.textSubtle} />

          <Text style={styles.label}>DURATION</Text>
          <View style={styles.durationRow}>
            {DURATIONS.map((d) => (
              <TouchableOpacity
                key={d}
                style={[styles.durationChip, duration === d && styles.durationChipOn]}
                onPress={() => setDuration(d)}
              >
                <Text style={[styles.durationText, duration === d && styles.durationTextOn]}>{d}m</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={[styles.primaryBtn, generating && { opacity: 0.6 }]} onPress={generate} disabled={generating}>
            {generating
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.primaryBtnText}>Generate plan</Text>}
          </TouchableOpacity>
          <Text style={styles.aiNote}>AI-generated. Review before teaching.</Text>
        </ScrollView>
      </ScreenBackground>
    );
  }

  // ── View a plan ─────────────────────────────────────────────────────────
  if (mode === 'view' && active) {
    return (
      <ScreenBackground>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <TouchableOpacity onPress={() => setMode('list')} hitSlop={10} style={styles.backRow}>
            <Text style={styles.backText}>← Plans</Text>
          </TouchableOpacity>
          <Text style={styles.h1}>{active.topic}</Text>
          <Text style={styles.meta}>
            {active.subject}{active.gradeClass ? ` · ${active.gradeClass}` : ''} · {active.durationMinutes}m
            {active.curriculum ? ` · ${curriculumShortName(active.curriculum)}` : ''}
          </Text>

          <GlassCard variant="dark" padding={16} style={styles.card}>
            <Text style={styles.cardTitle}>Summary</Text>
            <Text style={styles.body}>{active.summary}</Text>
          </GlassCard>

          <GlassCard variant="dark" padding={16} style={styles.card}>
            <Text style={styles.cardTitle}>Objectives</Text>
            {active.objectives.map((o, i) => (
              <View key={i} style={styles.bulletRow}><Text style={styles.bullet}>•</Text><Text style={styles.body}>{o}</Text></View>
            ))}
          </GlassCard>

          {!!active.curriculumAlignment?.length && (
            <GlassCard variant="dark" padding={16} style={styles.card}>
              <Text style={styles.cardTitle}>{curriculumShortName(active.curriculum)} alignment</Text>
              {active.curriculumAlignment.map((a, i) => (
                <View key={i} style={{ marginBottom: 10 }}>
                  <Text style={styles.diffStyle}>{a.label}</Text>
                  {a.items.map((it, j) => <Text key={j} style={styles.body}>{it}</Text>)}
                </View>
              ))}
            </GlassCard>
          )}

          {!!active.phases?.length && (
            <GlassCard variant="dark" padding={16} style={styles.card}>
              <Text style={styles.cardTitle}>Lesson flow</Text>
              {active.phases.map((ph, i) => (
                <View key={i} style={{ marginBottom: 12 }}>
                  <Text style={styles.diffStyle}>{ph.name} · {ph.durationMinutes}m</Text>
                  <Text style={styles.body}>{ph.activity}</Text>
                  {!!ph.teachingNotes && <Text style={styles.answer}>Tip: {ph.teachingNotes}</Text>}
                </View>
              ))}
            </GlassCard>
          )}

          <GlassCard variant="dark" padding={16} style={styles.card}>
            <Text style={styles.cardTitle}>Differentiation</Text>
            {active.differentiationStrategies.map((d, i) => (
              <View key={i} style={{ marginBottom: 10 }}>
                <Text style={styles.diffStyle}>{d.style}</Text>
                <Text style={styles.body}>{d.activity}</Text>
              </View>
            ))}
          </GlassCard>

          <GlassCard variant="dark" padding={16} style={styles.card}>
            <Text style={styles.cardTitle}>Formative checks</Text>
            {active.assessmentQuestions.map((q, i) => (
              <View key={i} style={{ marginBottom: 10 }}>
                <Text style={styles.qText}>{i + 1}. {q.question}</Text>
                <Text style={styles.answer}>{q.answer}</Text>
              </View>
            ))}
          </GlassCard>

          <LessonToolsPanel
            plan={active}
            onPlanChange={(p) => { setActive(p); getLessonPlans().then(setPlans); }}
            onCopilot={() => navigation.navigate('AskJotti', {
              prompt: `I'm teaching "${active.topic}" (${active.subject}${active.gradeClass ? `, ${active.gradeClass}` : ''}, ${active.durationMinutes} minutes). Objectives: ${active.objectives.join('; ')}. Help me improve this lesson plan and anticipate where students might struggle.`,
            })}
          />

          <TouchableOpacity style={[styles.primaryBtn, active.delivered && styles.deliveredBtn]} onPress={toggleDelivered}>
            <Text style={styles.primaryBtnText}>{active.delivered ? '✓ Delivered' : 'Mark as delivered'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => remove(active.id)} style={styles.deleteRow}>
            <Text style={styles.deleteText}>Delete plan</Text>
          </TouchableOpacity>
        </ScrollView>
      </ScreenBackground>
    );
  }

  // ── List ────────────────────────────────────────────────────────────────
  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.h1}>Lesson Planner</Text>

        <View style={styles.actionRow}>
          <TouchableOpacity style={[styles.primaryBtn, styles.actionBtn]} onPress={() => setMode('new')} accessibilityRole="button">
            <Text style={styles.primaryBtnText}>+ New plan</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.secondaryBtn, styles.actionBtn]}
            onPress={() => navigation.navigate('CurriculumTracker')}
            accessibilityRole="button"
          >
            <Text style={styles.secondaryBtnText}>Curriculum tracker</Text>
          </TouchableOpacity>
        </View>

        {streak > 0 && (
          <GlassCard variant="dark" padding={16} style={styles.card}>
            <View style={styles.listRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.listTopic}>🔥 {streak}-day planning streak</Text>
                <Text style={styles.listMeta}>Plan a lesson every day to keep it going.</Text>
              </View>
              <TouchableOpacity onPress={() => shareStreak(streak, 'planning')} hitSlop={10} accessibilityRole="button" accessibilityLabel="Share streak">
                <Text style={{ color: colors.cyan, fontWeight: '800' }}>Share ↗</Text>
              </TouchableOpacity>
            </View>
          </GlassCard>
        )}

        {plans.length === 0 ? (
          <GlassCard variant="dark" padding={24} style={styles.card}>
            <Text style={styles.body}>No plans yet. Tap “New plan” to make your first.</Text>
          </GlassCard>
        ) : (
          plans.map((p) => (
            <GlassCard key={p.id} padding={16} style={styles.card} onPress={() => { setActive(p); setMode('view'); }}>
              <View style={styles.listRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.listTopic}>{p.topic}</Text>
                  <Text style={styles.listMeta}>{p.subject}{p.gradeClass ? ` · ${p.gradeClass}` : ''}{p.curriculum ? ` · ${curriculumShortName(p.curriculum)}` : ''}</Text>
                </View>
                {p.delivered && <View style={styles.deliveredPill}><Text style={styles.deliveredPillText}>Delivered</Text></View>}
                <AppIcon name="→" size={16} color={colors.textMuted} />
              </View>
            </GlassCard>
          ))
        )}
      </ScrollView>
    </ScreenBackground>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  scroll: { paddingHorizontal: spacing.xl, paddingTop: 12, paddingBottom: 48 },
  backRow: { marginBottom: 10 },
  backText: { fontSize: rs(14), color: colors.textMuted, fontWeight: '600' },
  h1: { fontSize: rs(24), fontWeight: '800', color: colors.text, letterSpacing: -0.5, marginBottom: 6 },
  meta: { fontSize: rs(13), color: colors.textMuted, marginBottom: 18, lineHeight: rs(19) },

  label: { fontSize: rs(11), fontWeight: '800', color: colors.textSubtle, letterSpacing: 1, marginTop: 14, marginBottom: 6 },
  input: {
    backgroundColor: colors.glassMedium, borderRadius: radii.md, borderWidth: 1, borderColor: colors.borderLight,
    padding: 14, fontSize: rs(14), color: colors.text,
  },
  durationRow: { flexDirection: 'row', gap: 8 },
  durationChip: {
    flex: 1, paddingVertical: 10, borderRadius: radii.md, alignItems: 'center',
    backgroundColor: colors.glassMedium, borderWidth: 1, borderColor: colors.borderLight,
  },
  durationChipOn: { backgroundColor: colors.purple, borderColor: colors.purple },
  durationText: { fontSize: rs(13), fontWeight: '700', color: colors.textMuted },
  durationTextOn: { color: '#fff' },

  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingVertical: 9, paddingHorizontal: 12, borderRadius: radii.md,
    backgroundColor: colors.glassMedium, borderWidth: 1.5, borderColor: colors.borderLight,
  },
  chipOn: { borderColor: colors.purple, backgroundColor: `${colors.purple}22` },
  chipText: { fontSize: rs(12), fontWeight: '600', color: colors.textSecondary },
  chipTextOn: { color: colors.text, fontWeight: '700' },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  actionBtn: { flex: 1, marginTop: 0 },
  secondaryBtn: {
    paddingVertical: 15, borderRadius: radii.md, alignItems: 'center',
    backgroundColor: colors.glassMedium, borderWidth: 1.5, borderColor: colors.purple,
  },
  secondaryBtnText: { color: colors.text, fontSize: rs(14), fontWeight: '800' },
  primaryBtn: { marginTop: 20, paddingVertical: 15, borderRadius: radii.md, alignItems: 'center', backgroundColor: colors.purple },
  deliveredBtn: { backgroundColor: colors.success },
  primaryBtnText: { color: '#fff', fontSize: rs(15), fontWeight: '800' },
  aiNote: { fontSize: rs(11), color: colors.textSubtle, textAlign: 'center', marginTop: 10 },

  card: { marginTop: 14 },
  cardTitle: { fontSize: rs(13), fontWeight: '800', color: colors.text, marginBottom: 10, letterSpacing: 0.3 },
  body: { fontSize: rs(13), color: colors.textSecondary, lineHeight: rs(20) },
  bulletRow: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  bullet: { fontSize: rs(13), color: colors.cyan, fontWeight: '900' },
  diffStyle: { fontSize: rs(12), fontWeight: '800', color: colors.cyan, marginBottom: 2 },
  qText: { fontSize: rs(13), fontWeight: '700', color: colors.text, lineHeight: rs(19) },
  answer: { fontSize: rs(12), color: colors.textMuted, lineHeight: rs(18), marginTop: 2 },

  listRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  listTopic: { fontSize: rs(15), fontWeight: '700', color: colors.text },
  listMeta: { fontSize: rs(12), color: colors.textMuted, marginTop: 2 },
  deliveredPill: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: radii.pill, backgroundColor: `${colors.success}22` },
  deliveredPillText: { fontSize: rs(10), fontWeight: '800', color: colors.success },

  deleteRow: { alignItems: 'center', marginTop: 14 },
  deleteText: { fontSize: rs(13), color: colors.error, fontWeight: '600' },
});
