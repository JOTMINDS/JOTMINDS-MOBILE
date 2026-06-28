import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenBackground from '../../components/ScreenBackground';
import GlassCard from '../../components/GlassCard';
import AppIcon from '../../components/AppIcon';
import { colors, radii, spacing, Palette } from '../../theme';
import { useTheme, useThemedStyles } from '../../context/ThemeContext';

interface Stat { label: string; value: string }

export default function GameResult({
  title, score, stats, onPlayAgain, onDone,
}: {
  title: string;
  score?: number;
  stats: Stat[];
  onPlayAgain: () => void;
  onDone: () => void;
}) {
  const colors = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <ScreenBackground>
      <View style={styles.container}>
        <View style={styles.top}>
          <LinearGradient colors={['#3D52C9', '#6E4D9C']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.trophy}>
            <AppIcon name="🏆" size={40} color="#FFFFFF" />
          </LinearGradient>
          <Text style={styles.done}>Nice work!</Text>
          <Text style={styles.subtitle}>{title} complete</Text>
        </View>

        <GlassCard style={styles.card} glowColor="purple">
          {typeof score === 'number' && (
            <View style={styles.scoreWrap}>
              <Text style={styles.scoreValue}>{score}</Text>
              <Text style={styles.scoreLabel}>SCORE</Text>
            </View>
          )}
          <View style={styles.statsRow}>
            {stats.map((s, i) => (
              <React.Fragment key={s.label}>
                {i > 0 && <View style={styles.divider} />}
                <View style={styles.stat}>
                  <Text style={styles.statValue}>{s.value}</Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </View>
              </React.Fragment>
            ))}
          </View>
        </GlassCard>

        <TouchableOpacity style={styles.primary} onPress={onPlayAgain} accessibilityRole="button" accessibilityLabel="Play again">
          <LinearGradient colors={['#3D52C9', '#6E4D9C']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.primaryGradient}>
            <Text style={styles.primaryText}>Play Again</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondary} onPress={onDone} accessibilityRole="button" accessibilityLabel="Back to Brain Gym">
          <Text style={styles.secondaryText}>Back to Brain Gym</Text>
        </TouchableOpacity>
      </View>
    </ScreenBackground>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  container: { flex: 1, paddingHorizontal: spacing.xl, paddingTop: 16, paddingBottom: 40, justifyContent: 'center' },
  top: { alignItems: 'center', marginBottom: 28 },
  trophy: { width: 88, height: 88, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  done: { fontSize: 28, fontWeight: '800', color: colors.textPrimary, letterSpacing: -0.8 },
  subtitle: { fontSize: 15, color: colors.textMuted, marginTop: 6 },
  card: { marginBottom: 28 },
  scoreWrap: { alignItems: 'center', marginBottom: 20, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  scoreValue: { fontSize: 52, fontWeight: '800', color: colors.cyan, letterSpacing: -1 },
  scoreLabel: { fontSize: 12, fontWeight: '700', color: colors.textSubtle, letterSpacing: 1.5 },
  statsRow: { flexDirection: 'row', alignItems: 'center' },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '800', color: colors.text },
  statLabel: { fontSize: 12, color: colors.textMuted, marginTop: 3 },
  divider: { width: 1, height: 30, backgroundColor: colors.borderLight },
  primary: { borderRadius: radii.md, overflow: 'hidden' },
  primaryGradient: { paddingVertical: 17, alignItems: 'center' },
  primaryText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  secondary: { paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  secondaryText: { fontSize: 15, color: colors.textMuted, fontWeight: '600' },
});
