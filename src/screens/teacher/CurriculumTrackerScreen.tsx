import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import ScreenBackground from '../../components/ScreenBackground';
import GlassCard from '../../components/GlassCard';
import { useToast } from '../../context/ToastContext';
import { generateCurriculumTopics } from '../../utils/aiGenerators';
import {
  CurriculumTracker, getTrackers, saveTracker, deleteTracker, newTracker, nextStatus, progressPercent, TopicStatus,
} from '../../utils/curriculumTracker';
import { rs } from '../../utils/responsive';
import { radii, spacing, Palette } from '../../theme';
import { useTheme, useThemedStyles } from '../../context/ThemeContext';

const CURRICULA = ['NaCCA (Ghana)', 'GES', 'Cambridge', 'IB', 'Other'];
const STATUS_LABEL: Record<TopicStatus, string> = { outstanding: '○ Outstanding', in_progress: '◐ In progress', done: '● Done' };

/** Scheme-of-work progress: AI-suggested sub-topics per subject/class, tap a topic to advance its status. */
export default function CurriculumTrackerScreen() {
  const colors = useTheme();
  const styles = useThemedStyles(makeStyles);
  const toast = useToast();
  const [trackers, setTrackers] = useState<CurriculumTracker[]>([]);
  const [mode, setMode] = useState<'list' | 'new'>('list');
  const [subject, setSubject] = useState('');
  const [grade, setGrade] = useState('');
  const [mainTopic, setMainTopic] = useState('');
  const [curriculum, setCurriculum] = useState(CURRICULA[0]);
  const [busy, setBusy] = useState(false);

  useEffect(() => { getTrackers().then(setTrackers); }, []);
  const refresh = async () => setTrackers(await getTrackers());

  const create = async () => {
    if (!subject.trim() || !mainTopic.trim()) { toast.error('Subject and main topic are required.'); return; }
    setBusy(true);
    const input = { subject: subject.trim(), grade: grade.trim() || 'Any class', curriculum, mainTopic: mainTopic.trim() };
    const topics = await generateCurriculumTopics({ subject: input.subject, grade: input.grade, curriculum, mainTopic: input.mainTopic });
    setBusy(false);
    if (!topics) { toast.error('Could not suggest sub-topics right now. Try again in a moment.'); return; }
    await saveTracker(newTracker(input, topics));
    await refresh();
    setSubject(''); setGrade(''); setMainTopic('');
    setMode('list');
  };

  const advance = async (t: CurriculumTracker, topicId: string) => {
    await saveTracker({ ...t, topics: t.topics.map((x) => (x.id === topicId ? { ...x, status: nextStatus(x.status) } : x)) });
    await refresh();
  };

  const remove = (t: CurriculumTracker) =>
    Alert.alert('Delete tracker', `Delete "${t.subject}: ${t.mainTopic}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteTracker(t.id); await refresh(); } },
    ]);

  if (mode === 'new') {
    return (
      <ScreenBackground>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => setMode('list')} hitSlop={10}><Text style={styles.link}>← Trackers</Text></TouchableOpacity>
          <Text style={styles.h1}>New tracker</Text>
          <Text style={styles.label}>SUBJECT</Text>
          <TextInput style={styles.input} value={subject} onChangeText={setSubject} placeholder="e.g. Integrated Science" placeholderTextColor={colors.textSubtle} />
          <Text style={styles.label}>CLASS (optional)</Text>
          <TextInput style={styles.input} value={grade} onChangeText={setGrade} placeholder="e.g. JHS 2" placeholderTextColor={colors.textSubtle} />
          <Text style={styles.label}>MAIN TOPIC / STRAND</Text>
          <TextInput style={styles.input} value={mainTopic} onChangeText={setMainTopic} placeholder="e.g. Cells and living things" placeholderTextColor={colors.textSubtle} />
          <Text style={styles.label}>CURRICULUM</Text>
          <View style={styles.chips}>
            {CURRICULA.map((c) => (
              <TouchableOpacity key={c} onPress={() => setCurriculum(c)} accessibilityRole="button" accessibilityState={{ selected: c === curriculum }}
                style={[styles.chip, c === curriculum && styles.chipOn]}>
                <Text style={[styles.chipText, c === curriculum && { color: '#fff' }]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={[styles.btn, busy && { opacity: 0.6 }]} disabled={busy} onPress={create} accessibilityRole="button">
            {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Generate sub-topics</Text>}
          </TouchableOpacity>
          <Text style={styles.note}>✦ Suggested by AI. Edit your scheme of work to match your school’s.</Text>
        </ScrollView>
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.h1}>Curriculum Tracker</Text>
        <Text style={styles.meta}>Track scheme-of-work progress. Tap a topic to move it along.</Text>
        <TouchableOpacity style={styles.btn} onPress={() => setMode('new')} accessibilityRole="button">
          <Text style={styles.btnText}>+ New tracker</Text>
        </TouchableOpacity>
        {trackers.length === 0 && (
          <GlassCard variant="dark" padding={24} style={styles.card}><Text style={styles.body}>No trackers yet.</Text></GlassCard>
        )}
        {trackers.map((t) => {
          const pct = progressPercent(t.topics);
          return (
            <GlassCard key={t.id} variant="dark" padding={16} style={styles.card}>
              <Text style={styles.cardTitle}>{t.subject}: {t.mainTopic}</Text>
              <Text style={styles.meta}>{t.grade} · {t.curriculum}</Text>
              <View style={styles.track}><View style={[styles.fill, { width: `${pct}%` }]} /></View>
              <Text style={styles.pct}>{pct}% complete</Text>
              {t.topics.map((tp) => (
                <TouchableOpacity key={tp.id} onPress={() => advance(t, tp.id)} style={styles.topic} accessibilityRole="button"
                  accessibilityLabel={`${tp.title}, ${STATUS_LABEL[tp.status]}. Tap to change`}>
                  <Text style={[styles.body, { flex: 1 }, tp.status === 'done' && styles.done]}>{tp.title}</Text>
                  <Text style={styles.status}>{STATUS_LABEL[tp.status]} · {tp.estimatedHours}h</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity onPress={() => remove(t)} style={{ marginTop: 12 }}><Text style={styles.delete}>Delete tracker</Text></TouchableOpacity>
            </GlassCard>
          );
        })}
      </ScrollView>
    </ScreenBackground>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  scroll: { padding: spacing.xl, paddingBottom: 60 },
  h1: { fontSize: rs(24), fontWeight: '800', color: colors.text, marginTop: 6 },
  meta: { fontSize: rs(12), color: colors.textMuted, marginVertical: 6 },
  link: { color: colors.purpleSoft, fontWeight: '700', fontSize: rs(13) },
  label: { fontSize: rs(11), fontWeight: '800', letterSpacing: 1, color: colors.textMuted, marginTop: 14, marginBottom: 6 },
  input: { borderRadius: radii.lg, borderWidth: 1, borderColor: colors.borderSoft, backgroundColor: colors.glassLight, color: colors.text, padding: 12, fontSize: rs(14) },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: radii.pill, backgroundColor: colors.bgTertiary },
  chipOn: { backgroundColor: colors.purple },
  chipText: { fontSize: rs(12), color: colors.textSecondary, fontWeight: '700' },
  btn: { backgroundColor: colors.success, borderRadius: radii.xl, paddingVertical: 15, alignItems: 'center', marginTop: 18, marginBottom: 6 },
  btnText: { color: '#fff', fontWeight: '800', fontSize: rs(14) },
  note: { fontSize: rs(11), color: colors.textMuted, textAlign: 'center', marginTop: 10 },
  card: { marginTop: spacing.lg },
  cardTitle: { fontSize: rs(15), fontWeight: '800', color: colors.text },
  body: { fontSize: rs(13), lineHeight: rs(19), color: colors.textSecondary },
  track: { height: 8, borderRadius: 4, backgroundColor: colors.bgTertiary, overflow: 'hidden', marginTop: 8 },
  fill: { height: 8, borderRadius: 4, backgroundColor: colors.success },
  pct: { fontSize: rs(11), color: colors.textMuted, marginTop: 4, marginBottom: 6 },
  topic: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.borderSoft },
  done: { textDecorationLine: 'line-through', color: colors.textMuted },
  status: { fontSize: rs(11), color: colors.purpleSoft, fontWeight: '700' },
  delete: { color: colors.error, fontSize: rs(12), fontWeight: '700' },
});
