import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useToast } from '../../context/ToastContext';
import { saveCheckin } from '../../utils/mindCheckins';
import ScreenBackground from '../../components/ScreenBackground';
import GlassCard from '../../components/GlassCard';
import AppIcon from '../../components/AppIcon';
import { colors, radii, spacing, Palette } from '../../theme';
import { useTheme, useThemedStyles } from '../../context/ThemeContext';

const EMOTIONS = [
  { key: 'calm', emoji: '😌', label: 'Calm', color: colors.success },
  { key: 'confident', emoji: '💪', label: 'Confident', color: colors.cyan },
  { key: 'anxious', emoji: '😰', label: 'Anxious', color: colors.warning },
  { key: 'overwhelmed', emoji: '😵', label: 'Overwhelmed', color: colors.error },
  { key: 'distracted', emoji: '🌀', label: 'Distracted', color: colors.textMuted },
];

export default function DailyCheckQuestionsScreen({ navigation }: any) {
  const colors = useTheme();
  const styles = useThemedStyles(makeStyles);
  const toast = useToast();
  const [step, setStep] = useState(1);
  const [focusScore, setFocusScore] = useState<number | null>(null);
  const [decisionDelay, setDecisionDelay] = useState<boolean | null>(null);
  const [emotionalState, setEmotionalState] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const TOTAL_STEPS = 4;
  const progress = step / TOTAL_STEPS;

  const focusLabels = ['', 'Very scattered', 'Scattered', 'OK', 'Focused', 'Laser-focused'];
  const emotionLabel = EMOTIONS.find((e) => e.key === emotionalState)?.label ?? '—';

  const handleSubmit = async () => {
    if (!focusScore || decisionDelay === null || !emotionalState) return;
    setSubmitting(true);
    const checkin = {
      focus_score: focusScore,
      decision_delay: decisionDelay,
      emotional_state: emotionalState,
      created_at: new Date().toISOString(),
    };
    try {
      await saveCheckin(checkin);
      navigation.replace('InstantFeedback', { checkin });
    } catch {
      toast.error('Could not save check-in. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenBackground>
      <View style={styles.container}>
        {/* Progress */}
        <View style={styles.progressWrap}>
          <View style={styles.progressTrack}>
            <LinearGradient
              colors={['#6E4D9C', '#3D52C9']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressFill, { width: `${progress * 100}%` }]}
            />
          </View>
          <Text style={styles.progressLabel}>{step} / {TOTAL_STEPS}</Text>
        </View>

        {/* Q1: Focus score */}
        {step === 1 && (
          <GlassCard style={styles.questionCard}>
            <Text style={styles.qLabel}>QUESTION 1</Text>
            <Text style={styles.qTitle}>Over the last hour, how much did your attention wander from what you meant to be doing?</Text>
            <Text style={styles.qSub}>1 = drifted constantly · 5 = stayed on task</Text>
            <View style={styles.scaleRow}>
              {[1, 2, 3, 4, 5].map((n) => (
                <TouchableOpacity
                  key={n}
                  style={[styles.scaleBtn, focusScore === n && styles.scaleBtnActive]}
                  onPress={() => setFocusScore(n)}
                >
                  {focusScore === n ? (
                    <LinearGradient
                      colors={['#6E4D9C', '#3D52C9']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.scaleBtnGradient}
                    >
                      <Text style={styles.scaleBtnTextActive}>{n}</Text>
                    </LinearGradient>
                  ) : (
                    <Text style={styles.scaleBtnText}>{n}</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.scaleLabels}>
              <Text style={styles.scaleMin}>Drifted a lot</Text>
              <Text style={styles.scaleMax}>Stayed on task</Text>
            </View>
          </GlassCard>
        )}

        {/* Q2: Decision delay */}
        {step === 2 && (
          <GlassCard style={styles.questionCard}>
            <Text style={styles.qLabel}>QUESTION 2</Text>
            <Text style={styles.qTitle}>Is there a choice you keep coming back to without landing on it?</Text>
            <Text style={styles.qSub}>Something you've thought about more than once today and still haven't settled</Text>
            <View style={styles.yesNoRow}>
              {[
                { label: 'Yes', value: true, emoji: '😬' },
                { label: 'No', value: false, emoji: '✅' },
              ].map((opt) => (
                <TouchableOpacity
                  key={String(opt.value)}
                  style={[styles.yesNoBtn, decisionDelay === opt.value && styles.yesNoBtnActive]}
                  onPress={() => setDecisionDelay(opt.value)}
                >
                  <AppIcon
                    name={opt.emoji}
                    size={32}
                    color={decisionDelay === opt.value ? colors.purple : colors.textMuted}
                  />
                  <Text style={[styles.yesNoBtnText, decisionDelay === opt.value && styles.yesNoBtnTextActive]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </GlassCard>
        )}

        {/* Q3: Emotional state */}
        {step === 3 && (
          <GlassCard style={styles.questionCard}>
            <Text style={styles.qLabel}>QUESTION 3</Text>
            <Text style={styles.qTitle}>Which of these has been closest to how most of today has felt?</Text>
            <Text style={styles.qSub}>Go with your first read, not the version you'd like it to be</Text>
            <View style={styles.emotionsGrid}>
              {EMOTIONS.map((em) => (
                <TouchableOpacity
                  key={em.key}
                  style={[
                    styles.emotionBtn,
                    emotionalState === em.key && { borderColor: em.color, backgroundColor: `${em.color}22` },
                  ]}
                  onPress={() => setEmotionalState(em.key)}
                >
                  <AppIcon name={em.emoji} size={28} color={em.color} />
                  <Text style={[styles.emotionLabel, emotionalState === em.key && { color: em.color }]}>
                    {em.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </GlassCard>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <GlassCard style={styles.questionCard}>
            <Text style={styles.qLabel}>REVIEW</Text>
            <Text style={styles.qTitle}>Look good?</Text>
            <Text style={styles.qSub}>Tap any answer to change it before submitting.</Text>

            <TouchableOpacity style={styles.reviewRow} onPress={() => setStep(1)}>
              <Text style={styles.reviewLabel}>Focus</Text>
              <Text style={styles.reviewValue}>{focusScore ? `${focusScore} · ${focusLabels[focusScore]}` : '—'}</Text>
              <Text style={styles.reviewEdit}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.reviewRow} onPress={() => setStep(2)}>
              <Text style={styles.reviewLabel}>Decisions</Text>
              <Text style={styles.reviewValue}>{decisionDelay === null ? '—' : decisionDelay ? 'Putting some off' : 'On top of them'}</Text>
              <Text style={styles.reviewEdit}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.reviewRow, { borderBottomWidth: 0 }]} onPress={() => setStep(3)}>
              <Text style={styles.reviewLabel}>Mood</Text>
              <Text style={styles.reviewValue}>{emotionLabel}</Text>
              <Text style={styles.reviewEdit}>Edit</Text>
            </TouchableOpacity>
          </GlassCard>
        )}

        {/* Navigation buttons */}
        <View style={styles.navRow}>
          {step > 1 && (
            <TouchableOpacity style={styles.backBtn} onPress={() => setStep(step - 1)}>
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>
          )}

          {step < 4 ? (
            <TouchableOpacity
              style={[
                styles.nextBtn,
                (step === 1 && !focusScore) || (step === 2 && decisionDelay === null) || (step === 3 && !emotionalState)
                  ? styles.nextBtnDisabled : null,
              ]}
              disabled={(step === 1 && !focusScore) || (step === 2 && decisionDelay === null) || (step === 3 && !emotionalState)}
              onPress={() => setStep(step + 1)}
            >
              <LinearGradient
                colors={['#6E4D9C', '#3D52C9']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.nextBtnGradient}
              >
                <Text style={styles.nextBtnText}>{step === 3 ? 'Review →' : 'Next →'}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.nextBtn, submitting && styles.nextBtnDisabled]}
              disabled={submitting}
              onPress={handleSubmit}
            >
              <LinearGradient
                colors={['#10B981', '#059669']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.nextBtnGradient}
              >
                {submitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.nextBtnText}>Submit check-in</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScreenBackground>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  container: { flex: 1, paddingHorizontal: spacing.xl, paddingTop: 12, paddingBottom: 40 },
  progressWrap: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 32 },
  progressTrack: { flex: 1, height: 6, backgroundColor: colors.bgTertiary, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  progressLabel: { fontSize: 12, color: colors.textSubtle, fontWeight: '600' },
  reviewRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: colors.borderLight,
  },
  reviewLabel: { fontSize: 13, color: colors.textMuted, width: 78 },
  reviewValue: { flex: 1, fontSize: 14, color: colors.text, fontWeight: '600' },
  reviewEdit: { fontSize: 13, color: colors.cyan, fontWeight: '700' },
  questionCard: { flex: 1, marginBottom: 24 },
  qLabel: { fontSize: 11, fontWeight: '700', color: colors.cyan, letterSpacing: 1.5, marginBottom: 12 },
  qTitle: { fontSize: 22, fontWeight: '800', color: colors.text, letterSpacing: -0.5, lineHeight: 28, marginBottom: 8 },
  qSub: { fontSize: 13, color: colors.textMuted, lineHeight: 20, marginBottom: 28 },
  scaleRow: { flexDirection: 'row', gap: 10, justifyContent: 'center', marginBottom: 12 },
  scaleBtn: {
    width: 56, height: 56, borderRadius: 16,
    backgroundColor: colors.bgTertiary,
    borderWidth: 1, borderColor: colors.borderLight,
    justifyContent: 'center', alignItems: 'center',
    overflow: 'hidden',
  },
  scaleBtnActive: { borderColor: 'transparent' },
  scaleBtnGradient: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  scaleBtnText: { fontSize: 18, fontWeight: '700', color: colors.textMuted },
  scaleBtnTextActive: { fontSize: 18, fontWeight: '800', color: '#FFFFFF' },
  scaleLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  scaleMin: { fontSize: 11, color: colors.textSubtle },
  scaleMax: { fontSize: 11, color: colors.textSubtle },
  yesNoRow: { flexDirection: 'row', gap: 14 },
  yesNoBtn: {
    flex: 1, paddingVertical: 24, borderRadius: radii.lg,
    backgroundColor: colors.bgTertiary, borderWidth: 2, borderColor: colors.borderLight,
    alignItems: 'center', gap: 8,
  },
  yesNoBtnActive: { borderColor: colors.purple, backgroundColor: 'rgba(124,58,237,0.1)' },
  yesNoEmoji: { fontSize: 32 },
  yesNoBtnText: { fontSize: 16, fontWeight: '700', color: colors.textMuted },
  yesNoBtnTextActive: { color: colors.purple },
  emotionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  emotionBtn: {
    minWidth: '45%', flex: 1, paddingVertical: 16, borderRadius: radii.md,
    backgroundColor: colors.bgTertiary, borderWidth: 2, borderColor: colors.borderLight,
    alignItems: 'center', gap: 6,
  },
  emotionEmoji: { fontSize: 28 },
  emotionLabel: { fontSize: 13, fontWeight: '600', color: colors.textMuted },
  navRow: { flexDirection: 'row', gap: 12 },
  backBtn: {
    paddingHorizontal: 20, paddingVertical: 16, borderRadius: radii.md,
    borderWidth: 1, borderColor: colors.borderLight, justifyContent: 'center',
  },
  backText: { fontSize: 15, color: colors.textMuted, fontWeight: '600' },
  nextBtn: { flex: 1, borderRadius: radii.md, overflow: 'hidden' },
  nextBtnDisabled: { opacity: 0.4 },
  nextBtnGradient: { paddingVertical: 18, alignItems: 'center' },
  nextBtnText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
});
