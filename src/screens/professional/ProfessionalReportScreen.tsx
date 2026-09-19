import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Share } from 'react-native';
import ScreenBackground from '../../components/ScreenBackground';
import GlassCard from '../../components/GlassCard';
import { ExecutiveSummaryCard, ProfessionalInsightsCard } from '../../components/ai/InsightCards';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { exportProfessionalReportPdf } from '../../utils/pdfReport';
import { ProfessionalCognitiveEntry, loadEntries, buildReportText } from '../../utils/professionalCognitiveStore';
import { rs } from '../../utils/responsive';
import { radii, spacing, Palette } from '../../theme';
import { useTheme, useThemedStyles } from '../../context/ThemeContext';
import type { ScreenProps } from '../../navigation/types';

/** Professional Assessment Report: the cognitive profile with the person's position and organisation, AI insights, share. */
export default function ProfessionalReportScreen({ route, navigation }: ScreenProps<'ProfessionalReport'>) {
  const colors = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { user } = useAuth();
  const toast = useToast();
  const [pdfBusy, setPdfBusy] = useState(false);
  const [entry, setEntry] = useState<ProfessionalCognitiveEntry | null>(null);
  const [loading, setLoading] = useState(true);

  const entryId = route.params?.entryId;
  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    loadEntries(user.id).then((all) => {
      setEntry((entryId ? all.find((e) => e.id === entryId) : all[0]) ?? null);
      setLoading(false);
    });
  }, [user?.id, entryId]);

  if (loading) {
    return <ScreenBackground><View style={styles.centered}><ActivityIndicator size="large" color={colors.purple} /></View></ScreenBackground>;
  }
  if (!entry) {
    return (
      <ScreenBackground>
        <View style={styles.centered}>
          <Text style={styles.title}>No report yet</Text>
          <Text style={styles.text}>Take the Professional Cognitive Assessment to generate your report.</Text>
          <TouchableOpacity onPress={() => navigation.replace('ProfessionalCognitive')} style={{ marginTop: 16 }}>
            <Text style={styles.link}>Start assessment</Text>
          </TouchableOpacity>
        </View>
      </ScreenBackground>
    );
  }

  const p = entry.profile;
  const dims = [
    { label: 'Learning', d: p.learning },
    { label: 'Thinking', d: p.thinking },
    { label: 'Decision-making', d: p.decisionMaking },
    ...(p.motivation ? [{ label: 'Motivation', d: p.motivation }] : []),
  ];
  const who = { name: user?.name, position: user?.position, organization: user?.organizationName };

  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.eyebrow}>PROFESSIONAL ASSESSMENT REPORT</Text>
        <Text style={styles.title}>{user?.name}</Text>
        <Text style={styles.sub}>{[user?.position, user?.organizationName].filter(Boolean).join(' · ')}</Text>
        <Text style={styles.sub}>Completed {new Date(entry.at).toLocaleDateString()}</Text>

        <GlassCard variant="dark" padding={18} style={styles.card}>
          <Text style={styles.overall}>{p.overallProfile}</Text>
          <Text style={styles.text}>{p.summary}</Text>
        </GlassCard>

        {dims.map(({ label, d }) => (
          <GlassCard key={label} variant="dark" padding={16} style={styles.card}>
            <Text style={styles.dimLabel}>{label.toUpperCase()}</Text>
            <Text style={styles.dimStyle}>{d.style}</Text>
            {!!d.anchors && <Text style={styles.anchors}>{d.anchors}</Text>}
            <Text style={styles.text}>{d.description}</Text>
          </GlassCard>
        ))}

        <ExecutiveSummaryCard
          profile={{
            name: user?.name, position: user?.position, organization: user?.organizationName,
            learning: p.learning.style, thinking: p.thinking.style, decision: p.decisionMaking.style,
          }}
        />
        <ProfessionalInsightsCard
          profile={{
            name: user?.name, position: user?.position,
            learning: { style: p.learning.style, score: p.learning.score },
            thinking: { style: p.thinking.style, score: p.thinking.score },
            decisionMaking: { style: p.decisionMaking.style, score: p.decisionMaking.score },
          }}
        />

        <TouchableOpacity
          style={[styles.btn, pdfBusy && { opacity: 0.6 }]}
          disabled={pdfBusy}
          accessibilityRole="button"
          accessibilityLabel="Download report as PDF"
          onPress={async () => {
            setPdfBusy(true);
            const r = await exportProfessionalReportPdf(entry, who);
            setPdfBusy(false);
            if (!r.ok) toast.error(r.error);
          }}
        >
          {pdfBusy ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Download PDF report 📄</Text>}
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, { backgroundColor: colors.purple }]} onPress={() => Share.share({ message: buildReportText(entry, who) }).catch(() => {})} accessibilityRole="button">
          <Text style={styles.btnText}>Share report 📤</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('ProfessionalCognitive')} style={{ alignItems: 'center', padding: 14 }} accessibilityRole="button">
          <Text style={styles.link}>Retake assessment</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenBackground>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  scroll: { padding: spacing.xl, paddingBottom: 60 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  eyebrow: { fontSize: rs(11), fontWeight: '800', letterSpacing: 1.4, color: colors.purpleSoft, marginBottom: 6 },
  title: { fontSize: rs(24), fontWeight: '800', color: colors.text },
  sub: { fontSize: rs(12), color: colors.textMuted, marginTop: 3 },
  card: { marginTop: spacing.lg },
  overall: { fontSize: rs(17), fontWeight: '800', color: colors.text, marginBottom: 6 },
  text: { fontSize: rs(13), lineHeight: rs(19), color: colors.textSecondary, textAlign: 'auto' },
  dimLabel: { fontSize: rs(11), fontWeight: '800', letterSpacing: 1, color: colors.purpleSoft },
  dimStyle: { fontSize: rs(16), fontWeight: '800', color: colors.text, marginVertical: 3 },
  anchors: { fontSize: rs(11), color: colors.textMuted, marginBottom: 6 },
  link: { color: colors.success, fontWeight: '800', fontSize: rs(13) },
  btn: { backgroundColor: colors.success, borderRadius: radii.xl, paddingVertical: 15, alignItems: 'center', marginTop: spacing.md },
  btnText: { color: '#fff', fontWeight: '800', fontSize: rs(14) },
});
