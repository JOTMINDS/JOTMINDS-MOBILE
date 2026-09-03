import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import GlassCard from './GlassCard';
import AppIcon from './AppIcon';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  getReadingQuiz, isReadingQuizDone, markReadingQuizDone, QuizQuestion,
} from '../utils/readingQuiz';
import { recordReadingQuiz } from '../utils/gamificationApi';
import { rs } from '../utils/responsive';
import { radii, spacing, Palette } from '../theme';
import { useThemedStyles, useTheme } from '../context/ThemeContext';

/**
 * "Check your understanding" — a 3-question quiz at the end of a Discover
 * article. Completing it earns Cognitive Growth XP (once per article). It
 * does NOT feed any cognitive-assessment score.
 */
export default function ReadingQuiz({ articleId, title, body }: { articleId: string; title: string; body: string }) {
  const colors = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { user } = useAuth();
  const toast = useToast();

  const [questions, setQuestions] = useState<QuizQuestion[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [alreadyDone, setAlreadyDone] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      const done = await isReadingQuizDone(articleId);
      const qs = await getReadingQuiz(articleId, title, body);
      if (!alive) return;
      setAlreadyDone(done);
      setQuestions(qs);
      setLoading(false);
    })();
    return () => { alive = false; };
  }, [articleId, title, body]);

  if (loading) {
    return (
      <GlassCard style={styles.card} padding={20}>
        <ActivityIndicator color={colors.textMuted} />
      </GlassCard>
    );
  }
  if (!questions) return null; // AI unavailable — just don't show a quiz

  const allAnswered = questions.every((_, i) => answers[i] != null);
  const correct = questions.filter((q, i) => answers[i] === q.answerIndex).length;

  const submit = async () => {
    setSubmitted(true);
    if (!alreadyDone && user?.id) {
      const first = await markReadingQuizDone(articleId);
      if (first) {
        recordReadingQuiz(user.id).catch(() => {});
        toast.success('+15 XP · nice reading');
      }
    }
  };

  return (
    <GlassCard style={styles.card} padding={18}>
      <Text style={styles.title}>Check your understanding</Text>
      {alreadyDone && !submitted && <Text style={styles.doneNote}>You've completed this quiz.</Text>}

      {questions.map((q, qi) => (
        <View key={qi} style={styles.qBlock}>
          <Text style={styles.qText}>{qi + 1}. {q.question}</Text>
          {q.options.map((opt, oi) => {
            const chosen = answers[qi] === oi;
            const showRight = submitted && oi === q.answerIndex;
            const showWrong = submitted && chosen && oi !== q.answerIndex;
            return (
              <TouchableOpacity
                key={oi}
                disabled={submitted}
                style={[
                  styles.opt,
                  chosen && !submitted && styles.optChosen,
                  showRight && styles.optRight,
                  showWrong && styles.optWrong,
                ]}
                onPress={() => setAnswers((a) => ({ ...a, [qi]: oi }))}
              >
                <Text style={styles.optText}>{opt}</Text>
                {showRight && <AppIcon name="✓" size={14} color={colors.success} />}
                {showWrong && <AppIcon name="✕" size={14} color={colors.error} />}
              </TouchableOpacity>
            );
          })}
        </View>
      ))}

      {!submitted ? (
        <TouchableOpacity
          style={[styles.submitBtn, !allAnswered && { opacity: 0.5 }]}
          onPress={submit}
          disabled={!allAnswered}
        >
          <Text style={styles.submitText}>Submit</Text>
        </TouchableOpacity>
      ) : (
        <Text style={styles.result}>You got {correct} / {questions.length} right.</Text>
      )}
    </GlassCard>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  card: { marginTop: spacing.lg },
  title: { fontSize: rs(15), fontWeight: '800', color: colors.text, marginBottom: 4 },
  doneNote: { fontSize: rs(12), color: colors.textMuted, marginBottom: 8 },
  qBlock: { marginTop: 14 },
  qText: { fontSize: rs(13), fontWeight: '700', color: colors.text, lineHeight: rs(19), marginBottom: 8 },
  opt: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8,
    paddingVertical: 11, paddingHorizontal: 13, borderRadius: radii.md, marginBottom: 6,
    backgroundColor: colors.glassMedium, borderWidth: 1.5, borderColor: colors.borderLight,
  },
  optChosen: { borderColor: colors.purple, backgroundColor: `${colors.purple}22` },
  optRight: { borderColor: colors.success, backgroundColor: `${colors.success}18` },
  optWrong: { borderColor: colors.error, backgroundColor: `${colors.error}12` },
  optText: { flex: 1, fontSize: rs(13), color: colors.textSecondary, lineHeight: rs(18) },
  submitBtn: { marginTop: 14, paddingVertical: 13, borderRadius: radii.md, alignItems: 'center', backgroundColor: colors.purple },
  submitText: { color: '#fff', fontSize: rs(14), fontWeight: '800' },
  result: { marginTop: 14, fontSize: rs(14), fontWeight: '700', color: colors.text, textAlign: 'center' },
});
