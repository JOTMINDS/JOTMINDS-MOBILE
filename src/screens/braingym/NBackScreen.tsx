import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { saveBrainGymResult } from '../../utils/brainGym';
import ScreenBackground from '../../components/ScreenBackground';
import GlassCard from '../../components/GlassCard';
import AppIcon from '../../components/AppIcon';
import GameResult from './GameResult';
import { colors, radii, spacing } from '../../theme';

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];
const TRIALS = 15;
const INTERVAL = 2200;

function buildSequence(): string[] {
  const seq: string[] = [];
  for (let i = 0; i < TRIALS; i++) {
    // ~33% chance this trial repeats the previous letter (a "match")
    if (i > 0 && Math.random() < 0.33) {
      seq.push(seq[i - 1]);
    } else {
      let l = LETTERS[Math.floor(Math.random() * LETTERS.length)];
      if (i > 0) while (l === seq[i - 1]) l = LETTERS[Math.floor(Math.random() * LETTERS.length)];
      seq.push(l);
    }
  }
  return seq;
}

export default function NBackScreen({ navigation }: any) {
  const [phase, setPhase] = useState<'intro' | 'play' | 'done'>('intro');
  const [seq] = useState<string[]>(buildSequence);
  const [index, setIndex] = useState(0);
  const [flash, setFlash] = useState<'none' | 'hit' | 'miss'>('none');
  const tapped = useRef(false);
  const responses = useRef<boolean[]>([]);
  const [score, setScore] = useState(0);
  const [accuracy, setAccuracy] = useState(0);

  useEffect(() => {
    if (phase !== 'play') return;
    tapped.current = false;
    if (index >= seq.length) { finish(); return; }
    const t = setTimeout(() => {
      responses.current[index] = tapped.current;
      setIndex((i) => i + 1);
    }, INTERVAL);
    return () => clearTimeout(t);
  }, [index, phase]);

  const isMatch = (i: number) => i > 0 && seq[i] === seq[i - 1];

  const onMatch = () => {
    if (tapped.current) return;
    tapped.current = true;
    setFlash(isMatch(index) ? 'hit' : 'miss');
    setTimeout(() => setFlash('none'), 300);
  };

  const finish = () => {
    let hits = 0, falseAlarms = 0, correct = 0;
    for (let i = 0; i < seq.length; i++) {
      const m = isMatch(i);
      const t = responses.current[i] ?? false;
      if (m && t) hits++;
      if (!m && t) falseAlarms++;
      if (m === t) correct++;
    }
    const acc = correct / seq.length;
    const s = Math.max(0, hits * 100 - falseAlarms * 60);
    setScore(s); setAccuracy(acc); setPhase('done');
    saveBrainGymResult({ game: 'n-back', score: s, accuracy: acc });
  };

  const start = () => { responses.current = []; setIndex(0); setPhase('play'); };

  if (phase === 'done') {
    return (
      <GameResult
        title="N-Back"
        score={score}
        stats={[{ label: 'Accuracy', value: `${Math.round(accuracy * 100)}%` }, { label: 'Trials', value: String(TRIALS) }]}
        onPlayAgain={start}
        onDone={() => navigation.goBack()}
      />
    );
  }

  if (phase === 'intro') {
    return (
      <ScreenBackground>
        <View style={styles.introWrap}>
          <AppIcon name="🧠" size={56} color={colors.purpleSoft} />
          <Text style={styles.introTitle}>N-Back (1-back)</Text>
          <Text style={styles.introText}>
            Letters appear one at a time. Tap <Text style={styles.bold}>Match</Text> whenever the current letter is the
            same as the one immediately before it. Stay sharp!
          </Text>
          <TouchableOpacity style={styles.startBtn} onPress={start} accessibilityRole="button" accessibilityLabel="Start game">
            <LinearGradient colors={['#3D52C9', '#6E4D9C']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.startGradient}>
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

  // play
  const current = seq[Math.min(index, seq.length - 1)];
  return (
    <ScreenBackground>
      <View style={styles.container}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Quit game">
            <AppIcon name="✕" size={22} color={colors.textMuted} />
          </TouchableOpacity>
          <Text style={styles.progress}>{Math.min(index + 1, seq.length)} / {seq.length}</Text>
        </View>

        <View style={styles.stimWrap}>
          <View style={[
            styles.stim,
            flash === 'hit' && { borderColor: colors.success },
            flash === 'miss' && { borderColor: colors.error },
          ]}>
            <Text style={styles.letter}>{current}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.matchBtn} onPress={onMatch} accessibilityRole="button" accessibilityLabel="Match">
          <LinearGradient colors={['#6E4D9C', '#3D52C9']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.matchGradient}>
            <Text style={styles.matchText}>MATCH</Text>
          </LinearGradient>
        </TouchableOpacity>
        <Text style={styles.helper}>Tap when the letter repeats the previous one</Text>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: spacing.xl, paddingTop: 60 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progress: { fontSize: 15, fontWeight: '700', color: colors.textSecondary },
  stimWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  stim: {
    width: 160, height: 160, borderRadius: 32, backgroundColor: colors.bgSecondary,
    borderWidth: 3, borderColor: colors.borderLight, justifyContent: 'center', alignItems: 'center',
  },
  letter: { fontSize: 84, fontWeight: '800', color: colors.textPrimary },
  matchBtn: { borderRadius: radii.md, overflow: 'hidden', marginBottom: 12 },
  matchGradient: { paddingVertical: 20, alignItems: 'center' },
  matchText: { fontSize: 20, fontWeight: '800', color: '#FFFFFF', letterSpacing: 2 },
  helper: { fontSize: 13, color: colors.textMuted, textAlign: 'center', marginBottom: 40 },
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
