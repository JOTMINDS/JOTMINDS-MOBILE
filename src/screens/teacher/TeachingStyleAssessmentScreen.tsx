import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import ScreenBackground from '../../components/ScreenBackground';
import AppIcon from '../../components/AppIcon';
import { teachingStyleQuestions } from '../../data/teachingStyleQuestions';
import { calculateTeachingStyleScore } from '../../utils/teachingStyleScoring';
import { recordAssessmentCompletion } from '../../utils/gamificationApi';
import { markTeachingStyleDone } from '../../utils/teachingStyleStatus';
import { useAuth } from '../../context/AuthContext';
import { rs } from '../../utils/responsive';
import { colors, radii, spacing, Palette } from '../../theme';
import { useTheme, useThemedStyles } from '../../context/ThemeContext';

// Same conversational Likert scale as AssessmentTakingScreen.
const LIKERT = [
  { value: 5, label: 'Strongly agree', tint: '#10B981' },
  { value: 4, label: 'Agree', tint: '#3D52C9' },
  { value: 3, label: 'Neutral', tint: '#8A97B2' },
  { value: 2, label: 'Disagree', tint: '#6E4D9C' },
  { value: 1, label: 'Strongly disagree', tint: '#EC4899' },
];

export default function TeachingStyleAssessmentScreen({ navigation }: any) {
  const colors = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { user } = useAuth();
  const [index, setIndex] = useState(0);
  // Keyed by question id (not array index — ids are non-contiguous).
  const [answers, setAnswers] = useState<Record<number, number>>({});

  const question = teachingStyleQuestions[index];
  const total = teachingStyleQuestions.length;
  const isLastQuestion = index === total - 1;
  const progress = ((index + 1) / total) * 100;

  const finish = (finalAnswers: Record<number, number>) => {
    // calculateTeachingStyleScore expects a 1-indexed-by-id sparse array.
    const maxId = teachingStyleQuestions[teachingStyleQuestions.length - 1].id;
    const responses: number[] = new Array(maxId).fill(0);
    teachingStyleQuestions.forEach((q) => {
      if (finalAnswers[q.id]) responses[q.id - 1] = finalAnswers[q.id];
    });
    const score = calculateTeachingStyleScore(responses);
    // No backend persistence for this assessment (see TeachingStyleResultsScreen —
    // the score is passed via nav params, not fetched), so award right after
    // computing rather than after a submit that doesn't exist.
    if (user?.id) recordAssessmentCompletion(user.id).catch(() => {});
    markTeachingStyleDone();
    navigation.navigate('TeachingStyleResults', { score });
  };

  const choose = (value: number) => {
    const updated = { ...answers, [question.id]: value };
    setAnswers(updated);
    if (isLastQuestion) {
      finish(updated);
    } else {
      setIndex(index + 1);
    }
  };

  const goBack = () => {
    if (index === 0) return;
    setIndex(index - 1);
  };

  return (
    <ScreenBackground>
      <View style={styles.container}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12} accessibilityRole="button" accessibilityLabel="Exit assessment">
            <AppIcon name="✕" size={22} color={colors.textMuted} />
          </TouchableOpacity>
          <Text style={styles.framework}>Teaching Style</Text>
          <View style={{ width: 22 }} />
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>

        <View style={styles.body}>
          <Text style={styles.counter}>QUESTION {index + 1} OF {total}</Text>
          <Text style={styles.question}>{question.text}</Text>

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
        </View>

        <View style={styles.footer}>
          {index > 0 ? (
            <TouchableOpacity onPress={goBack} hitSlop={10} accessibilityRole="button" accessibilityLabel="Previous question">
              <Text style={styles.backText}>← Previous</Text>
            </TouchableOpacity>
          ) : <View />}
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
  progressFill: { height: '100%', borderRadius: 2, backgroundColor: colors.success },
  body: { flex: 1, justifyContent: 'center' },
  counter: { fontSize: rs(12), fontWeight: '700', color: colors.success, letterSpacing: 1.5, marginBottom: 16, textAlign: 'center' },
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
