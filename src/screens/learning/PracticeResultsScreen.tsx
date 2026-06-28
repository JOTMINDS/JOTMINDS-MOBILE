import React from 'react';
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
import { colors, radii, shadow, spacing } from '../../theme';

export default function PracticeResultsScreen({ route, navigation }: any) {
  const { score, total, moduleId } = route.params;
  const percentage = Math.round((score / total) * 100);

  const getPerformanceLevel = () => {
    if (percentage >= 80) return { level: 'Excellent', emoji: '🌟', color: colors.success };
    if (percentage >= 60) return { level: 'Good', emoji: '👍', color: colors.cyan };
    if (percentage >= 40) return { level: 'Fair', emoji: '📚', color: colors.warning };
    return { level: 'Needs Practice', emoji: '💪', color: colors.coral };
  };

  const performance = getPerformanceLevel();

  const recommendations = [
    {
      id: '1',
      title: 'Review Key Concepts',
      description: 'Go back and review the questions you missed',
      icon: '📖',
      gradient: ['#3D52C9', '#2E3FA8'] as [string, string],
    },
    {
      id: '2',
      title: 'Try Advanced Module',
      description: 'Challenge yourself with harder exercises',
      icon: '🚀',
      gradient: ['#6E4D9C', '#5A3E82'] as [string, string],
    },
    {
      id: '3',
      title: 'Join Study Group',
      description: 'Practice with peers in your learning community',
      icon: '👥',
      gradient: ['#EC4899', '#DB2777'] as [string, string],
    },
  ];

  return (
    <ScreenBackground>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>Practice Complete!</Text>
          <Text style={styles.name}>Great Work! {performance.emoji}</Text>
        </View>

        <LinearGradient
          colors={['#14136E', '#2C2E83', '#6E4D9C']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.scoreCard}
        >
          <Text style={styles.scoreLabel}>YOUR SCORE</Text>
          <Text style={styles.scoreValue}>
            {score} / {total}
          </Text>
          <Text style={styles.scorePercentage}>{percentage}%</Text>
          <View style={styles.performanceRow}>
            <View style={[styles.performanceBadge, { backgroundColor: performance.color }]}>
              <Text style={styles.performanceText}>{performance.level}</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Insights</Text>
          <GlassCard padding={20} style={styles.insightCard}>
            <View style={styles.insightRow}>
              <AppIcon name="💡" size={22} style={styles.insightIcon} />
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>Strength Identified</Text>
                <Text style={styles.insightText}>
                  You excel at analyzing arguments and identifying conclusions. Keep building on this skill!
                </Text>
              </View>
            </View>
          </GlassCard>

          <GlassCard padding={20} style={styles.insightCard}>
            <View style={styles.insightRow}>
              <AppIcon name="🎯" size={22} style={styles.insightIcon} />
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>Area for Growth</Text>
                <Text style={styles.insightText}>
                  Practice recognizing cognitive biases in real-world scenarios to strengthen your critical thinking.
                </Text>
              </View>
            </View>
          </GlassCard>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommended Next Steps</Text>
          {recommendations.map((rec) => (
            <GlassCard
              key={rec.id}
              onPress={() => {}}
              style={styles.recommendationCard}
            >
              <View style={styles.recRow}>
                <LinearGradient
                  colors={rec.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.recIconWrap}
                >
                  <AppIcon name={rec.icon} size={22} style={styles.recIcon} />
                </LinearGradient>
                <View style={styles.recContent}>
                  <Text style={styles.recTitle}>{rec.title}</Text>
                  <Text style={styles.recDescription}>{rec.description}</Text>
                </View>
                <AppIcon name="→" size={18} style={styles.recArrow} />
              </View>
            </GlassCard>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <GlassCard padding={20}>
            <View style={styles.achievementRow}>
              <LinearGradient
                colors={['#F59E0B', '#D97706']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.achievementIconWrap}
              >
                <AppIcon name="🏆" size={22} style={styles.achievementIcon} />
              </LinearGradient>
              <View style={styles.achievementContent}>
                <Text style={styles.achievementTitle}>Module Completed</Text>
                <Text style={styles.achievementDescription}>
                  You've earned 50 points
                </Text>
              </View>
              <View style={styles.pointsBadge}>
 <Text style={styles.pointsText}>+50</Text>
              </View>
            </View>
          </GlassCard>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('SkillBuilder')}>
          <LinearGradient
            colors={['#6E4D9C', '#5A3E82']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.continueButton}
          >
            <Text style={styles.continueButtonText}>Continue Learning →</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.retryButton}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingTop: 56,
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
  scoreCard: {
    borderRadius: radii.xl,
    padding: spacing.xxl,
    marginBottom: spacing.xxl,
    alignItems: 'center',
    ...shadow.glow,
  },
  scoreLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    letterSpacing: 1.6,
    fontWeight: '700',
  },
  scoreValue: {
    color: '#FFFFFF',
    fontSize: 48,
    fontWeight: '800',
    marginTop: 8,
  },
  scorePercentage: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 28,
    fontWeight: '700',
    marginTop: 4,
  },
  performanceRow: {
    marginTop: spacing.lg,
  },
  performanceBadge: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 16,
  },
  performanceText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
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
  insightCard: {
    marginBottom: spacing.md,
  },
  insightRow: {
    flexDirection: 'row',
  },
  insightIcon: {
    fontSize: 28,
    marginRight: spacing.md,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  insightText: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
  },
  recommendationCard: {
    marginBottom: spacing.md,
  },
  recRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
  },
  recIcon: {
    fontSize: 24,
  },
  recContent: {
    flex: 1,
  },
  recTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  recDescription: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
  },
  recArrow: {
    fontSize: 22,
    color: colors.purple,
    fontWeight: '700',
  },
  achievementRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  achievementIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
  },
  achievementIcon: {
    fontSize: 24,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  achievementDescription: {
    fontSize: 13,
    color: colors.textMuted,
  },
  pointsBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  pointsText: {
    color: '#B45309',
    fontWeight: '700',
    fontSize: 13,
  },
  continueButton: {
    borderRadius: radii.lg,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadow.glow,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  retryButton: {
    borderRadius: radii.lg,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  retryButtonText: {
    color: colors.purple,
    fontSize: 16,
    fontWeight: '700',
  },
});
