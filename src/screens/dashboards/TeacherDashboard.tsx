import React, { useState, useEffect } from 'react';
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
import { getStudentsForTeacher } from '../../utils/api';
import ScreenBackground from '../../components/ScreenBackground';
import GlassCard from '../../components/GlassCard';
import AppIcon from '../../components/AppIcon';
import AskJottiCard from '../../components/AskJottiCard';
import NotificationBell from '../../components/NotificationBell';
import { ClassroomOverviewCard } from '../../components/ai/InsightCards';
import { classStyles, completedCount } from '../../utils/classInsights';
import { isJTIADone } from '../../utils/jtiaStatus';
import { colors, radii, shadow, spacing, Palette } from '../../theme';
import { useTheme, useThemedStyles } from '../../context/ThemeContext';

export default function TeacherDashboard({ navigation }: any) {
  const colors = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { user } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jtiaDone, setJtiaDone] = useState(false);

  const fetchStudents = async () => {
    try {
      const data = await getStudentsForTeacher();
      setStudents(data.students || []);
      setError(null);
    } catch (e: any) {
      // Keep any students already loaded; just tell the teacher the refresh failed.
      setError(e?.message || 'Could not load your students.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Teaching Insights opens the saved report once the assessment is done.
  useEffect(() => {
    const refresh = () => { isJTIADone().then(setJtiaDone).catch(() => {}); };
    refresh();
    return navigation?.addListener?.('focus', refresh);
  }, [navigation]);

  // Same groupings as the webapp's Educator Portal. Observations are reached from a
  // student's own profile, and growth content lives under Discover.
  const tools: { icon: string; title: string; g: [string, string]; onPress: () => void }[] = [
    { icon: '👥', title: 'Classes', g: ['#10B981', '#059669'], onPress: () => navigation.navigate('ClassManagement') },
    { icon: '📊', title: 'Analytics', g: ['#3B82F6', '#2563EB'], onPress: () => navigation.navigate('ClassAnalytics') },
    { icon: '🗂️', title: 'Lesson Planner', g: ['#6E4D9C', '#4F46E5'], onPress: () => navigation.navigate('Planner') },
    { icon: '🧸', title: 'Early Years', g: ['#F59E0B', '#D97706'], onPress: () => navigation.navigate('PreschoolChildren') },
    { icon: '🎓', title: 'Teaching Insights', g: ['#EC4899', '#DB2777'], onPress: () => navigation.navigate(jtiaDone ? 'JTIAResults' : 'JTIAAssessment') },
  ];

  const cls = classStyles(students);
  const totalAssessments = students.reduce((s, st) => s + completedCount(st), 0);

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
              fetchStudents();
            }}
            tintColor={colors.purple}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <NotificationBell style={styles.bell} />
          <Text style={styles.greeting}>WELCOME</Text>
          <Text style={styles.name}>{user?.name || 'Teacher'}</Text>
          {user?.school ? <Text style={styles.tagline}>{user.school}</Text> : null}
        </View>

        <LinearGradient
          colors={['#10B981', '#059669', '#14136E']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.snapshotCard}
        >
          <Text style={styles.snapshotLabel}>CLASSROOM SNAPSHOT</Text>
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
              <Text style={styles.snapshotStatValue}>
                {students.length ? Math.round(totalAssessments / students.length) : 0}
              </Text>
              <Text style={styles.snapshotStatLabel}>Avg</Text>
            </View>
          </View>
        </LinearGradient>

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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your tools</Text>
          <View style={styles.grid}>
            {tools.map((tool, i) => (
              <GlassCard
                key={tool.title}
                padding={14}
                style={[styles.tile, tools.length % 2 === 1 && i === tools.length - 1 && styles.tileWide]}
                onPress={tool.onPress}
              >
                <LinearGradient colors={tool.g} style={styles.iconWrap} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                  <AppIcon name={tool.icon} size={22} color="#FFFFFF" />
                </LinearGradient>
                <Text style={styles.tileTitle}>{tool.title}</Text>
              </GlassCard>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Students</Text>
          <Text style={styles.sectionSubtitle}>
            {students.length} student{students.length !== 1 ? 's' : ''} · tap one for their profile and observations
          </Text>

          {!!error && (
            <GlassCard padding={16} style={styles.spacedCard}>
              <Text style={styles.cardTitle}>Couldn't load your students</Text>
              <Text style={styles.cardSubtle}>{error}</Text>
              <Text style={[styles.cardSubtle, { marginTop: 8 }]} onPress={() => { setRefreshing(true); fetchStudents(); }} accessibilityRole="button">Tap to retry</Text>
            </GlassCard>
          )}

          {students.length === 0 && !error ? (
            <GlassCard padding={32}>
              <View style={styles.empty}>
                <AppIcon name="👥" size={40} color={colors.textSubtle} style={styles.emptyIcon} />
                <Text style={styles.cardTitle}>No students yet</Text>
                <Text style={styles.cardSubtle}>They appear here once they join your class</Text>
              </View>
            </GlassCard>
          ) : students.length === 0 ? null : (
            students.map((student, i) => (
              <GlassCard key={student.id ?? i} padding={16} style={styles.spacedCard} onPress={() => navigation.navigate('StudentDetail', { student })}>
                <View style={styles.row}>
                  <LinearGradient colors={['#10B981', '#059669']} style={styles.avatar} start={{x:0,y:0}} end={{x:1,y:1}}>
                    <Text style={styles.avatarText}>{(student.name || '?')[0].toUpperCase()}</Text>
                  </LinearGradient>
                  <View style={{ flex: 1, marginLeft: spacing.md }}>
                    <Text style={styles.cardTitle}>{student.name}</Text>
                    {!!student.className && <Text style={styles.cardSubtle}>{student.className}</Text>}
                  </View>
                  <View style={styles.statBadge}>
                    <Text style={styles.statBadgeText}>{completedCount(student)}</Text>
                    <Text style={styles.statBadgeLabel}>tests</Text>
                  </View>
                </View>
              </GlassCard>
            ))
          )}
        </View>
      </ScrollView>
    </ScreenBackground>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  scroll: { paddingTop: 8, paddingHorizontal: spacing.xl, paddingBottom: 120 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { marginBottom: spacing.xxl, paddingRight: 56 },
  bell: { position: 'absolute', top: 0, right: 0 },
  greeting: { fontSize: 12, color: colors.textSubtle, letterSpacing: 1.4, fontWeight: '700' },
  name: { fontSize: 30, fontWeight: '700', color: colors.textPrimary, marginTop: 4, letterSpacing: -0.6 },
  tagline: { fontSize: 15, color: colors.textMuted, marginTop: 6 },
  snapshotCard: { borderRadius: radii.xl, padding: spacing.xxl, marginBottom: spacing.xxl, ...shadow.glow },
  snapshotLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11, letterSpacing: 1.6, fontWeight: '700', marginBottom: spacing.lg },
  snapshotStatsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  snapshotStat: { flex: 1, alignItems: 'center' },
  snapshotStatValue: { color: '#FFF', fontSize: 26, fontWeight: '800' },
  snapshotStatLabel: { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 2 },
  snapshotDivider: { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.25)' },
  section: { marginBottom: spacing.xxl },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: colors.textPrimary, marginBottom: 4, letterSpacing: -0.4 },
  sectionSubtitle: { fontSize: 14, color: colors.textMuted, marginBottom: spacing.lg },
  spacedCard: { marginBottom: spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  tile: { flexBasis: '47%', flexGrow: 1 },
  tileWide: { flexBasis: '100%' },
  tileTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginTop: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '600', color: colors.text },
  cardSubtle: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  empty: { alignItems: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: spacing.md },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#FFF', fontWeight: '800', fontSize: 18 },
  iconWrap: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 22 },
  arrow: { fontSize: 22, color: colors.purple, fontWeight: '700' },
  statBadge: { alignItems: 'center', backgroundColor: colors.glassMedium, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  statBadgeText: { color: colors.success, fontWeight: '800', fontSize: 16 },
  statBadgeLabel: { color: colors.textMuted, fontSize: 10 },
});
