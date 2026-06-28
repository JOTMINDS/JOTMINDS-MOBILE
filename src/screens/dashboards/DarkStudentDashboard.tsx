import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import DarkScreenBackground from '../../components/DarkScreenBackground';
import DarkGlassCard from '../../components/DarkGlassCard';
import { darkColors, darkRadii, darkSpacing, darkShadow } from '../../theme-dark';

export default function DarkStudentDashboard({ navigation }: any) {
  const [activeFilter, setActiveFilter] = useState('all');

  const assessments = [
    {
      id: '1',
      type: 'learning',
      title: 'Learning Agility',
      description: 'Discover how you learn best',
      icon: '📚',
      gradient: darkColors.gradientCyan,
      completed: false,
    },
    {
      id: '2',
      type: 'thinking',
      title: 'Thinking Style',
      description: 'Understand how you think',
      icon: '🧠',
      gradient: darkColors.gradientPurple,
      completed: true,
    },
    {
      id: '3',
      type: 'decision',
      title: 'Decision Style',
      description: 'Learn how you make decisions',
      icon: '🎯',
      gradient: darkColors.gradientCoral,
      completed: false,
    },
  ];

  const stats = [
    { label: 'Completed', value: '2', icon: '✓' },
    { label: 'Profile', value: '67%', icon: '📊' },
    { label: 'Streak', value: '5', icon: '🔥' },
  ];

  return (
    <DarkScreenBackground>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>WELCOME BACK</Text>
            <Text style={styles.userName}>Sarah Johnson 👋</Text>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <LinearGradient
              colors={darkColors.gradientPurple}
              style={styles.profileAvatar}
            >
              <Text style={styles.profileInitial}>S</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Stats Card */}
        <DarkGlassCard variant="dark" padding={24} glowColor="purple" style={styles.statsCard}>
          <LinearGradient
            colors={darkColors.gradientPurple}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.statsGradient}
          >
            <Text style={styles.statsLabel}>YOUR PROGRESS</Text>
            <View style={styles.statsRow}>
              {stats.map((stat, index) => (
                <React.Fragment key={stat.label}>
                  {index > 0 && <View style={styles.statDivider} />}
                  <View style={styles.stat}>
                    <Text style={styles.statValue}>{stat.value}</Text>
                    <Text style={styles.statLabel}>{stat.label}</Text>
                  </View>
                </React.Fragment>
              ))}
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '67%' }]} />
            </View>
          </LinearGradient>
        </DarkGlassCard>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.quickAction, styles.quickActionPrimary]}
          >
            <LinearGradient
              colors={darkColors.gradientCyan}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.quickActionGradient}
            >
              <Text style={styles.quickActionIcon}>🚀</Text>
              <Text style={styles.quickActionText}>Start Learning</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction}>
            <View style={styles.quickActionOutline}>
              <Text style={styles.quickActionIconSmall}>📈</Text>
              <Text style={styles.quickActionTextSmall}>View Progress</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Assessments</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See All →</Text>
          </TouchableOpacity>
        </View>

        {/* Assessment Cards */}
        {assessments.map((assessment) => (
          <DarkGlassCard
            key={assessment.id}
            variant="medium"
            padding={0}
            style={styles.assessmentCard}
            onPress={() => navigation.navigate('AssessmentTaking')}
          >
            <LinearGradient
              colors={assessment.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.assessmentHeader}
            >
              <View style={styles.assessmentIconContainer}>
                <Text style={styles.assessmentIcon}>{assessment.icon}</Text>
              </View>
              {assessment.completed && (
                <View style={styles.completedBadge}>
                  <Text style={styles.completedBadgeText}>✓</Text>
                </View>
              )}
            </LinearGradient>
            <View style={styles.assessmentBody}>
              <Text style={styles.assessmentTitle}>{assessment.title}</Text>
              <Text style={styles.assessmentDescription}>
                {assessment.description}
              </Text>
              <TouchableOpacity style={styles.assessmentCTA}>
                <Text style={styles.assessmentCTAText}>
                  {assessment.completed ? 'View Results' : 'Start Now'} →
                </Text>
              </TouchableOpacity>
            </View>
          </DarkGlassCard>
        ))}

        {/* Daily Challenge */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Daily Challenge</Text>
        </View>
        <DarkGlassCard variant="dark" padding={20} glowColor="cyan">
          <View style={styles.challengeRow}>
            <LinearGradient
              colors={['#F59E0B', '#D97706']}
              style={styles.challengeIcon}
            >
              <Text style={styles.challengeIconText}>🎯</Text>
            </LinearGradient>
            <View style={styles.challengeContent}>
              <Text style={styles.challengeTitle}>Quick Logic Puzzle</Text>
              <Text style={styles.challengeDescription}>
                Complete today's challenge and earn 25 points
              </Text>
            </View>
            <View style={styles.pointsBadge}>
              <Text style={styles.pointsText}>+25</Text>
            </View>
          </View>
        </DarkGlassCard>
      </ScrollView>
    </DarkScreenBackground>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 11,
    color: darkColors.textMuted,
    letterSpacing: 1.2,
    fontWeight: '700',
    marginBottom: 4,
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    color: darkColors.textPrimary,
    letterSpacing: -0.6,
  },
  profileButton: {
    width: 48,
    height: 48,
  },
  profileAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitial: {
    color: darkColors.textPrimary,
    fontSize: 20,
    fontWeight: '800',
  },
  statsCard: {
    marginBottom: 20,
    overflow: 'hidden',
  },
  statsGradient: {
    padding: 24,
    borderRadius: darkRadii.xl,
  },
  statsLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    letterSpacing: 1.6,
    fontWeight: '700',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    color: darkColors.textPrimary,
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
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: darkColors.secondary,
    borderRadius: 3,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  quickAction: {
    flex: 1,
    height: 56,
  },
  quickActionPrimary: {
    flex: 2,
  },
  quickActionGradient: {
    flex: 1,
    borderRadius: darkRadii.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...darkShadow.glowCyan,
  },
  quickActionOutline: {
    flex: 1,
    borderRadius: darkRadii.md,
    borderWidth: 1,
    borderColor: darkColors.borderLight,
    backgroundColor: darkColors.glassMedium,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  quickActionIcon: {
    fontSize: 20,
  },
  quickActionText: {
    color: darkColors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  quickActionIconSmall: {
    fontSize: 16,
  },
  quickActionTextSmall: {
    color: darkColors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: darkColors.textPrimary,
    letterSpacing: -0.4,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
    color: darkColors.primary,
  },
  assessmentCard: {
    marginBottom: 16,
    overflow: 'hidden',
  },
  assessmentHeader: {
    height: 80,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  assessmentIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  assessmentIcon: {
    fontSize: 28,
  },
  completedBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedBadgeText: {
    color: darkColors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  assessmentBody: {
    padding: 20,
  },
  assessmentTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: darkColors.textPrimary,
    marginBottom: 6,
  },
  assessmentDescription: {
    fontSize: 14,
    color: darkColors.textMuted,
    lineHeight: 20,
    marginBottom: 12,
  },
  assessmentCTA: {
    alignSelf: 'flex-start',
  },
  assessmentCTAText: {
    fontSize: 14,
    fontWeight: '700',
    color: darkColors.primary,
  },
  challengeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  challengeIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  challengeIconText: {
    fontSize: 24,
  },
  challengeContent: {
    flex: 1,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: darkColors.textPrimary,
    marginBottom: 4,
  },
  challengeDescription: {
    fontSize: 13,
    color: darkColors.textMuted,
    lineHeight: 18,
  },
  pointsBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  pointsText: {
    color: '#F59E0B',
    fontWeight: '700',
    fontSize: 14,
  },
});
