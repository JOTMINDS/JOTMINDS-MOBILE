import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenBackground from '../../components/ScreenBackground';
import AppIcon from '../../components/AppIcon';
import GlassCard from '../../components/GlassCard';
import { callEdgeFn } from '../../utils/supabase';
import { colors, radii, shadow, spacing, Palette } from '../../theme';
import { useTheme, useThemedStyles } from '../../context/ThemeContext';

interface SkillPlan {
  planId: string;
  dimensionId: string;
  lengthDays: number;
  activities: { day: number; completed?: boolean }[];
}

interface SkillModule {
  id: string;
  title: string;
  description: string;
  skillArea: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  icon: string;
  gradient: [string, string];
  progress: number;
  locked: boolean;
}

export default function SkillBuilderScreen({ navigation }: any) {
  const colors = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [plans, setPlans] = useState<SkillPlan[]>([]);

  useEffect(() => {
    // Auto-generated gap-closure curriculums (created server-side when a user
    // scores < 50 on a dimension). Falls back silently if none / offline.
    callEdgeFn('/skill-plan/list')
      .then((d) => setPlans(d?.plans ?? []))
      .catch(() => {});
  }, []);

  const dimLabel = (id: string) =>
    id.replace(/[_-]/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());

  const isPlanComplete = (plan: SkillPlan) => {
    const total = plan.activities?.length ?? plan.lengthDays;
    const done = plan.activities?.filter((a) => a.completed).length ?? 0;
    return total > 0 && done >= total;
  };
  const completedPlanCount = plans.filter(isPlanComplete).length;
  const activePlanCount = plans.length - completedPlanCount;

  const skillModules: SkillModule[] = [
    {
      id: 'critical-thinking-1',
      title: 'Critical Thinking Basics',
      description: 'Learn to analyze information and evaluate arguments',
      skillArea: 'Critical Thinking',
      difficulty: 'beginner',
      duration: '15 min',
      icon: '🔍',
      gradient: ['#3D52C9', '#2E3FA8'],
      progress: 0,
      locked: false,
    },
    {
      id: 'problem-solving-1',
      title: 'Problem Solving Strategies',
      description: 'Master techniques to break down complex problems',
      skillArea: 'Problem Solving',
      difficulty: 'beginner',
      duration: '20 min',
      icon: '🧩',
      gradient: ['#6E4D9C', '#5A3E82'],
      progress: 60,
      locked: false,
    },
    {
      id: 'creative-thinking-1',
      title: 'Creative Ideation',
      description: 'Unlock your creative potential with brainstorming techniques',
      skillArea: 'Creative Thinking',
      difficulty: 'intermediate',
      duration: '25 min',
      icon: '💡',
      gradient: ['#EC4899', '#DB2777'],
      progress: 0,
      locked: false,
    },
    {
      id: 'memory-techniques-1',
      title: 'Memory Enhancement',
      description: 'Improve recall with proven memory techniques',
      skillArea: 'Memory',
      difficulty: 'beginner',
      duration: '18 min',
      icon: '🧠',
      gradient: ['#F59E0B', '#D97706'],
      progress: 0,
      locked: false,
    },
    {
      id: 'decision-making-1',
      title: 'Effective Decision Making',
      description: 'Learn frameworks for making better decisions',
      skillArea: 'Decision Making',
      difficulty: 'intermediate',
      duration: '22 min',
      icon: '⚖️',
      gradient: ['#10B981', '#059669'],
      progress: 30,
      locked: false,
    },
    {
      id: 'logical-reasoning-1',
      title: 'Logical Reasoning',
      description: 'Strengthen your logical thinking patterns',
      skillArea: 'Logical Reasoning',
      difficulty: 'intermediate',
      duration: '20 min',
      icon: '🎯',
      gradient: ['#6366F1', '#4F46E5'],
      progress: 0,
      locked: true,
    },
  ];

  const categories = [
    { id: 'all', label: 'All Skills', icon: '📚' },
    { id: 'thinking', label: 'Thinking', icon: '🧠' },
    { id: 'problem-solving', label: 'Problem Solving', icon: '🧩' },
    { id: 'creativity', label: 'Creativity', icon: '💡' },
    { id: 'memory', label: 'Memory', icon: '🎓' },
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

  return (
    <ScreenBackground>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>Skill Builder</Text>
 <Text style={styles.name}>Build Your Cognitive Strengths</Text>
          <Text style={styles.tagline}>
            Interactive exercises to develop your thinking skills
          </Text>
        </View>

        <LinearGradient
          colors={['#14136E', '#2C2E83', '#6E4D9C']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.progressCard}
        >
          <Text style={styles.progressLabel}>YOUR SKILL PLANS</Text>
          <View style={styles.progressStatsRow}>
            <View style={styles.progressStat}>
              <Text style={styles.progressStatValue}>{activePlanCount}</Text>
              <Text style={styles.progressStatLabel}>Active</Text>
            </View>
            <View style={styles.progressDivider} />
            <View style={styles.progressStat}>
              <Text style={styles.progressStatValue}>{completedPlanCount}</Text>
              <Text style={styles.progressStatLabel}>Completed</Text>
            </View>
            <View style={styles.progressDivider} />
            <View style={styles.progressStat}>
              <Text style={styles.progressStatValue}>{plans.length}</Text>
              <Text style={styles.progressStatLabel}>Total Plans</Text>
            </View>
          </View>
          {plans.length === 0 && (
            <Text style={styles.progressHint}>
              Plans are auto-built when you score below 50 on a cognitive dimension.
            </Text>
          )}
        </LinearGradient>

        {plans.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Skill Plans</Text>
            <Text style={styles.planHint}>Auto-built to close your weakest cognitive gaps</Text>
            {plans.map((plan) => {
              const total = plan.activities?.length ?? plan.lengthDays;
              const done = plan.activities?.filter((a) => a.completed).length ?? 0;
              const pct = total ? Math.round((done / total) * 100) : 0;
              return (
                <GlassCard key={plan.planId} style={styles.planCard} glowColor="purple">
                  <View style={styles.planTop}>
                    <View style={styles.planIconWrap}>
                      <AppIcon name="🌱" size={20} color={colors.success} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.planTitle}>{dimLabel(plan.dimensionId)}</Text>
                      <Text style={styles.planMeta}>{plan.lengthDays}-day plan · {done}/{total} days done</Text>
                    </View>
                    <Text style={styles.planPct}>{pct}%</Text>
                  </View>
                  <View style={styles.planBarTrack}>
                    <View style={[styles.planBarFill, { width: `${pct}%` }]} />
                  </View>
                </GlassCard>
              );
            })}
          </View>
        )}

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
          <Text style={styles.sectionTitle}>Available Modules</Text>
          {skillModules.map((module) => (
            <GlassCard
              key={module.id}
              onPress={() =>
                !module.locked &&
                navigation.navigate('PracticeModule', { moduleId: module.id })
              }
              style={styles.moduleCard}
              opacity={module.locked ? 0.5 : undefined}
            >
              <View style={styles.moduleRow}>
                <LinearGradient
                  colors={module.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.moduleIconWrap}
                >
                  <AppIcon name={module.icon} size={22} style={styles.moduleIcon} />
                </LinearGradient>
                <View style={styles.moduleContent}>
                  <View style={styles.moduleHeader}>
                    <Text style={styles.moduleTitle}>{module.title}</Text>
                    {module.locked && <AppIcon name="🔒" size={18} style={styles.lockIcon} />}
                  </View>
                  <Text style={styles.moduleDescription}>
                    {module.description}
                  </Text>
                  <View style={styles.moduleMetaRow}>
                    <View
                      style={[
                        styles.difficultyBadge,
                        {
                          backgroundColor: `${getDifficultyColor(module.difficulty)}20`,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.difficultyText,
                          { color: getDifficultyColor(module.difficulty) },
                        ]}
                      >
                        {module.difficulty}
                      </Text>
                    </View>
                    <Text style={styles.durationText}>⏱ {module.duration}</Text>
                  </View>
                  {module.progress > 0 && (
                    <View style={styles.progressBarWrap}>
                      <View style={styles.progressBarTrack}>
                        <View
                          style={[
                            styles.progressBarFill,
                            { width: `${module.progress}%` },
                          ]}
                        />
                      </View>
                      <Text style={styles.progressPercent}>
                        {module.progress}%
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </GlassCard>
          ))}
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
  planHint: { fontSize: 13, color: colors.textMuted, marginTop: -8, marginBottom: spacing.md },
  progressHint: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: spacing.md, textAlign: 'center' },
  planCard: { marginBottom: spacing.md },
  planTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  planIconWrap: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: 'rgba(16,185,129,0.15)', justifyContent: 'center', alignItems: 'center',
  },
  planTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  planMeta: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  planPct: { fontSize: 18, fontWeight: '800', color: colors.success },
  planBarTrack: { height: 8, backgroundColor: colors.bgTertiary, borderRadius: 4, overflow: 'hidden' },
  planBarFill: { height: '100%', borderRadius: 4, backgroundColor: colors.success },
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
    backgroundColor: colors.purple,
    borderColor: colors.purple,
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
  moduleCard: {
    marginBottom: spacing.md,
  },
  moduleRow: {
    flexDirection: 'row',
  },
  moduleIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
  },
  moduleIcon: {
    fontSize: 28,
  },
  moduleContent: {
    flex: 1,
  },
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  moduleTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  lockIcon: {
    fontSize: 16,
    marginLeft: 8,
  },
  moduleDescription: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  moduleMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: spacing.sm,
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  durationText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
  },
  progressBarWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  progressBarTrack: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
    marginRight: spacing.sm,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.purple,
    borderRadius: 3,
  },
  progressPercent: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.purple,
    minWidth: 35,
    textAlign: 'right',
  },
});
