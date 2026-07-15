import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenBackground from '../../components/ScreenBackground';
import AppIcon from '../../components/AppIcon';
import GlassCard from '../../components/GlassCard';
import { ParentObservationScore, calculateHarmonyScore, getAlignmentLabel } from '../../utils/parentObservationData';
import { colors, radii, shadow, spacing, Palette } from '../../theme';
import { useTheme, useThemedStyles } from '../../context/ThemeContext';

const SECTIONS: { key: keyof Pick<ParentObservationScore, 'sectionA' | 'sectionB' | 'sectionC' | 'sectionD'>; label: string; icon: string; gradient: [string, string] }[] = [
  { key: 'sectionA', label: 'Learning Habits', icon: '📚', gradient: ['#3D52C9', '#2E3FA8'] },
  { key: 'sectionB', label: 'Thinking Patterns', icon: '🧩', gradient: ['#6E4D9C', '#5A3E82'] },
  { key: 'sectionC', label: 'Decision-Making', icon: '⚖️', gradient: ['#EC4899', '#DB2777'] },
  { key: 'sectionD', label: 'Motivation & Self-Management', icon: '🔥', gradient: ['#F59E0B', '#D97706'] },
];

function extractChildScore(assessments: any[]) {
  const result: { kolb?: any; sternberg?: any; dualProcess?: any } = {};
  (assessments ?? []).forEach((a: any) => {
    if (a.type === 'kolb' && a.score?.kolb) result.kolb = a.score.kolb;
    if (a.type === 'sternberg' && a.score?.sternberg) result.sternberg = a.score.sternberg;
    if (a.type === 'dual-process' && a.score?.dualProcess) result.dualProcess = a.score.dualProcess;
  });
  return result;
}

export default function ParentObservationResultsScreen({ route, navigation }: any) {
  const colors = useTheme();
  const styles = useThemedStyles(makeStyles);
  const score: ParentObservationScore | undefined = route.params?.score;
  const childName: string = route.params?.childName || 'your child';
  const assessments = route.params?.assessments;
  const consentGranted: boolean = !!route.params?.consentGranted;

  if (!score) {
    return (
      <ScreenBackground>
        <View style={styles.centered}>
          <Text style={styles.emptyTitle}>No results yet</Text>
        </View>
      </ScreenBackground>
    );
  }

  const childScore = extractChildScore(assessments ?? []);
  const showHarmony = consentGranted && Object.keys(childScore).length > 0;
  const harmonyScore = showHarmony ? calculateHarmonyScore(childScore, score) : null;
  const alignment = harmonyScore !== null ? getAlignmentLabel(harmonyScore) : null;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `👀 My observation of ${childName} on JotMinds:\n${score.overallSummary}`,
      });
    } catch {
      // non-critical
    }
  };

  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.greeting}>OBSERVATION COMPLETE</Text>
          <Text style={styles.name}>{childName}'s Profile</Text>
        </View>

        <GlassCard padding={20} style={styles.summaryCard}>
          <Text style={styles.summaryText}>{score.overallSummary}</Text>
        </GlassCard>

        {SECTIONS.map(({ key, label, icon, gradient }) => {
          const s = score[key];
          return (
            <View key={key} style={styles.section}>
              <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.styleCard}>
                <Text style={styles.styleLabel}>{icon} {label.toUpperCase()}</Text>
                <Text style={styles.styleName}>{s.style}</Text>
                <Text style={styles.styleScore}>{s.total}/30</Text>
              </LinearGradient>
              <GlassCard padding={16}>
                <Text style={styles.interpretation}>{s.interpretation}</Text>
                <Text style={styles.insights}>{s.insights}</Text>
                <View style={styles.tagRow}>
                  {s.tags.map((tag: string) => (
                    <View key={tag} style={styles.tag}><Text style={styles.tagText}>{tag}</Text></View>
                  ))}
                </View>
              </GlassCard>
            </View>
          );
        })}

        {alignment && harmonyScore !== null && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Harmony with {childName}'s Own Results</Text>
            <GlassCard padding={20}>
              <View style={styles.row}>
                <Text style={{ fontSize: 28 }}>{alignment.emoji}</Text>
                <View style={{ flex: 1, marginLeft: spacing.md }}>
                  <Text style={[styles.cardTitle, { color: alignment.color }]}>{alignment.label}</Text>
                  <Text style={styles.cardSubtle}>{alignment.description}</Text>
                </View>
                <Text style={[styles.harmonyScore, { color: alignment.color }]}>{harmonyScore}</Text>
              </View>
            </GlassCard>
          </View>
        )}

        <TouchableOpacity onPress={handleShare}>
          <LinearGradient colors={['#6E4D9C', '#5A3E82']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.shareButton}>
            <Text style={styles.shareButtonText}>Share →</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </ScreenBackground>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  scroll: { paddingTop: 8, paddingHorizontal: spacing.xl, paddingBottom: 120 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  emptyTitle: { fontSize: 22, fontWeight: '700', color: colors.textPrimary },
  header: { marginBottom: spacing.xl },
  greeting: { fontSize: 12, color: colors.textSubtle, letterSpacing: 1.4, fontWeight: '700' },
  name: { fontSize: 26, fontWeight: '700', color: colors.textPrimary, marginTop: 4, letterSpacing: -0.5 },
  summaryCard: { marginBottom: spacing.xxl },
  summaryText: { fontSize: 15, color: colors.text, lineHeight: 22, fontWeight: '500' },
  section: { marginBottom: spacing.xxl },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.md, letterSpacing: -0.3 },
  styleCard: { borderRadius: radii.lg, padding: spacing.lg, marginBottom: spacing.md, ...shadow.glow },
  styleLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11, letterSpacing: 1.2, fontWeight: '700', marginBottom: 6 },
  styleName: { color: '#FFFFFF', fontSize: 20, fontWeight: '800' },
  styleScore: { color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: '600', marginTop: 4 },
  interpretation: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 6 },
  insights: { fontSize: 13, color: colors.textMuted, lineHeight: 19, marginBottom: spacing.md },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, backgroundColor: colors.glassMedium },
  tagText: { fontSize: 11, color: colors.textMuted, fontWeight: '600' },
  row: { flexDirection: 'row', alignItems: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  cardSubtle: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  harmonyScore: { fontSize: 24, fontWeight: '800' },
  shareButton: { borderRadius: radii.lg, paddingVertical: 16, alignItems: 'center', ...shadow.glow },
  shareButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
});
