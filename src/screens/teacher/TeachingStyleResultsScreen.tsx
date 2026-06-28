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
import { colors, radii, shadow, spacing, Palette } from '../../theme';
import { useTheme, useThemedStyles } from '../../context/ThemeContext';

export default function TeachingStyleResultsScreen({ route, navigation }: any) {
  const colors = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { answers } = route.params || { answers: [] };

  // Calculate teaching style based on answers (simplified logic)
  const getTeachingStyle = () => {
    const counts = [0, 0, 0, 0];
    answers.forEach((answer: number) => {
      counts[answer]++;
    });
    const maxIndex = counts.indexOf(Math.max(...counts));

    const styles = [
      {
        name: 'Structured Instructor',
        description: 'You excel at providing clear, organized instruction with well-defined learning objectives',
        strengths: ['Clear communication', 'Organized planning', 'Consistent routines'],
        growth: ['Incorporate more student choice', 'Try flexible grouping'],
        icon: '📚',
        gradient: ['#6E4D9C', '#5A3E82'] as [string, string],
      },
      {
        name: 'Inquiry Facilitator',
        description: 'You guide students to discover knowledge through exploration and questioning',
        strengths: ['Fostering curiosity', 'Problem-based learning', 'Critical thinking'],
        growth: ['Balance with direct instruction', 'Ensure foundational knowledge'],
        icon: '🔍',
        gradient: ['#3D52C9', '#2E3FA8'] as [string, string],
      },
      {
        name: 'Collaborative Coach',
        description: 'You create dynamic learning communities where students learn together',
        strengths: ['Building relationships', 'Peer learning', 'Communication skills'],
        growth: ['Monitor individual progress', 'Balance group and solo work'],
        icon: '👥',
        gradient: ['#EC4899', '#DB2777'] as [string, string],
      },
      {
        name: 'Differentiated Mentor',
        description: 'You tailor instruction to meet each student where they are',
        strengths: ['Personalization', 'Individual support', 'Responsive teaching'],
        growth: ['Streamline management', 'Use flexible grouping'],
        icon: '🎯',
        gradient: ['#10B981', '#059669'] as [string, string],
      },
    ];

    return styles[maxIndex];
  };

  const teachingStyle = getTeachingStyle();

  return (
    <ScreenBackground>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>Assessment Complete!</Text>
          <Text style={styles.name}>Your Teaching Style {teachingStyle.icon}</Text>
        </View>

        <LinearGradient
          colors={teachingStyle.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.styleCard}
        >
          <Text style={styles.styleLabel}>YOUR PRIMARY STYLE</Text>
          <Text style={styles.styleName}>{teachingStyle.name}</Text>
          <Text style={styles.styleDescription}>
            {teachingStyle.description}
          </Text>
        </LinearGradient>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Strengths</Text>
          {teachingStyle.strengths.map((strength, index) => (
            <GlassCard key={index} padding={16} style={styles.itemCard}>
              <View style={styles.itemRow}>
                <View style={styles.strengthDot} />
                <Text style={styles.itemText}>{strength}</Text>
              </View>
            </GlassCard>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Growth Opportunities</Text>
          {teachingStyle.growth.map((opportunity, index) => (
            <GlassCard key={index} padding={16} style={styles.itemCard}>
              <View style={styles.itemRow}>
                <View style={styles.growthDot} />
                <Text style={styles.itemText}>{opportunity}</Text>
              </View>
            </GlassCard>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommended Actions</Text>
          <GlassCard padding={20} style={styles.actionCard}>
            <View style={styles.actionRow}>
              <LinearGradient
                colors={['#6E4D9C', '#5A3E82']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.actionIconWrap}
              >
                <AppIcon name="📚" size={22} style={styles.actionIcon} />
              </LinearGradient>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>
                  Explore Development Modules
                </Text>
                <Text style={styles.actionDescription}>
                  Find modules tailored to your teaching style
                </Text>
              </View>
              <AppIcon name="→" size={18} style={styles.actionArrow} />
            </View>
          </GlassCard>

          <GlassCard
            padding={20}
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
                <Text style={styles.actionTitle}>Track Your Growth</Text>
                <Text style={styles.actionDescription}>
                  Set goals and monitor your progress
                </Text>
              </View>
              <AppIcon name="→" size={18} style={styles.actionArrow} />
            </View>
          </GlassCard>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate('TeacherDevelopment')}
        >
          <LinearGradient
            colors={['#10B981', '#059669']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.continueButton}
          >
            <Text style={styles.continueButtonText}>
              Continue to Development →
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.retryButton}
        >
          <Text style={styles.retryButtonText}>Retake Assessment</Text>
        </TouchableOpacity>
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
  styleCard: {
    borderRadius: radii.xl,
    padding: spacing.xxl,
    marginBottom: spacing.xxl,
    ...shadow.glow,
  },
  styleLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    letterSpacing: 1.6,
    fontWeight: '700',
    marginBottom: 8,
  },
  styleName: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800',
    marginBottom: spacing.md,
  },
  styleDescription: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 15,
    lineHeight: 22,
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
  itemCard: {
    marginBottom: spacing.md,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  strengthDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.success,
    marginRight: spacing.md,
  },
  growthDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.cyan,
    marginRight: spacing.md,
  },
  itemText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 21,
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
    color: colors.success,
    fontSize: 16,
    fontWeight: '700',
  },
});
