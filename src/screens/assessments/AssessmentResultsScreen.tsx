import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getAssessmentResults, getAllAssessmentResults } from '../../utils/api';
import ScreenBackground from '../../components/ScreenBackground';
import AppIcon from '../../components/AppIcon';
import GlassCard from '../../components/GlassCard';
import GradientButton from '../../components/GradientButton';
import RadarChart from '../../components/RadarChart';
import { SkeletonCard, Skeleton } from '../../components/Skeleton';
import { STYLE_DESCRIPTIONS, normalizeAssessmentResult } from '../../utils/scoring';
import { getGhanaMapping } from '../../utils/ghanaMapping';
import { getStyleInsights } from '../../utils/styleInsights';
import { missingCognitiveDomains, domainLabel, findResultForDomain } from '../../utils/profileCompleteness';
import CertificateModal from '../../components/CertificateModal';
import { useAuth } from '../../context/AuthContext';
import { rs } from '../../utils/responsive';
import { colors, radii, shadow, spacing, Palette } from '../../theme';
import { useTheme, useThemedStyles } from '../../context/ThemeContext';

const typeGradient: Record<string, [string, string, string]> = {
  learning: ['#3D52C9', '#2E3FA8', '#14136E'],
  thinking: ['#6E4D9C', '#5A3E82', '#14136E'],
  decision: ['#EC4899', '#DB2777', '#14136E'],
};

export default function AssessmentResultsScreen({ route, navigation }: any) {
  const colors = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { user } = useAuth();
  const { assessmentType } = route.params;
  const [results, setResults] = useState<any>(null);
  const [allResults, setAllResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCertificate, setShowCertificate] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [data, all] = await Promise.all([
          getAssessmentResults(assessmentType),
          getAllAssessmentResults().catch(() => ({ results: [] })),
        ]);
        // Backend returns the stored result object under `results` (plural).
        setResults(data.results ?? data.result);
        setAllResults(all?.results ?? []);
      } catch (e) {
        console.error('[AssessmentResults]', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [assessmentType]);

  // Normalize once — the stored result may be mobile-shaped (primaryStyle/scores)
  // or webapp-shaped (style/percentages), depending on which client submitted it.
  const normalized = results?.results ? normalizeAssessmentResult(results.results) : null;

  const completedTypes = allResults.map((r) => r.assessmentType);
  const missingDomains = missingCognitiveDomains(completedTypes);
  const byDomain = (domain: 'learning' | 'thinking' | 'decision') => {
    const entry = findResultForDomain(allResults, domain);
    return entry?.results ? normalizeAssessmentResult(entry.results) : null;
  };
  const ghanaMapping = missingDomains.length === 0
    ? getGhanaMapping({
        kolbStyle: byDomain('learning')?.primaryStyle,
        sternbergStyle: byDomain('thinking')?.primaryStyle,
        dualProcessStyle: byDomain('decision')?.primaryStyle,
      })
    : null;

  // The webapp itself submits strengths/weaknesses/recommendations empty and
  // derives them at view time (see insights.ts) — mobile now matches that
  // instead of relying on what was stored at take-time.
  const insights =
    (assessmentType === 'learning' || assessmentType === 'thinking' || assessmentType === 'decision')
    && normalized?.primaryStyle && normalized.scores
      ? getStyleInsights(assessmentType, normalized.primaryStyle, normalized.scores)
      : null;

  if (loading) {
    return (
      <ScreenBackground>
        <View style={{ paddingTop: 8, paddingHorizontal: spacing.xl }}>
          <Skeleton width={'40%'} height={14} style={{ marginBottom: 10 }} />
          <Skeleton width={'60%'} height={28} radius={6} style={{ marginBottom: 24 }} />
          <Skeleton height={150} radius={20} style={{ marginBottom: 20 }} />
          <SkeletonCard lines={4} />
          <SkeletonCard lines={3} />
        </View>
      </ScreenBackground>
    );
  }

  if (!results) {
    return (
      <ScreenBackground>
        <View style={styles.centered}>
          <Text style={styles.emptyTitle}>No results yet</Text>
          <Text style={styles.emptyText}>Take the assessment to view your results.</Text>
          <GradientButton
            label="Take Assessment"
            onPress={() => navigation.navigate('AssessmentTaking', { assessmentType })}
            style={{ marginTop: spacing.lg }}
          />
        </View>
      </ScreenBackground>
    );
  }

  const gradient = typeGradient[assessmentType] || typeGradient.thinking;

  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>{assessmentType.toUpperCase()} RESULTS</Text>
          <Text style={styles.title}>Your Profile</Text>
          <Text style={styles.date}>
            Completed on {new Date(results.completedAt ?? results.createdAt ?? Date.now()).toLocaleDateString()}
          </Text>
        </View>

        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <Text style={styles.heroLabel}>PRIMARY STYLE</Text>
          <Text style={styles.heroValue}>{normalized?.primaryStyle || 'N/A'}</Text>
          {normalized?.primaryStyle && STYLE_DESCRIPTIONS[normalized.primaryStyle] ? (
            <Text style={styles.heroDesc}>{STYLE_DESCRIPTIONS[normalized.primaryStyle]}</Text>
          ) : null}
        </LinearGradient>

        {normalized?.scores && Object.keys(normalized.scores).length >= 3 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cognitive Profile</Text>
            <GlassCard padding={16}>
              <RadarChart
                data={Object.entries(normalized.scores).map(([label, value]: any) => ({ label, value }))}
              />
            </GlassCard>
          </View>
        )}

        {normalized?.scores && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Detailed Scores</Text>
            <GlassCard padding={20}>
              {Object.entries(normalized.scores).map(([key, value]: any, i, arr) => {
                const n = Math.max(0, Math.min(100, Math.round(Number(value) || 0)));
                return (
                <View key={key} style={[styles.scoreRow, i === arr.length - 1 && { marginBottom: 0 }]}>
                  <View style={styles.scoreHeader}>
                    <Text style={styles.scoreLabel}>
                      {String(key).charAt(0).toUpperCase() + String(key).slice(1)}
                    </Text>
                    <Text style={styles.scoreValue}>{n}/100</Text>
                  </View>
                  <View style={styles.scoreBar}>
                    <LinearGradient
                      colors={[gradient[0], gradient[1]]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[styles.scoreBarFill, { width: `${n}%` }]}
                    />
                  </View>
                </View>
                );
              })}
            </GlassCard>
          </View>
        )}

        {insights && insights.strengths.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Strengths</Text>
            {insights.strengths.map((s: string, i: number) => (
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

        {insights && insights.weaknesses.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Areas for Growth</Text>
            {insights.weaknesses.map((w: string, i: number) => (
              <GlassCard key={i} padding={16} style={styles.listCard}>
                <View style={styles.listRow}>
                  <View style={[styles.listBadge, { backgroundColor: colors.cyanSoft }]}>
                    <Text style={[styles.listBadgeText, { color: '#2E3FA8' }]}>→</Text>
                  </View>
                  <Text style={styles.listText}>{w}</Text>
                </View>
              </GlassCard>
            ))}
          </View>
        )}

        {insights && insights.improvements.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recommendations</Text>
            {insights.improvements.map((r: string, i: number) => (
              <GlassCard key={i} padding={16} style={[styles.listCard, styles.recCard]}>
                <View style={styles.listRow}>
                  <AppIcon name="💡" size={22} style={styles.recIcon} />
                  <Text style={styles.recText}>{r}</Text>
                </View>
              </GlassCard>
            ))}
          </View>
        )}

        {insights && insights.organizationalFit.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Where You Thrive</Text>
            {insights.organizationalFit.map((f: string, i: number) => (
              <GlassCard key={i} padding={16} style={styles.listCard}>
                <View style={styles.listRow}>
                  <AppIcon name="🏢" size={20} style={styles.recIcon} />
                  <Text style={styles.listText}>{f}</Text>
                </View>
              </GlassCard>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Career & Program Fit</Text>
          {ghanaMapping ? (
            <GlassCard padding={20}>
              {ghanaMapping.shsTrack.length > 0 && (
                <View style={styles.fitBlock}>
                  <Text style={styles.fitBlockLabel}>SHS TRACK</Text>
                  <Text style={styles.fitBlockValue}>{ghanaMapping.shsTrack.join(', ')}</Text>
                </View>
              )}
              {ghanaMapping.tertiaryFocus.length > 0 && (
                <View style={styles.fitBlock}>
                  <Text style={styles.fitBlockLabel}>TERTIARY FOCUS</Text>
                  <Text style={styles.fitBlockValue}>{ghanaMapping.tertiaryFocus.join(', ')}</Text>
                </View>
              )}
              {ghanaMapping.careerSuggestions.length > 0 && (
                <View style={styles.fitBlock}>
                  <Text style={styles.fitBlockLabel}>CAREER SUGGESTIONS</Text>
                  <Text style={styles.fitBlockValue}>{ghanaMapping.careerSuggestions.join(', ')}</Text>
                </View>
              )}
              {ghanaMapping.decisionTip ? (
                <View style={[styles.fitBlock, { marginBottom: 0 }]}>
                  <Text style={styles.fitBlockLabel}>DECISION TIP</Text>
                  <Text style={styles.fitBlockValue}>{ghanaMapping.decisionTip}</Text>
                </View>
              ) : null}
            </GlassCard>
          ) : (
            <GlassCard padding={20}>
              <Text style={styles.fitLockedText}>
                Complete your full cognitive profile to unlock career and program suggestions. Missing:{' '}
                {missingDomains.map((d) => domainLabel(d)).join(', ')}.
              </Text>
            </GlassCard>
          )}
        </View>

        {normalized?.primaryStyle && (
          <GradientButton
            label="Share Your Results 📤"
            onPress={() => setShowCertificate(true)}
            gradient={['#6E4D9C', '#3D52C9']}
            style={{ marginBottom: spacing.md }}
          />
        )}

        <GradientButton
          label="Retake Assessment"
          onPress={() => navigation.navigate('AssessmentTaking', { assessmentType })}
          gradient={[gradient[0], gradient[1]]}
          style={{ marginTop: spacing.md }}
        />
      </ScrollView>

      {normalized?.primaryStyle && (
        <CertificateModal
          visible={showCertificate}
          onClose={() => setShowCertificate(false)}
          icon="🏆"
          headline={normalized.primaryStyle}
          subtitle={`${assessmentType.charAt(0).toUpperCase() + assessmentType.slice(1)} Style · JotMinds Cognitive Profile`}
          name={user?.name ?? 'JotMinds User'}
          date={new Date().toLocaleDateString()}
        />
      )}
    </ScreenBackground>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  scroll: { paddingTop: 8, paddingHorizontal: spacing.xl, paddingBottom: 120 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  header: { marginBottom: spacing.lg },
  eyebrow: { fontSize: 12, color: colors.textSubtle, letterSpacing: 1.4, fontWeight: '700' },
  title: { fontSize: rs(28), fontWeight: '700', color: colors.textPrimary, marginTop: 4, letterSpacing: -0.6 },
  date: { fontSize: 14, color: colors.textMuted, marginTop: 4 },
  heroCard: { borderRadius: radii.xl, padding: spacing.xxl, marginBottom: spacing.xxl, ...shadow.glow },
  heroLabel: { color: 'rgba(255,255,255,0.75)', fontSize: 11, letterSpacing: 1.6, fontWeight: '700' },
  heroValue: { color: '#FFF', fontSize: rs(32), fontWeight: '800', marginTop: 8, letterSpacing: -0.5 },
  heroDesc: { color: 'rgba(255,255,255,0.85)', fontSize: 14, lineHeight: 21, marginTop: 10 },
  section: { marginBottom: spacing.xxl },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.md, letterSpacing: -0.4 },
  scoreRow: { marginBottom: spacing.lg },
  scoreHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  scoreLabel: { fontSize: 14, fontWeight: '600', color: colors.text },
  scoreValue: { fontSize: 14, fontWeight: '700', color: colors.textMuted },
  scoreBar: { height: 8, backgroundColor: '#E5EEFF', borderRadius: 4, overflow: 'hidden' },
  scoreBarFill: { height: '100%', borderRadius: 4 },
  listCard: { marginBottom: spacing.md },
  listRow: { flexDirection: 'row', alignItems: 'center' },
  listBadge: {
    width: 32, height: 32, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
    marginRight: spacing.md,
  },
  listBadgeText: { fontSize: 16, fontWeight: '800' },
  listText: { flex: 1, fontSize: 14, color: colors.text, lineHeight: 20 },
  recCard: { backgroundColor: '#FEF3C7', borderColor: '#FCD34D' },
  recIcon: { fontSize: 22, marginRight: spacing.md },
  recText: { flex: 1, fontSize: 14, color: '#78350F', lineHeight: 20 },
  emptyTitle: { fontSize: 22, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.sm },
  emptyText: { fontSize: 14, color: colors.textMuted, textAlign: 'center' },
  fitBlock: { marginBottom: spacing.lg },
  fitBlockLabel: { fontSize: 11, fontWeight: '700', color: colors.textSubtle, letterSpacing: 1.2, marginBottom: 6 },
  fitBlockValue: { fontSize: 14, color: colors.text, lineHeight: 20 },
  fitLockedText: { fontSize: 13, color: colors.textMuted, lineHeight: 20 },
});
