import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenBackground from '../../components/ScreenBackground';
import AppIcon from '../../components/AppIcon';
import GlassCard from '../../components/GlassCard';
import { getAllAssessmentResults } from '../../utils/api';
import { getGamificationProfile } from '../../utils/gamificationApi';
import { useAuth } from '../../context/AuthContext';
import { colors, radii, shadow, spacing, Palette } from '../../theme';
import { useTheme, useThemedStyles } from '../../context/ThemeContext';

interface TimelineItem {
  date: string;
  title: string;
  type: 'assessment' | 'badge';
  icon: string;
}

export default function GrowthTrackerScreen({ navigation }: any) {
  const colors = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [badgeCount, setBadgeCount] = useState(0);
  const [assessmentCount, setAssessmentCount] = useState(0);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    Promise.all([
      getAllAssessmentResults().catch(() => ({ results: [] })),
      getGamificationProfile(user.id).catch(() => null),
    ]).then(([assessmentsRes, profile]) => {
      const results = assessmentsRes?.results ?? [];
      const badges = profile?.badges ?? [];

      const items: TimelineItem[] = [
        ...results
          .filter((r: any) => r?.completedAt)
          .map((r: any) => ({
            date: r.completedAt,
            title: `Completed ${r.assessmentType} assessment`,
            type: 'assessment' as const,
            icon: '✅',
          })),
        ...badges
          .filter((b: any) => b?.unlockedAt)
          .map((b: any) => ({
            date: b.unlockedAt,
            title: `Earned badge: ${b.name}`,
            type: 'badge' as const,
            icon: b.icon ?? '🏆',
          })),
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setTimeline(items);
      setBadgeCount(badges.length);
      setAssessmentCount(results.length);
      setStreak(profile?.currentStreak ?? 0);
    }).finally(() => setLoading(false));
  }, [user?.id]);

  if (loading) {
    return (
      <ScreenBackground>
        <View style={styles.centered}><ActivityIndicator size="large" color={colors.purple} /></View>
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>Growth Tracker</Text>
          <Text style={styles.name}>Your Professional Journey</Text>
          <Text style={styles.tagline}>
            Real activity — assessments completed and badges earned
          </Text>
        </View>

        <LinearGradient
          colors={['#10B981', '#059669', '#14136E']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.statsCard}
        >
          <Text style={styles.statsLabel}>OVERALL PROGRESS</Text>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{assessmentCount}</Text>
              <Text style={styles.statLabel}>Assessments</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>{badgeCount}</Text>
              <Text style={styles.statLabel}>Badges</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>{streak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activity Timeline</Text>
          {timeline.length === 0 ? (
            <GlassCard padding={24}>
              <Text style={styles.emptyText}>
                Complete an assessment or earn a badge to start building your growth timeline.
              </Text>
            </GlassCard>
          ) : (
            timeline.map((item, index) => (
              <GlassCard key={index} padding={16} style={styles.milestoneCard}>
                <View style={styles.milestoneRow}>
                  <AppIcon name={item.icon} size={20} style={styles.milestoneIcon} />
                  <View style={styles.milestoneContent}>
                    <Text style={styles.milestoneTitle}>{item.title}</Text>
                    <Text style={styles.milestoneDate}>{new Date(item.date).toLocaleDateString()}</Text>
                  </View>
                </View>
              </GlassCard>
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <GlassCard padding={16} style={styles.actionCard} onPress={() => navigation.navigate('Badges')}>
            <View style={styles.actionRow}>
              <LinearGradient
                colors={['#3D52C9', '#2E3FA8']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.actionIconWrap}
              >
                <AppIcon name="📊" size={22} style={styles.actionIcon} />
              </LinearGradient>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>View Full Report</Text>
                <Text style={styles.actionDescription}>
                  See your detailed Cognitive Growth breakdown
                </Text>
              </View>
              <AppIcon name="→" size={18} style={styles.actionArrow} />
            </View>
          </GlassCard>
        </View>
      </ScrollView>
    </ScreenBackground>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  scroll: {
    paddingTop: 8,
    paddingHorizontal: spacing.xl,
    paddingBottom: 120,
  },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    marginBottom: spacing.xxl,
  },
  greeting: {
    fontSize: 14,
    color: colors.textSubtle,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 4,
    letterSpacing: -0.6,
  },
  tagline: {
    fontSize: 15,
    color: colors.textMuted,
    marginTop: 6,
  },
  statsCard: {
    borderRadius: radii.xl,
    padding: spacing.xxl,
    marginBottom: spacing.xxl,
    ...shadow.glow,
  },
  statsLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    letterSpacing: 1.6,
    fontWeight: '700',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  section: {
    marginBottom: spacing.xxl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.md,
    letterSpacing: -0.4,
  },
  emptyText: { fontSize: 14, color: colors.textMuted, lineHeight: 20, textAlign: 'center' },
  milestoneCard: {
    marginBottom: spacing.md,
  },
  milestoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  milestoneIcon: {
    fontSize: 20,
    marginRight: spacing.md,
  },
  milestoneContent: {
    flex: 1,
  },
  milestoneTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  milestoneDate: {
    fontSize: 12,
    color: colors.textMuted,
  },
  actionCard: {
    marginBottom: spacing.md,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
  },
  actionIcon: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  actionDescription: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
  },
  actionArrow: {
    fontSize: 22,
    color: colors.success,
    fontWeight: '700',
  },
});
