import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenBackground from '../../components/ScreenBackground';
import GlassCard from '../../components/GlassCard';
import AppIcon from '../../components/AppIcon';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  getDailyChallengeProgress,
  completeDailyChallenge,
  ChallengeProgress,
} from '../../utils/dailyChallengeApi';
import { generateDailyChallenge, DailyChallenge } from '../../data/dailyChallenges';
import { rs } from '../../utils/responsive';
import { radii, spacing, Palette } from '../../theme';
import { useTheme, useThemedStyles } from '../../context/ThemeContext';

const wordCount = (t: string) => t.trim().split(/\s+/).filter(Boolean).length;

export default function DailyChallengeScreen({ navigation }: any) {
  const colors = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { user } = useAuth();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<ChallengeProgress | null>(null);
  const [challenge, setChallenge] = useState<DailyChallenge | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<{ points: number; badges: string[] } | null>(null);

  // response state
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [puzzleAnswer, setPuzzleAnswer] = useState('');
  const [reflection, setReflection] = useState('');
  const [checked, setChecked] = useState<Record<number, boolean>>({});

  useEffect(() => {
    let alive = true;
    (async () => {
      const p = await getDailyChallengeProgress(user?.id ?? '');
      if (!alive) return;
      setProgress(p);
      if (!p.todayCompleted) {
        setChallenge(generateDailyChallenge(p.completedDays.length, user?.age ?? 16));
      }
      setLoading(false);
    })();
    return () => { alive = false; };
  }, [user?.id, user?.age]);

  const canSubmit = (): boolean => {
    if (!challenge) return false;
    switch (challenge.type) {
      case 'questions':
        return challenge.content.questions.every((_: any, i: number) => answers[i] != null);
      case 'puzzle':
        return puzzleAnswer.trim().length > 0;
      case 'reflection':
        return wordCount(reflection) >= challenge.content.minWords;
      case 'practical':
        return challenge.content.checkboxes.every((_: any, i: number) => checked[i]);
    }
  };

  const submit = async () => {
    if (!challenge || !user?.id || submitting) return;
    setSubmitting(true);
    let response: any = {};
    if (challenge.type === 'questions') response = { answers };
    else if (challenge.type === 'puzzle') response = { answer: puzzleAnswer };
    else if (challenge.type === 'reflection') response = { reflection };
    else if (challenge.type === 'practical') response = { completed: true };

    try {
      const res = await completeDailyChallenge(user.id, challenge.id, response);
      setProgress(res.updatedProgress);
      setResults({ points: res.pointsEarned, badges: res.newBadges });
      setChallenge(null);
    } catch (e: any) {
      toast.error(e.message || 'Could not submit your challenge. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <ScreenBackground>
        <View style={styles.centered}><ActivityIndicator size="large" color={colors.purple} /></View>
      </ScreenBackground>
    );
  }

  const streak = progress?.currentStreak ?? 0;

  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={['#F59E0B', '#DB2777', '#6E4D9C']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerCard}
        >
          <Text style={styles.headerLabel}>DAILY CHALLENGE</Text>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{streak} 🔥</Text>
              <Text style={styles.statLabel}>Streak</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>{progress?.totalPoints ?? 0}</Text>
              <Text style={styles.statLabel}>Points</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>{progress?.badges.length ?? 0}</Text>
              <Text style={styles.statLabel}>Badges</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Results */}
        {results && (
          <GlassCard variant="dark" padding={20} style={styles.card}>
            <Text style={styles.doneTitle}>Challenge complete! 🎉</Text>
            <Text style={styles.donePoints}>+{results.points} points</Text>
            {results.badges.length > 0 && (
              <View style={styles.badgeWrap}>
                {results.badges.map((b) => (
                  <View key={b} style={styles.badgePill}><Text style={styles.badgePillText}>🏆 {b}</Text></View>
                ))}
              </View>
            )}
            <Text style={styles.doneSub}>Come back tomorrow to keep your streak alive.</Text>
            <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.goBack()}>
              <Text style={styles.primaryBtnText}>Done</Text>
            </TouchableOpacity>
          </GlassCard>
        )}

        {/* Already completed */}
        {!results && !challenge && progress?.todayCompleted && (
          <GlassCard variant="dark" padding={20} style={styles.card}>
            <Text style={styles.doneTitle}>You're done for today ✓</Text>
            <Text style={styles.doneSub}>
              Next challenge unlocks tomorrow. Longest streak: {progress.longestStreak} days.
            </Text>
          </GlassCard>
        )}

        {/* Active challenge */}
        {!results && challenge && (
          <GlassCard variant="dark" padding={18} style={styles.card}>
            <Text style={styles.typeLabel}>
              {challenge.type.toUpperCase()} · {challenge.points} pts
            </Text>

            {challenge.type === 'questions' && (
              <View>
                {challenge.content.questions.map((q: any, qi: number) => (
                  <View key={qi} style={styles.qBlock}>
                    <Text style={styles.qDomain}>{q.domainLabel}</Text>
                    <Text style={styles.qText}>{q.question}</Text>
                    {q.options.map((opt: string, oi: number) => {
                      const sel = answers[qi] === oi;
                      return (
                        <TouchableOpacity
                          key={oi}
                          style={[styles.option, sel && styles.optionSel]}
                          onPress={() => setAnswers((a) => ({ ...a, [qi]: oi }))}
                        >
                          <View style={[styles.radio, sel && styles.radioSel]} />
                          <Text style={styles.optionText}>{opt}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ))}
              </View>
            )}

            {challenge.type === 'puzzle' && (
              <View>
                <Text style={styles.qText}>{challenge.content.title}</Text>
                <Text style={styles.puzzleDesc}>{challenge.content.description}</Text>
                <Text style={styles.hint}>💡 {challenge.content.hint}</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Your answer"
                  placeholderTextColor={colors.textSubtle}
                  value={puzzleAnswer}
                  onChangeText={setPuzzleAnswer}
                />
              </View>
            )}

            {challenge.type === 'reflection' && (
              <View>
                <Text style={styles.qText}>{challenge.content.prompt}</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  placeholder="Write your reflection…"
                  placeholderTextColor={colors.textSubtle}
                  value={reflection}
                  onChangeText={setReflection}
                  multiline
                />
                <Text style={styles.wordCount}>
                  {wordCount(reflection)} / {challenge.content.minWords} words
                </Text>
              </View>
            )}

            {challenge.type === 'practical' && (
              <View>
                <Text style={styles.qText}>{challenge.content.title}</Text>
                <Text style={styles.puzzleDesc}>{challenge.content.task}</Text>
                {challenge.content.checkboxes.map((c: string, ci: number) => (
                  <TouchableOpacity
                    key={ci}
                    style={styles.checkRow}
                    onPress={() => setChecked((s) => ({ ...s, [ci]: !s[ci] }))}
                  >
                    <View style={[styles.checkbox, checked[ci] && styles.checkboxOn]}>
                      {checked[ci] && <AppIcon name="✓" size={13} color="#fff" />}
                    </View>
                    <Text style={styles.optionText}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <TouchableOpacity
              style={[styles.primaryBtn, (!canSubmit() || submitting) && { opacity: 0.5 }]}
              onPress={submit}
              disabled={!canSubmit() || submitting}
            >
              <Text style={styles.primaryBtnText}>{submitting ? 'Submitting…' : `Complete (+${challenge.points})`}</Text>
            </TouchableOpacity>
          </GlassCard>
        )}
      </ScrollView>
    </ScreenBackground>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  scroll: { paddingHorizontal: spacing.xl, paddingTop: 12, paddingBottom: 48 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  headerCard: { borderRadius: radii.lg, padding: 20, marginBottom: 16 },
  headerLabel: { color: 'rgba(255,255,255,0.8)', fontSize: rs(11), fontWeight: '800', letterSpacing: 1.5, marginBottom: 14 },
  statsRow: { flexDirection: 'row', alignItems: 'center' },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { color: '#fff', fontSize: rs(22), fontWeight: '900' },
  statLabel: { color: 'rgba(255,255,255,0.8)', fontSize: rs(11), marginTop: 2 },
  statDivider: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.25)' },

  card: { marginBottom: 14 },
  typeLabel: { fontSize: rs(11), fontWeight: '800', color: colors.cyan, letterSpacing: 1, marginBottom: 14 },

  qBlock: { marginBottom: 20 },
  qDomain: { fontSize: rs(11), fontWeight: '700', color: colors.success, letterSpacing: 0.5, marginBottom: 4 },
  qText: { fontSize: rs(15), fontWeight: '700', color: colors.text, lineHeight: rs(22), marginBottom: 12 },
  puzzleDesc: { fontSize: rs(14), color: colors.textSecondary, lineHeight: rs(21), marginBottom: 10 },
  hint: { fontSize: rs(12), color: colors.textMuted, fontStyle: 'italic', marginBottom: 12 },

  option: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12, paddingHorizontal: 14, borderRadius: radii.md, marginBottom: 8,
    backgroundColor: colors.glassMedium, borderWidth: 1.5, borderColor: colors.borderLight,
  },
  optionSel: { borderColor: colors.purple, backgroundColor: `${colors.purple}22` },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: colors.textMuted },
  radioSel: { borderColor: colors.purple, backgroundColor: colors.purple },
  optionText: { flex: 1, fontSize: rs(13), color: colors.textSecondary, lineHeight: rs(19) },

  textInput: {
    backgroundColor: colors.glassMedium, borderRadius: radii.md, borderWidth: 1, borderColor: colors.borderLight,
    padding: 14, fontSize: rs(14), color: colors.text, marginTop: 4,
  },
  textArea: { minHeight: 120, textAlignVertical: 'top' },
  wordCount: { fontSize: rs(11), color: colors.textMuted, marginTop: 6, textAlign: 'right' },

  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  checkbox: {
    width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: colors.textMuted,
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxOn: { backgroundColor: colors.success, borderColor: colors.success },

  primaryBtn: {
    marginTop: 18, paddingVertical: 15, borderRadius: radii.md, alignItems: 'center',
    backgroundColor: colors.purple,
  },
  primaryBtnText: { color: '#fff', fontSize: rs(15), fontWeight: '800' },

  doneTitle: { fontSize: rs(18), fontWeight: '800', color: colors.text, marginBottom: 6 },
  donePoints: { fontSize: rs(24), fontWeight: '900', color: colors.success, marginBottom: 10 },
  doneSub: { fontSize: rs(13), color: colors.textMuted, lineHeight: rs(19), marginTop: 6 },
  badgeWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  badgePill: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: radii.pill, backgroundColor: colors.glassMedium, borderWidth: 1, borderColor: colors.borderLight },
  badgePillText: { fontSize: rs(12), color: colors.textSecondary, fontWeight: '600' },
});
