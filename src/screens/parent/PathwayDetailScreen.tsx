import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenBackground from '../../components/ScreenBackground';
import GlassCard from '../../components/GlassCard';
import AppIcon from '../../components/AppIcon';
import { CoachingPathway } from '../../utils/coachingPathways';
import { getPathwayProgress, toggleWeekComplete } from '../../utils/coachingProgress';
import { radii, spacing, shadow, Palette } from '../../theme';
import { useTheme, useThemedStyles } from '../../context/ThemeContext';

const GRADIENTS: Record<string, [string, string]> = {
  A: ['#3D52C9', '#2E3FA8'],
  B: ['#6E4D9C', '#5A3E82'],
  C: ['#EC4899', '#DB2777'],
  D: ['#F59E0B', '#D97706'],
};

export default function PathwayDetailScreen({ route, navigation }: any) {
  const colors = useTheme();
  const styles = useThemedStyles(makeStyles);
  const pathway: CoachingPathway | undefined = route?.params?.pathway;
  const { childId, childName } = route.params ?? {};
  const [completedWeeks, setCompletedWeeks] = useState<number[]>([]);

  useEffect(() => {
    if (!childId || !pathway) return;
    getPathwayProgress(childId, pathway.id).then(setCompletedWeeks);
  }, [childId, pathway?.id]);

  if (!pathway) {
    return (
      <ScreenBackground>
        <View style={styles.centered}><Text style={styles.emptyText}>Pathway not found.</Text></View>
      </ScreenBackground>
    );
  }

  const gradient = GRADIENTS[pathway.section];

  const toggleWeek = async (weekIndex: number) => {
    const next = await toggleWeekComplete(childId, pathway.id, weekIndex);
    setCompletedWeeks(next);
  };

  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Go back">
          <AppIcon name="arrow-back" size={22} color={colors.textMuted} />
        </TouchableOpacity>

        <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
          <View style={styles.heroIcon}><AppIcon name={pathway.icon} size={30} color="#FFFFFF" /></View>
          <Text style={styles.heroTitle}>{pathway.title}</Text>
          <Text style={styles.heroMeta}>For {childName || 'your child'} · Based on: {pathway.focusLabel}</Text>
        </LinearGradient>

        <GlassCard style={styles.card}>
          <Text style={styles.cardLabel}>YOUR PROGRESS</Text>
          <View style={styles.progressRow}>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${(completedWeeks.length / 4) * 100}%`, backgroundColor: gradient[0] }]} />
            </View>
            <Text style={styles.pct}>{completedWeeks.length}/4 weeks</Text>
          </View>
        </GlassCard>

        {pathway.weeks.map((week, i) => {
          const done = completedWeeks.includes(i);
          return (
            <GlassCard key={i} style={styles.weekCard}>
              <TouchableOpacity onPress={() => toggleWeek(i)} activeOpacity={0.7} style={styles.weekHeader}>
                <View style={[styles.checkbox, done && { backgroundColor: gradient[0], borderColor: gradient[0] }]}>
                  {done && <AppIcon name="✓" size={14} color="#FFFFFF" />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.weekLabel}>WEEK {i + 1}</Text>
                  <Text style={styles.weekTheme}>{week.theme}</Text>
                </View>
              </TouchableOpacity>

              <Text style={styles.subheading}>Conversation Starters</Text>
              {week.conversationStarters.map((c, ci) => <Text key={ci} style={styles.bullet}>💬 {c}</Text>)}

              <Text style={styles.subheading}>Weekend Activity</Text>
              <Text style={styles.bullet}>🎯 {week.weekendActivity}</Text>

              <Text style={styles.subheading}>Watch For</Text>
              {week.watchFor.map((w, wi) => <Text key={wi} style={styles.bullet}>👀 {w}</Text>)}
            </GlassCard>
          );
        })}
      </ScrollView>
    </ScreenBackground>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  scroll: { paddingTop: 8, paddingHorizontal: spacing.xl, paddingBottom: 100 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: colors.textMuted, fontSize: 15 },
  back: { width: 44, height: 44, justifyContent: 'center', marginBottom: 4 },
  hero: { borderRadius: radii.xl, padding: spacing.xxl, marginBottom: spacing.lg, ...shadow.glow },
  heroIcon: { width: 60, height: 60, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
  heroTitle: { fontSize: 24, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.5 },
  heroMeta: { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 6 },
  card: { marginBottom: spacing.lg },
  cardLabel: { fontSize: 12, fontWeight: '700', color: colors.textSubtle, letterSpacing: 1.2, marginBottom: 10 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  track: { flex: 1, height: 8, backgroundColor: colors.bgTertiary, borderRadius: 4, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4 },
  pct: { fontSize: 13, fontWeight: '700', color: colors.text },
  weekCard: { marginBottom: spacing.md },
  weekHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: spacing.md },
  checkbox: { width: 26, height: 26, borderRadius: 8, borderWidth: 2, borderColor: colors.borderLight, alignItems: 'center', justifyContent: 'center' },
  weekLabel: { fontSize: 11, fontWeight: '700', color: colors.textSubtle, letterSpacing: 1 },
  weekTheme: { fontSize: 16, fontWeight: '700', color: colors.text, marginTop: 2 },
  subheading: { fontSize: 12, fontWeight: '700', color: colors.textMuted, marginTop: spacing.md, marginBottom: 6, letterSpacing: 0.3, textTransform: 'uppercase' },
  bullet: { fontSize: 13, color: colors.textMuted, lineHeight: 20, marginBottom: 4 },
});
