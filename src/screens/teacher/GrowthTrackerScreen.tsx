import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenBackground from '../../components/ScreenBackground';
import AppIcon from '../../components/AppIcon';
import GlassCard from '../../components/GlassCard';
import { colors, radii, shadow, spacing, Palette } from '../../theme';
import { useTheme, useThemedStyles } from '../../context/ThemeContext';

interface Goal {
  id: string;
  title: string;
  category: string;
  progress: number;
  target: string;
  gradient: [string, string];
}

export default function GrowthTrackerScreen({ navigation }: any) {
  const colors = useTheme();
  const styles = useThemedStyles(makeStyles);
  const goals: Goal[] = [
    {
      id: '1',
      title: 'Implement differentiated instruction',
      category: 'Pedagogy',
      progress: 65,
      target: 'June 2026',
      gradient: ['#10B981', '#059669'],
    },
    {
      id: '2',
      title: 'Master formative assessment techniques',
      category: 'Assessment',
      progress: 85,
      target: 'May 2026',
      gradient: ['#3D52C9', '#2E3FA8'],
    },
    {
      id: '3',
      title: 'Integrate technology tools',
      category: 'Technology',
      progress: 40,
      target: 'July 2026',
      gradient: ['#6366F1', '#4F46E5'],
    },
    {
      id: '4',
      title: 'Build culturally responsive practices',
      category: 'Equity',
      progress: 25,
      target: 'August 2026',
      gradient: ['#F59E0B', '#D97706'],
    },
  ];

  const milestones = [
    {
      date: 'May 10, 2026',
      title: 'Completed Assessment Strategies Module',
      type: 'completed',
    },
    {
      date: 'May 5, 2026',
      title: 'Peer Observation Session',
      type: 'completed',
    },
    {
      date: 'Apr 28, 2026',
      title: 'Workshop: Classroom Management',
      type: 'completed',
    },
    {
      date: 'May 25, 2026',
      title: 'Upcoming: Technology Integration Workshop',
      type: 'upcoming',
    },
  ];

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
            Monitor progress and celebrate milestones
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
              <Text style={styles.statValue}>54%</Text>
              <Text style={styles.statLabel}>Complete</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>4</Text>
              <Text style={styles.statLabel}>Active Goals</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statLabel}>Hours Logged</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Goals</Text>
          {goals.map((goal) => (
            <GlassCard key={goal.id} padding={20} style={styles.goalCard}>
              <View style={styles.goalHeader}>
                <Text style={styles.goalTitle}>{goal.title}</Text>
                <Text style={styles.goalCategory}>{goal.category}</Text>
              </View>
              <View style={styles.goalMetaRow}>
                <Text style={styles.goalTarget}>Target: {goal.target}</Text>
                <Text style={styles.goalProgress}>{goal.progress}%</Text>
              </View>
              <View style={styles.progressBarTrack}>
                <LinearGradient
                  colors={goal.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.progressBarFill, { width: `${goal.progress}%` }]}
                />
              </View>
            </GlassCard>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Milestones</Text>
          {milestones.map((milestone, index) => (
            <GlassCard key={index} padding={16} style={styles.milestoneCard}>
              <View style={styles.milestoneRow}>
                <View
                  style={[
                    styles.milestoneDot,
                    {
                      backgroundColor:
                        milestone.type === 'completed'
                          ? colors.success
                          : colors.cyan,
                    },
                  ]}
                />
                <View style={styles.milestoneContent}>
                  <Text style={styles.milestoneTitle}>{milestone.title}</Text>
                  <Text style={styles.milestoneDate}>{milestone.date}</Text>
                </View>
                {milestone.type === 'completed' && (
                  <View style={styles.completedBadge}>
                    <AppIcon name="✓" size={18} style={styles.completedText} />
                  </View>
                )}
              </View>
            </GlassCard>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <GlassCard padding={16} style={styles.actionCard}>
            <View style={styles.actionRow}>
              <LinearGradient
                colors={['#6E4D9C', '#5A3E82']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.actionIconWrap}
              >
                <AppIcon name="➕" size={22} style={styles.actionIcon} />
              </LinearGradient>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Add New Goal</Text>
                <Text style={styles.actionDescription}>
                  Set a new professional development goal
                </Text>
              </View>
              <AppIcon name="→" size={18} style={styles.actionArrow} />
            </View>
          </GlassCard>

          <GlassCard padding={16} style={styles.actionCard}>
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
                  See detailed analytics and insights
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
  goalCard: {
    marginBottom: spacing.md,
  },
  goalHeader: {
    marginBottom: spacing.sm,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  goalCategory: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.success,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  goalMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  goalTarget: {
    fontSize: 13,
    color: colors.textMuted,
  },
  goalProgress: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.success,
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  milestoneCard: {
    marginBottom: spacing.md,
  },
  milestoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  milestoneDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
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
  completedBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.successSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedText: {
    color: colors.success,
    fontSize: 14,
    fontWeight: '700',
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
