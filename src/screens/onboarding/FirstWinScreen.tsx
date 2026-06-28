import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';
import ScreenBackground from '../../components/ScreenBackground';
import GlassCard from '../../components/GlassCard';
import AppIcon from '../../components/AppIcon';
import Logo from '../../components/Logo';
import { colors, radii, spacing } from '../../theme';

// A 3-question taster (Curiosity, Logic, Self-Reflection) → instant mini-result.
const QUESTIONS = [
  { key: 'curiosity', trait: 'Curiosity', icon: '💡', color: colors.cyan,
    prompt: 'I enjoy exploring new ideas just to see where they lead.' },
  { key: 'logic', trait: 'Logic', icon: '🧮', color: colors.purpleSoft,
    prompt: 'I like breaking problems down step by step.' },
  { key: 'reflection', trait: 'Self-Reflection', icon: '🪞', color: colors.warning,
    prompt: 'I often think about why I made a decision.' },
];

const ARCHETYPE: Record<string, string> = {
  curiosity: 'an Explorer',
  logic: 'an Analyst',
  reflection: 'a Reflector',
};

const INSIGHT: Record<string, string> = {
  curiosity: "You're an Explorer — you learn fastest when you can follow your own questions. JotMinds will surface ideas that stretch you.",
  logic: "You're an Analyst — you think in structure and steps. We'll lean into frameworks that make your reasoning even sharper.",
  reflection: "You're a Reflector — you grow by understanding your own thinking. Your daily check-ins will be especially powerful.",
};

export default function FirstWinScreen({ navigation }: any) {
  const { user } = useAuth();
  const [index, setIndex] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [done, setDone] = useState(false);

  const current = QUESTIONS[index];
  const progress = (index + (done ? 1 : 0)) / QUESTIONS.length;

  const answer = (value: number) => {
    const next = { ...scores, [current.key]: value };
    setScores(next);
    if (index < QUESTIONS.length - 1) {
      setIndex(index + 1);
    } else {
      setDone(true);
    }
  };

  const dominant = Object.entries(scores).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'curiosity';
  const dominantQ = QUESTIONS.find((q) => q.key === dominant)!;

  const finish = async () => {
    if (user?.id) await AsyncStorage.setItem(`jotminds.firstwin.${user.id}`, 'done').catch(() => {});
    navigation.replace('Main');
  };

  if (done) {
    return (
      <ScreenBackground>
        <View style={styles.container}>
          <View style={styles.resultHeader}>
            <Text style={styles.resultEyebrow}>YOUR FIRST INSIGHT</Text>
            <Text style={styles.resultTitle}>You think like{'\n'}{ARCHETYPE[dominant]}</Text>
          </View>

          <GlassCard style={styles.resultCard} glowColor="purple">
            <LinearGradient
              colors={[dominantQ.color, colors.purple]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.resultIconWrap}
            >
              <AppIcon name={dominantQ.icon} size={34} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.insightText}>{INSIGHT[dominant]}</Text>

            <View style={styles.miniBars}>
              {QUESTIONS.map((q) => (
                <View key={q.key} style={styles.miniBarRow}>
                  <Text style={styles.miniBarLabel}>{q.trait}</Text>
                  <View style={styles.miniBarTrack}>
                    <View style={[styles.miniBarFill, { width: `${(scores[q.key] / 5) * 100}%`, backgroundColor: q.color }]} />
                  </View>
                </View>
              ))}
            </View>
          </GlassCard>

          <Text style={styles.deferNote}>
            This is just a taster. Your full cognitive profile, daily check-ins, and Role Fit are waiting on your dashboard.
          </Text>

          <TouchableOpacity style={styles.cta} onPress={finish} accessibilityRole="button" accessibilityLabel="Continue to JotMinds">
            <LinearGradient
              colors={['#3D52C9', '#6E4D9C']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.ctaGradient}
            >
              <Text style={styles.ctaText}>Continue to JotMinds →</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground>
      <View style={styles.container}>
        <View style={styles.logoWrap}><Logo size="sm" /></View>

        <View style={styles.progressWrap}>
          <View style={styles.progressTrack}>
            <LinearGradient
              colors={['#3D52C9', '#6E4D9C']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressFill, { width: `${progress * 100}%` }]}
            />
          </View>
          <Text style={styles.progressLabel}>{index + 1} / {QUESTIONS.length}</Text>
        </View>

        <Text style={styles.tasterTitle}>Your first win in 60 seconds</Text>
        <Text style={styles.tasterSub}>Three quick questions — no right answers.</Text>

        <GlassCard style={styles.qCard}>
          <View style={[styles.qIconWrap, { backgroundColor: `${current.color}22` }]}>
            <AppIcon name={current.icon} size={26} color={current.color} />
          </View>
          <Text style={styles.qPrompt}>{current.prompt}</Text>

          <View style={styles.scaleRow}>
            {[1, 2, 3, 4, 5].map((n) => (
              <TouchableOpacity
                key={n}
                style={styles.scaleBtn}
                onPress={() => answer(n)}
                accessibilityRole="button"
                accessibilityLabel={`${n} out of 5`}
              >
                <Text style={styles.scaleNum}>{n}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.scaleLabels}>
            <Text style={styles.scaleEnd}>Rarely</Text>
            <Text style={styles.scaleEnd}>Always</Text>
          </View>
        </GlassCard>

        <TouchableOpacity onPress={finish} style={styles.skip} accessibilityRole="button" accessibilityLabel="Skip for now">
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: spacing.xl, paddingTop: 64, paddingBottom: 32 },
  logoWrap: { alignItems: 'center', marginBottom: 28 },
  progressWrap: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 28 },
  progressTrack: { flex: 1, height: 6, backgroundColor: colors.bgTertiary, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  progressLabel: { fontSize: 12, color: colors.textSubtle, fontWeight: '600' },
  tasterTitle: { fontSize: 24, fontWeight: '800', color: colors.textPrimary, letterSpacing: -0.6 },
  tasterSub: { fontSize: 14, color: colors.textMuted, marginTop: 6, marginBottom: 24 },
  qCard: { alignItems: 'center', paddingVertical: 28 },
  qIconWrap: { width: 60, height: 60, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 18 },
  qPrompt: { fontSize: 19, fontWeight: '700', color: colors.text, textAlign: 'center', lineHeight: 26, marginBottom: 26, paddingHorizontal: 8 },
  scaleRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  scaleBtn: {
    width: 52, height: 52, borderRadius: 16, backgroundColor: colors.bgTertiary,
    borderWidth: 1, borderColor: colors.borderLight, justifyContent: 'center', alignItems: 'center',
  },
  scaleNum: { fontSize: 18, fontWeight: '700', color: colors.textSecondary },
  scaleLabels: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingHorizontal: 4 },
  scaleEnd: { fontSize: 11, color: colors.textSubtle },
  skip: { alignItems: 'center', paddingVertical: 14, marginTop: 'auto' },
  skipText: { fontSize: 14, color: colors.textMuted, fontWeight: '500' },
  // result
  resultHeader: { marginBottom: 24, marginTop: 8 },
  resultEyebrow: { fontSize: 12, fontWeight: '700', color: colors.cyan, letterSpacing: 1.5, marginBottom: 10 },
  resultTitle: { fontSize: 30, fontWeight: '800', color: colors.textPrimary, letterSpacing: -1, lineHeight: 36 },
  resultCard: { alignItems: 'center', paddingVertical: 28 },
  resultIconWrap: { width: 72, height: 72, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  insightText: { fontSize: 15, color: colors.textSecondary, textAlign: 'center', lineHeight: 23, marginBottom: 24 },
  miniBars: { width: '100%', gap: 12 },
  miniBarRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  miniBarLabel: { width: 96, fontSize: 12, color: colors.textMuted, fontWeight: '600' },
  miniBarTrack: { flex: 1, height: 8, backgroundColor: colors.bgTertiary, borderRadius: 4, overflow: 'hidden' },
  miniBarFill: { height: '100%', borderRadius: 4 },
  deferNote: { fontSize: 13, color: colors.textMuted, textAlign: 'center', lineHeight: 20, marginTop: 24, marginBottom: 20, paddingHorizontal: 12 },
  cta: { borderRadius: radii.md, overflow: 'hidden', marginTop: 'auto' },
  ctaGradient: { paddingVertical: 18, alignItems: 'center' },
  ctaText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
});
