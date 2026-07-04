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

interface CoachingPathway {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: string;
  modules: number;
  icon: string;
  gradient: [string, string];
  progress: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export default function CoachingPathwaysScreen({ navigation }: any) {
  const colors = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const pathways: CoachingPathway[] = [
    {
      id: 'executive-function',
      title: 'Supporting Executive Function',
      description: 'Help your child develop planning, organization, and self-regulation skills',
      category: 'cognitive',
      duration: '4 weeks',
      modules: 8,
      icon: '🧠',
      gradient: ['#6E4D9C', '#5A3E82'],
      progress: 0,
      difficulty: 'beginner',
    },
    {
      id: 'emotional-regulation',
      title: 'Emotional Intelligence Coaching',
      description: 'Guide your child through understanding and managing emotions',
      category: 'emotional',
      duration: '6 weeks',
      modules: 12,
      icon: '❤️',
      gradient: ['#EC4899', '#DB2777'],
      progress: 40,
      difficulty: 'intermediate',
    },
    {
      id: 'learning-strategies',
      title: 'Effective Learning Strategies',
      description: 'Teach your child proven techniques for better retention and understanding',
      category: 'academic',
      duration: '5 weeks',
      modules: 10,
      icon: '📚',
      gradient: ['#3D52C9', '#2E3FA8'],
      progress: 0,
      difficulty: 'beginner',
    },
    {
      id: 'growth-mindset',
      title: 'Cultivating Growth Mindset',
      description: 'Foster resilience and a love of learning in your child',
      category: 'mindset',
      duration: '3 weeks',
      modules: 6,
      icon: '🌱',
      gradient: ['#10B981', '#059669'],
      progress: 75,
      difficulty: 'beginner',
    },
    {
      id: 'social-skills',
      title: 'Social Skills Development',
      description: 'Support your child in building healthy peer relationships',
      category: 'social',
      duration: '4 weeks',
      modules: 8,
      icon: '👥',
      gradient: ['#F59E0B', '#D97706'],
      progress: 0,
      difficulty: 'intermediate',
    },
    {
      id: 'critical-thinking',
      title: 'Critical Thinking at Home',
      description: 'Engage your child in activities that develop analytical skills',
      category: 'cognitive',
      duration: '6 weeks',
      modules: 12,
      icon: '🔍',
      gradient: ['#6366F1', '#4F46E5'],
      progress: 20,
      difficulty: 'intermediate',
    },
  ];

  const categories = [
    { id: 'all', label: 'All Pathways', icon: '🌟' },
    { id: 'cognitive', label: 'Cognitive', icon: '🧠' },
    { id: 'emotional', label: 'Emotional', icon: '❤️' },
    { id: 'academic', label: 'Academic', icon: '📚' },
    { id: 'social', label: 'Social', icon: '👥' },
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return colors.success;
      case 'intermediate':
        return colors.warning;
      case 'advanced':
        return colors.coral;
      default:
        return colors.textMuted;
    }
  };

  const filteredPathways =
    selectedCategory === 'all'
      ? pathways
      : pathways.filter((p) => p.category === selectedCategory);

  return (
    <ScreenBackground>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>Coaching Pathways</Text>
 <Text style={styles.name}>Expert Guidance for Parents</Text>
          <Text style={styles.tagline}>
            Structured programs to support your child's development
          </Text>
        </View>

        <LinearGradient
          colors={['#EC4899', '#DB2777', '#6E4D9C']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.progressCard}
        >
          <Text style={styles.progressLabel}>YOUR COACHING JOURNEY</Text>
          <View style={styles.progressStatsRow}>
            <View style={styles.progressStat}>
              <Text style={styles.progressStatValue}>3</Text>
              <Text style={styles.progressStatLabel}>Active</Text>
            </View>
            <View style={styles.progressDivider} />
            <View style={styles.progressStat}>
              <Text style={styles.progressStatValue}>1</Text>
              <Text style={styles.progressStatLabel}>Completed</Text>
            </View>
            <View style={styles.progressDivider} />
            <View style={styles.progressStat}>
              <Text style={styles.progressStatValue}>24</Text>
              <Text style={styles.progressStatLabel}>Modules</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
          >
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setSelectedCategory(cat.id)}
                style={[
                  styles.categoryChip,
                  selectedCategory === cat.id && styles.categoryChipActive,
                ]}
              >
                <AppIcon name={cat.icon} size={22} style={styles.categoryIcon} />
                <Text
                  style={[
                    styles.categoryLabel,
                    selectedCategory === cat.id && styles.categoryLabelActive,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Pathways</Text>
          {filteredPathways.map((pathway) => (
            <GlassCard
              key={pathway.id}
              onPress={() =>
                navigation.navigate('PathwayDetail', { pathway })
              }
              style={styles.pathwayCard}
            >
              <View style={styles.pathwayRow}>
                <LinearGradient
                  colors={pathway.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.pathwayIconWrap}
                >
                  <AppIcon name={pathway.icon} size={22} style={styles.pathwayIcon} />
                </LinearGradient>
                <View style={styles.pathwayContent}>
                  <Text style={styles.pathwayTitle}>{pathway.title}</Text>
                  <Text style={styles.pathwayDescription}>
                    {pathway.description}
                  </Text>
                  <View style={styles.pathwayMetaRow}>
                    <View
                      style={[
                        styles.difficultyBadge,
                        {
                          backgroundColor: `${getDifficultyColor(pathway.difficulty)}20`,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.difficultyText,
                          { color: getDifficultyColor(pathway.difficulty) },
                        ]}
                      >
                        {pathway.difficulty}
                      </Text>
                    </View>
                    <Text style={styles.metaText}>⏱ {pathway.duration}</Text>
                    <Text style={styles.metaText}>
 {pathway.modules} modules
                    </Text>
                  </View>
                  {pathway.progress > 0 && (
                    <View style={styles.progressBarWrap}>
                      <View style={styles.progressBarTrack}>
                        <View
                          style={[
                            styles.progressBarFill,
                            { width: `${pathway.progress}%` },
                          ]}
                        />
                      </View>
                      <Text style={styles.progressPercent}>
                        {pathway.progress}%
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </GlassCard>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Expert Insights</Text>
          <GlassCard padding={20}>
            <View style={styles.insightRow}>
              <LinearGradient
                colors={['#10B981', '#059669']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.insightIconWrap}
              >
                <AppIcon name="💡" size={22} style={styles.insightIcon} />
              </LinearGradient>
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>
                  This Week's Coaching Tip
                </Text>
                <Text style={styles.insightText}>
                  Celebrate effort over outcomes. When your child works hard on a
                  challenge, acknowledge their persistence rather than just the
                  result.
                </Text>
              </View>
            </View>
          </GlassCard>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <GlassCard
            padding={16}
            style={styles.actionCard}
            onPress={() => navigation.navigate('ExpertConsultation')}
          >
            <View style={styles.actionRow}>
              <LinearGradient
                colors={['#EC4899', '#DB2777']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.actionIconWrap}
              >
                <AppIcon name="👨‍⚕️" size={22} style={styles.actionIcon} />
              </LinearGradient>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Book Expert Consultation</Text>
                <Text style={styles.actionDescription}>
                  Get personalized guidance from our specialists
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
  progressCard: {
    borderRadius: radii.xl,
    padding: spacing.xxl,
    marginBottom: spacing.xxl,
    ...shadow.glow,
  },
  progressLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    letterSpacing: 1.6,
    fontWeight: '700',
    marginBottom: 12,
  },
  progressStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressStat: {
    flex: 1,
    alignItems: 'center',
  },
  progressStatValue: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800',
  },
  progressStatLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    marginTop: 2,
  },
  progressDivider: {
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
  categoryScroll: {
    marginBottom: spacing.md,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoryChipActive: {
    backgroundColor: colors.coral,
    borderColor: colors.coral,
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  categoryLabelActive: {
    color: '#FFFFFF',
  },
  pathwayCard: {
    marginBottom: spacing.md,
  },
  pathwayRow: {
    flexDirection: 'row',
  },
  pathwayIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
  },
  pathwayIcon: {
    fontSize: 28,
  },
  pathwayContent: {
    flex: 1,
  },
  pathwayTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  pathwayDescription: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  pathwayMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: spacing.sm,
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: spacing.sm,
    marginBottom: 4,
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metaText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
    marginRight: spacing.sm,
    marginBottom: 4,
  },
  progressBarWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  progressBarTrack: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(236, 72, 153, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
    marginRight: spacing.sm,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.coral,
    borderRadius: 3,
  },
  progressPercent: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.coral,
    minWidth: 35,
    textAlign: 'right',
  },
  insightRow: {
    flexDirection: 'row',
  },
  insightIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
  },
  insightIcon: {
    fontSize: 24,
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
    color: colors.coral,
    fontWeight: '700',
  },
});
