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
import { teachingStyleProfiles, axisDescriptions } from '../../data/teachingStyleProfiles';
import { TeachingStyleScore } from '../../utils/teachingStyleScoring';
import CertificateModal from '../../components/CertificateModal';
import { useAuth } from '../../context/AuthContext';
import { colors, radii, shadow, spacing, Palette } from '../../theme';
import { useTheme, useThemedStyles } from '../../context/ThemeContext';

const PROFILE_STYLE: Record<string, { icon: string; gradient: [string, string] }> = {
  'Authoritative Instructor': { icon: '📐', gradient: ['#6E4D9C', '#5A3E82'] },
  'Structured Educator': { icon: '📚', gradient: ['#3D52C9', '#2E3FA8'] },
  'Facilitator Coach': { icon: '🌱', gradient: ['#10B981', '#059669'] },
  'Engagement Driver': { icon: '⚡', gradient: ['#EC4899', '#DB2777'] },
  'Learning Architect': { icon: '🏗️', gradient: ['#3D52C9', '#14136E'] },
  'Innovation Leader': { icon: '💡', gradient: ['#F59E0B', '#D97706'] },
  'Traditionalist': { icon: '📖', gradient: ['#6E4D9C', '#14136E'] },
  'Student-Centered Mentor': { icon: '🎯', gradient: ['#10B981', '#3D52C9'] },
};

const AXIS_ORDER: (keyof TeachingStyleScore['scores'])[] = [
  'axisAuthority', 'axisKnowledge', 'axisMotivation', 'axisAssessment', 'axisAdaptability', 'axisClimate',
];

export default function TeachingStyleResultsScreen({ route, navigation }: any) {
  const colors = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { user } = useAuth();
  const score: TeachingStyleScore | undefined = route.params?.score;
  const [showCertificate, setShowCertificate] = useState(false);

  if (!score) {
    return (
      <ScreenBackground>
        <View style={styles.centered}>
          <Text style={styles.emptyTitle}>No results yet</Text>
          <Text style={styles.emptyText}>Take the assessment to view your teaching style.</Text>
          <TouchableOpacity onPress={() => navigation.navigate('TeachingStyleAssessment')} style={{ marginTop: spacing.lg }}>
            <Text style={{ color: colors.success, fontWeight: '700' }}>Take Assessment</Text>
          </TouchableOpacity>
        </View>
      </ScreenBackground>
    );
  }

  const profile = teachingStyleProfiles[score.primaryStyle];
  const visual = PROFILE_STYLE[score.primaryStyle] ?? { icon: '🎓', gradient: ['#10B981', '#059669'] as [string, string] };

  return (
    <ScreenBackground>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>Assessment Complete!</Text>
          <Text style={styles.name}>Your Teaching Style {visual.icon}</Text>
        </View>

        <LinearGradient
          colors={visual.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.styleCard}
        >
          <Text style={styles.styleLabel}>YOUR PRIMARY STYLE</Text>
          <Text style={styles.styleName}>{score.primaryStyle}</Text>
          {score.secondaryStyle ? (
            <Text style={styles.styleSecondary}>Secondary: {score.secondaryStyle}</Text>
          ) : null}
        </LinearGradient>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Axis Scores</Text>
          <GlassCard padding={20}>
            {AXIS_ORDER.map((axis, i, arr) => {
              const desc = axisDescriptions[axis];
              const n = score.scores[axis];
              return (
                <View key={axis} style={[styles.scoreRow, i === arr.length - 1 && { marginBottom: 0 }]}>
                  <View style={styles.scoreHeader}>
                    <Text style={styles.scoreLabel}>{desc.title}</Text>
                    <Text style={styles.scoreValue}>{n}/100</Text>
                  </View>
                  <View style={styles.scoreBar}>
                    <LinearGradient
                      colors={visual.gradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[styles.scoreBarFill, { width: `${n}%` }]}
                    />
                  </View>
                  <View style={styles.scorePoles}>
                    <Text style={styles.scorePoleText}>{desc.low}</Text>
                    <Text style={styles.scorePoleText}>{desc.high}</Text>
                  </View>
                </View>
              );
            })}
          </GlassCard>
        </View>

        {profile && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Your Strengths</Text>
              {profile.strengths.map((strength, index) => (
                <GlassCard key={index} padding={16} style={styles.itemCard}>
                  <View style={styles.itemRow}>
                    <View style={styles.strengthDot} />
                    <Text style={styles.itemText}>{strength}</Text>
                  </View>
                </GlassCard>
              ))}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Blind Spots</Text>
              {profile.blindSpots.map((spot, index) => (
                <GlassCard key={index} padding={16} style={styles.itemCard}>
                  <View style={styles.itemRow}>
                    <View style={styles.growthDot} />
                    <Text style={styles.itemText}>{spot}</Text>
                  </View>
                </GlassCard>
              ))}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recommendations</Text>
              {profile.recommendations.map((rec, index) => (
                <GlassCard key={index} padding={16} style={styles.itemCard}>
                  <View style={styles.itemRow}>
                    <AppIcon name="💡" size={18} style={{ marginRight: spacing.md }} />
                    <Text style={styles.itemText}>{rec}</Text>
                  </View>
                </GlassCard>
              ))}
            </View>
          </>
        )}

        <TouchableOpacity onPress={() => setShowCertificate(true)}>
          <LinearGradient
            colors={visual.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.continueButton}
          >
            <Text style={styles.continueButtonText}>
              Share Your Results 📤
            </Text>
          </LinearGradient>
        </TouchableOpacity>

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
          onPress={() => navigation.navigate('TeachingStyleAssessment')}
          style={styles.retryButton}
        >
          <Text style={styles.retryButtonText}>Retake Assessment</Text>
        </TouchableOpacity>
      </ScrollView>

      <CertificateModal
        visible={showCertificate}
        onClose={() => setShowCertificate(false)}
        icon={visual.icon}
        headline={score.primaryStyle}
        subtitle="Teaching Style · JotMinds"
        name={user?.name ?? 'JotMinds User'}
        date={new Date().toLocaleDateString()}
      />
    </ScreenBackground>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  scroll: {
    paddingTop: 8,
    paddingHorizontal: spacing.xl,
    paddingBottom: 120,
  },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  emptyTitle: { fontSize: 22, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.sm },
  emptyText: { fontSize: 14, color: colors.textMuted, textAlign: 'center' },
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
  styleSecondary: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    fontWeight: '600',
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
  scoreRow: { marginBottom: spacing.lg },
  scoreHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  scoreLabel: { fontSize: 14, fontWeight: '600', color: colors.text },
  scoreValue: { fontSize: 14, fontWeight: '700', color: colors.textMuted },
  scoreBar: { height: 8, backgroundColor: '#E5EEFF', borderRadius: 4, overflow: 'hidden' },
  scoreBarFill: { height: '100%', borderRadius: 4 },
  scorePoles: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  scorePoleText: { fontSize: 10, color: colors.textSubtle, fontWeight: '600' },
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
