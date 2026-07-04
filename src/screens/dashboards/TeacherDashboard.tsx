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
import { useToast } from '../../context/ToastContext';
import { getStudentsForTeacher } from '../../utils/api';
import ScreenBackground from '../../components/ScreenBackground';
import GlassCard from '../../components/GlassCard';
import AppIcon from '../../components/AppIcon';
import { colors, radii, shadow, spacing, Palette } from '../../theme';
import { useTheme, useThemedStyles } from '../../context/ThemeContext';

export default function TeacherDashboard({ navigation }: any) {
  const colors = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { user } = useAuth();
  const toast = useToast();
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStudents = async () => {
    try {
      const data = await getStudentsForTeacher();
      setStudents(data.students || []);
    } catch (e) {
      console.error('[TeacherDashboard]', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const totalAssessments = students.reduce((s, st) => s + (st.assessmentsCompleted?.length || 0), 0);

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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Students</Text>
          <Text style={styles.sectionSubtitle}>
            {students.length} student{students.length !== 1 ? 's' : ''} in your class
          </Text>

          {students.length === 0 ? (
            <GlassCard padding={32}>
              <View style={styles.empty}>
                <AppIcon name="👥" size={40} color={colors.textSubtle} style={styles.emptyIcon} />
                <Text style={styles.cardTitle}>No students yet</Text>
                <Text style={styles.cardSubtle}>Students appear here once they join your class</Text>
              </View>
            </GlassCard>
          ) : (
            students.map((student, i) => (
              <GlassCard key={i} padding={16} style={styles.spacedCard}>
                <View style={styles.row}>
                  <LinearGradient colors={['#10B981', '#059669']} style={styles.avatar} start={{x:0,y:0}} end={{x:1,y:1}}>
                    <Text style={styles.avatarText}>{(student.name || '?')[0].toUpperCase()}</Text>
                  </LinearGradient>
                  <View style={{ flex: 1, marginLeft: spacing.md }}>
                    <Text style={styles.cardTitle}>{student.name}</Text>
                    <Text style={styles.cardSubtle}>{student.email}</Text>
                  </View>
                  <View style={styles.statBadge}>
                    <Text style={styles.statBadgeText}>{student.assessmentsCompleted?.length || 0}</Text>
                    <Text style={styles.statBadgeLabel}>tests</Text>
                  </View>
                </View>
              </GlassCard>
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          {[
            { icon: '📊', title: 'View Class Analytics', desc: 'See overall class performance', g: ['#3B82F6', '#2563EB'] as [string, string], nav: 'GrowthTracker' as const },
            { icon: '📝', title: 'Create Assignment', desc: 'Assign assessments to students', g: ['#6E4D9C', '#5A3E82'] as [string, string], nav: null },
          ].map((a) => (
            <GlassCard
              key={a.title}
              padding={16}
              style={styles.spacedCard}
              onPress={() => (a.nav ? navigation.navigate(a.nav) : toast.info('This feature is coming soon.'))}
            >
              <View style={styles.row}>
                <LinearGradient colors={a.g} style={styles.iconWrap} start={{x:0,y:0}} end={{x:1,y:1}}>
                  <AppIcon name={a.icon} size={22} color="#FFFFFF" />
                </LinearGradient>
                <View style={{ flex: 1, marginLeft: spacing.md }}>
                  <Text style={styles.cardTitle}>{a.title}</Text>
                  <Text style={styles.cardSubtle}>{a.desc}</Text>
                </View>
                <Text style={styles.arrow}>→</Text>
              </View>
            </GlassCard>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Professional Development</Text>
          <GlassCard
            padding={16}
            style={styles.spacedCard}
            onPress={() => navigation.navigate('TeacherDevelopment')}
          >
            <View style={styles.row}>
              <LinearGradient colors={['#10B981', '#059669']} style={styles.iconWrap} start={{x:0,y:0}} end={{x:1,y:1}}>
                <AppIcon name="🌟" size={22} color="#FFFFFF" />
              </LinearGradient>
              <View style={{ flex: 1, marginLeft: spacing.md }}>
                <Text style={styles.cardTitle}>Growth & Development</Text>
                <Text style={styles.cardSubtle}>Explore professional development modules</Text>
              </View>
              <Text style={styles.arrow}>→</Text>
            </View>
          </GlassCard>

          <GlassCard
            padding={16}
            style={styles.spacedCard}
            onPress={() => navigation.navigate('TeachingStyleAssessment')}
          >
            <View style={styles.row}>
              <LinearGradient colors={['#EC4899', '#DB2777']} style={styles.iconWrap} start={{x:0,y:0}} end={{x:1,y:1}}>
                <AppIcon name="🎯" size={22} color="#FFFFFF" />
              </LinearGradient>
              <View style={{ flex: 1, marginLeft: spacing.md }}>
                <Text style={styles.cardTitle}>Teaching Style Assessment</Text>
                <Text style={styles.cardSubtle}>Discover your teaching strengths</Text>
              </View>
              <Text style={styles.arrow}>→</Text>
            </View>
          </GlassCard>
        </View>
      </ScrollView>
    </ScreenBackground>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  scroll: { paddingTop: 8, paddingHorizontal: spacing.xl, paddingBottom: 120 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { marginBottom: spacing.xxl },
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
