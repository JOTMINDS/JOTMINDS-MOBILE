import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import ScreenBackground from '../../components/ScreenBackground';
import AppIcon from '../../components/AppIcon';
import { PARENT_OBSERVATION_QUESTIONS, calculateParentObservationScore } from '../../utils/parentObservationData';
import { saveParentObservation } from '../../utils/parentApi';
import { recordAssessmentCompletion } from '../../utils/gamificationApi';
import { useAuth } from '../../context/AuthContext';
import { rs } from '../../utils/responsive';
import { colors, radii, spacing, Palette } from '../../theme';
import { useTheme, useThemedStyles } from '../../context/ThemeContext';

// Same conversational Likert scale as AssessmentTakingScreen/TeachingStyleAssessmentScreen.
const LIKERT = [
  { value: 5, label: 'Strongly agree', tint: '#10B981' },
  { value: 4, label: 'Agree', tint: '#3D52C9' },
  { value: 3, label: 'Neutral', tint: '#8A97B2' },
  { value: 2, label: 'Disagree', tint: '#6E4D9C' },
  { value: 1, label: 'Strongly disagree', tint: '#EC4899' },
];

export default function ParentObservationScreen({ route, navigation }: any) {
  const colors = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { user } = useAuth();
  const { childId, childName, assessments, consentGranted } = route.params ?? {};
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [saving, setSaving] = useState(false);

  const question = PARENT_OBSERVATION_QUESTIONS[index];
  const total = PARENT_OBSERVATION_QUESTIONS.length;
  const isLastQuestion = index === total - 1;
  const progress = ((index + 1) / total) * 100;

  const finish = async (finalAnswers: Record<number, number>) => {
    const responses = PARENT_OBSERVATION_QUESTIONS.map((q) => finalAnswers[q.id] ?? 0);
    const score = calculateParentObservationScore(responses);
    setSaving(true);
    try {
      await saveParentObservation(childId, responses, score);
    } catch {
      // non-critical; results screen still shows the freshly computed score
    }
    if (user?.id) recordAssessmentCompletion(user.id).catch(() => {});
    setSaving(false);
    navigation.replace('ParentObservationResults', { score, childId, childName, assessments, consentGranted });
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

  if (saving) {
    return (
      <ScreenBackground>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.purple} />
        </View>
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground>
      <View style={styles.container}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12} accessibilityRole="button" accessibilityLabel="Exit assessment">
            <AppIcon name="✕" size={22} color={colors.textMuted} />
          </TouchableOpacity>
          <Text style={styles.framework}>Observing {childName || 'your child'}</Text>
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
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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
