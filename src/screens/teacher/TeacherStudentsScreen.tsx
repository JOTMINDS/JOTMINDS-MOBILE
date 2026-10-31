import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenBackground from '../../components/ScreenBackground';
import GlassCard from '../../components/GlassCard';
import StaleNotice from '../../components/StaleNotice';
import { loadTeacherStudents } from '../../utils/teacherStudents';
import { completedCount } from '../../utils/classInsights';
import { groupStudentsByClass } from '../../utils/studentGroups';
import { rs } from '../../utils/responsive';
import { radii, spacing, Palette } from '../../theme';
import { useTheme, useThemedStyles } from '../../context/ThemeContext';

/**
 * "My Students" tab: every student in one place, grouped by class (the webapp's merged
 * Students & Classes tab). Tapping a student opens their profile, which holds their observations.
 */
export default function TeacherStudentsScreen({ navigation }: any) {
  const colors = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [staleAt, setStaleAt] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const load = useCallback(async () => {
    try {
      const r = await loadTeacherStudents();
      setStudents(r.students);
      setStaleAt(r.stale ? (r.savedAt ?? '') : null);
      setError(null);
    } catch (e: any) {
      setError(e?.message || 'Could not load your students.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
    // Refresh when returning (e.g. after enrolling a student in My Classes).
    return navigation?.addListener?.('focus', () => { void load(); });
  }, [load, navigation]);

  const groups = useMemo(() => groupStudentsByClass(students, query), [students, query]);

  if (loading) {
    return <ScreenBackground><View style={styles.centered}><ActivityIndicator size="large" color={colors.purple} /></View></ScreenBackground>;
  }

  return (
    <ScreenBackground>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); void load(); }} tintColor={colors.purple} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>My Students</Text>
            <Text style={styles.sub}>{students.length} student{students.length !== 1 ? 's' : ''}</Text>
          </View>
          <TouchableOpacity style={styles.classesBtn} onPress={() => navigation.navigate('ClassManagement')} accessibilityRole="button">
            <Text style={styles.classesBtnText}>Manage classes</Text>
          </TouchableOpacity>
        </View>

        {staleAt !== null && <StaleNotice savedAt={staleAt} onRetry={() => { setRefreshing(true); void load(); }} />}

        {!!error && (
          <GlassCard padding={16} style={styles.card}>
            <Text style={styles.name}>Couldn't load your students</Text>
            <Text style={styles.meta}>{error}</Text>
            <TouchableOpacity onPress={() => { setRefreshing(true); void load(); }} accessibilityRole="button" style={{ marginTop: 8 }}>
              <Text style={styles.link}>Tap to retry</Text>
            </TouchableOpacity>
          </GlassCard>
        )}

        {students.length > 6 && (
          <TextInput
            style={styles.search}
            value={query}
            onChangeText={setQuery}
            placeholder="Search students"
            placeholderTextColor={colors.textSubtle}
            accessibilityLabel="Search students"
          />
        )}

        {students.length === 0 && !error ? (
          <GlassCard padding={28}>
            <Text style={styles.name}>No students yet</Text>
            <Text style={styles.meta}>They appear here once they join your class.</Text>
          </GlassCard>
        ) : groups.length === 0 && query ? (
          <Text style={styles.meta}>No student matches “{query}”.</Text>
        ) : (
          groups.map((g) => (
            <View key={g.name} style={styles.group}>
              <Text style={styles.groupLabel}>{g.name.toUpperCase()} · {g.students.length}</Text>
              {g.students.map((s, i) => (
                <GlassCard key={s.id ?? i} padding={14} style={styles.card} onPress={() => navigation.navigate('StudentDetail', { student: s })}>
                  <View style={styles.row}>
                    <LinearGradient colors={['#10B981', '#059669']} style={styles.avatar} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                      <Text style={styles.avatarText}>{(s.name || '?')[0].toUpperCase()}</Text>
                    </LinearGradient>
                    <Text style={[styles.name, { flex: 1, marginLeft: spacing.md }]} numberOfLines={1}>{s.name}</Text>
                    <View style={styles.badge}>
                      <Text style={styles.badgeNum}>{completedCount(s)}</Text>
                      <Text style={styles.badgeLabel}>done</Text>
                    </View>
                  </View>
                </GlassCard>
              ))}
            </View>
          ))
        )}
      </ScrollView>
    </ScreenBackground>
  );
}

const makeStyles = (c: Palette) => StyleSheet.create({
  scroll: { paddingTop: 8, paddingHorizontal: spacing.xl, paddingBottom: 40 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg, gap: 12 },
  title: { fontSize: rs(28), fontWeight: '800', color: c.textPrimary, letterSpacing: -0.6 },
  sub: { fontSize: rs(13), color: c.textMuted, marginTop: 2 },
  classesBtn: { paddingVertical: 9, paddingHorizontal: 14, borderRadius: radii.pill, borderWidth: 1.5, borderColor: c.purple },
  classesBtnText: { fontSize: rs(12), fontWeight: '800', color: c.text },
  search: {
    backgroundColor: c.glassMedium, borderRadius: radii.md, borderWidth: 1, borderColor: c.borderLight,
    paddingVertical: 11, paddingHorizontal: 14, fontSize: rs(14), color: c.text, marginBottom: spacing.lg,
  },
  group: { marginBottom: spacing.lg },
  groupLabel: { fontSize: rs(11), fontWeight: '800', letterSpacing: 1.2, color: c.textSubtle, marginBottom: 8 },
  card: { marginBottom: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#FFFFFF', fontWeight: '800', fontSize: rs(16) },
  name: { fontSize: rs(15), fontWeight: '700', color: c.text },
  meta: { fontSize: rs(13), color: c.textMuted, marginTop: 2 },
  link: { fontSize: rs(13), fontWeight: '800', color: c.cyan },
  badge: { alignItems: 'center', backgroundColor: c.glassMedium, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 12 },
  badgeNum: { color: c.success, fontWeight: '800', fontSize: rs(15) },
  badgeLabel: { color: c.textMuted, fontSize: rs(10) },
});
