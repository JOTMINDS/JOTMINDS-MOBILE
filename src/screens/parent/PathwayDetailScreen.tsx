import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenBackground from '../../components/ScreenBackground';
import GlassCard from '../../components/GlassCard';
import AppIcon from '../../components/AppIcon';
import { radii, spacing, shadow, Palette } from '../../theme';
import { useTheme, useThemedStyles } from '../../context/ThemeContext';

export default function PathwayDetailScreen({ route, navigation }: any) {
  const colors = useTheme();
  const styles = useThemedStyles(makeStyles);
  const pathway = route?.params?.pathway ?? {};
  const {
    title = 'Pathway', description = '', duration = '', modules = 0,
    icon = '🌱', gradient = ['#6E4D9C', '#5A3E82'], progress = 0, difficulty = 'beginner',
  } = pathway;

  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Go back">
          <AppIcon name="arrow-back" size={22} color={colors.textMuted} />
        </TouchableOpacity>

        <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
          <View style={styles.heroIcon}><AppIcon name={icon} size={30} color="#FFFFFF" /></View>
          <Text style={styles.heroTitle}>{title}</Text>
          <Text style={styles.heroMeta}>{difficulty} · {duration} · {modules} modules</Text>
        </LinearGradient>

        <Text style={styles.desc}>{description}</Text>

        {progress > 0 && (
          <GlassCard style={styles.card}>
            <Text style={styles.cardLabel}>YOUR PROGRESS</Text>
            <View style={styles.progressRow}>
              <View style={styles.track}><View style={[styles.fill, { width: `${Math.min(100, progress)}%`, backgroundColor: gradient[0] }]} /></View>
              <Text style={styles.pct}>{progress}%</Text>
            </View>
          </GlassCard>
        )}

        <Text style={styles.sectionTitle}>What you'll cover</Text>
        {Array.from({ length: Math.min(4, modules || 4) }).map((_, i) => (
          <GlassCard key={i} style={styles.moduleCard}>
            <View style={styles.moduleRow}>
              <View style={[styles.moduleNum, { backgroundColor: `${gradient[0]}22` }]}>
                <Text style={[styles.moduleNumText, { color: gradient[0] }]}>{i + 1}</Text>
              </View>
              <Text style={styles.moduleText}>Module {i + 1}</Text>
            </View>
          </GlassCard>
        ))}

        <TouchableOpacity
          style={styles.cta}
          onPress={() => navigation.navigate('ExpertConsultation')}
          activeOpacity={0.85}
          accessibilityRole="button"
        >
          <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.ctaGradient}>
            <Text style={styles.ctaText}>Talk to an expert about this pathway</Text>
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.note}>Full module content is coming soon. In the meantime, book a consultation for tailored guidance.</Text>
      </ScrollView>
    </ScreenBackground>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  scroll: { paddingTop: 8, paddingHorizontal: spacing.xl, paddingBottom: 100 },
  back: { width: 44, height: 44, justifyContent: 'center', marginBottom: 4 },
  hero: { borderRadius: radii.xl, padding: spacing.xxl, marginBottom: spacing.lg, ...shadow.glow },
  heroIcon: { width: 60, height: 60, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
  heroTitle: { fontSize: 24, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.5 },
  heroMeta: { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 6, textTransform: 'capitalize' },
  desc: { fontSize: 15, color: colors.textMuted, lineHeight: 22, marginBottom: spacing.lg },
  card: { marginBottom: spacing.lg },
  cardLabel: { fontSize: 12, fontWeight: '700', color: colors.textSubtle, letterSpacing: 1.2, marginBottom: 10 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  track: { flex: 1, height: 8, backgroundColor: colors.bgTertiary, borderRadius: 4, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4 },
  pct: { fontSize: 13, fontWeight: '700', color: colors.text },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.md, marginTop: spacing.sm },
  moduleCard: { marginBottom: 10 },
  moduleRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  moduleNum: { width: 36, height: 36, borderRadius: 11, justifyContent: 'center', alignItems: 'center' },
  moduleNumText: { fontSize: 15, fontWeight: '800' },
  moduleText: { fontSize: 15, fontWeight: '600', color: colors.text },
  cta: { borderRadius: radii.md, overflow: 'hidden', marginTop: spacing.lg },
  ctaGradient: { paddingVertical: 16, alignItems: 'center' },
  ctaText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  note: { fontSize: 12, color: colors.textSubtle, lineHeight: 18, marginTop: spacing.md, textAlign: 'center' },
});
