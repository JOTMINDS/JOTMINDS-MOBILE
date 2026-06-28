import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { saveBrainGymResult } from '../../utils/brainGym';
import ScreenBackground from '../../components/ScreenBackground';
import AppIcon from '../../components/AppIcon';
import GameResult from './GameResult';
import { select } from '../../utils/haptics';
import { colors, radii, spacing, Palette } from '../../theme';
import { useTheme, useThemedStyles } from '../../context/ThemeContext';

const FACES = ['🧠', '💡', '🎯', '🌱', '🔍', '🧩', '⚡', '🚀'];

interface Card { id: number; face: string; matched: boolean }

function buildDeck(): Card[] {
  const deck = [...FACES, ...FACES].map((face, i) => ({ id: i, face, matched: false }));
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

export default function MemoryMatchScreen({ navigation }: any) {
  const colors = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [deck, setDeck] = useState<Card[]>(buildDeck);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [done, setDone] = useState(false);
  const startTime = useRef(Date.now());
  const lock = useRef(false);

  const matchedCount = deck.filter((c) => c.matched).length;

  useEffect(() => {
    if (matchedCount === deck.length && !done) {
      const durationMs = Date.now() - startTime.current;
      // Fewer moves & faster = higher score. Perfect = 16 moves (8 pairs).
      const score = Math.max(50, Math.round(1000 - moves * 20 - durationMs / 200));
      setDone(true);
      saveBrainGymResult({ game: 'memory-match', score, durationMs });
    }
  }, [matchedCount]);

  const onFlip = (index: number) => {
    if (lock.current || flipped.includes(index) || deck[index].matched) return;
    select();
    const next = [...flipped, index];
    setFlipped(next);
    if (next.length === 2) {
      setMoves((m) => m + 1);
      lock.current = true;
      const [a, b] = next;
      if (deck[a].face === deck[b].face) {
        setTimeout(() => {
          setDeck((d) => d.map((c, i) => (i === a || i === b ? { ...c, matched: true } : c)));
          setFlipped([]);
          lock.current = false;
        }, 350);
      } else {
        setTimeout(() => { setFlipped([]); lock.current = false; }, 750);
      }
    }
  };

  const restart = () => {
    setDeck(buildDeck()); setFlipped([]); setMoves(0); setDone(false);
    startTime.current = Date.now();
  };

  if (done) {
    const durationMs = Date.now() - startTime.current;
    return (
      <GameResult
        title="Memory Match"
        stats={[
          { label: 'Moves', value: String(moves) },
          { label: 'Time', value: `${Math.round(durationMs / 1000)}s` },
          { label: 'Pairs', value: '8/8' },
        ]}
        onPlayAgain={restart}
        onDone={() => navigation.goBack()}
      />
    );
  }

  return (
    <ScreenBackground>
      <View style={styles.container}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Quit game">
            <AppIcon name="✕" size={22} color={colors.textMuted} />
          </TouchableOpacity>
          <Text style={styles.movesText}>Moves: {moves}</Text>
        </View>

        <Text style={styles.title}>Memory Match</Text>
        <Text style={styles.hint}>Find all 8 matching pairs</Text>

        <View style={styles.grid}>
          {deck.map((card, i) => {
            const revealed = flipped.includes(i) || card.matched;
            return (
              <TouchableOpacity
                key={card.id}
                style={styles.cardWrap}
                activeOpacity={0.9}
                onPress={() => onFlip(i)}
                accessibilityRole="button"
                accessibilityLabel={revealed ? `Card ${card.face}` : 'Hidden card'}
              >
                {revealed ? (
                  <LinearGradient
                    colors={card.matched ? ['#10B981', '#059669'] : ['#3D52C9', '#6E4D9C']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.card}
                  >
                    <AppIcon name={card.face} size={28} color="#FFFFFF" />
                  </LinearGradient>
                ) : (
                  <View style={[styles.card, styles.cardBack]}>
                    <AppIcon name="🧠" size={20} color={colors.textSubtle} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </ScreenBackground>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  container: { flex: 1, paddingHorizontal: spacing.xl, paddingTop: 12 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  movesText: { fontSize: 15, fontWeight: '700', color: colors.textSecondary },
  title: { fontSize: 26, fontWeight: '800', color: colors.textPrimary, letterSpacing: -0.6 },
  hint: { fontSize: 14, color: colors.textMuted, marginTop: 4, marginBottom: 24 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  cardWrap: { width: '23%', aspectRatio: 1, marginBottom: '2.6%' },
  card: { flex: 1, borderRadius: radii.md, justifyContent: 'center', alignItems: 'center' },
  cardBack: { backgroundColor: colors.bgTertiary, borderWidth: 1, borderColor: colors.borderLight },
});
