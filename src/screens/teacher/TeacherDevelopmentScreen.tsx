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
import { colors, radii, shadow, spacing } from '../../theme';

interface DevelopmentModule {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: string;
  icon: string;
  gradient: [string, string];
  progress: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export default function TeacherDevelopmentScreen({ navigation }: any) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const modules: DevelopmentModule[] = [
    {
      id: 'differentiated-instruction',
      title: 'Differentiated Instruction',
      description: 'Adapt teaching methods to diverse learning styles and abilities',
      category: 'pedagogy',
      duration: '6 weeks',
      icon: '🎯',
      gradient: ['#10B981', '#059669'],
      progress: 45,
      difficulty: 'intermediate',
    },
    {
      id: 'classroom-management',
      title: 'Advanced Classroom Management',
      description: 'Create positive learning environments and manage behavior effectively',
      category: 'management',
      duration: '4 weeks',
      icon: '🏫',
      gradient: ['#6E4D9C', '#5A3E82'],
      progress: 0,
      difficulty: 'beginner',
    },
    {
      id: 'assessment-strategies',
      title: 'Formative Assessment Strategies',
      description: 'Use ongoing assessments to guide instruction and support growth',
      category: 'assessment',
      duration: '5 weeks',
      icon: '📊',
      gradient: ['#3D52C9', '#2E3FA8'],
      progress: 80,
      difficulty: 'intermediate',
    },
    {
      id: 'social-emotional',
      title: 'Social-Emotional Learning',
      description: 'Integrate SEL practices into daily instruction',
      category: 'well-being',
      duration: '4 weeks',
      icon: '❤️',
      gradient: ['#EC4899', '#DB2777'],
      progress: 20,
      difficulty: 'beginner',
    },
    {
      id: 'technology-integration',
      title: 'Technology Integration',
      description: 'Leverage digital tools to enhance learning outcomes',
      category: 'technology',
      duration: '5 weeks',
      icon: '💻',
      gradient: ['#6366F1', '#4F46E5'],
      progress: 0,
      difficulty: 'intermediate',
    },
    {
      id: 'culturally-responsive',
      title: 'Culturally Responsive Teaching',
      description: 'Build inclusive classrooms that honor diverse backgrounds',
      category: 'equity',
      duration: '6 weeks',
      icon: '🌍',
      gradient: ['#F59E0B', '#D97706'],
      progress: 0,
      difficulty: 'advanced',
    },
  ];

  const categories = [
    { id: 'all', label: 'All Modules', icon: '📚' },
    { id: 'pedagogy', label: 'Pedagogy', icon: '🎯' },
    { id: 'management', label: 'Management', icon: '🏫' },
    { id: 'assessment', label: 'Assessment', icon: '📊' },
    { id: 'technology', label: 'Technology', icon: '💻' },
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

  const filteredModules =
    selectedCategory === 'all'
      ? modules
      : modules.filter((m) => m.category === selectedCategory);

  return (
    <ScreenBackground>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>Professional Development</Text>
 <Text style={styles.name}>Grow Your Teaching Practice</Text>
          <Text style={styles.tagline}>
            Evidence-based modules to enhance your effectiveness
          </Text>
        </View>

        <LinearGradient
          colors={['#10B981', '#059669', '#14136E']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.progressCard}
        >
          <Text style={styles.progressLabel}>YOUR GROWTH JOURNEY</Text>
          <View style={styles.progressStatsRow}>
            <View style={styles.progressStat}>
              <Text style={styles.progressStatValue}>4</Text>
              <Text style={styles.progressStatLabel}>Active</Text>
            </View>
            <View style={styles.progressDivider} />
            <View style={styles.progressStat}>
              <Text style={styles.progressStatValue}>2</Text>
              <Text style={styles.progressStatLabel}>Completed</Text>
            </View>
            <View style={styles.progressDivider} />
            <View style={styles.progressStat}>
              <Text style={styles.progressStatValue}>12</Text>
              <Text style={styles.progressStatLabel}>Hours</Text>
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
          <Text style={styles.sectionTitle}>Development Modules</Text>
          {filteredModules.map((module) => (
            <GlassCard
              key={module.id}
              onPress={() =>
                navigation.navigate('TeachingStyleAssessment', {
                  moduleId: module.id,
                })
              }
              style={styles.moduleCard}
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
                  <Text style={styles.moduleTitle}>{module.title}</Text>
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
                    <Text style={styles.metaText}>⏱ {module.duration}</Text>
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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <GlassCard
            padding={16}
            style={styles.actionCard}
            onPress={() => navigation.navigate('TeachingStyleAssessment')}
          >
            <View style={styles.actionRow}>
              <LinearGradient
                colors={['#6E4D9C', '#5A3E82']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.actionIconWrap}
              >
                <AppIcon name="🎯" size={22} style={styles.actionIcon} />
              </LinearGradient>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>
                  Take Teaching Style Assessment
                </Text>
                <Text style={styles.actionDescription}>
                  Discover your unique teaching strengths
                </Text>
              </View>
              <AppIcon name="→" size={18} style={styles.actionArrow} />
            </View>
          </GlassCard>

          <GlassCard
            padding={16}
            style={styles.actionCard}
            onPress={() => navigation.navigate('GrowthTracker')}
          >
            <View style={styles.actionRow}>
              <LinearGradient
                colors={['#10B981', '#059669']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.actionIconWrap}
              >
                <AppIcon name="📈" size={22} style={styles.actionIcon} />
              </LinearGradient>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>View Growth Tracker</Text>
                <Text style={styles.actionDescription}>
                  Monitor your professional development progress
                </Text>
              </View>
              <AppIcon name="→" size={18} style={styles.actionArrow} />
            </View>
          </GlassCard>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Community Insights</Text>
          <GlassCard padding={20}>
            <View style={styles.insightRow}>
              <LinearGradient
                colors={['#3D52C9', '#2E3FA8']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.insightIconWrap}
              >
                <AppIcon name="💡" size={22} style={styles.insightIcon} />
              </LinearGradient>
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>This Week's Tip</Text>
                <Text style={styles.insightText}>
                  Try the "2-minute feedback" strategy: Give students immediate,
                  specific feedback during independent work to boost engagement.
                </Text>
              </View>
            </View>
          </GlassCard>
        </View>
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
    backgroundColor: colors.success,
    borderColor: colors.success,
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
  moduleTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
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
  metaText: {
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
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
    marginRight: spacing.sm,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.success,
    borderRadius: 3,
  },
  progressPercent: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.success,
    minWidth: 35,
    textAlign: 'right',
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
    color: colors.success,
    fontWeight: '700',
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
});
