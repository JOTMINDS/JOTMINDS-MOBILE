import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenBackground from '../../components/ScreenBackground';
import AppIcon from '../../components/AppIcon';
import GlassCard from '../../components/GlassCard';
import { colors, radii, shadow, spacing, Palette } from '../../theme';
import { useTheme, useThemedStyles } from '../../context/ThemeContext';

export default function AssessmentListScreen({ navigation }: any) {
  const colors = useTheme();
  const styles = useThemedStyles(makeStyles);
  const assessments: {
    type: string; title: string; description: string; icon: string;
    gradient: [string, string]; duration: string;
  }[] = [
    {
      type: 'learning',
      title: 'Learning Agility',
      description: 'Discover how you learn best through experience, reflection, analysis, or experimentation.',
      icon: '📚',
      gradient: ['#3D52C9', '#2E3FA8'],
      duration: '15-20 min',
    },
    {
      type: 'thinking',
      title: 'Thinking Style',
      description: 'Explore your unique strengths in analytical, creative, or practical thinking.',
      icon: '🧠',
      gradient: ['#6E4D9C', '#5A3E82'],
      duration: '15-20 min',
    },
    {
      type: 'decision',
      title: 'Decision Style',
      description: 'Discover whether you rely on intuition or analysis when making choices.',
      icon: '🎯',
      gradient: ['#EC4899', '#DB2777'],
      duration: '10-15 min',
    },
  ];

  const info = [
    { icon: '✨', text: 'Gain deep insights into how you think, learn, and decide' },
    { icon: '🎓', text: 'Receive personalized recommendations for study and career paths' },
    { icon: '📊', text: 'Track your cognitive profile and growth over time' },
  ];

  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>EXPLORE</Text>
          <Text style={styles.title}>Assessments</Text>
          <Text style={styles.subtitle}>
            Discover your cognitive profile through research-based assessments.
          </Text>
        </View>

        <View style={styles.list}>
          {assessments.map((a) => (
            <GlassCard
              key={a.type}
              padding={20}
              style={styles.card}
              onPress={() => navigation.navigate('AssessmentTaking', { assessmentType: a.type })}
            >
              <View style={styles.cardHeader}>
                <LinearGradient colors={a.gradient} style={styles.iconWrap} start={{x:0,y:0}} end={{x:1,y:1}}>
                  <AppIcon name={a.icon} size={22} style={styles.icon} />
                </LinearGradient>
                <View style={styles.durationPill}>
                  <Text style={styles.durationText}>{a.duration}</Text>
                </View>
              </View>
              <Text style={styles.cardTitle}>{a.title}</Text>
              <Text style={styles.cardDesc}>{a.description}</Text>
              <View style={styles.startRow}>
                <Text style={styles.startText}>Start Assessment</Text>
                <AppIcon name="→" size={18} style={styles.startArrow} />
              </View>
            </GlassCard>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Why Take These?</Text>
        {info.map((i) => (
          <GlassCard key={i.text} padding={16} style={styles.infoCard}>
            <View style={styles.infoRow}>
              <AppIcon name={i.icon} size={22} style={styles.infoIcon} />
              <Text style={styles.infoText}>{i.text}</Text>
            </View>
          </GlassCard>
        ))}
      </ScrollView>
    </ScreenBackground>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  scroll: { paddingTop: 8, paddingHorizontal: spacing.xl, paddingBottom: 120 },
  header: { marginBottom: spacing.xxl },
  eyebrow: { fontSize: 12, color: colors.textSubtle, letterSpacing: 1.4, fontWeight: '700' },
  title: { fontSize: 32, fontWeight: '700', color: colors.textPrimary, marginTop: 4, letterSpacing: -0.6 },
  subtitle: { fontSize: 15, color: colors.textMuted, marginTop: spacing.sm, lineHeight: 22 },
  list: { marginBottom: spacing.lg },
  card: { marginBottom: spacing.lg },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  iconWrap: { width: 52, height: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 26 },
  durationPill: { backgroundColor: colors.surfaceMuted, paddingHorizontal: 12, paddingVertical: 6, borderRadius: radii.pill },
  durationText: { fontSize: 12, color: colors.textPrimary, fontWeight: '700' },
  cardTitle: { fontSize: 20, fontWeight: '700', color: colors.textPrimary, marginBottom: 6, letterSpacing: -0.3 },
  cardDesc: { fontSize: 14, color: colors.textMuted, lineHeight: 20, marginBottom: spacing.lg },
  startRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 6 },
  startText: { fontSize: 14, fontWeight: '700', color: colors.purple },
  startArrow: { fontSize: 16, color: colors.purple, fontWeight: '800' },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.md, letterSpacing: -0.4 },
  infoCard: { marginBottom: spacing.md },
  infoRow: { flexDirection: 'row', alignItems: 'center' },
  infoIcon: { fontSize: 22, marginRight: spacing.md },
  infoText: { flex: 1, fontSize: 14, color: colors.text, lineHeight: 20 },
});
