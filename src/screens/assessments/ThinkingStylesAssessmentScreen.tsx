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
import { ThinkingStylesTrack } from '../../utils/thinkingStylesTrack';
import { JHS_QUESTIONS } from '../../data/jhsThinkingQuestions';
import { shsQuestions } from '../../data/shsThinkingQuestions';
import { adultQuestions } from '../../data/adultThinkingQuestions';
import { calculateJHSScores } from '../../utils/jhsScoring';
import { calculateSHSScores } from '../../utils/shsScoring';
import { calculateAdultScores } from '../../utils/adultScoring';
import ScreenBackground from '../../components/ScreenBackground';
import AppIcon from '../../components/AppIcon';
import { colors, radii, spacing, Palette } from '../../theme';
import { useTheme, useThemedStyles } from '../../context/ThemeContext';

// Same conversational Likert scale as AssessmentTakingScreen.
const LIKERT = [
  { value: 5, label: 'Totally me!', tint: '#10B981' },
  { value: 4, label: 'Mostly me', tint: '#3D52C9' },
  { value: 3, label: 'Sometimes', tint: '#8A97B2' },
  { value: 2, label: 'Not really', tint: '#6E4D9C' },
  { value: 1, label: 'Not me at all', tint: '#EC4899' },
];

const TITLES: Record<ThinkingStylesTrack, string> = {
  jhs: 'Thinking Styles Adventure', shs: 'Thinking Styles Adventure', adult: 'Thinking Styles',
};

const WIRE_TYPE: Record<ThinkingStylesTrack, string> = {
  jhs: 'jhs-thinking', shs: 'shs-thinking', adult: 'adult-thinking',
};

export default function ThinkingStylesAssessmentScreen({ navigation, route }: any) {
  const colors = useTheme();
  const styles = useThemedStyles(makeStyles);
  const track: ThinkingStylesTrack = route.params?.track ?? 'adult';
  const questions = track === 'jhs' ? JHS_QUESTIONS : track === 'shs' ? shsQuestions : adultQuestions;
  const { user } = useAuth();
  const toast = useToast();
  const { reduceMotion } = useAccessibility();

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const anim = useRef(new Animated.Value(1)).current;
  const busy = useRef(false);

  const question = questions[index];
  const total = questions.length;
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

  const computeResult = (source: Record<number, number>) => {
    if (track === 'jhs') {
      // Slice-based scoring — needs answers in JHS_QUESTIONS' fixed order.
      const orderedResponses = JHS_QUESTIONS.map((q) => source[q.id] ?? 0);
      return calculateJHSScores(orderedResponses);
    }
    const responseList = Object.entries(source).map(([qid, value]) => ({ questionId: Number(qid), value }));
    return track === 'shs' ? calculateSHSScores(responseList) : calculateAdultScores(responseList);
  };

  const handleSubmit = async (finalAnswers: Record<number, number>) => {
    setSubmitting(true);
    const result = computeResult(finalAnswers);
    const answerList = Object.entries(finalAnswers).map(([qid, value]) => ({ questionId: Number(qid), value }));
    try {
      // Flat payload — confirmed against a live production row (unlike the
      // core 3's nested {kolb: {...}} shape).
      await submitAssessment(WIRE_TYPE[track], answerList, result, [], [], []);
      if (user?.id) recordAssessmentCompletion(user.id, 'thinking-styles').catch(() => {});
      navigation.replace('ThinkingStylesResults', { track });
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
  const questionText = track === 'jhs' ? (question as typeof JHS_QUESTIONS[0]).text : (question as { text: string }).text;

  return (
    <ScreenBackground>
      <View style={styles.container}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12} accessibilityRole="button" accessibilityLabel="Exit assessment">
            <AppIcon name="✕" size={22} color={colors.textMuted} />
          </TouchableOpacity>
          <Text style={styles.framework}>{TITLES[track]}</Text>
          <View style={{ width: 22 }} />
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>

        <Animated.View style={[styles.body, { opacity: anim, transform: [{ translateX: slide }] }]}>
          <Text style={styles.counter}>QUESTION {index + 1} OF {total}</Text>
          <Text style={styles.question}>{questionText}</Text>

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
    fontSize: rs(24), fontWeight: '800', color: colors.text, textAlign: 'center',
    lineHeight: rs(32), letterSpacing: -0.5, marginBottom: 40, paddingHorizontal: 4,
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
