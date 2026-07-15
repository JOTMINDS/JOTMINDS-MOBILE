import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getAssessmentResults } from '../../utils/api';
import { ThinkingStylesTrack } from '../../utils/thinkingStylesTrack';
import { JHSResults } from '../../utils/jhsScoring';
import { SHSResults, getSHSInsights } from '../../utils/shsScoring';
import { AdultResults, getAdultInsights } from '../../utils/adultScoring';
import ScreenBackground from '../../components/ScreenBackground';
import AppIcon from '../../components/AppIcon';
import GlassCard from '../../components/GlassCard';
import GradientButton from '../../components/GradientButton';
import { SkeletonCard, Skeleton } from '../../components/Skeleton';
import CertificateModal from '../../components/CertificateModal';
import { useAuth } from '../../context/AuthContext';
import { rs } from '../../utils/responsive';
import { colors, radii, shadow, spacing, Palette } from '../../theme';
import { useTheme, useThemedStyles } from '../../context/ThemeContext';

const WIRE_TYPE: Record<ThinkingStylesTrack, string> = {
  jhs: 'jhs-thinking', shs: 'shs-thinking', adult: 'adult-thinking',
};

const STYLE_LABEL: Record<string, string> = {
  creative: 'Creative', analytical: 'Analytical', practical: 'Practical', reflective: 'Reflective',
};

const GRADIENT: [string, string, string] = ['#6E4D9C', '#5A3E82', '#14136E'];

export default function ThinkingStylesResultsScreen({ route, navigation }: any) {
  const colors = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { user } = useAuth();
  const track: ThinkingStylesTrack = route.params?.track ?? 'adult';
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showCertificate, setShowCertificate] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await getAssessmentResults(WIRE_TYPE[track]);
        setResults(data.results ?? data.result);
      } catch (e) {
        console.error('[ThinkingStylesResults]', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [track]);

  if (loading) {
    return (
      <ScreenBackground>
        <View style={{ paddingTop: 8, paddingHorizontal: spacing.xl }}>
          <Skeleton width={'40%'} height={14} style={{ marginBottom: 10 }} />
          <Skeleton width={'60%'} height={28} radius={6} style={{ marginBottom: 24 }} />
          <Skeleton height={150} radius={20} style={{ marginBottom: 20 }} />
          <SkeletonCard lines={4} />
        </View>
      </ScreenBackground>
    );
  }

  if (!results) {
    return (
      <ScreenBackground>
        <View style={styles.centered}>
          <Text style={styles.emptyTitle}>No results yet</Text>
          <Text style={styles.emptyText}>Take the Thinking Styles assessment to view your results.</Text>
        </View>
      </ScreenBackground>
    );
  }

  const headline = track === 'jhs'
    ? (results as JHSResults).personalityType
    : track === 'shs'
      ? (results as SHSResults).personalityType
      : (results as AdultResults).professionalProfile;

  const percentages: Record<string, number> = results.percentages ?? {};

  const insights = track === 'shs' ? getSHSInsights(results as SHSResults)
    : track === 'adult' ? getAdultInsights(results as AdultResults)
    : null;

  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>THINKING STYLES RESULTS</Text>
          <Text style={styles.title}>Your Profile</Text>
        </View>

        <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroCard}>
          <Text style={styles.heroLabel}>{track === 'adult' ? 'PROFESSIONAL PROFILE' : 'YOUR TYPE'}</Text>
          <Text style={styles.heroValue}>{headline}</Text>
        </LinearGradient>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Style Breakdown</Text>
          <GlassCard padding={20}>
            {Object.entries(percentages).map(([key, value], i, arr) => (
              <View key={key} style={[styles.scoreRow, i === arr.length - 1 && { marginBottom: 0 }]}>
                <View style={styles.scoreHeader}>
                  <Text style={styles.scoreLabel}>{STYLE_LABEL[key] ?? key}</Text>
                  <Text style={styles.scoreValue}>{value}%</Text>
                </View>
                <View style={styles.scoreBar}>
                  <LinearGradient colors={[GRADIENT[0], GRADIENT[1]]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={[styles.scoreBarFill, { width: `${value}%` }]} />
                </View>
                {track === 'jhs' && (results as JHSResults).strengthLevels?.[key] ? (
                  <Text style={styles.strengthLevel}>{(results as JHSResults).strengthLevels[key]}</Text>
                ) : null}
              </View>
            ))}
          </GlassCard>
        </View>

        {track === 'jhs' && (results as JHSResults).recommendations?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>SHS Track Suggestions</Text>
            {(results as JHSResults).recommendations.map((r, i) => (
              <GlassCard key={i} padding={16} style={styles.listCard}>
                <View style={styles.listRow}>
                  <AppIcon name="🎓" size={20} style={styles.listIcon} />
                  <Text style={styles.listText}>{r}</Text>
                </View>
              </GlassCard>
            ))}
          </View>
        )}

        {track === 'shs' && (results as SHSResults).topPrograms?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Top Tertiary Programs</Text>
            {(results as SHSResults).topPrograms.map((p, i) => (
              <GlassCard key={p.name} padding={20} style={styles.programCard}>
                <View style={styles.programHeader}>
                  <View style={styles.programRank}><Text style={styles.programRankText}>{i + 1}</Text></View>
                  <Text style={styles.programName}>{p.name}</Text>
                </View>
                <Text style={styles.programDesc}>{p.description}</Text>
                <Text style={styles.programMeta}>Careers: {p.careerPaths.join(', ')}</Text>
                <Text style={styles.programMeta}>Schools: {p.universities.join(', ')}</Text>
              </GlassCard>
            ))}
          </View>
        )}

        {track === 'adult' && (results as AdultResults).topCareerPaths?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Top Career Paths</Text>
            {(results as AdultResults).topCareerPaths.map((c, i) => (
              <GlassCard key={c.name} padding={20} style={styles.programCard}>
                <View style={styles.programHeader}>
                  <View style={styles.programRank}><Text style={styles.programRankText}>{i + 1}</Text></View>
                  <Text style={styles.programName}>{c.name}</Text>
                </View>
                <Text style={styles.programDesc}>{c.description}</Text>
                <Text style={styles.programMeta}>Progression: {c.careerProgression.join(' → ')}</Text>
                <Text style={styles.programMeta}>Salary: {c.averageSalaryRange}</Text>
              </GlassCard>
            ))}
          </View>
        )}

        {insights && insights.strengths.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Strengths</Text>
            {insights.strengths.map((s, i) => (
              <GlassCard key={i} padding={16} style={styles.listCard}>
                <View style={styles.listRow}>
                  <View style={[styles.listBadge, { backgroundColor: colors.successSoft }]}>
                    <AppIcon name="✓" size={14} color={colors.success} />
                  </View>
                  <Text style={styles.listText}>{s}</Text>
                </View>
              </GlassCard>
            ))}
          </View>
        )}

        {insights && insights.recommendations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recommendations</Text>
            {insights.recommendations.map((r, i) => (
              <GlassCard key={i} padding={16} style={[styles.listCard, styles.recCard]}>
                <View style={styles.listRow}>
                  <AppIcon name="💡" size={22} style={styles.listIcon} />
                  <Text style={styles.recText}>{r}</Text>
                </View>
              </GlassCard>
            ))}
          </View>
        )}

        <GradientButton
          label="Share Your Results 📤"
          onPress={() => setShowCertificate(true)}
          gradient={[GRADIENT[0], GRADIENT[1]]}
          style={{ marginBottom: spacing.md }}
        />

        <GradientButton
          label="Retake Assessment"
          onPress={() => navigation.navigate('ThinkingStylesAssessment', { track })}
          gradient={[GRADIENT[0], GRADIENT[1]]}
          style={{ marginTop: spacing.md }}
        />
      </ScrollView>

      <CertificateModal
        visible={showCertificate}
        onClose={() => setShowCertificate(false)}
        icon="🎨"
        headline={String(headline)}
        subtitle={`Thinking Styles · ${track.toUpperCase()} Track · JotMinds`}
        name={user?.name ?? 'JotMinds User'}
        date={new Date().toLocaleDateString()}
      />
    </ScreenBackground>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  scroll: { paddingTop: 8, paddingHorizontal: spacing.xl, paddingBottom: 120 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  header: { marginBottom: spacing.lg },
  eyebrow: { fontSize: 12, color: colors.textSubtle, letterSpacing: 1.4, fontWeight: '700' },
  title: { fontSize: rs(28), fontWeight: '700', color: colors.textPrimary, marginTop: 4, letterSpacing: -0.6 },
  heroCard: { borderRadius: radii.xl, padding: spacing.xxl, marginBottom: spacing.xxl, ...shadow.glow },
  heroLabel: { color: 'rgba(255,255,255,0.75)', fontSize: 11, letterSpacing: 1.6, fontWeight: '700' },
  heroValue: { color: '#FFF', fontSize: rs(28), fontWeight: '800', marginTop: 8, letterSpacing: -0.5 },
  section: { marginBottom: spacing.xxl },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.md, letterSpacing: -0.4 },
  scoreRow: { marginBottom: spacing.lg },
  scoreHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  scoreLabel: { fontSize: 14, fontWeight: '600', color: colors.text },
  scoreValue: { fontSize: 14, fontWeight: '700', color: colors.textMuted },
  scoreBar: { height: 8, backgroundColor: '#E5EEFF', borderRadius: 4, overflow: 'hidden' },
  scoreBarFill: { height: '100%', borderRadius: 4 },
  strengthLevel: { fontSize: 12, color: colors.textMuted, marginTop: 6 },
  listCard: { marginBottom: spacing.md },
  listRow: { flexDirection: 'row', alignItems: 'center' },
  listIcon: { fontSize: 20, marginRight: spacing.md },
  listBadge: {
    width: 32, height: 32, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
    marginRight: spacing.md,
  },
  listText: { flex: 1, fontSize: 14, color: colors.text, lineHeight: 20 },
  recCard: { backgroundColor: '#FEF3C7', borderColor: '#FCD34D' },
  recText: { flex: 1, fontSize: 14, color: '#78350F', lineHeight: 20 },
  programCard: { marginBottom: spacing.md },
  programHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  programRank: { width: 26, height: 26, borderRadius: 13, backgroundColor: colors.bgTertiary, alignItems: 'center', justifyContent: 'center' },
  programRankText: { fontSize: 12, fontWeight: '700', color: colors.textSubtle },
  programName: { fontSize: 16, fontWeight: '700', color: colors.text, flex: 1 },
  programDesc: { fontSize: 13, color: colors.textMuted, lineHeight: 19, marginBottom: 8 },
  programMeta: { fontSize: 12, color: colors.textSecondary, lineHeight: 18 },
  emptyTitle: { fontSize: 22, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.sm },
  emptyText: { fontSize: 14, color: colors.textMuted, textAlign: 'center' },
});
