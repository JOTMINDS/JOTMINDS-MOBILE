import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { loadTeacherStudents } from '../../utils/teacherStudents';
import ScreenBackground from '../../components/ScreenBackground';
import GlassCard from '../../components/GlassCard';
import AppIcon from '../../components/AppIcon';
import AskJottiCard from '../../components/AskJottiCard';
import NotificationBell from '../../components/NotificationBell';
import ProfileButton from '../../components/ProfileButton';
import StaleNotice from '../../components/StaleNotice';
import { ClassroomOverviewCard } from '../../components/ai/InsightCards';
import { classStyles, completedCount } from '../../utils/classInsights';
import { radii, shadow, spacing, Palette } from '../../theme';
import { useTheme, useThemedStyles } from '../../context/ThemeContext';

/**
 * Teacher Home (the webapp's Overview). The rest of the Educator Portal is on the bottom menu:
 * My Students, Pre School, Analytics, Lesson Planner and Teaching Insights. These cards cover what
 * is not on the bar.
 */
export default function TeacherDashboard({ navigation }: any) {
  const colors = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { user } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [staleAt, setStaleAt] = useState<string | null>(null);

  const fetchStudents = useCallback(async () => {
    try {
      const r = await loadTeacherStudents();
      setStudents(r.students);
      setStaleAt(r.stale ? (r.savedAt ?? '') : null);
      setError(null);
    } catch (e: any) {
      // Keep any students already loaded; just tell the teacher the refresh failed.
      setError(e?.message || 'Could not load your students.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void fetchStudents();
    return navigation?.addListener?.('focus', () => { void fetchStudents(); });
  }, [fetchStudents, navigation]);

  const cls = classStyles(students);
  const totalAssessments = students.reduce((s, st) => s + completedCount(st), 0);

  const tools: { icon: string; title: string; g: [string, string]; onPress: () => void }[] = [
    { icon: '👥', title: 'Classes', g: ['#10B981', '#059669'], onPress: () => navigation.navigate('ClassManagement') },
    { icon: '📚', title: 'Curriculum', g: ['#3B82F6', '#2563EB'], onPress: () => navigation.navigate('CurriculumTracker') },
    { icon: '💡', title: 'Discover', g: ['#F59E0B', '#D97706'], onPress: () => navigation.navigate('Discover') },
    { icon: '🧠', title: 'Mind', g: ['#6E4D9C', '#4F46E5'], onPress: () => navigation.navigate('MindHome') },
  ];

  if (loading) {
    return (
      <ScreenBackground>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.purple} />
        </View>
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              void fetchStudents();
            }}
            tintColor={colors.purple}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <ProfileButton style={styles.profile} />
          <NotificationBell style={styles.bell} />
          <Text style={styles.greeting}>WELCOME</Text>
          <Text style={styles.name}>{user?.name || 'Teacher'}</Text>
          {user?.school ? <Text style={styles.tagline}>{user.school}</Text> : null}
        </View>

        {staleAt !== null && <StaleNotice savedAt={staleAt} onRetry={() => { setRefreshing(true); void fetchStudents(); }} />}

        {!!error && (
          <GlassCard padding={16} style={styles.errorCard}>
            <Text style={styles.cardTitle}>Couldn't load your students</Text>
            <Text style={styles.cardSubtle}>{error}</Text>
            <Text style={[styles.cardSubtle, { marginTop: 8 }]} onPress={() => { setRefreshing(true); void fetchStudents(); }} accessibilityRole="button">Tap to retry</Text>
          </GlassCard>
        )}

        <GlassCard padding={0} style={styles.snapshotWrap} onPress={() => navigation.navigate('Students')}>
          <LinearGradient
            colors={['#10B981', '#059669', '#14136E']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.snapshotCard}
          >
            <Text style={styles.snapshotLabel}>YOUR CLASS</Text>
            <View style={styles.snapshotStatsRow}>
              <View style={styles.snapshotStat}>
                <Text style={styles.snapshotStatValue}>{students.length}</Text>
                <Text style={styles.snapshotStatLabel}>Students</Text>
              </View>
              <View style={styles.snapshotDivider} />
              <View style={styles.snapshotStat}>
                <Text style={styles.snapshotStatValue}>{totalAssessments}</Text>
                <Text style={styles.snapshotStatLabel}>Assessments</Text>
              </View>
              <View style={styles.snapshotDivider} />
              <View style={styles.snapshotStat}>
                <Text style={styles.snapshotStatValue}>{cls.profiled}</Text>
                <Text style={styles.snapshotStatLabel}>Profiled</Text>
              </View>
            </View>
          </LinearGradient>
        </GlassCard>

        <AskJottiCard style={{ marginBottom: spacing.xl }} />

        {cls.profiled >= 3 && cls.dominantLearning && cls.dominantThinking && (
          <ClassroomOverviewCard
            params={{
              className: 'your class',
              studentCount: students.length,
              dominantLearning: cls.dominantLearning,
              dominantThinking: cls.dominantThinking,
              dominantDecision: cls.dominantDecision,
            }}
          />
        )}

        <View style={styles.grid}>
          {tools.map((tool) => (
            <GlassCard key={tool.title} padding={14} style={styles.tile} onPress={tool.onPress}>
              <LinearGradient colors={tool.g} style={styles.iconWrap} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <AppIcon name={tool.icon} size={22} color="#FFFFFF" />
              </LinearGradient>
              <Text style={styles.tileTitle}>{tool.title}</Text>
            </GlassCard>
          ))}
        </View>
      </ScrollView>
    </ScreenBackground>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  scroll: { paddingTop: 8, paddingHorizontal: spacing.xl, paddingBottom: 120 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { marginBottom: spacing.xxl, paddingRight: 108 },
  bell: { position: 'absolute', top: 0, right: 0 },
  profile: { position: 'absolute', top: 0, right: 52 },
  greeting: { fontSize: 12, color: colors.textSubtle, letterSpacing: 1.4, fontWeight: '700' },
  name: { fontSize: 30, fontWeight: '700', color: colors.textPrimary, marginTop: 4, letterSpacing: -0.6 },
  tagline: { fontSize: 15, color: colors.textMuted, marginTop: 6 },
  snapshotWrap: { marginBottom: spacing.xl, overflow: 'hidden', borderRadius: radii.xl, ...shadow.glow },
  snapshotCard: { borderRadius: radii.xl, padding: spacing.xxl },
  snapshotLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11, letterSpacing: 1.6, fontWeight: '700', marginBottom: spacing.lg },
  snapshotStatsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  snapshotStat: { flex: 1, alignItems: 'center' },
  snapshotStatValue: { color: '#FFF', fontSize: 26, fontWeight: '800' },
  snapshotStatLabel: { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 2 },
  snapshotDivider: { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.25)' },
  errorCard: { marginBottom: spacing.lg },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: spacing.sm },
  tile: { flexBasis: '47%', flexGrow: 1 },
  tileTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginTop: spacing.md },
  cardTitle: { fontSize: 16, fontWeight: '600', color: colors.text },
  cardSubtle: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  iconWrap: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
});
