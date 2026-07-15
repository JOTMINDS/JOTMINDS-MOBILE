import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { submitAssessment } from '../../utils/api';
import { recordAssessmentCompletion } from '../../utils/gamificationApi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useAccessibility } from '../../context/AccessibilityContext';
import { select as hapticSelect } from '../../utils/haptics';
import { rs } from '../../utils/responsive';
import {
  calculateKolbScore, calculateSternbergScore, calculateDualProcessScore, WIRE_RESULT_KEY,
} from '../../utils/scoring';
import { QUESTION_BANK, AssessmentType } from '../../data/questionBank';
import ScreenBackground from '../../components/ScreenBackground';
import AppIcon from '../../components/AppIcon';
import { colors, radii, spacing, Palette } from '../../theme';
import { useTheme, useThemedStyles } from '../../context/ThemeContext';

// Conversational, one-question-at-a-time scale (top = agree).
const LIKERT = [
  { value: 5, label: 'Strongly agree', tint: '#10B981' },
  { value: 4, label: 'Agree', tint: '#3D52C9' },
  { value: 3, label: 'Neutral', tint: '#8A97B2' },
  { value: 2, label: 'Disagree', tint: '#6E4D9C' },
  { value: 1, label: 'Strongly disagree', tint: '#EC4899' },
];

const TITLES: Record<AssessmentType, string> = {
  learning: 'Learning Agility', thinking: 'Thinking Style', decision: 'Decision Style',
};

export default function AssessmentTakingScreen({ navigation, route }: any) {
  const colors = useTheme();
  const styles = useThemedStyles(makeStyles);
  const assessmentType: AssessmentType = route.params?.assessmentType ?? 'learning';
  const bank = QUESTION_BANK[assessmentType] ?? QUESTION_BANK.learning;
  const { user } = useAuth();
  const toast = useToast();
  const { reduceMotion } = useAccessibility();

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const anim = useRef(new Animated.Value(1)).current; // 1 = fully visible
  const busy = useRef(false);

  const question = bank.questions[index];
  const total = bank.questions.length;
  const progress = ((index + 1) / total) * 100;

  const transitionTo = (next: () => void) => {
    if (reduceMotion) { next(); anim.setValue(1); return; }
    Animated.timing(anim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
      next();
      anim.setValue(0);
      Animated.timing(anim, { toValue: 1, duration: 240, useNativeDriver: true }).start(() => {
        busy.current = false;
      });
    });
  };

  // responses[i] must line up with bank.questions[i].dimension — the real
  // webapp algorithms (calculateKolbScore etc.) are index-aligned, not id-keyed.
  const computeResult = (source: Record<number, number> = answers) => {
    const orderedResponses = bank.questions.map((q) => source[q.id] ?? 0);
    if (assessmentType === 'learning') return calculateKolbScore(orderedResponses, bank.questions);
    if (assessmentType === 'thinking') return calculateSternbergScore(orderedResponses, bank.questions);
    return calculateDualProcessScore(orderedResponses, bank.questions);
  };

  const handleSubmit = async (finalAnswers: Record<number, number>) => {
    setSubmitting(true);
    const result = computeResult(finalAnswers);
    const answerList = Object.entries(finalAnswers).map(([qid, value]) => ({ questionId: Number(qid), value }));
    try {
      await submitAssessment(
        assessmentType, answerList,
        // Nested under kolb/sternberg/dualProcess — matches the real shape
        // the webapp submits, confirmed against a live production row.
        // Strengths/weaknesses/recommendations are computed at view time
        // (AssessmentResultsScreen, via getStyleInsights) — the webapp
        // itself submits these empty and derives them on render too.
        { [WIRE_RESULT_KEY[assessmentType]]: result },
        [], [], [],
      );
      if (user?.id) recordAssessmentCompletion(user.id).catch(() => {});
      navigation.replace('AssessmentResults', { assessmentType });
    } catch {
      toast.error('Could not save your results. Please check your connection.');
      setSubmitting(false);
    }
  };

  const choose = (value: number) => {
    if (busy.current || submitting) return;
    busy.current = true;
    hapticSelect();
    const updated = { ...answers, [question.id]: value };
    setAnswers(updated);
    // brief pause so the selection registers visually, then advance
    setTimeout(() => {
      if (index < total - 1) {
        transitionTo(() => setIndex(index + 1));
      } else {
        handleSubmit(updated);
      }
    }, reduceMotion ? 60 : 180);
  };

  const goBack = () => {
    if (busy.current || index === 0) return;
    busy.current = true;
    transitionTo(() => setIndex(index - 1));
  };

  const slide = anim.interpolate({ inputRange: [0, 1], outputRange: [reduceMotion ? 0 : 28, 0] });

  return (
    <ScreenBackground>
      <View style={styles.container}>
        {/* minimal chrome: close + slim progress */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12} accessibilityRole="button" accessibilityLabel="Exit assessment">
            <AppIcon name="✕" size={22} color={colors.textMuted} />
          </TouchableOpacity>
          <Text style={styles.framework}>{TITLES[assessmentType]}</Text>
          <View style={{ width: 22 }} />
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>

        <Animated.View style={[styles.body, { opacity: anim, transform: [{ translateX: slide }] }]}>
          <Text style={styles.counter}>QUESTION {index + 1} OF {total}</Text>
          <Text style={styles.question}>{question.question}</Text>

          <View style={styles.options}>
            {LIKERT.map((opt) => {
              const isSel = answers[question.id] === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  activeOpacity={0.85}
                  style={[styles.option, isSel && { borderColor: opt.tint, backgroundColor: `${opt.tint}22` }]}
                  onPress={() => choose(opt.value)}
                  accessibilityRole="button"
                  accessibilityLabel={opt.label}
                >
                  <View style={[styles.dot, { borderColor: opt.tint }, isSel && { backgroundColor: opt.tint }]} />
                  <Text style={[styles.optionText, isSel && { color: colors.text, fontWeight: '700' }]}>{opt.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>

        <View style={styles.footer}>
          {index > 0 ? (
            <TouchableOpacity onPress={goBack} hitSlop={10} accessibilityRole="button" accessibilityLabel="Previous question">
              <Text style={styles.backText}>← Previous</Text>
            </TouchableOpacity>
          ) : <View />}
          {submitting && <ActivityIndicator color={colors.cyan} />}
        </View>
      </View>
    </ScreenBackground>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  container: { flex: 1, paddingHorizontal: spacing.xl, paddingTop: 8 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  framework: { fontSize: rs(13), fontWeight: '700', color: colors.textMuted, letterSpacing: 0.3 },
  progressTrack: { height: 4, backgroundColor: colors.bgTertiary, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 2, backgroundColor: colors.cyan },
  body: { flex: 1, justifyContent: 'center' },
  counter: { fontSize: rs(12), fontWeight: '700', color: colors.cyan, letterSpacing: 1.5, marginBottom: 16, textAlign: 'center' },
  question: {
    fontSize: rs(27), fontWeight: '800', color: colors.text, textAlign: 'center',
    lineHeight: rs(36), letterSpacing: -0.5, marginBottom: 40, paddingHorizontal: 4,
  },
  options: { gap: 12 },
  option: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingVertical: 18, paddingHorizontal: 18, borderRadius: radii.lg,
    backgroundColor: colors.glassMedium, borderWidth: 1.5, borderColor: colors.borderLight,
  },
  dot: { width: 22, height: 22, borderRadius: 11, borderWidth: 2 },
  optionText: { flex: 1, fontSize: rs(16), color: colors.textSecondary, fontWeight: '600' },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 20, minHeight: 60 },
  backText: { fontSize: rs(15), color: colors.textMuted, fontWeight: '600' },
});
