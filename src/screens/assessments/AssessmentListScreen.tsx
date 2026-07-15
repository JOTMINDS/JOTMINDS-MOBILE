import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenBackground from '../../components/ScreenBackground';
import AppIcon from '../../components/AppIcon';
import GlassCard from '../../components/GlassCard';
import { getAllAssessmentResults } from '../../utils/api';
import { completedDomains, missingCognitiveDomains } from '../../utils/profileCompleteness';
import { getThinkingStylesTrack, isThinkingStylesUnlocked } from '../../utils/thinkingStylesTrack';
import { getGamificationProfile } from '../../utils/gamificationApi';
import { getXPProgress, GamificationProfile } from '../../utils/gamification';
import { scheduleStreakReminder, scheduleProfileCompletionReminder } from '../../utils/notifications';
import CertificateModal from '../../components/CertificateModal';
import { useAuth } from '../../context/AuthContext';
import { colors, radii, shadow, spacing, Palette } from '../../theme';
import { useTheme, useThemedStyles } from '../../context/ThemeContext';

const THINKING_STYLES_WIRE_TYPE: Record<string, string> = {
  jhs: 'jhs-thinking', shs: 'shs-thinking', adult: 'adult-thinking',
};

export default function AssessmentListScreen({ navigation }: any) {
  const colors = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { user } = useAuth();
  const [completedTypes, setCompletedTypes] = useState<string[]>([]);
  const [growth, setGrowth] = useState<GamificationProfile | null>(null);
  const [showCertificate, setShowCertificate] = useState(false);

  useEffect(() => {
    const load = async () => {
      let types: string[] = [];
      try {
        const data = await getAllAssessmentResults();
        types = (data.results || []).map((r: any) => r.assessmentType);
        setCompletedTypes(types);
      } catch { /* leave empty on failure */ }
      scheduleProfileCompletionReminder(missingCognitiveDomains(types).length).catch(() => {});
      if (user?.id) {
        getGamificationProfile(user.id).then((profile) => {
          setGrowth(profile);
          scheduleStreakReminder(profile.currentStreak).catch(() => {});
        }).catch(() => {});
      }
    };
    load();
    const unsub = navigation?.addListener?.('focus', load);
    return unsub;
  }, [navigation, user?.id]);
  const assessments: {
    type: string; title: string; description: string; icon: string;
    gradient: [string, string]; duration: string;
  }[] = [
    {
      type: 'learning',
      title: 'Learning Agility',
      description: 'Discover how you learn best through experience, reflection, analysis, or experimentation.',
      icon: '📚',
      gradient: ['#3D52C9', '#2E3FA8'],
      duration: '15-20 min',
    },
    {
      type: 'thinking',
      title: 'Thinking Style',
      description: 'Explore your unique strengths in analytical, creative, or practical thinking.',
      icon: '🧠',
      gradient: ['#6E4D9C', '#5A3E82'],
      duration: '15-20 min',
    },
    {
      type: 'decision',
      title: 'Decision Style',
      description: 'Discover whether you rely on intuition or analysis when making choices.',
      icon: '🎯',
      gradient: ['#EC4899', '#DB2777'],
      duration: '10-15 min',
    },
  ];

  const info = [
    { icon: '✨', text: 'Gain deep insights into how you think, learn, and decide' },
    { icon: '🎓', text: 'Receive personalized recommendations for study and career paths' },
    { icon: '📊', text: 'Track your cognitive profile and growth over time' },
  ];

  // completedTypes may contain either mobile's own names (learning/thinking/
  // decision) or the webapp's (kolb/sternberg/dual-process) — a domain
  // counts as done regardless of which client completed it.
  const doneDomains = completedDomains(completedTypes);

  // Bonus "Thinking Styles" assessment (JHS/SHS/Adult) — mirrors the
  // webapp's unlock-only-after-the-core-3 behavior. Not shown at all while
  // locked (matches the webapp — no teaser).
  const thinkingStylesTrack = getThinkingStylesTrack(user);
  const thinkingStylesUnlocked = thinkingStylesTrack !== null && isThinkingStylesUnlocked(completedTypes);
  const thinkingStylesDone = thinkingStylesTrack
    ? completedTypes.includes(THINKING_STYLES_WIRE_TYPE[thinkingStylesTrack])
    : false;

  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>EXPLORE</Text>
          <Text style={styles.title}>Assessments</Text>
          <Text style={styles.subtitle}>
            Discover your cognitive profile through research-based assessments.
          </Text>
        </View>

        {growth && (() => {
          const { level, percentage, xpToNext } = getXPProgress(growth.xp);
          return (
            <GlassCard
              padding={20}
              style={styles.growthCard}
              onPress={() => navigation.navigate('Badges')}
            >
              <View style={styles.growthHeader}>
                <View style={[styles.growthIconWrap, { backgroundColor: `${level.color}22` }]}>
                  <AppIcon name={level.icon} size={26} color={level.color} />
                </View>
                <View style={styles.growthInfo}>
                  <Text style={styles.growthLevel}>{level.title}</Text>
                  <Text style={styles.growthSubtitle}>{level.subtitle}</Text>
                </View>
                <View style={styles.growthXPCol}>
                  <Text style={styles.growthXPValue}>{growth.xp}</Text>
                  <Text style={styles.growthXPLabel}>XP</Text>
                </View>
              </View>
              <View style={styles.growthBarTrack}>
                <View style={[styles.growthBarFill, { width: `${percentage}%`, backgroundColor: level.color }]} />
              </View>
              <View style={styles.growthFooter}>
                <Text style={styles.growthFooterText}>
                  {level.level < 10 ? `${xpToNext} XP to next level` : 'Max level reached'}
                </Text>
                <View style={styles.growthBadgesRow}>
                  {growth.currentStreak > 0 && (
                    <Text style={styles.growthFooterText}>🔥 {growth.currentStreak}d</Text>
                  )}
                  <Text style={styles.growthFooterText}>🎖️ {growth.badges.length}</Text>
                  {growth.streakInsurance.available > 0 && (
                    <Text style={styles.growthFooterText}>🛡️ {growth.streakInsurance.available}</Text>
                  )}
                  <TouchableOpacity
                    onPress={(e) => { e.stopPropagation?.(); setShowCertificate(true); }}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel="Share your growth certificate"
                  >
                    <Text style={[styles.growthFooterText, { color: colors.purple }]}>📤 Share</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </GlassCard>
          );
        })()}

        {growth && (
          <CertificateModal
            visible={showCertificate}
            onClose={() => setShowCertificate(false)}
            icon={getXPProgress(growth.xp).level.icon}
            headline={getXPProgress(growth.xp).level.title}
            subtitle={`Level ${growth.level} · ${growth.xp} XP · ${growth.badges.length} badges earned`}
            name={user?.name ?? 'JotMinds User'}
            date={new Date().toLocaleDateString()}
          />
        )}

        <View style={styles.list}>
          {assessments.map((a) => {
            const done = doneDomains.has(a.type as any);
            return (
              <GlassCard
                key={a.type}
                padding={20}
                style={styles.card}
                onPress={() => navigation.navigate(done ? 'AssessmentResults' : 'AssessmentTaking', { assessmentType: a.type })}
              >
                <View style={styles.cardHeader}>
                  <LinearGradient colors={a.gradient} style={styles.iconWrap} start={{x:0,y:0}} end={{x:1,y:1}}>
                    <AppIcon name={a.icon} size={22} style={styles.icon} />
                  </LinearGradient>
                  <View style={[styles.durationPill, done && styles.donePill]}>
                    <Text style={[styles.durationText, done && styles.donePillText]}>{done ? '✓ Completed' : a.duration}</Text>
                  </View>
                </View>
                <Text style={styles.cardTitle}>{a.title}</Text>
                <Text style={styles.cardDesc}>{a.description}</Text>
                <View style={styles.startRow}>
                  <Text style={styles.startText}>{done ? 'View Results' : 'Start Assessment'}</Text>
                  <AppIcon name="→" size={18} style={styles.startArrow} />
                </View>
              </GlassCard>
            );
          })}
        </View>

        {thinkingStylesUnlocked && (
          <View style={styles.list}>
            <Text style={styles.sectionTitle}>Bonus Unlocked 🎉</Text>
            <GlassCard
              padding={20}
              style={styles.card}
              onPress={() => navigation.navigate(
                thinkingStylesDone ? 'ThinkingStylesResults' : 'ThinkingStylesAssessment',
                { track: thinkingStylesTrack },
              )}
            >
              <View style={styles.cardHeader}>
                <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.iconWrap} start={{x:0,y:0}} end={{x:1,y:1}}>
                  <AppIcon name="🎨" size={22} style={styles.icon} />
                </LinearGradient>
                <View style={[styles.durationPill, thinkingStylesDone && styles.donePill]}>
                  <Text style={[styles.durationText, thinkingStylesDone && styles.donePillText]}>
                    {thinkingStylesDone ? '✓ Completed' : '10-15 min'}
                  </Text>
                </View>
              </View>
              <Text style={styles.cardTitle}>Thinking Styles Adventure</Text>
              <Text style={styles.cardDesc}>
                You've completed your Core Profile! Unlock a deeper look at your creative, analytical, practical, and reflective thinking — with program and career suggestions.
              </Text>
              <View style={styles.startRow}>
                <Text style={styles.startText}>{thinkingStylesDone ? 'View Results' : 'Start Assessment'}</Text>
                <AppIcon name="→" size={18} style={styles.startArrow} />
              </View>
            </GlassCard>
          </View>
        )}

        <Text style={styles.sectionTitle}>Why Take These?</Text>
        {info.map((i) => (
          <GlassCard key={i.text} padding={16} style={styles.infoCard}>
            <View style={styles.infoRow}>
              <AppIcon name={i.icon} size={22} style={styles.infoIcon} />
              <Text style={styles.infoText}>{i.text}</Text>
            </View>
          </GlassCard>
        ))}
      </ScrollView>
    </ScreenBackground>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  scroll: { paddingTop: 8, paddingHorizontal: spacing.xl, paddingBottom: 120 },
  header: { marginBottom: spacing.xxl },
  eyebrow: { fontSize: 12, color: colors.textSubtle, letterSpacing: 1.4, fontWeight: '700' },
  title: { fontSize: 32, fontWeight: '700', color: colors.textPrimary, marginTop: 4, letterSpacing: -0.6 },
  subtitle: { fontSize: 15, color: colors.textMuted, marginTop: spacing.sm, lineHeight: 22 },
  growthCard: { marginBottom: spacing.xl },
  growthHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  growthIconWrap: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  growthInfo: { flex: 1 },
  growthLevel: { fontSize: 16, fontWeight: '700', color: colors.text },
  growthSubtitle: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  growthXPCol: { alignItems: 'flex-end' },
  growthXPValue: { fontSize: 20, fontWeight: '800', color: colors.text },
  growthXPLabel: { fontSize: 10, color: colors.textSubtle, fontWeight: '700', letterSpacing: 0.5 },
  growthBarTrack: { height: 6, backgroundColor: colors.bgTertiary, borderRadius: 3, overflow: 'hidden', marginBottom: 10 },
  growthBarFill: { height: '100%', borderRadius: 3 },
  growthFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  growthFooterText: { fontSize: 12, color: colors.textMuted, fontWeight: '600' },
  growthBadgesRow: { flexDirection: 'row', gap: 12 },
  list: { marginBottom: spacing.lg },
  card: { marginBottom: spacing.lg },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  iconWrap: { width: 52, height: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 26 },
  durationPill: { backgroundColor: colors.surfaceMuted, paddingHorizontal: 12, paddingVertical: 6, borderRadius: radii.pill },
  durationText: { fontSize: 12, color: colors.textPrimary, fontWeight: '700' },
  donePill: { backgroundColor: colors.successSoft },
  donePillText: { color: colors.success },
  cardTitle: { fontSize: 20, fontWeight: '700', color: colors.textPrimary, marginBottom: 6, letterSpacing: -0.3 },
  cardDesc: { fontSize: 14, color: colors.textMuted, lineHeight: 20, marginBottom: spacing.lg },
  startRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 6 },
  startText: { fontSize: 14, fontWeight: '700', color: colors.purple },
  startArrow: { fontSize: 16, color: colors.purple, fontWeight: '800' },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.md, letterSpacing: -0.4 },
  infoCard: { marginBottom: spacing.md },
  infoRow: { flexDirection: 'row', alignItems: 'center' },
  infoIcon: { fontSize: 22, marginRight: spacing.md },
  infoText: { flex: 1, fontSize: 14, color: colors.text, lineHeight: 20 },
});
