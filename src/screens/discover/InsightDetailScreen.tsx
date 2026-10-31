import React, { useEffect, useState } from 'react';
import * as Speech from 'expo-speech';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenBackground from '../../components/ScreenBackground';
import GlassCard from '../../components/GlassCard';
import AppIcon from '../../components/AppIcon';
import ReadingQuiz from '../../components/ReadingQuiz';
import { articleSpeech } from '../../utils/articleSpeech';
import { useParentGate } from '../../utils/useParentGate';
import { useToast } from '../../context/ToastContext';
import { colors, radii, spacing, Palette } from '../../theme';
import { useTheme, useThemedStyles } from '../../context/ThemeContext';

export default function InsightDetailScreen({ route, navigation }: any) {
  const colors = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { insight } = route.params;
  const { gate, gateModal } = useParentGate();
  const toast = useToast();

  const isKids = insight.audience === 'kids';
  const sections: { heading: string; body: string }[] = insight.sections ?? [
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

  // Audio version: the article read aloud, a little slower for younger readers.
  const [speaking, setSpeaking] = useState(false);
  useEffect(() => () => { Speech.stop(); }, []);
  const toggleListen = () => {
    if (speaking) { Speech.stop(); setSpeaking(false); return; }
    setSpeaking(true);
    Speech.speak(articleSpeech(insight.title, sections), {
      rate: isKids ? 0.85 : 1,
      onDone: () => setSpeaking(false),
      onStopped: () => setSpeaking(false),
      onError: () => setSpeaking(false),
    });
  };

  // Videos open on YouTube, outside the app, so a child needs a parent's PIN first.
  const watch = () => {
    const url: string | undefined = insight.video?.url;
    if (!url) return;
    gate(() => { Linking.openURL(url).catch(() => toast.error('Could not open the video.')); }, 'Ask a parent to enter the PIN to watch this video');
  };

  return (
    <ScreenBackground>
      {gateModal}
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

        <TouchableOpacity style={styles.listenBtn} onPress={toggleListen} accessibilityRole="button" accessibilityLabel={speaking ? 'Stop listening' : 'Listen to this article'}>
          <AppIcon name={speaking ? 'stop-circle' : 'volume-high'} size={20} color={colors.cyan} />
          <Text style={styles.listenText}>{speaking ? 'Stop' : 'Listen'}</Text>
        </TouchableOpacity>

        {!!insight.video && (
          <GlassCard padding={14} style={styles.videoCard} onPress={watch}>
            <View style={styles.videoRow}>
              <AppIcon name="play-circle" size={isKids ? 36 : 28} color={colors.cyan} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.videoTitle, isKids && styles.videoTitleKids]}>Watch the video</Text>
                <Text style={styles.videoSource}>{insight.video.source} · opens YouTube</Text>
              </View>
            </View>
          </GlassCard>
        )}

        {/* Content sections */}
        <View style={styles.content}>
          {sections.map((s) => (
            <GlassCard key={s.heading} style={styles.section}>
              <Text style={styles.sectionHeading}>{s.heading}</Text>
              <Text style={styles.sectionBody}>{s.body}</Text>
            </GlassCard>
          ))}
        </View>

        {/* Comprehension quiz — earns Cognitive Growth XP, keeps you in the app */}
        {/* Not for elementary learners: the quiz questions are AI-written. */}
        {!isKids && (
          <ReadingQuiz
            articleId={String(insight.id)}
            title={insight.title}
            body={sections.map((s) => `${s.heading}. ${s.body}`).join('\n\n')}
          />
        )}
      </ScrollView>
    </ScreenBackground>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  listenBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, alignSelf: 'flex-start',
    marginTop: 16, paddingVertical: 10, paddingHorizontal: 18, borderRadius: 999,
    borderWidth: 1.5, borderColor: colors.cyan,
  },
  listenText: { fontSize: 14, fontWeight: '800', color: colors.cyan },
  videoCard: { marginTop: spacing.lg },
  videoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  videoTitle: { fontSize: 15, fontWeight: '800', color: colors.text },
  videoTitleKids: { fontSize: 20 },
  videoSource: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
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
