import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import ScreenBackground from '../../components/ScreenBackground';
import GlassCard from '../../components/GlassCard';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { PROFESSIONAL_SECTIONS, LIKERT } from '../../data/professionalCognitiveQuestions';
import type { ProfessionalAssessmentResponses } from '../../utils/professionalCognitiveScoring';
import { saveAttempt, progress, isSubmittable } from '../../utils/professionalCognitiveStore';
import { rs } from '../../utils/responsive';
import { radii, spacing, Palette } from '../../theme';
import { useThemedStyles } from '../../context/ThemeContext';
import type { ScreenProps } from '../../navigation/types';

const empty = (): ProfessionalAssessmentResponses => ({ learning: [], thinking: [], decisionMaking: [], motivation: [] });

/** Professional Cognitive Assessment: 3 core sections + an optional motivation section, 1–5 Likert. */
export default function ProfessionalCognitiveScreen({ navigation }: ScreenProps<'ProfessionalCognitive'>) {
  const styles = useThemedStyles(makeStyles);
  const { user } = useAuth();
  const toast = useToast();
  const [responses, setResponses] = useState<ProfessionalAssessmentResponses>(empty);
  const [s, setS] = useState(0); // section
  const [q, setQ] = useState(0); // question within section
  const [saving, setSaving] = useState(false);

  const section = PROFESSIONAL_SECTIONS[s];
  const { answered, total } = progress(responses);
  const current = responses[section.id]?.[q];
  const isLast = s === PROFESSIONAL_SECTIONS.length - 1 && q === section.questions.length - 1;

  const finish = async (final: ProfessionalAssessmentResponses) => {
    if (!user?.id || saving) return;
    if (!isSubmittable(final)) { toast.error('Please answer every question in the first three sections.'); return; }
    setSaving(true);
    try {
      const entry = await saveAttempt(user.id, final);
      navigation.replace('ProfessionalReport', { entryId: entry.id });
    } catch {
      setSaving(false);
      toast.error('Could not save your results. Please try again.');
    }
  };

  const answer = (value: number) => {
    const list = [...(responses[section.id] ?? [])];
    list[q] = value;
    const next = { ...responses, [section.id]: list };
    setResponses(next);
    if (q < section.questions.length - 1) setQ(q + 1);
    else if (s < PROFESSIONAL_SECTIONS.length - 1) { setS(s + 1); setQ(0); }
    else void finish(next);
  };

  const back = () => {
    if (q > 0) setQ(q - 1);
    else if (s > 0) { setS(s - 1); setQ(PROFESSIONAL_SECTIONS[s - 1].questions.length - 1); }
    else navigation.goBack();
  };

  const skipOptional = () => Alert.alert('Skip this section?', 'It only adds extended insight on motivation and teamwork.', [
    { text: 'Keep answering', style: 'cancel' },
    { text: 'Skip & see results', onPress: () => void finish({ ...responses, motivation: [] }) },
  ]);

  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.track}><View style={[styles.fill, { width: `${Math.round((answered / total) * 100)}%` }]} /></View>
        <Text style={styles.count}>Question {answered + (current === undefined ? 1 : 0)} of {total}</Text>

        {q === 0 && (
          <GlassCard variant="medium" padding={14} style={styles.intro}>
            <Text style={styles.sectionTitle}>{section.icon}  {section.title}{section.optional ? ' (optional)' : ''}</Text>
            <Text style={styles.sectionText}>{section.benefit}</Text>
          </GlassCard>
        )}

        <GlassCard variant="dark" padding={20} style={styles.qCard}>
          <Text style={styles.question}>{section.questions[q]}</Text>
        </GlassCard>

        <View style={styles.options}>
          {LIKERT.map((o) => (
            <TouchableOpacity
              key={o.value}
              disabled={saving}
              onPress={() => answer(o.value)}
              style={[styles.option, current === o.value && styles.optionOn]}
              accessibilityRole="radio"
              accessibilityState={{ selected: current === o.value }}
              accessibilityLabel={o.label}
            >
              <Text style={[styles.optionNum, current === o.value && { color: '#fff' }]}>{o.value}</Text>
              <Text style={[styles.optionText, current === o.value && { color: '#fff' }]}>{o.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.nav}>
          <TouchableOpacity onPress={back} accessibilityRole="button"><Text style={styles.link}>← Back</Text></TouchableOpacity>
          {section.optional && <TouchableOpacity onPress={skipOptional} accessibilityRole="button"><Text style={styles.link}>Skip section</Text></TouchableOpacity>}
          {current !== undefined && !isLast && (
            <TouchableOpacity onPress={() => (q < section.questions.length - 1 ? setQ(q + 1) : (setS(s + 1), setQ(0)))} accessibilityRole="button">
              <Text style={styles.link}>Next →</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </ScreenBackground>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  scroll: { padding: spacing.xl, paddingBottom: 60 },
  track: { height: 6, borderRadius: 3, backgroundColor: colors.bgTertiary, overflow: 'hidden' },
  fill: { height: 6, borderRadius: 3, backgroundColor: colors.success },
  count: { fontSize: rs(12), color: colors.textMuted, marginTop: 8, marginBottom: spacing.lg },
  intro: { marginBottom: spacing.lg },
  sectionTitle: { fontSize: rs(15), fontWeight: '800', color: colors.text, marginBottom: 4 },
  sectionText: { fontSize: rs(12), lineHeight: rs(18), color: colors.textSecondary },
  qCard: { marginBottom: spacing.lg },
  question: { fontSize: rs(17), lineHeight: rs(25), fontWeight: '700', color: colors.text },
  options: { gap: 10 },
  option: {
    flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: radii.lg,
    borderWidth: 1, borderColor: colors.borderSoft, backgroundColor: colors.glassLight,
  },
  optionOn: { backgroundColor: colors.success, borderColor: colors.success },
  optionNum: { width: 22, textAlign: 'center', fontWeight: '800', color: colors.purpleSoft, fontSize: rs(15) },
  optionText: { fontSize: rs(14), color: colors.text, fontWeight: '600' },
  nav: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xl },
  link: { color: colors.purpleSoft, fontWeight: '700', fontSize: rs(13) },
});
