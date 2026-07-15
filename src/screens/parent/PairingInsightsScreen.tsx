import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenBackground from '../../components/ScreenBackground';
import GlassCard from '../../components/GlassCard';
import {
  getSternbergPairing, getKolbPairing, getDualProcessPairing, PairingInsight, AdultStyle,
} from '../../utils/cognitivePairingData';
import { AdultResults } from '../../utils/adultScoring';
import { colors, radii, shadow, spacing, Palette } from '../../theme';
import { useTheme, useThemedStyles } from '../../context/ThemeContext';

const CARDS: { type: 'kolb' | 'sternberg' | 'dual-process'; label: string; icon: string; gradient: [string, string]; getPairing: (p: AdultStyle, c: string) => PairingInsight }[] = [
  { type: 'kolb', label: 'Learning Style', icon: '📚', gradient: ['#3D52C9', '#2E3FA8'], getPairing: getKolbPairing },
  { type: 'sternberg', label: 'Thinking Style', icon: '🧩', gradient: ['#6E4D9C', '#5A3E82'], getPairing: getSternbergPairing },
  { type: 'dual-process', label: 'Decision Style', icon: '⚖️', gradient: ['#EC4899', '#DB2777'], getPairing: getDualProcessPairing },
];

const ALIGNMENT_COLOR: Record<PairingInsight['alignmentLevel'], string> = {
  High: '#10B981', Moderate: '#F59E0B', Different: '#3D52C9',
};

export default function PairingInsightsScreen({ route }: any) {
  const colors = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { child, assessments, parentAdult } = route.params ?? {};
  const parentStyle: AdultStyle | undefined = (parentAdult as AdultResults)?.dominantStyle;

  const findChildStyle = (type: string) =>
    (assessments ?? []).find((a: any) => a.type === type)?.score?.[
      type === 'kolb' ? 'kolb' : type === 'sternberg' ? 'sternberg' : 'dualProcess'
    ]?.style;

  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.greeting}>PAIRING INSIGHTS</Text>
          <Text style={styles.name}>You &amp; {child?.name}</Text>
        </View>

        {!parentStyle ? (
          <GlassCard padding={20}>
            <Text style={styles.emptyText}>Complete your own Adult Thinking Styles assessment to see pairing insights.</Text>
          </GlassCard>
        ) : (
          CARDS.map(({ type, label, icon, gradient, getPairing }) => {
            const childStyle = findChildStyle(type);
            if (!childStyle) {
              return (
                <View key={type} style={styles.section}>
                  <Text style={styles.sectionTitle}>{icon} {label}</Text>
                  <GlassCard padding={16} style={styles.lockedCard}>
                    <Text style={styles.emptyText}>{child?.name} hasn't completed this assessment yet.</Text>
                  </GlassCard>
                </View>
              );
            }

            const insight = getPairing(parentStyle, childStyle);
            return (
              <View key={type} style={styles.section}>
                <Text style={styles.sectionTitle}>{icon} {label}</Text>
                <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.titleCard}>
                  <Text style={styles.titleCardLabel}>{insight.alignmentLevel.toUpperCase()} ALIGNMENT</Text>
                  <Text style={styles.titleCardTitle}>{insight.title}</Text>
                  <Text style={styles.titleCardDesc}>{insight.description}</Text>
                </LinearGradient>

                <GlassCard padding={16} style={styles.spacedCard}>
                  <Text style={styles.subheading}>Strengths</Text>
                  {insight.strengths.map((s, i) => <Text key={i} style={styles.bullet}>• {s}</Text>)}
                </GlassCard>
                <GlassCard padding={16} style={styles.spacedCard}>
                  <Text style={styles.subheading}>Challenges</Text>
                  {insight.challenges.map((s, i) => <Text key={i} style={styles.bullet}>• {s}</Text>)}
                </GlassCard>
                <GlassCard padding={16} style={styles.spacedCard}>
                  <Text style={styles.subheading}>Tips</Text>
                  {insight.tips.map((s, i) => <Text key={i} style={styles.bullet}>💡 {s}</Text>)}
                </GlassCard>
              </View>
            );
          })
        )}
      </ScrollView>
    </ScreenBackground>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  scroll: { paddingTop: 8, paddingHorizontal: spacing.xl, paddingBottom: 120 },
  header: { marginBottom: spacing.xl },
  greeting: { fontSize: 12, color: colors.textSubtle, letterSpacing: 1.4, fontWeight: '700' },
  name: { fontSize: 26, fontWeight: '700', color: colors.textPrimary, marginTop: 4, letterSpacing: -0.5 },
  section: { marginBottom: spacing.xxl },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.md, letterSpacing: -0.3 },
  titleCard: { borderRadius: radii.lg, padding: spacing.lg, marginBottom: spacing.md, ...shadow.glow },
  titleCardLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11, letterSpacing: 1.2, fontWeight: '700', marginBottom: 6 },
  titleCardTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '800', marginBottom: 8 },
  titleCardDesc: { color: 'rgba(255,255,255,0.9)', fontSize: 13, lineHeight: 19 },
  spacedCard: { marginBottom: spacing.md },
  subheading: { fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: 8, letterSpacing: 0.3, textTransform: 'uppercase' },
  bullet: { fontSize: 13, color: colors.textMuted, lineHeight: 20, marginBottom: 4 },
  lockedCard: { opacity: 0.75 },
  emptyText: { fontSize: 14, color: colors.textMuted, lineHeight: 20 },
});
