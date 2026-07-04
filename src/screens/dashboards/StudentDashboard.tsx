import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { getAllAssessmentResults } from '../../utils/api';
import ScreenBackground from '../../components/ScreenBackground';
import GlassCard from '../../components/GlassCard';
import AppIcon from '../../components/AppIcon';
import { Skeleton, SkeletonCard } from '../../components/Skeleton';
import { colors, radii, shadow, spacing, Palette } from '../../theme';
import { useTheme, useThemedStyles } from '../../context/ThemeContext';

export default function StudentDashboard({ navigation }: any) {
  const colors = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { user } = useAuth();
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAssessments = async () => {
    try {
      const data = await getAllAssessmentResults();
      setAssessments(data.results || []);
    } catch (error) {
      console.error('[StudentDashboard] Error fetching assessments:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAssessments();
    // Re-fetch whenever the dashboard regains focus (e.g. after finishing an
    // assessment) so the completed state and results routing stay current.
    const unsub = navigation?.addListener?.('focus', fetchAssessments);
    return unsub;
  }, [navigation]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAssessments();
  };

  const completedTypes = assessments.map((a) => a.assessmentType);

  // Determine if user is in kids age group (7-12)
  const isKidsMode = user?.ageGroup === '7-12';

  const assessmentCards = [
    {
      type: 'learning',
      title: 'Learning Agility',
      description: 'Discover how you learn best',
      icon: '📚',
      gradient: ['#3D52C9', '#2E3FA8'] as [string, string],
    },
    {
      type: 'thinking',
      title: 'Thinking Style',
      description: 'Understand how you think',
      icon: '🧠',
      gradient: ['#6E4D9C', '#5A3E82'] as [string, string],
    },
    {
      type: 'decision',
      title: 'Decision Style',
      description: 'Learn how you make decisions',
      icon: '🎯',
      gradient: ['#EC4899', '#DB2777'] as [string, string],
    },
  ];

  const progressPct = Math.round(
    (completedTypes.length / assessmentCards.length) * 100,
  );

  if (loading) {
    return (
      <ScreenBackground>
        <View style={{ paddingTop: 8, paddingHorizontal: spacing.xl }}>
          <Skeleton width={'45%'} height={14} style={{ marginBottom: 8 }} />
          <Skeleton width={'65%'} height={28} radius={6} style={{ marginBottom: 24 }} />
          <Skeleton height={160} radius={24} style={{ marginBottom: 24 }} />
          <SkeletonCard lines={2} />
          <SkeletonCard lines={2} />
        </View>
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.purple} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.name}>{user?.name || 'Student'}</Text>
          <Text style={styles.tagline}>Your weekly cognitive snapshot</Text>
        </View>

        <LinearGradient
          colors={['#14136E', '#2C2E83', '#6E4D9C']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.snapshotCard}
        >
          <Text style={styles.snapshotLabel}>WEEKLY SNAPSHOT</Text>
          <Text style={styles.snapshotTitle}>Your mind in motion</Text>
          <View style={styles.snapshotStatsRow}>
            <View style={styles.snapshotStat}>
              <Text style={styles.snapshotStatValue}>{completedTypes.length}</Text>
              <Text style={styles.snapshotStatLabel}>Completed</Text>
            </View>
            <View style={styles.snapshotDivider} />
            <View style={styles.snapshotStat}>
              <Text style={styles.snapshotStatValue}>{progressPct}%</Text>
              <Text style={styles.snapshotStatLabel}>Profile</Text>
            </View>
            <View style={styles.snapshotDivider} />
            <View style={styles.snapshotStat}>
              <Text style={styles.snapshotStatValue}>{assessments.length}</Text>
              <Text style={styles.snapshotStatLabel}>Insights</Text>
            </View>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
          </View>
        </LinearGradient>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Assessments</Text>
          <Text style={styles.sectionSubtitle}>
            Complete these to build your cognitive profile
          </Text>

          {assessmentCards.map((card) => {
            const isCompleted = completedTypes.includes(card.type);
            return (
              <GlassCard
                key={card.type}
                onPress={() => {
                  if (isKidsMode) { navigation.navigate('KidsAssessment'); return; }
                  // A completed assessment opens its saved results instead of
                  // restarting — results persist on the backend per user+type.
                  navigation.navigate(
                    isCompleted ? 'AssessmentResults' : 'AssessmentTaking',
                    { assessmentType: card.type },
                  );
                }}
                style={styles.assessmentCard}
              >
                <View style={styles.cardRow}>
                  <LinearGradient
                    colors={card.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.cardIconWrap}
                  >
                    <AppIcon name={card.icon} size={22} color="#FFFFFF" />
                  </LinearGradient>
                  <View style={styles.cardText}>
                    <Text style={styles.cardTitle}>{card.title}</Text>
                    <Text style={styles.cardDescription}>{card.description}</Text>
                  </View>
                  {isCompleted ? (
                    <View style={styles.completedBadge}>
                      <AppIcon name="✓" size={16} color={colors.success} />
                    </View>
                  ) : (
                    <Text style={styles.startArrow}>→</Text>
                  )}
                </View>
              </GlassCard>
            );
          })}
        </View>

        {assessments.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Results</Text>
            {assessments
              .filter((result) => typeof result?.assessmentType === 'string' && result.assessmentType)
              .slice(0, 3)
              .map((result, index) => (
              <GlassCard
                key={index}
                padding={16}
                style={styles.resultCard}
                onPress={() =>
                  navigation.navigate('AssessmentResults', { assessmentType: result.assessmentType })
                }
              >
                <View style={styles.resultRow}>
                  <View style={styles.resultDot} />
                  <View style={styles.resultText}>
                    <Text style={styles.resultTitle}>
                      {result.assessmentType.charAt(0).toUpperCase() +
                        result.assessmentType.slice(1)}{' '}
                      Assessment
                    </Text>
                    <Text style={styles.resultDate}>
                      {new Date(result.completedAt ?? result.createdAt ?? Date.now()).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text style={styles.viewResults}>View →</Text>
                </View>
              </GlassCard>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Challenge</Text>
          <GlassCard padding={20}>
            <View style={styles.challengeRow}>
              <LinearGradient
                colors={['#F59E0B', '#D97706']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardIconWrap}
              >
                <AppIcon name="🎯" size={22} color="#FFFFFF" />
              </LinearGradient>
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>Complete a Reflection</Text>
                <Text style={styles.cardDescription}>
                  Reflect on your recent assessment results
                </Text>
              </View>
              <View style={styles.pointsBadge}>
                <View style={styles.pointsRow}>
                  <Text style={styles.pointsText}>+10</Text>
                  <AppIcon name="⭐" size={13} color="#B45309" />
                </View>
              </View>
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    fontSize: 30,
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
  snapshotCard: {
    borderRadius: radii.xl,
    padding: spacing.xxl,
    marginBottom: spacing.xxl,
    ...shadow.glow,
  },
  snapshotLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    letterSpacing: 1.6,
    fontWeight: '700',
  },
  snapshotTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    marginTop: 6,
    marginBottom: spacing.lg,
  },
  snapshotStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  snapshotStat: {
    flex: 1,
    alignItems: 'center',
  },
  snapshotStatValue: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800',
  },
  snapshotStatLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    marginTop: 2,
  },
  snapshotDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  progressTrack: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.cyan,
    borderRadius: 4,
  },
  section: {
    marginBottom: spacing.xxl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
    letterSpacing: -0.4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  assessmentCard: {
    marginBottom: spacing.md,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
  },
  cardIcon: {
    fontSize: 22,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  cardDescription: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
  },
  completedBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.successSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedText: {
    color: colors.success,
    fontSize: 16,
    fontWeight: '700',
  },
  startArrow: {
    fontSize: 22,
    color: colors.purple,
    fontWeight: '700',
  },
  resultCard: {
    marginBottom: spacing.md,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.cyan,
    marginRight: spacing.md,
  },
  resultText: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  resultDate: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  viewResults: {
    color: colors.purple,
    fontSize: 14,
    fontWeight: '600',
  },
  challengeRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  pointsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});
