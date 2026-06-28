import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { saveBrainGymResult } from '../../utils/brainGym';
import ScreenBackground from '../../components/ScreenBackground';
import AppIcon from '../../components/AppIcon';
import GameResult from './GameResult';
import { select } from '../../utils/haptics';
import { colors, radii, spacing, Palette } from '../../theme';
import { useTheme, useThemedStyles } from '../../context/ThemeContext';

const COLORS = [
  { name: 'RED', value: '#EF4444' },
  { name: 'BLUE', value: '#3D52C9' },
  { name: 'GREEN', value: '#10B981' },
  { name: 'YELLOW', value: '#F59E0B' },
];
const TRIALS = 12;

function rnd<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

function makeTrial() {
  const word = rnd(COLORS);
  // 70% incongruent (ink ≠ word) to create interference
  let ink = word;
  if (Math.random() < 0.7) { while (ink.name === word.name) ink = rnd(COLORS); }
  return { word, ink };
}

export default function StroopScreen({ navigation }: any) {
  const colors = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [phase, setPhase] = useState<'intro' | 'play' | 'done'>('intro');
  const [trial, setTrial] = useState(makeTrial);
  const [count, setCount] = useState(0);
  const [flash, setFlash] = useState<string | null>(null);
  const correct = useRef(0);
  const rts = useRef<number[]>([]);
  const trialStart = useRef(0);
  const [score, setScore] = useState(0);

  const start = () => {
    correct.current = 0; rts.current = []; setCount(0);
    setTrial(makeTrial()); trialStart.current = Date.now(); setPhase('play');
  };

  const answer = (chosen: { name: string; value: string }) => {
    select();
    const isCorrect = chosen.name === trial.ink.name;
    if (isCorrect) correct.current += 1;
    rts.current.push(Date.now() - trialStart.current);
    setFlash(isCorrect ? 'ok' : 'no');
    setTimeout(() => setFlash(null), 200);

    const nextCount = count + 1;
    if (nextCount >= TRIALS) {
      const avgRt = rts.current.reduce((a, b) => a + b, 0) / rts.current.length;
      const s = Math.max(0, correct.current * 100 - Math.round(avgRt / 25));
      setScore(s); setPhase('done');
      saveBrainGymResult({
        game: 'stroop', score: s,
        durationMs: Math.round(avgRt),
        accuracy: correct.current / TRIALS,
      });
    } else {
      setCount(nextCount);
      setTrial(makeTrial());
      trialStart.current = Date.now();
    }
  };

  if (phase === 'done') {
    const avgRt = rts.current.reduce((a, b) => a + b, 0) / (rts.current.length || 1);
    return (
      <GameResult
        title="Stroop Task"
        score={score}
        stats={[
          { label: 'Correct', value: `${correct.current}/${TRIALS}` },
          { label: 'Avg time', value: `${(avgRt / 1000).toFixed(2)}s` },
        ]}
        onPlayAgain={start}
        onDone={() => navigation.goBack()}
      />
    );
  }

  if (phase === 'intro') {
    return (
      <ScreenBackground>
        <View style={styles.introWrap}>
          <AppIcon name="🎨" size={56} color={colors.coral} />
          <Text style={styles.introTitle}>Stroop Task</Text>
          <Text style={styles.introText}>
            A colour word appears in a coloured ink. Tap the <Text style={styles.bold}>ink colour</Text> — not what the
            word says. Go as fast and accurately as you can.
          </Text>
          <TouchableOpacity style={styles.startBtn} onPress={start} accessibilityRole="button" accessibilityLabel="Start game">
            <LinearGradient colors={['#EC4899', '#DB2777']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.startGradient}>
              <Text style={styles.startText}>Start</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.quit}>
            <Text style={styles.quitText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground>
      <View style={styles.container}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Quit game">
            <AppIcon name="✕" size={22} color={colors.textMuted} />
          </TouchableOpacity>
          <Text style={styles.progress}>{count + 1} / {TRIALS}</Text>
        </View>

        <View style={[
          styles.stimWrap,
          flash === 'ok' && { backgroundColor: 'rgba(16,185,129,0.12)' },
          flash === 'no' && { backgroundColor: 'rgba(239,68,68,0.12)' },
        ]}>
          <Text style={[styles.word, { color: trial.ink.value }]}>{trial.word.name}</Text>
          <Text style={styles.prompt}>Tap the INK colour</Text>
        </View>

        <View style={styles.options}>
          {COLORS.map((c) => (
            <TouchableOpacity
              key={c.name}
              style={[styles.optionBtn, { backgroundColor: c.value }]}
              onPress={() => answer(c)}
              accessibilityRole="button"
              accessibilityLabel={c.name.toLowerCase()}
            >
              <Text style={styles.optionText}>{c.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScreenBackground>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  container: { flex: 1, paddingHorizontal: spacing.xl, paddingTop: 12 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progress: { fontSize: 15, fontWeight: '700', color: colors.textSecondary },
  stimWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', borderRadius: radii.xl, marginVertical: 20 },
  word: { fontSize: 56, fontWeight: '800', letterSpacing: 1 },
  prompt: { fontSize: 14, color: colors.textMuted, marginTop: 16 },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 40 },
  optionBtn: { flex: 1, minWidth: '45%', paddingVertical: 22, borderRadius: radii.md, alignItems: 'center' },
  optionText: { fontSize: 16, fontWeight: '800', color: '#FFFFFF', letterSpacing: 1 },
  introWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xxl },
  introTitle: { fontSize: 26, fontWeight: '800', color: colors.textPrimary, marginTop: 20, marginBottom: 12 },
  introText: { fontSize: 15, color: colors.textMuted, textAlign: 'center', lineHeight: 23, marginBottom: 32 },
  bold: { color: colors.text, fontWeight: '700' },
  startBtn: { borderRadius: radii.md, overflow: 'hidden', width: '100%' },
  startGradient: { paddingVertical: 18, alignItems: 'center' },
  startText: { fontSize: 17, fontWeight: '700', color: '#FFFFFF' },
  quit: { paddingVertical: 16 },
  quitText: { fontSize: 15, color: colors.textMuted },
});
