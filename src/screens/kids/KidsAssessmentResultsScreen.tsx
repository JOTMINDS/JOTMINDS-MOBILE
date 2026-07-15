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

export default function KidsAssessmentResultsScreen({ route, navigation }: any) {
  const colors = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { answers } = route.params || { answers: [] };

  // Simplified learning style determination
  const getLearningstyle = () => {
    const styles = [
      {
        name: 'Super Reader',
        emoji: '📚',
        description: 'You learn best by reading and writing!',
        tips: ['Read books about things you love', 'Write down new words', 'Make lists and notes'],
        gradient: ['#6E4D9C', '#5A3E82'] as [string, string],
      },
      {
        name: 'Picture Thinker',
        emoji: '🎨',
        description: 'You learn best with pictures and drawings!',
        tips: ['Draw what you learn', 'Watch videos', 'Use colorful diagrams'],
        gradient: ['#3D52C9', '#2E3FA8'] as [string, string],
      },
      {
        name: 'Hands-On Learner',
        emoji: '🤸',
        description: 'You learn best by doing and moving!',
        tips: ['Build things', 'Act things out', 'Try experiments'],
        gradient: ['#10B981', '#059669'] as [string, string],
      },
      {
        name: 'Team Player',
        emoji: '👥',
        description: 'You learn best by talking with others!',
        tips: ['Work with friends', 'Discuss ideas', 'Teach what you know'],
        gradient: ['#EC4899', '#DB2777'] as [string, string],
      },
    ];

    // Tally the most frequent answer index across all 3 real answers,
    // rather than only looking at the first one — each question's options
    // are ordered the same way (0=reading/writing, 1=visual, 2=hands-on,
    // 3=social), so the mode across all 3 is a fair aggregate style.
    const counts = [0, 0, 0, 0];
    answers.forEach((a: number) => { if (a >= 0 && a < 4) counts[a] += 1; });
    const styleIndex = counts.indexOf(Math.max(...counts));
    return styles[styleIndex];
  };

  const learningStyle = getLearningstyle();

  return (
    <ScreenBackground>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <AppIcon name="🎉" size={18} style={styles.celebration} />
          <Text style={styles.headerTitle}>You Did It!</Text>
          <Text style={styles.headerSubtitle}>Here's what we learned about you</Text>
        </View>

        <LinearGradient
          colors={learningStyle.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.resultCard}
        >
          <AppIcon name={learningStyle.emoji} size={22} style={styles.resultEmoji} />
          <Text style={styles.resultName}>{learningStyle.name}</Text>
          <Text style={styles.resultDescription}>
            {learningStyle.description}
          </Text>
        </LinearGradient>

        <View style={styles.section}>
 <Text style={styles.sectionTitle}>Tips to Learn Better</Text>
          {learningStyle.tips.map((tip, index) => (
            <GlassCard key={index} padding={18} style={styles.tipCard}>
              <View style={styles.tipRow}>
                <View style={styles.tipNumber}>
                  <Text style={styles.tipNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            </GlassCard>
          ))}
        </View>

        <View style={styles.section}>
 <Text style={styles.sectionTitle}>Fun Activities</Text>
          <GlassCard padding={20} style={styles.activityCard} onPress={() => navigation.navigate('BrainGym')}>
            <View style={styles.activityRow}>
              <AppIcon name="🌟" size={22} style={styles.activityEmoji} />
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Brain Games</Text>
                <Text style={styles.activityDescription}>
                  Play fun games to make your brain stronger
                </Text>
              </View>
              <AppIcon name="→" size={18} style={styles.activityArrow} />
            </View>
          </GlassCard>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate('Main')}
        >
          <LinearGradient
            colors={['#10B981', '#059669']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.doneButton}
          >
            <Text style={styles.doneButtonText}>Awesome! Let's Go! 🚀</Text>
          </LinearGradient>
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
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  celebration: {
    fontSize: 80,
    marginBottom: spacing.md,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 17,
    color: colors.textMuted,
  },
  resultCard: {
    borderRadius: radii.xl,
    padding: spacing.xxl * 1.5,
    marginBottom: spacing.xxl,
    alignItems: 'center',
    ...shadow.glow,
  },
  resultEmoji: {
    fontSize: 72,
    marginBottom: spacing.lg,
  },
  resultName: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: spacing.sm,
  },
  resultDescription: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 17,
    textAlign: 'center',
    lineHeight: 24,
  },
  section: {
    marginBottom: spacing.xxl,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  tipCard: {
    marginBottom: spacing.md,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tipNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  tipNumberText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  tipText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 22,
  },
  activityCard: {
    marginBottom: spacing.md,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityEmoji: {
    fontSize: 36,
    marginRight: spacing.md,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  activityDescription: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
  },
  activityArrow: {
    fontSize: 24,
    color: colors.purple,
    fontWeight: '700',
  },
  doneButton: {
    borderRadius: radii.xl,
    paddingVertical: 20,
    alignItems: 'center',
    marginBottom: spacing.xxl,
    ...shadow.glow,
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
});
