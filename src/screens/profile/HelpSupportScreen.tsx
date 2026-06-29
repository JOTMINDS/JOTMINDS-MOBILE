import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import ScreenBackground from '../../components/ScreenBackground';
import GlassCard from '../../components/GlassCard';
import AppIcon from '../../components/AppIcon';
import { radii, spacing, Palette } from '../../theme';
import { useTheme, useThemedStyles } from '../../context/ThemeContext';

const FAQS = [
  { q: 'How are my results calculated?', a: 'Each assessment uses a validated framework (Kolb, Sternberg, Dual-Process) and scores your answers across its dimensions.' },
  { q: 'Can I retake an assessment?', a: 'Yes. Open a completed assessment from your dashboard to view results, then tap Retake.' },
  { q: 'Why is my Role Fit locked?', a: 'Role Fit needs all three core assessments completed so its match is based on your full cognitive profile.' },
  { q: 'Is my data private?', a: 'Yes — see Privacy Settings. Your results are tied to your account and never sold.' },
];

export default function HelpSupportScreen({ navigation }: any) {
  const colors = useTheme();
  const styles = useThemedStyles(makeStyles);

  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Go back">
          <AppIcon name="arrow-back" size={22} color={colors.textMuted} />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Help & Support</Text>
          <Text style={styles.subtitle}>Answers and ways to reach us</Text>
        </View>

        <Text style={styles.sectionLabel}>CONTACT</Text>
        <GlassCard style={styles.card} onPress={() => Linking.openURL('mailto:support@jotminds.com').catch(() => {})}>
          <View style={styles.row}>
            <View style={styles.iconWrap}><AppIcon name="✉️" size={20} color={colors.cyan} /></View>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Email Support</Text>
              <Text style={styles.rowDesc}>support@jotminds.com</Text>
            </View>
            <AppIcon name="arrow-forward" size={16} color={colors.purple} />
          </View>
        </GlassCard>

        <Text style={styles.sectionLabel}>FREQUENTLY ASKED</Text>
        {FAQS.map((f) => (
          <GlassCard key={f.q} style={styles.card}>
            <Text style={styles.q}>{f.q}</Text>
            <Text style={styles.a}>{f.a}</Text>
          </GlassCard>
        ))}
      </ScrollView>
    </ScreenBackground>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  scroll: { paddingTop: 8, paddingHorizontal: spacing.xl, paddingBottom: 80 },
  back: { width: 44, height: 44, justifyContent: 'center', marginBottom: 4 },
  header: { marginBottom: 24 },
  title: { fontSize: 30, fontWeight: '800', color: colors.textPrimary, letterSpacing: -1 },
  subtitle: { fontSize: 15, color: colors.textMuted, marginTop: 4 },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: colors.textSubtle, letterSpacing: 1.4, marginBottom: 12, marginTop: 8 },
  card: { marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  iconWrap: { width: 44, height: 44, borderRadius: 13, backgroundColor: `${colors.cyan}22`, justifyContent: 'center', alignItems: 'center' },
  rowText: { flex: 1 },
  rowTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 3 },
  rowDesc: { fontSize: 13, color: colors.textMuted },
  q: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 6 },
  a: { fontSize: 13, color: colors.textMuted, lineHeight: 19 },
});
