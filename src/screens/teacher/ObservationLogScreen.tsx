import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Alert, Switch,
} from 'react-native';
import ScreenBackground from '../../components/ScreenBackground';
import GlassCard from '../../components/GlassCard';
import AppIcon from '../../components/AppIcon';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { loadTeacherStudents } from '../../utils/teacherStudents';
import {
  createTeacherObservation, getTeacherObservations, deleteTeacherObservation,
  CONCERN_TYPES, ConcernType, Severity, TeacherObservation,
} from '../../utils/observationApi';
import { rs } from '../../utils/responsive';
import { radii, spacing, Palette } from '../../theme';
import { useTheme, useThemedStyles } from '../../context/ThemeContext';
import type { ScreenProps } from '../../navigation/types';

const SEVERITIES: { key: Severity; label: string; tint: string }[] = [
  { key: 'low', label: 'Low', tint: '#10B981' },
  { key: 'medium', label: 'Medium', tint: '#F59E0B' },
  { key: 'high', label: 'High', tint: '#EC4899' },
];

const severityTint = (s: Severity) => SEVERITIES.find((x) => x.key === s)?.tint ?? '#8A97B2';

/**
 * A teacher's observation notes. Opened from a student's profile it is scoped to that
 * student (list filtered, new notes pre-addressed); without a student it shows every note.
 */
export default function ObservationLogScreen({ route }: ScreenProps<'ObservationLog'>) {
  const lockedId = route.params?.studentId;
  const lockedName = route.params?.studentName;
  const colors = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { user } = useAuth();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [observations, setObservations] = useState<TeacherObservation[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [mode, setMode] = useState<'list' | 'new'>(route.params?.startNew ? 'new' : 'list');

  const [studentId, setStudentId] = useState(lockedId ?? '');
  const [concernType, setConcernType] = useState<ConcernType>('Academic Focus');
  const [severity, setSeverity] = useState<Severity>('low');
  const [text, setText] = useState('');
  const [action, setAction] = useState('');
  const [share, setShare] = useState(true);
  const [busy, setBusy] = useState(false);

  const [loadError, setLoadError] = useState<string | null>(null);
  const [rosterError, setRosterError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [obs, studs] = await Promise.allSettled([
      user?.id ? getTeacherObservations(user.id) : Promise.resolve([] as TeacherObservation[]),
      loadTeacherStudents(),
    ]);
    // On failure keep whatever is already on screen and say so, rather than
    // presenting an empty list or roster as if it were the truth.
    if (obs.status === 'fulfilled') { setObservations(obs.value); setLoadError(null); }
    else setLoadError(obs.reason?.message || 'Could not load your observations.');
    if (studs.status === 'fulfilled') { setStudents(studs.value.students); setRosterError(null); }
    else setRosterError(studs.reason?.message || 'Could not load your students.');
    setLoading(false);
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    // Opened from a profile, the student is known even if the roster hasn't loaded.
    const student = students.find((s) => s.id === studentId) ?? (lockedId ? { id: lockedId, name: lockedName ?? 'Student' } : undefined);
    if (!studentId || !student) { toast.error('Pick a student.'); return; }
    if (text.trim().length < 5) { toast.error('Add a bit more detail to the observation.'); return; }
    setBusy(true);
    const { observation, error } = await createTeacherObservation({
      studentId,
      studentName: student.name,
      concernType,
      severity,
      observationText: text.trim(),
      recommendedAction: action.trim() || undefined,
      shareWithParent: share,
    });
    setBusy(false);
    if (error || !observation) {
      toast.error(error || 'Could not save. The observation route may not be deployed yet.');
      return;
    }
    toast.success(share ? 'Saved and shared with parent' : 'Saved to your log');
    setStudentId(lockedId ?? ''); setText(''); setAction(''); setConcernType('Academic Focus'); setSeverity('low'); setShare(true);
    setMode('list');
    load();
  };

  const remove = (o: TeacherObservation) => {
    Alert.alert('Delete observation', `Delete your note about ${o.studentName}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        if (await deleteTeacherObservation(o.id)) load();
        else toast.error('Could not delete the observation. Check your connection and try again.');
      } },
    ]);
  };

  const visible = lockedId ? observations.filter((o) => o.studentId === lockedId) : observations;

  if (loading) {
    return <ScreenBackground><View style={styles.centered}><ActivityIndicator size="large" color={colors.purple} /></View></ScreenBackground>;
  }

  // ── New observation ─────────────────────────────────────────────────────
  if (mode === 'new') {
    return (
      <ScreenBackground>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <TouchableOpacity onPress={() => setMode('list')} hitSlop={10} style={styles.backRow}>
            <Text style={styles.backText}>← Log</Text>
          </TouchableOpacity>
          <Text style={styles.h1}>New observation</Text>

          <Text style={styles.label}>STUDENT</Text>
          {lockedId ? (
            <View style={styles.chipWrap}>
              <View style={[styles.chip, styles.chipOn]}>
                <Text style={[styles.chipText, styles.chipTextOn]}>{lockedName ?? students.find((s) => s.id === lockedId)?.name ?? 'Student'}</Text>
              </View>
            </View>
          ) : students.length === 0 && rosterError ? (
            <TouchableOpacity onPress={load} accessibilityRole="button">
              <Text style={styles.emptyText}>Couldn't load your students ({rosterError}). Tap to retry.</Text>
            </TouchableOpacity>
          ) : students.length === 0 ? (
            <Text style={styles.emptyText}>No students on your roster yet.</Text>
          ) : (
            <View style={styles.chipWrap}>
              {students.map((s) => (
                <TouchableOpacity
                  key={s.id}
                  style={[styles.chip, studentId === s.id && styles.chipOn]}
                  onPress={() => setStudentId(s.id)}
                >
                  <Text style={[styles.chipText, studentId === s.id && styles.chipTextOn]}>{s.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Text style={styles.label}>TYPE</Text>
          <View style={styles.chipWrap}>
            {CONCERN_TYPES.map((ct) => (
              <TouchableOpacity key={ct} style={[styles.chip, concernType === ct && styles.chipOn]} onPress={() => setConcernType(ct)}>
                <Text style={[styles.chipText, concernType === ct && styles.chipTextOn]}>{ct}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>SEVERITY</Text>
          <View style={styles.chipWrap}>
            {SEVERITIES.map((s) => (
              <TouchableOpacity
                key={s.key}
                style={[styles.chip, severity === s.key && { borderColor: s.tint, backgroundColor: `${s.tint}22` }]}
                onPress={() => setSeverity(s.key)}
              >
                <Text style={[styles.chipText, severity === s.key && { color: colors.text, fontWeight: '700' }]}>{s.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>OBSERVATION</Text>
          <TextInput style={[styles.input, styles.textArea]} value={text} onChangeText={setText} multiline placeholder="What did you notice?" placeholderTextColor={colors.textSubtle} />

          <Text style={styles.label}>RECOMMENDED ACTION (optional)</Text>
          <TextInput style={[styles.input, styles.textArea]} value={action} onChangeText={setAction} multiline placeholder="What could help at home / next lesson?" placeholderTextColor={colors.textSubtle} />

          <View style={styles.shareRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.shareTitle}>Share with parent</Text>
              <Text style={styles.shareSub}>Visible to the student's linked parent in their dashboard.</Text>
            </View>
            <Switch value={share} onValueChange={setShare} trackColor={{ false: colors.bgTertiary, true: colors.purple }} thumbColor="#fff" />
          </View>

          <TouchableOpacity style={[styles.primaryBtn, busy && { opacity: 0.6 }]} onPress={save} disabled={busy}>
            {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Save observation</Text>}
          </TouchableOpacity>
        </ScrollView>
      </ScreenBackground>
    );
  }

  // ── List ────────────────────────────────────────────────────────────────
  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.h1}>{lockedId ? 'Observations' : 'Observation Log'}</Text>
        <Text style={styles.meta}>{lockedId ? (lockedName ?? '') : 'Private notes, or share with a parent.'}</Text>

        <TouchableOpacity style={styles.primaryBtn} onPress={() => setMode('new')}>
          <Text style={styles.primaryBtnText}>+ New observation</Text>
        </TouchableOpacity>

        {!!loadError && (
          <GlassCard variant="dark" padding={16} style={styles.card}>
            <Text style={styles.obsStudent}>Couldn't load your observations</Text>
            <Text style={styles.emptyText}>{loadError}</Text>
            <TouchableOpacity onPress={load} accessibilityRole="button" hitSlop={8} style={{ marginTop: 8 }}>
              <Text style={styles.deleteText}>Tap to retry</Text>
            </TouchableOpacity>
          </GlassCard>
        )}

        {visible.length === 0 ? (
          loadError ? null : (
            <GlassCard variant="dark" padding={24} style={styles.card}>
              <Text style={styles.emptyText}>No observations yet.</Text>
            </GlassCard>
          )
        ) : (
          visible.map((o) => (
            <GlassCard key={o.id} padding={16} style={styles.card}>
              <View style={styles.obsHead}>
                <Text style={styles.obsStudent}>{o.studentName || 'Student'}</Text>
                <View style={[styles.sevPill, { backgroundColor: `${severityTint(o.severity)}22` }]}>
                  <Text style={[styles.sevPillText, { color: severityTint(o.severity) }]}>{o.severity}</Text>
                </View>
              </View>
              <Text style={styles.obsType}>{o.concernType}{o.sharedWithParent ? ' · shared' : ' · private'}</Text>
              <Text style={styles.obsBody}>{o.observationText}</Text>
              {o.recommendedAction ? <Text style={styles.obsAction}>→ {o.recommendedAction}</Text> : null}
              <View style={styles.obsFoot}>
                <Text style={styles.obsDate}>{new Date(o.createdAt).toLocaleDateString()}</Text>
                <TouchableOpacity onPress={() => remove(o)} hitSlop={8}><Text style={styles.deleteText}>Delete</Text></TouchableOpacity>
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
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  backRow: { marginBottom: 10 },
  backText: { fontSize: rs(14), color: colors.textMuted, fontWeight: '600' },
  h1: { fontSize: rs(24), fontWeight: '800', color: colors.text, letterSpacing: -0.5, marginBottom: 6 },
  meta: { fontSize: rs(13), color: colors.textMuted, marginBottom: 16, lineHeight: rs(19) },
  emptyText: { fontSize: rs(13), color: colors.textMuted, lineHeight: rs(20) },

  label: { fontSize: rs(11), fontWeight: '800', color: colors.textSubtle, letterSpacing: 1, marginTop: 16, marginBottom: 8 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingVertical: 8, paddingHorizontal: 12, borderRadius: radii.md,
    backgroundColor: colors.glassMedium, borderWidth: 1.5, borderColor: colors.borderLight,
  },
  chipOn: { borderColor: colors.purple, backgroundColor: `${colors.purple}22` },
  chipText: { fontSize: rs(12), fontWeight: '600', color: colors.textSecondary },
  chipTextOn: { color: colors.text, fontWeight: '700' },

  input: {
    backgroundColor: colors.glassMedium, borderRadius: radii.md, borderWidth: 1, borderColor: colors.borderLight,
    padding: 13, fontSize: rs(14), color: colors.text,
  },
  textArea: { minHeight: 84, textAlignVertical: 'top' },

  shareRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 18 },
  shareTitle: { fontSize: rs(14), fontWeight: '700', color: colors.text },
  shareSub: { fontSize: rs(12), color: colors.textMuted, marginTop: 2, lineHeight: rs(17) },

  primaryBtn: { marginTop: 20, paddingVertical: 15, borderRadius: radii.md, alignItems: 'center', backgroundColor: colors.purple },
  primaryBtnText: { color: '#fff', fontSize: rs(15), fontWeight: '800' },

  card: { marginTop: 12 },
  obsHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  obsStudent: { fontSize: rs(15), fontWeight: '800', color: colors.text },
  sevPill: { paddingVertical: 3, paddingHorizontal: 8, borderRadius: radii.pill },
  sevPillText: { fontSize: rs(10), fontWeight: '800', textTransform: 'capitalize' },
  obsType: { fontSize: rs(11), fontWeight: '700', color: colors.textMuted, marginBottom: 8 },
  obsBody: { fontSize: rs(13), color: colors.textSecondary, lineHeight: rs(20) },
  obsAction: { fontSize: rs(12), color: colors.cyan, marginTop: 6, lineHeight: rs(18) },
  obsFoot: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  obsDate: { fontSize: rs(11), color: colors.textSubtle },
  deleteText: { fontSize: rs(12), color: colors.error, fontWeight: '600' },
});
