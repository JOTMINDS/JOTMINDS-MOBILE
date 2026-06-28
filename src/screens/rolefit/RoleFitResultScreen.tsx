import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenBackground from '../../components/ScreenBackground';
import GlassCard from '../../components/GlassCard';
import AppIcon from '../../components/AppIcon';
import { colors, radii, spacing } from '../../theme';

function fitInfo(score: number) {
  if (score >= 85) return { label: 'Natural Accelerator', color: colors.success, desc: 'Your cognitive profile is a natural match. Expect rapid growth and low friction.' };
  if (score >= 70) return { label: 'Strong Alignment', color: colors.cyan, desc: 'Strong compatibility. You have the core traits for this role with minor gaps.' };
  if (score >= 55) return { label: 'Adaptable Fit', color: colors.warning, desc: 'You can succeed here with targeted development in a few key areas.' };
  if (score >= 40) return { label: 'Strain Risk', color: '#F97316', desc: 'Some misalignment that could lead to burnout. Proceed with awareness.' };
  return { label: 'Misalignment Risk', color: colors.error, desc: 'Significant cognitive mismatch. Consider whether this role suits your traits.' };
}

export default function RoleFitResultScreen({ route, navigation }: any) {
  const { result, roleName, role } = route.params;
  const name = roleName ?? role?.title ?? 'This Role';
  const score = result?.fit_score ?? role?.fit ?? 0;
  const info = fitInfo(score);

  const gapMap: Record<string, number> = result?.gap_map ?? {};
  const riskFlags: string[] = result?.risk_flags ?? [];

  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        {/* Score circle */}
        <LinearGradient
          colors={['#14136E', '#0F172B']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.scoreCard}
        >
          <Text style={styles.scoreRoleName}>{name}</Text>
          <View style={styles.scoreCircle}>
            <Text style={[styles.scoreNumber, { color: info.color }]}>{score}</Text>
            <Text style={styles.scoreUnit}>/100</Text>
          </View>
          <View style={[styles.fitBadge, { backgroundColor: `${info.color}22`, borderColor: info.color }]}>
            <Text style={[styles.fitLabel, { color: info.color }]}>{info.label}</Text>
          </View>
          <Text style={styles.fitDesc}>{info.desc}</Text>
        </LinearGradient>

        {/* Score scale legend */}
        <GlassCard style={styles.scaleCard}>
          <Text style={styles.scaleTitle}>Fit Scale</Text>
          {[
            { range: '85–100', label: 'Natural Accelerator', color: colors.success },
            { range: '70–84', label: 'Strong Alignment', color: colors.cyan },
            { range: '55–69', label: 'Adaptable Fit', color: colors.warning },
            { range: '40–54', label: 'Strain Risk', color: '#F97316' },
            { range: 'Below 40', label: 'Misalignment Risk', color: colors.error },
          ].map((item) => (
            <View key={item.label} style={styles.scaleRow}>
              <View style={[styles.scaleDot, { backgroundColor: item.color }]} />
              <Text style={styles.scaleRange}>{item.range}</Text>
              <Text style={[styles.scaleLabel, { color: item.color }]}>{item.label}</Text>
            </View>
          ))}
        </GlassCard>

        {/* Gap map */}
        {Object.keys(gapMap).length > 0 && (
          <GlassCard style={styles.gapCard}>
            <Text style={styles.gapTitle}>Gap Map</Text>
            <Text style={styles.gapSub}>Your cognitive traits vs. role demands</Text>
            {Object.entries(gapMap).map(([dim, gap]) => (
              <View key={dim} style={styles.gapRow}>
                <Text style={styles.gapDim}>{dim.replace(/_/g, ' ')}</Text>
                <View style={styles.gapBarTrack}>
                  <View style={styles.gapBarCenter} />
                  <View
                    style={[
                      styles.gapBarFill,
                      {
                        width: `${Math.abs(gap) * 10}%`,
                        backgroundColor: gap > 0 ? colors.success : colors.error,
                        left: gap > 0 ? '50%' : undefined,
                        right: gap < 0 ? '50%' : undefined,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.gapValue, { color: gap > 0 ? colors.success : colors.error }]}>
                  {gap > 0 ? `+${gap}` : gap}
                </Text>
              </View>
            ))}
          </GlassCard>
        )}

        {/* Risk flags */}
        {riskFlags.length > 0 && (
          <GlassCard style={styles.riskCard}>
            <View style={styles.riskTitleRow}>
              <AppIcon name="⚠️" size={16} color={colors.warning} />
              <Text style={styles.riskTitle}>Risk Flags</Text>
            </View>
            {riskFlags.map((flag, i) => (
              <Text key={i} style={styles.riskFlag}>• {flag}</Text>
            ))}
          </GlassCard>
        )}

        {/* CTA */}
        <TouchableOpacity
          style={styles.adaptBtn}
          onPress={() => navigation.navigate('AdaptationRecommendations', { result, roleName: name })}
        >
          <LinearGradient
            colors={['#6E4D9C', '#3D52C9']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.adaptBtnGradient}
          >
            <Text style={styles.adaptBtnText}>See Adaptation Plan →</Text>
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          Note: Cognitive fit analysis is not a substitute for skill evaluation.
        </Text>
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingTop: 56, paddingHorizontal: spacing.xl, paddingBottom: 120 },
  backBtn: { marginBottom: 20 },
  backText: { fontSize: 15, color: colors.cyan, fontWeight: '600' },
  scoreCard: { borderRadius: radii.xl, padding: 28, alignItems: 'center', marginBottom: 20 },
  scoreRoleName: { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.55)', letterSpacing: 1, marginBottom: 20, textTransform: 'uppercase' },
  scoreCircle: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 16 },
  scoreNumber: { fontSize: 80, fontWeight: '800', lineHeight: 88 },
  scoreUnit: { fontSize: 22, color: 'rgba(255,255,255,0.4)', fontWeight: '600', marginLeft: 4 },
  fitBadge: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: radii.pill,
    borderWidth: 1.5, marginBottom: 12,
  },
  fitLabel: { fontSize: 13, fontWeight: '800', letterSpacing: 0.5 },
  fitDesc: { fontSize: 13, color: 'rgba(255,255,255,0.6)', textAlign: 'center', lineHeight: 20, paddingHorizontal: 16 },
  scaleCard: { marginBottom: 16 },
  scaleTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 14 },
  scaleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  scaleDot: { width: 10, height: 10, borderRadius: 5 },
  scaleRange: { fontSize: 12, color: colors.textMuted, width: 72 },
  scaleLabel: { fontSize: 13, fontWeight: '600', flex: 1 },
  gapCard: { marginBottom: 16 },
  gapTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 4 },
  gapSub: { fontSize: 12, color: colors.textMuted, marginBottom: 16 },
  gapRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  gapDim: { fontSize: 12, color: colors.textSecondary, width: 100, textTransform: 'capitalize' },
  gapBarTrack: { flex: 1, height: 10, backgroundColor: colors.bgTertiary, borderRadius: 5, overflow: 'hidden', position: 'relative' },
  gapBarCenter: { position: 'absolute', left: '50%', width: 2, height: '100%', backgroundColor: colors.borderLight },
  gapBarFill: { position: 'absolute', height: '100%', borderRadius: 5 },
  gapValue: { fontSize: 12, fontWeight: '700', width: 32, textAlign: 'right' },
  riskCard: { marginBottom: 16 },
  riskTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  riskTitle: { fontSize: 16, fontWeight: '700', color: colors.warning },
  riskFlag: { fontSize: 13, color: colors.textSecondary, lineHeight: 22, marginBottom: 4 },
  adaptBtn: { borderRadius: radii.md, overflow: 'hidden', marginBottom: 16 },
  adaptBtnGradient: { paddingVertical: 18, alignItems: 'center' },
  adaptBtnText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  disclaimer: { fontSize: 11, color: colors.textSubtle, textAlign: 'center', lineHeight: 16 },
});
