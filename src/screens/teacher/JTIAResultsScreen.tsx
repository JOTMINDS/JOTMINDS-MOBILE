import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenBackground from '../../components/ScreenBackground';
import GlassCard from '../../components/GlassCard';
import RadarChart from '../../components/RadarChart';
import { JTIAReportData } from '../../utils/jtiaScoring';
import { getLastJTIAReport } from '../../utils/jtiaStatus';
import { rs } from '../../utils/responsive';
import { radii, spacing, Palette } from '../../theme';
import { useTheme, useThemedStyles } from '../../context/ThemeContext';

const DOMAIN_META: { key: keyof JTIAReportData['domainScores']; label: string; icon: string }[] = [
  { key: 'cognitive', label: 'Cognitive', icon: '🧠' },
  { key: 'instructional', label: 'Instructional', icon: '📖' },
  { key: 'leadership', label: 'Leadership', icon: '🧭' },
  { key: 'relationship', label: 'Relationship', icon: '🤝' },
  { key: 'professional', label: 'Professional', icon: '🎖️' },
];

const REC_SECTIONS: { key: keyof JTIAReportData['recommendations']; title: string; icon: string }[] = [
  { key: 'resources', title: 'Resources', icon: '📚' },
  { key: 'activities', title: 'Try This Week', icon: '✅' },
  { key: 'coaching', title: 'Coaching Moves', icon: '🎯' },
  { key: 'pathways', title: 'Growth Pathways', icon: '🚀' },
];

function bandLabel(score: number): string {
  if (score >= 85) return 'Exemplary';
  if (score >= 70) return 'Proficient';
  if (score >= 55) return 'Developing';
  return 'Emerging';
}

export default function JTIAResultsScreen({ route, navigation }: any) {
  const colors = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [report, setReport] = useState<JTIAReportData | undefined>(route.params?.report);

  useEffect(() => {
    if (!report) getLastJTIAReport().then((r) => r && setReport(r));
  }, [report]);

  if (!report) {
    return (
      <ScreenBackground>
        <View style={styles.centered}>
          <Text style={styles.emptyTitle}>No results yet</Text>
          <Text style={styles.emptyText}>Take the JTIA to see your teacher intelligence profile.</Text>
          <TouchableOpacity onPress={() => navigation.replace('JTIAAssessment')} style={{ marginTop: spacing.lg }}>
            <Text style={{ color: colors.success, fontWeight: '700' }}>Start JTIA</Text>
          </TouchableOpacity>
        </View>
      </ScreenBackground>
    );
  }

  const radarData = DOMAIN_META.map((d) => ({ label: d.label, value: report.domainScores[d.key] }));

  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>ASSESSMENT COMPLETE</Text>
          <Text style={styles.title}>Your Teacher Intelligence 🎓</Text>
        </View>

        <LinearGradient
          colors={['#3D52C9', '#14136E']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.scoreCard}
        >
          <Text style={styles.scoreValue}>{report.overallScore}</Text>
          <Text style={styles.scoreLabel}>Overall · {bandLabel(report.overallScore)}</Text>
        </LinearGradient>

        <GlassCard variant="dark" padding={16} style={styles.card}>
          <Text style={styles.cardTitle}>Domain Profile</Text>
          <View style={{ alignItems: 'center', marginVertical: 8 }}>
            <RadarChart data={radarData} size={280} />
          </View>
          {DOMAIN_META.map((d) => (
            <View key={d.key} style={styles.domainRow}>
              <Text style={styles.domainIcon}>{d.icon}</Text>
              <Text style={styles.domainLabel}>{d.label}</Text>
              <View style={styles.domainBarTrack}>
                <View style={[styles.domainBarFill, { width: `${report.domainScores[d.key]}%` }]} />
              </View>
              <Text style={styles.domainScore}>{report.domainScores[d.key]}</Text>
            </View>
          ))}
        </GlassCard>

        <GlassCard variant="dark" padding={16} style={styles.card}>
          <Text style={styles.cardTitle}>Signature Strengths</Text>
          {report.strengths.map((s) => (
            <View key={s.title} style={styles.capItem}>
              <View style={styles.capHead}>
                <Text style={styles.capTitle}>{s.title}</Text>
                <Text style={[styles.capScore, { color: colors.success }]}>{s.score}</Text>
              </View>
              <Text style={styles.capDesc}>{s.description}</Text>
            </View>
          ))}
        </GlassCard>

        <GlassCard variant="dark" padding={16} style={styles.card}>
          <Text style={styles.cardTitle}>Growth Opportunities</Text>
          {report.growthOpportunities.map((g) => (
            <View key={g.title} style={styles.capItem}>
              <View style={styles.capHead}>
                <Text style={styles.capTitle}>{g.title}</Text>
                <Text style={[styles.capScore, { color: colors.cyan }]}>{g.score}</Text>
              </View>
              <Text style={styles.capDesc}>{g.description}</Text>
            </View>
          ))}
        </GlassCard>

        {REC_SECTIONS.map((sec) => {
          const items = report.recommendations[sec.key];
          if (!items?.length) return null;
          return (
            <GlassCard key={sec.key} variant="dark" padding={16} style={styles.card}>
              <Text style={styles.cardTitle}>{sec.icon}  {sec.title}</Text>
              {items.map((it, i) => (
                <View key={i} style={styles.recRow}>
                  <Text style={styles.recBullet}>•</Text>
                  <Text style={styles.recText}>{it}</Text>
                </View>
              ))}
            </GlassCard>
          );
        })}

        <TouchableOpacity
          style={styles.doneBtn}
          onPress={() => navigation.navigate('TeacherDevelopment')}
          accessibilityRole="button"
          accessibilityLabel="Back to teacher development"
        >
          <Text style={styles.doneBtnText}>Done</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenBackground>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  scroll: { paddingHorizontal: spacing.xl, paddingTop: 12, paddingBottom: 48 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl },
  emptyTitle: { fontSize: rs(20), fontWeight: '800', color: colors.text, marginBottom: 8 },
  emptyText: { fontSize: rs(14), color: colors.textMuted, textAlign: 'center' },

  header: { marginBottom: 16 },
  eyebrow: { fontSize: rs(11), fontWeight: '800', color: colors.success, letterSpacing: 1.5, marginBottom: 6 },
  title: { fontSize: rs(24), fontWeight: '800', color: colors.text, letterSpacing: -0.5 },

  scoreCard: { borderRadius: radii.lg, paddingVertical: 24, alignItems: 'center', marginBottom: 16 },
  scoreValue: { fontSize: rs(48), fontWeight: '900', color: '#fff', letterSpacing: -1 },
  scoreLabel: { fontSize: rs(13), fontWeight: '700', color: 'rgba(255,255,255,0.85)', marginTop: 2 },

  card: { marginBottom: 14 },
  cardTitle: { fontSize: rs(15), fontWeight: '800', color: colors.text, marginBottom: 12 },

  domainRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  domainIcon: { fontSize: rs(14), width: 20 },
  domainLabel: { fontSize: rs(12), fontWeight: '600', color: colors.textSecondary, width: 84 },
  domainBarTrack: { flex: 1, height: 7, borderRadius: 4, backgroundColor: colors.bgTertiary, overflow: 'hidden' },
  domainBarFill: { height: '100%', borderRadius: 4, backgroundColor: colors.cyan },
  domainScore: { fontSize: rs(12), fontWeight: '800', color: colors.text, width: 26, textAlign: 'right' },

  capItem: { marginBottom: 12 },
  capHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  capTitle: { fontSize: rs(13), fontWeight: '700', color: colors.text, flex: 1 },
  capScore: { fontSize: rs(13), fontWeight: '800', marginLeft: 8 },
  capDesc: { fontSize: rs(12), color: colors.textMuted, lineHeight: rs(18) },

  recRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  recBullet: { fontSize: rs(13), color: colors.cyan, fontWeight: '900' },
  recText: { flex: 1, fontSize: rs(12), color: colors.textSecondary, lineHeight: rs(18) },

  doneBtn: {
    marginTop: 8, paddingVertical: 15, borderRadius: radii.md, alignItems: 'center',
    backgroundColor: colors.glassMedium, borderWidth: 1, borderColor: colors.borderLight,
  },
  doneBtnText: { fontSize: rs(15), fontWeight: '700', color: colors.textSecondary },
});
