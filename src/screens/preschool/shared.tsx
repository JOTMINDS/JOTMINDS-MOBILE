import React, { useCallback, useState } from 'react';
import { StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getStudentsForTeacher } from '../../utils/api';
import { getPreschoolStore } from '../../utils/preschoolStore';
import { isPreschoolChild } from '../../utils/preschoolEngine';
import { calculateAge } from '../../utils/dateUtils';
import type { EvidenceEvent, PreschoolUser } from '../../types/preschoolDevelopmental';
import { rs } from '../../utils/responsive';
import { radii, spacing, Palette } from '../../theme';

export type PreschoolChild = PreschoolUser & { classId?: string };

/** Normalise a /teacher/students row into the shape the framework reads. */
export function toPreschoolChild(s: any): PreschoolChild {
  const age = s?.dateOfBirth ? calculateAge(s.dateOfBirth) : s?.age;
  return {
    id: String(s.id),
    name: s.name || 'Child',
    role: 'student',
    age: typeof age === 'number' && age >= 0 ? age : undefined,
    dateOfBirth: s.dateOfBirth,
    educationLevel: s.educationLevel,
    className: s.className,
    classId: s.classId,
  };
}

/** The teacher's Pre-school children plus all locally stored evidence for them. Reloads on focus. */
export function usePreschoolData() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [children, setChildren] = useState<PreschoolChild[]>([]);
  const [events, setEvents] = useState<EvidenceEvent[]>([]);

  const reload = useCallback(async () => {
    try {
      const [res, all] = await Promise.all([getStudentsForTeacher(), getPreschoolStore().list()]);
      const kids = ((res?.students ?? []) as any[]).map(toPreschoolChild).filter(isPreschoolChild);
      const ids = new Set(kids.map((c) => c.id));
      setChildren(kids);
      setEvents(all.filter((e) => ids.has(e.childId)));
      setError(null);
    } catch (e: any) {
      setError(e?.message || 'Could not load your children.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { reload(); }, [reload]));
  return { loading, error, children, events, reload };
}

export const RATING_COLORS = ['#94A3B8', '#F59E0B', '#3B82F6', '#10B981', '#8B5CF6'];

export const makeStyles = (colors: Palette) => StyleSheet.create({
  scroll: { paddingHorizontal: spacing.xl, paddingTop: 12, paddingBottom: 48 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  h1: { fontSize: rs(24), fontWeight: '800', color: colors.text, letterSpacing: -0.5, marginBottom: 6 },
  meta: { fontSize: rs(13), color: colors.textMuted, marginBottom: 12, lineHeight: rs(19) },
  text: { fontSize: rs(13), lineHeight: rs(19), color: colors.textSecondary },
  muted: { fontSize: rs(12), color: colors.textSubtle },
  label: { fontSize: rs(11), fontWeight: '800', color: colors.textSubtle, letterSpacing: 1, marginTop: 16, marginBottom: 8 },
  card: { marginTop: 12 },
  cardTitle: { fontSize: rs(15), fontWeight: '800', color: colors.text },
  row: { flexDirection: 'row', alignItems: 'center' },
  spread: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
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
  primaryBtn: { marginTop: 20, paddingVertical: 15, borderRadius: radii.md, alignItems: 'center', backgroundColor: colors.purple },
  primaryBtnOff: { opacity: 0.45 },
  primaryBtnText: { color: '#fff', fontSize: rs(15), fontWeight: '800' },
  secondaryBtn: { marginTop: 10, paddingVertical: 12, borderRadius: radii.md, alignItems: 'center', borderWidth: 1.5, borderColor: colors.purple },
  secondaryBtnText: { color: colors.text, fontSize: rs(14), fontWeight: '700' },
  pill: { paddingVertical: 3, paddingHorizontal: 8, borderRadius: radii.pill, backgroundColor: colors.glassMedium },
  pillText: { fontSize: rs(10), fontWeight: '800', color: colors.textSecondary },
  track: { flex: 1, height: 8, borderRadius: 4, backgroundColor: colors.bgTertiary, overflow: 'hidden' },
  fill: { height: 8, borderRadius: 4 },
  notice: { fontSize: rs(11), color: colors.textSubtle, marginTop: 14, lineHeight: rs(16), textAlign: 'center' },
});
