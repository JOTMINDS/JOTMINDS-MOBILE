import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Animated, Easing } from 'react-native';
import ScreenBackground from '../../components/ScreenBackground';
import GlassCard from '../../components/GlassCard';
import AppIcon from '../../components/AppIcon';
import { useToast } from '../../context/ToastContext';
import { useAccessibility } from '../../context/AccessibilityContext';
import { saveReflection } from '../../utils/reflectionsApi';
import { getLastJTIAReport } from '../../utils/jtiaStatus';
import { teachingFocus, TeachingFocus } from '../../utils/teachingFocus';
import {
  BREATH_SECONDS, BREATH_ROUNDS, INTENTIONS, breathAt, promptForDay, recordReset, resetStreak,
} from '../../utils/teacherReset';
import { rs } from '../../utils/responsive';
import { radii, spacing, Palette } from '../../theme';
import { useTheme, useThemedStyles } from '../../context/ThemeContext';

type Step = 'intro' | 'breathe' | 'reflect' | 'intention' | 'done';

const MIN_SCALE = 0.55;

/** Two-minute reset for teachers: breathe, reflect on one prompt, set an intention for the next lesson. */
export default function TeacherResetScreen({ navigation }: any) {
  const colors = useTheme();
  const styles = useThemedStyles(makeStyles);
  const toast = useToast();
  const { reduceMotion } = useAccessibility();

  const [step, setStep] = useState<Step>('intro');
  const [elapsed, setElapsed] = useState(0);
  const [note, setNote] = useState('');
  const [intention, setIntention] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);
  // With a Teaching Insights report, the question and suggested intention target the growth edge.
  const [focus, setFocus] = useState<TeachingFocus | null>(null);
  useEffect(() => { getLastJTIAReport().then((r) => setFocus(teachingFocus(r))).catch(() => {}); }, []);
  const dayPrompt = useRef(promptForDay()).current;
  const prompt = focus?.prompt ?? dayPrompt;
  const intentions = focus ? [focus.intention, ...INTENTIONS.filter((i) => i !== focus.intention)] : INTENTIONS;
  const scale = useRef(new Animated.Value(MIN_SCALE)).current;

  // One tick a second while breathing; the circle follows the current phase.
  useEffect(() => {
    if (step !== 'breathe') return;
    setElapsed(0);
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [step]);

  const phase = breathAt(elapsed);
  const finishedBreathing = elapsed >= BREATH_SECONDS;
  useEffect(() => {
    if (step !== 'breathe') return;
    if (finishedBreathing) { setStep('reflect'); return; }
    const target = phase.phaseIndex === 0 ? 1 : phase.phaseIndex === 2 ? MIN_SCALE : undefined;
    if (target === undefined) return; // holds keep the current size
    if (reduceMotion) { scale.setValue(target); return; }
    Animated.timing(scale, { toValue: target, duration: 4000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }).start();
  }, [step, phase.phaseIndex, finishedBreathing]);

  const finishReflection = async () => {
    if (note.trim()) {
      try {
        await saveReflection(`${prompt}\n\n${note.trim()}`);
        toast.success('Saved to Reflections & Notes');
      } catch {
        toast.error('Could not save your note, but your reset still counts.');
      }
    }
    setStep('intention');
  };

  const finish = async () => {
    const dates = await recordReset();
    setStreak(resetStreak(dates));
    setStep('done');
  };

  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Go back">
          <AppIcon name="arrow-back" size={22} color={colors.textMuted} />
        </TouchableOpacity>

        {step === 'intro' && (
          <>
            <Text style={styles.title}>Teacher Reset</Text>
            <Text style={styles.sub}>Two minutes between lessons.</Text>
            {[
              { icon: '🌬️', t: 'Breathe', d: '3 slow rounds' },
              { icon: '💭', t: 'Reflect', d: 'One question about your day' },
              { icon: '🎯', t: 'Set an intention', d: 'For your next lesson' },
            ].map((s) => (
              <GlassCard key={s.t} padding={14} style={styles.stepCard}>
                <View style={styles.stepRow}>
                  <AppIcon name={s.icon} size={22} color={colors.purpleSoft} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.stepTitle}>{s.t}</Text>
                    <Text style={styles.stepDesc}>{s.d}</Text>
                  </View>
                </View>
              </GlassCard>
            ))}
            <TouchableOpacity style={styles.primary} onPress={() => setStep('breathe')} accessibilityRole="button">
              <Text style={styles.primaryText}>Begin</Text>
            </TouchableOpacity>
          </>
        )}

        {step === 'breathe' && (
          <View style={styles.center}>
            <Text style={styles.round}>Round {Math.min(phase.round, BREATH_ROUNDS)} of {BREATH_ROUNDS}</Text>
            <View style={styles.circleWrap}>
              <Animated.View style={[styles.circle, { transform: [{ scale }] }]} />
              <Text style={styles.phase} accessibilityLiveRegion="polite">{phase.label}</Text>
              <Text style={styles.count}>{phase.secondsLeft}</Text>
            </View>
            <TouchableOpacity onPress={() => setStep('reflect')} hitSlop={10} accessibilityRole="button">
              <Text style={styles.skip}>Skip</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 'reflect' && (
          <>
            <Text style={styles.title}>Reflect</Text>
            <GlassCard padding={16} style={styles.stepCard}>
              <Text style={styles.prompt}>{prompt}</Text>
            </GlassCard>
            <TextInput
              style={styles.input}
              value={note}
              onChangeText={setNote}
              multiline
              placeholder="A sentence is enough (optional)"
              placeholderTextColor={colors.textSubtle}
              accessibilityLabel="Your reflection"
            />
            <TouchableOpacity style={styles.primary} onPress={finishReflection} accessibilityRole="button">
              <Text style={styles.primaryText}>{note.trim() ? 'Save and continue' : 'Continue'}</Text>
            </TouchableOpacity>
          </>
        )}

        {step === 'intention' && (
          <>
            <Text style={styles.title}>Your intention</Text>
            <Text style={styles.sub}>Pick one for your next lesson.</Text>
            <View style={styles.chips}>
              {intentions.map((i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.chip, intention === i && styles.chipOn]}
                  onPress={() => setIntention(i)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: intention === i }}
                >
                  <Text style={[styles.chipText, intention === i && styles.chipTextOn]}>{focus && i === focus.intention ? `★ ${i}` : i}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={[styles.primary, !intention && { opacity: 0.5 }]} disabled={!intention} onPress={finish} accessibilityRole="button">
              <Text style={styles.primaryText}>Finish</Text>
            </TouchableOpacity>
          </>
        )}

        {step === 'done' && (
          <View style={styles.center}>
            <AppIcon name="✓" size={44} color={colors.success} />
            <Text style={styles.title}>Reset complete</Text>
            {!!intention && <Text style={styles.sub}>Today’s intention: {intention}</Text>}
            {streak > 1 && <Text style={styles.streak}>🔥 {streak}-day reset streak</Text>}
            <TouchableOpacity style={styles.primary} onPress={() => navigation.goBack()} accessibilityRole="button">
              <Text style={styles.primaryText}>Back to Mind</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </ScreenBackground>
  );
}

const makeStyles = (c: Palette) => StyleSheet.create({
  scroll: { paddingHorizontal: spacing.xl, paddingTop: 8, paddingBottom: 60, flexGrow: 1 },
  back: { width: 44, height: 44, justifyContent: 'center', marginBottom: 4 },
  title: { fontSize: rs(28), fontWeight: '800', color: c.textPrimary, letterSpacing: -0.6 },
  sub: { fontSize: rs(14), color: c.textMuted, marginTop: 4, marginBottom: spacing.lg },
  center: { alignItems: 'center', paddingTop: spacing.xl },
  stepCard: { marginTop: spacing.md },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  stepTitle: { fontSize: rs(15), fontWeight: '700', color: c.text },
  stepDesc: { fontSize: rs(12), color: c.textMuted, marginTop: 2 },
  primary: { marginTop: spacing.xl, alignSelf: 'stretch', paddingVertical: 15, borderRadius: radii.md, alignItems: 'center', backgroundColor: c.purple },
  primaryText: { color: '#FFFFFF', fontSize: rs(15), fontWeight: '800' },
  round: { fontSize: rs(12), fontWeight: '700', color: c.textSubtle, letterSpacing: 1.2, textTransform: 'uppercase' },
  circleWrap: { width: 260, height: 260, alignItems: 'center', justifyContent: 'center', marginVertical: spacing.xxl },
  circle: { position: 'absolute', width: 260, height: 260, borderRadius: 130, backgroundColor: `${c.purple}55`, borderWidth: 2, borderColor: c.purple },
  phase: { fontSize: rs(22), fontWeight: '800', color: c.textPrimary },
  count: { fontSize: rs(34), fontWeight: '800', color: c.cyan, marginTop: 2 },
  skip: { fontSize: rs(13), fontWeight: '700', color: c.textMuted },
  prompt: { fontSize: rs(17), lineHeight: rs(25), fontWeight: '600', color: c.text },
  input: {
    marginTop: spacing.lg, minHeight: 110, textAlignVertical: 'top', padding: 14, fontSize: rs(14), color: c.text,
    backgroundColor: c.glassMedium, borderRadius: radii.md, borderWidth: 1, borderColor: c.borderLight,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: { paddingVertical: 11, paddingHorizontal: 16, borderRadius: radii.pill, backgroundColor: c.glassMedium, borderWidth: 1.5, borderColor: c.borderLight },
  chipOn: { borderColor: c.purple, backgroundColor: `${c.purple}33` },
  chipText: { fontSize: rs(14), fontWeight: '600', color: c.textSecondary },
  chipTextOn: { color: c.text, fontWeight: '800' },
  streak: { fontSize: rs(15), fontWeight: '700', color: c.warning, marginTop: spacing.md },
});
