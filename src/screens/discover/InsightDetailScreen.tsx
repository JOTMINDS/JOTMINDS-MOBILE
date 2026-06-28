import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenBackground from '../../components/ScreenBackground';
import GlassCard from '../../components/GlassCard';
import AppIcon from '../../components/AppIcon';
import { colors, radii, spacing, Palette } from '../../theme';
import { useTheme, useThemedStyles } from '../../context/ThemeContext';

export default function InsightDetailScreen({ route, navigation }: any) {
  const colors = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { insight } = route.params;

  const sections = [
    {
      heading: 'The Science',
      body: `${insight.preview} This is a well-documented phenomenon in cognitive science, supported by decades of research across multiple disciplines.`,
    },
    {
      heading: 'What This Means For You',
      body: 'Understanding your cognitive patterns gives you a significant advantage. When you know how you naturally process information, you can design environments and habits that amplify your strengths.',
    },
    {
      heading: 'Micro-Adjustment',
      body: 'Try this: Before making your next major decision, pause for 90 seconds. Ask yourself — am I operating from System 1 (gut) or System 2 (deliberate)? Naming the mode is the first step to controlling it.',
    },
  ];

  return (
    <ScreenBackground>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Back button */}
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        {/* Hero */}
        <LinearGradient
          colors={insight.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <AppIcon name={insight.icon} size={44} color="#FFFFFF" style={styles.heroIcon} />
          <Text style={styles.heroTag}>{insight.tag}</Text>
          <Text style={styles.heroTitle}>{insight.title}</Text>
          <Text style={styles.heroMeta}>{insight.readTime} read</Text>
        </LinearGradient>

        {/* Content sections */}
        <View style={styles.content}>
          {sections.map((s) => (
            <GlassCard key={s.heading} style={styles.section}>
              <Text style={styles.sectionHeading}>{s.heading}</Text>
              <Text style={styles.sectionBody}>{s.body}</Text>
            </GlassCard>
          ))}
        </View>

        {/* CTA */}
        <GlassCard style={styles.cta}>
          <Text style={styles.ctaTitle}>Apply This Insight</Text>
          <Text style={styles.ctaBody}>
            Complete your cognitive assessment to see how this pattern shows up in your personal profile.
          </Text>
          <TouchableOpacity
            style={styles.ctaBtn}
            onPress={() => navigation.navigate('Home')}
          >
            <LinearGradient
              colors={['#6E4D9C', '#3D52C9']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.ctaBtnGradient}
            >
              <Text style={styles.ctaBtnText}>Go to Assessments →</Text>
            </LinearGradient>
          </TouchableOpacity>
        </GlassCard>
      </ScrollView>
    </ScreenBackground>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  scroll: {
    paddingTop: 8,
    paddingHorizontal: spacing.xl,
    paddingBottom: 120,
  },
  backBtn: {
    marginBottom: 20,
  },
  backText: {
    fontSize: 15,
    color: colors.cyan,
    fontWeight: '600',
  },
  hero: {
    borderRadius: radii.xl,
    padding: 28,
    marginBottom: 24,
  },
  heroIcon: {
    fontSize: 44,
    marginBottom: 12,
  },
  heroTag: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    lineHeight: 30,
    marginBottom: 12,
  },
  heroMeta: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.55)',
    fontWeight: '600',
  },
  content: {
    gap: 14,
    marginBottom: 20,
  },
  section: {
    marginBottom: 0,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.cyan,
    marginBottom: 10,
    letterSpacing: -0.2,
  },
  sectionBody: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  cta: {
    marginTop: 4,
  },
  ctaTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  ctaBody: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 20,
    marginBottom: 16,
  },
  ctaBtn: {
    borderRadius: radii.md,
    overflow: 'hidden',
  },
  ctaBtnGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  ctaBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
