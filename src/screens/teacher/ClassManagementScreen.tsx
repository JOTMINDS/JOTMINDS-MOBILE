import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Alert,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import ScreenBackground from '../../components/ScreenBackground';
import GlassCard from '../../components/GlassCard';
import AppIcon from '../../components/AppIcon';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  getClasses, saveClass, deleteClass, enrollStudent, getStudentsForTeacher, SchoolClass,
} from '../../utils/api';
import { parseCSV, toRosterRows } from '../../utils/csv';
import { rs } from '../../utils/responsive';
import { radii, spacing, Palette } from '../../theme';
import { useTheme, useThemedStyles } from '../../context/ThemeContext';

export default function ClassManagementScreen() {
  const colors = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { user } = useAuth();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [selected, setSelected] = useState<SchoolClass | null>(null);

  const [newClassName, setNewClassName] = useState('');
  const [newClassYear, setNewClassYear] = useState('');
  const [showNewClass, setShowNewClass] = useState(false);

  const [enrollName, setEnrollName] = useState('');
  const [enrollDob, setEnrollDob] = useState('');
  const [enrollLevel, setEnrollLevel] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const [cls, studs] = await Promise.all([
      getClasses().catch(() => ({ classes: [] })),
      getStudentsForTeacher().catch(() => ({ students: [] })),
    ]);
    const mine = (cls.classes ?? []).filter(
      (c) => !c.classTeacherId || c.classTeacherId === user?.id,
    );
    setClasses(mine.length ? mine : cls.classes ?? []);
    setStudents(studs.students ?? []);
    setLoading(false);
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  const createClass = async () => {
    if (!newClassName.trim()) return;
    setBusy(true);
    try {
      await saveClass({
        name: newClassName.trim(),
        academicYear: newClassYear.trim() || undefined,
        classTeacherId: user?.id,
      });
      toast.success('Class created');
      setNewClassName(''); setNewClassYear(''); setShowNewClass(false);
      await load();
    } catch (e: any) {
      toast.error(e.message || 'Could not create class');
    } finally {
      setBusy(false);
    }
  };

  const removeClass = (c: SchoolClass) => {
    Alert.alert('Delete class', `Delete "${c.name}"? Students stay enrolled but lose this class label.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteClass(c.id).catch(() => {});
          if (selected?.id === c.id) setSelected(null);
          await load();
        },
      },
    ]);
  };

  const enrollOne = async () => {
    if (!selected || !enrollName.trim() || !enrollDob.trim()) {
      toast.error('Name and date of birth are required.');
      return;
    }
    setBusy(true);
    try {
      const res = await enrollStudent({
        studentName: enrollName.trim(),
        dateOfBirth: enrollDob.trim(),
        classId: selected.id,
        className: selected.name,
        teacherId: user?.id,
        educationLevel: enrollLevel.trim() || undefined,
      });
      if (res.error) throw new Error(res.error);
      toast.success(`Enrolled — code ${res.code ?? res.student?.studentCode ?? ''}`);
      setEnrollName(''); setEnrollDob(''); setEnrollLevel('');
      await load();
    } catch (e: any) {
      toast.error(e.message || 'Enrolment failed');
    } finally {
      setBusy(false);
    }
  };

  const importCSV = async () => {
    if (!selected) return;
    const res = await DocumentPicker.getDocumentAsync({
      type: ['text/csv', 'text/comma-separated-values', 'application/vnd.ms-excel', '*/*'],
      copyToCacheDirectory: true,
    });
    if (res.canceled || !res.assets?.[0]) return;

    let rows;
    try {
      const text = await fetch(res.assets[0].uri).then((r) => r.text());
      rows = toRosterRows(parseCSV(text));
    } catch {
      toast.error('Could not read that file.');
      return;
    }
    if (rows.length === 0) {
      toast.error('No student rows found. Expected columns: name, date of birth, level.');
      return;
    }

    Alert.alert(
      'Import roster',
      `Enrol ${rows.length} student${rows.length > 1 ? 's' : ''} into "${selected.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Import',
          onPress: async () => {
            setBusy(true);
            let ok = 0;
            let failed = 0;
            for (const r of rows) {
              try {
                const out = await enrollStudent({
                  studentName: r.studentName,
                  dateOfBirth: r.dateOfBirth || '2010-01-01',
                  classId: selected.id,
                  className: selected.name,
                  teacherId: user?.id,
                  educationLevel: r.educationLevel,
                });
                out.error ? failed++ : ok++;
              } catch {
                failed++;
              }
            }
            setBusy(false);
            toast.success(`Imported ${ok}${failed ? `, ${failed} failed` : ''}`);
            await load();
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <ScreenBackground>
        <View style={styles.centered}><ActivityIndicator size="large" color={colors.purple} /></View>
      </ScreenBackground>
    );
  }

  // ── Class detail ────────────────────────────────────────────────────────
  if (selected) {
    const inClass = students.filter((s) => s.classId === selected.id);
    return (
      <ScreenBackground>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <TouchableOpacity onPress={() => setSelected(null)} hitSlop={10} style={styles.backRow}>
            <Text style={styles.backText}>← Classes</Text>
          </TouchableOpacity>
          <Text style={styles.h1}>{selected.name}</Text>
          <Text style={styles.meta}>
            {selected.academicYear ? `${selected.academicYear} · ` : ''}{inClass.length} student{inClass.length !== 1 ? 's' : ''}
            {selected.classCode ? ` · code ${selected.classCode}` : ''}
          </Text>

          <GlassCard variant="dark" padding={16} style={styles.card}>
            <Text style={styles.cardTitle}>Enrol a student</Text>
            <TextInput style={styles.input} value={enrollName} onChangeText={setEnrollName} placeholder="Full name" placeholderTextColor={colors.textSubtle} />
            <TextInput style={styles.input} value={enrollDob} onChangeText={setEnrollDob} placeholder="Date of birth (YYYY-MM-DD)" placeholderTextColor={colors.textSubtle} />
            <TextInput style={styles.input} value={enrollLevel} onChangeText={setEnrollLevel} placeholder="Education level (optional)" placeholderTextColor={colors.textSubtle} />
            <View style={styles.btnRow}>
              <TouchableOpacity style={[styles.primaryBtn, { flex: 1 }, busy && { opacity: 0.5 }]} onPress={enrollOne} disabled={busy}>
                <Text style={styles.primaryBtnText}>Enrol</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.secondaryBtn, busy && { opacity: 0.5 }]} onPress={importCSV} disabled={busy}>
                <Text style={styles.secondaryBtnText}>Import CSV</Text>
              </TouchableOpacity>
            </View>
            {busy && <ActivityIndicator style={{ marginTop: 10 }} color={colors.textMuted} />}
          </GlassCard>

          <Text style={styles.sectionLabel}>ROSTER</Text>
          {inClass.length === 0 ? (
            <Text style={styles.emptyText}>No students in this class yet.</Text>
          ) : (
            inClass.map((s, i) => (
              <GlassCard key={i} padding={14} style={styles.card}>
                <View style={styles.studentRow}>
                  <Text style={styles.studentName}>{s.name}</Text>
                  {s.studentCode ? <Text style={styles.studentCode}>{s.studentCode}</Text> : null}
                </View>
              </GlassCard>
            ))
          )}
        </ScrollView>
      </ScreenBackground>
    );
  }

  // ── Class list ──────────────────────────────────────────────────────────
  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.h1}>My Classes</Text>
        <Text style={styles.meta}>Group students, enrol individually or import a roster CSV.</Text>

        {showNewClass ? (
          <GlassCard variant="dark" padding={16} style={styles.card}>
            <Text style={styles.cardTitle}>New class</Text>
            <TextInput style={styles.input} value={newClassName} onChangeText={setNewClassName} placeholder="Class name (e.g. JHS 2 Gold)" placeholderTextColor={colors.textSubtle} />
            <TextInput style={styles.input} value={newClassYear} onChangeText={setNewClassYear} placeholder="Academic year (optional)" placeholderTextColor={colors.textSubtle} />
            <View style={styles.btnRow}>
              <TouchableOpacity style={[styles.primaryBtn, { flex: 1 }, busy && { opacity: 0.5 }]} onPress={createClass} disabled={busy}>
                <Text style={styles.primaryBtnText}>Create</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryBtn} onPress={() => setShowNewClass(false)}>
                <Text style={styles.secondaryBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </GlassCard>
        ) : (
          <TouchableOpacity style={styles.primaryBtn} onPress={() => setShowNewClass(true)}>
            <Text style={styles.primaryBtnText}>+ New class</Text>
          </TouchableOpacity>
        )}

        {classes.length === 0 ? (
          <GlassCard variant="dark" padding={24} style={styles.card}>
            <Text style={styles.emptyText}>No classes yet. Create one to start enrolling students.</Text>
          </GlassCard>
        ) : (
          classes.map((c) => {
            const count = students.filter((s) => s.classId === c.id).length;
            return (
              <GlassCard key={c.id} padding={16} style={styles.card} onPress={() => setSelected(c)}>
                <View style={styles.classRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.className}>{c.name}</Text>
                    <Text style={styles.classMeta}>
                      {c.academicYear ? `${c.academicYear} · ` : ''}{count} student{count !== 1 ? 's' : ''}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => removeClass(c)} hitSlop={10}>
                    <AppIcon name="🗑️" size={16} color={colors.textMuted} />
                  </TouchableOpacity>
                  <AppIcon name="→" size={16} color={colors.textMuted} />
                </View>
              </GlassCard>
            );
          })
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
  sectionLabel: { fontSize: rs(11), fontWeight: '800', color: colors.textSubtle, letterSpacing: 1, marginTop: 20, marginBottom: 8 },
  emptyText: { fontSize: rs(13), color: colors.textMuted, lineHeight: rs(20) },

  card: { marginTop: 12 },
  cardTitle: { fontSize: rs(13), fontWeight: '800', color: colors.text, marginBottom: 10 },
  input: {
    backgroundColor: colors.glassMedium, borderRadius: radii.md, borderWidth: 1, borderColor: colors.borderLight,
    padding: 13, fontSize: rs(14), color: colors.text, marginBottom: 8,
  },
  btnRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  primaryBtn: { marginTop: 12, paddingVertical: 14, borderRadius: radii.md, alignItems: 'center', backgroundColor: colors.purple },
  primaryBtnText: { color: '#fff', fontSize: rs(14), fontWeight: '800' },
  secondaryBtn: {
    paddingVertical: 14, paddingHorizontal: 16, borderRadius: radii.md, alignItems: 'center',
    backgroundColor: colors.glassMedium, borderWidth: 1, borderColor: colors.borderLight,
  },
  secondaryBtnText: { color: colors.textSecondary, fontSize: rs(14), fontWeight: '700' },

  classRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  className: { fontSize: rs(15), fontWeight: '700', color: colors.text },
  classMeta: { fontSize: rs(12), color: colors.textMuted, marginTop: 2 },
  studentRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  studentName: { fontSize: rs(14), fontWeight: '600', color: colors.text },
  studentCode: { fontSize: rs(12), fontWeight: '700', color: colors.cyan },
});
