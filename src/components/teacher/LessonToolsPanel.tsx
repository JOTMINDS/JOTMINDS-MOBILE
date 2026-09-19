import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator } from 'react-native';
import GlassCard from '../GlassCard';
import { useToast } from '../../context/ToastContext';
import {
  generateLessonAssessmentSuite, generateDifferentiatedInstruction, generateReflectionFeedback,
  AssessmentSuite, DifferentiationIdeas, AssessmentItem,
} from '../../utils/aiGenerators';
import { LessonPlan, updateLessonPlan } from '../../utils/lessonPlannerApi';
import { rs } from '../../utils/responsive';
import { radii, spacing, Palette } from '../../theme';
import { useTheme, useThemedStyles } from '../../context/ThemeContext';

const SECTIONS: { key: keyof Omit<AssessmentSuite, 'title'>; title: string }[] = [
  { key: 'mcqs', title: 'Multiple choice' },
  { key: 'shortAnswer', title: 'Short answer' },
  { key: 'discussion', title: 'Discussion' },
  { key: 'practicalExercises', title: 'Practical' },
  { key: 'homework', title: 'Homework' },
];

/** AI tools for a saved lesson plan: assessment suite, extra differentiation, post-lesson reflection, copilot. */
export default function LessonToolsPanel({
  plan, onPlanChange, onCopilot,
}: { plan: LessonPlan; onPlanChange: (p: LessonPlan) => void; onCopilot: () => void }) {
  const colors = useTheme();
  const styles = useThemedStyles(makeStyles);
  const toast = useToast();
  const [suite, setSuite] = useState<AssessmentSuite | null>(null);
  const [ideas, setIdeas] = useState<DifferentiationIdeas | null>(null);
  const [busy, setBusy] = useState<'suite' | 'diff' | 'reflect' | null>(null);
  const [showAnswers, setShowAnswers] = useState(false);
  const [reflection, setReflection] = useState('');

  const ctx = { subject: plan.subject, topic: plan.topic, gradeClass: plan.gradeClass ?? '' };

  const makeSuite = async () => {
    setBusy('suite');
    const s = await generateLessonAssessmentSuite(ctx);
    setBusy(null);
    s ? setSuite(s) : toast.error('Could not build the assessment right now. Try again in a moment.');
  };

  const makeIdeas = async () => {
    setBusy('diff');
    const d = await generateDifferentiatedInstruction(ctx);
    setBusy(null);
    d ? setIdeas(d) : toast.error('Could not generate ideas right now. Try again in a moment.');
  };

  const saveReflection = async () => {
    const text = reflection.trim();
    if (!text) return;
    setBusy('reflect');
    const feedback = await generateReflectionFeedback(text, { audience: 'teacher', topic: `${plan.subject}: ${plan.topic}` });
    const entry = { at: new Date().toISOString(), text, ...(feedback ? { feedback } : {}) };
    const reflections = [entry, ...(plan.reflections ?? [])];
    await updateLessonPlan(plan.id, { reflections });
    onPlanChange({ ...plan, reflections });
    setReflection('');
    setBusy(null);
    if (!feedback) toast.info('Reflection saved. AI feedback wasn’t available right now.');
  };

  const Item = ({ q, i }: { q: AssessmentItem; i: number }) => (
    <View style={styles.q}>
      <Text style={styles.qText}>{i + 1}. {q.question}</Text>
      {q.options?.map((o, j) => <Text key={j} style={styles.opt}>{String.fromCharCode(65 + j)}. {o}</Text>)}
      {showAnswers && (q.correctAnswer || q.explanation) && (
        <Text style={styles.answer}>{q.correctAnswer ? `Answer: ${q.correctAnswer}. ` : ''}{q.explanation ?? ''}</Text>
      )}
    </View>
  );

  return (
    <View>
      <GlassCard variant="dark" padding={16} style={styles.card}>
        <Text style={styles.title}>✦ Assessment suite</Text>
        {!suite ? (
          <ToolButton label="Generate quiz, short answers & homework" busy={busy === 'suite'} onPress={makeSuite} styles={styles} />
        ) : (
          <>
            <Text style={styles.suiteTitle}>{suite.title}</Text>
            <TouchableOpacity onPress={() => setShowAnswers((v) => !v)} accessibilityRole="button" style={{ marginBottom: 8 }}>
              <Text style={styles.link}>{showAnswers ? 'Hide answers' : 'Show answers & marking notes'}</Text>
            </TouchableOpacity>
            {SECTIONS.map((sec) => suite[sec.key].length > 0 && (
              <View key={sec.key}>
                <Text style={styles.sub}>{sec.title.toUpperCase()}</Text>
                {suite[sec.key].map((q, i) => <Item key={q.id} q={q} i={i} />)}
              </View>
            ))}
          </>
        )}
      </GlassCard>

      <GlassCard variant="dark" padding={16} style={styles.card}>
        <Text style={styles.title}>✦ More differentiation ideas</Text>
        {!ideas ? (
          <ToolButton label="Suggest strategies for mixed-ability groups" busy={busy === 'diff'} onPress={makeIdeas} styles={styles} />
        ) : (
          <>
            {ideas.strategies.map((s, i) => (
              <View key={i} style={{ marginBottom: 10 }}>
                <Text style={styles.sub}>{s.group.toUpperCase()}</Text>
                <Text style={styles.body}>{s.strategy}</Text>
              </View>
            ))}
            {ideas.tips?.map((t, i) => <Text key={i} style={styles.body}>💡 {t}</Text>)}
          </>
        )}
      </GlassCard>

      <GlassCard variant="dark" padding={16} style={styles.card}>
        <Text style={styles.title}>📝 After the lesson</Text>
        <TextInput
          style={styles.input}
          multiline
          value={reflection}
          onChangeText={setReflection}
          placeholder="What worked? What would you change next time?"
          placeholderTextColor={colors.textSubtle}
          accessibilityLabel="Post-lesson reflection"
        />
        <TouchableOpacity
          style={[styles.btn, (!reflection.trim() || busy === 'reflect') && { opacity: 0.5 }]}
          disabled={!reflection.trim() || busy === 'reflect'}
          onPress={saveReflection}
          accessibilityRole="button"
        >
          {busy === 'reflect' ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Save reflection + get coaching feedback</Text>}
        </TouchableOpacity>
        {(plan.reflections ?? []).map((r, i) => (
          <View key={r.at + i} style={styles.reflection}>
            <Text style={styles.sub}>{new Date(r.at).toLocaleDateString()}</Text>
            <Text style={styles.body}>{r.text}</Text>
            {r.feedback && (
              <View style={{ marginTop: 6 }}>
                <Text style={styles.body}>💬 {r.feedback.encouragement}</Text>
                <Text style={styles.body}>🔍 {r.feedback.insight}</Text>
                <Text style={styles.body}>➡️ {r.feedback.actionableStep}</Text>
              </View>
            )}
          </View>
        ))}
      </GlassCard>

      <TouchableOpacity style={styles.copilot} onPress={onCopilot} accessibilityRole="button">
        <Text style={styles.copilotText}>✦ Ask the Lesson Copilot about this plan</Text>
      </TouchableOpacity>
    </View>
  );
}

function ToolButton({ label, busy, onPress, styles }: { label: string; busy: boolean; onPress: () => void; styles: ReturnType<typeof makeStyles> }) {
  return (
    <TouchableOpacity style={[styles.btn, busy && { opacity: 0.6 }]} disabled={busy} onPress={onPress} accessibilityRole="button">
      {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>{label}</Text>}
    </TouchableOpacity>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  card: { marginBottom: spacing.lg },
  title: { fontSize: rs(15), fontWeight: '800', color: colors.text, marginBottom: 10 },
  suiteTitle: { fontSize: rs(13), fontWeight: '700', color: colors.textSecondary, marginBottom: 6 },
  sub: { fontSize: rs(11), fontWeight: '800', letterSpacing: 0.8, color: colors.purpleSoft, marginTop: 8, marginBottom: 4 },
  body: { fontSize: rs(13), lineHeight: rs(19), color: colors.textSecondary, marginBottom: 2 },
  q: { marginBottom: 10 },
  qText: { fontSize: rs(13), fontWeight: '700', color: colors.text, marginBottom: 3 },
  opt: { fontSize: rs(13), color: colors.textSecondary, marginLeft: 8 },
  answer: { fontSize: rs(12), color: colors.success, marginTop: 3 },
  link: { color: colors.purpleSoft, fontWeight: '700', fontSize: rs(13) },
  input: {
    minHeight: 90, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.borderSoft, backgroundColor: colors.glassLight,
    color: colors.text, padding: 12, fontSize: rs(13), textAlignVertical: 'top', marginBottom: 10,
  },
  btn: { backgroundColor: colors.purple, borderRadius: radii.lg, paddingVertical: 13, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '800', fontSize: rs(13) },
  reflection: { marginTop: 14, paddingTop: 10, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.borderSoft },
  copilot: { alignItems: 'center', paddingVertical: 14, marginBottom: spacing.md },
  copilotText: { color: colors.purpleSoft, fontWeight: '800', fontSize: rs(13) },
});
