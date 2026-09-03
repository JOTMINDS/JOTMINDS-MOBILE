import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenBackground from '../../components/ScreenBackground';
import GlassCard from '../../components/GlassCard';
import { useAuth } from '../../context/AuthContext';
import {
  getLeaderboard, submitLeaderboardScore, LeaderboardView,
} from '../../utils/leaderboardApi';
import { rs } from '../../utils/responsive';
import { radii, spacing, Palette } from '../../theme';
import { useTheme, useThemedStyles } from '../../context/ThemeContext';

const medal = (rank: number) => (rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `${rank}`);

export default function LeaderboardScreen({ navigation }: any) {
  const colors = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { user } = useAuth();

  const [scope, setScope] = useState<'global' | 'class'>('global');
  const [view, setView] = useState<LeaderboardView | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (s: 'global' | 'class') => {
    setLoading(true);
    // Make sure our own score is current before reading the board.
    await submitLeaderboardScore(user?.name, user?.className);
    setView(await getLeaderboard(s));
    setLoading(false);
  }, [user?.name, user?.className]);

  useEffect(() => { load(scope); }, [scope, load]);

  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10} style={styles.backRow}>
          <Text style={styles.backText}>← Brain Gym</Text>
        </TouchableOpacity>
        <Text style={styles.h1}>Leaderboard</Text>
        <Text style={styles.meta}>Combined best score across all Brain Gym games.</Text>

        <View style={styles.toggle}>
          {(['global', 'class'] as const).map((s) => (
            <TouchableOpacity
              key={s}
              style={[styles.toggleOpt, scope === s && styles.toggleOptOn]}
              onPress={() => setScope(s)}
            >
              <Text style={[styles.toggleText, scope === s && styles.toggleTextOn]}>
                {s === 'global' ? 'Global' : 'My Class'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {view?.myRank != null && (
          <LinearGradient
            colors={['#3D52C9', '#6E4D9C']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.myCard}
          >
            <Text style={styles.myLabel}>YOUR RANK</Text>
            <View style={styles.myRow}>
              <Text style={styles.myRank}>#{view.myRank}</Text>
              <Text style={styles.myPoints}>{view.myPoints} pts</Text>
            </View>
            <Text style={styles.mySub}>of {view.total} players{scope === 'class' && view.className ? ` in ${view.className}` : ''}</Text>
          </LinearGradient>
        )}

        {loading ? (
          <ActivityIndicator style={{ marginTop: 40 }} size="large" color={colors.purple} />
        ) : !view || view.entries.length === 0 ? (
          <GlassCard variant="dark" padding={24} style={styles.card}>
            <Text style={styles.emptyText}>
              {scope === 'class' && !view?.className
                ? "You're not in a class yet — ask your teacher to add you."
                : 'No scores yet. Play a Brain Gym game to get on the board.'}
            </Text>
          </GlassCard>
        ) : (
          view.entries.map((e) => (
            <View key={e.rank} style={[styles.row, e.isMe && styles.rowMe]}>
              <Text style={[styles.rowRank, e.rank <= 3 && styles.rowRankTop]}>{medal(e.rank)}</Text>
              <Text style={[styles.rowInitials, e.isMe && styles.rowMeText]}>
                {e.initials}{e.isMe ? '  (you)' : ''}
              </Text>
              <Text style={[styles.rowPoints, e.isMe && styles.rowMeText]}>{e.points}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </ScreenBackground>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  scroll: { paddingHorizontal: spacing.xl, paddingTop: 12, paddingBottom: 48 },
  backRow: { marginBottom: 10 },
  backText: { fontSize: rs(14), color: colors.textMuted, fontWeight: '600' },
  h1: { fontSize: rs(24), fontWeight: '800', color: colors.text, letterSpacing: -0.5, marginBottom: 6 },
  meta: { fontSize: rs(13), color: colors.textMuted, marginBottom: 16 },

  toggle: {
    flexDirection: 'row', backgroundColor: colors.glassMedium, borderRadius: radii.md,
    borderWidth: 1, borderColor: colors.borderLight, padding: 4, marginBottom: 16,
  },
  toggleOpt: { flex: 1, paddingVertical: 10, borderRadius: radii.sm, alignItems: 'center' },
  toggleOptOn: { backgroundColor: colors.purple },
  toggleText: { fontSize: rs(13), fontWeight: '700', color: colors.textMuted },
  toggleTextOn: { color: '#fff' },

  myCard: { borderRadius: radii.lg, padding: 18, marginBottom: 16 },
  myLabel: { color: 'rgba(255,255,255,0.75)', fontSize: rs(10), fontWeight: '800', letterSpacing: 1.5 },
  myRow: { flexDirection: 'row', alignItems: 'baseline', gap: 12, marginTop: 6 },
  myRank: { color: '#fff', fontSize: rs(32), fontWeight: '900' },
  myPoints: { color: 'rgba(255,255,255,0.9)', fontSize: rs(15), fontWeight: '700' },
  mySub: { color: 'rgba(255,255,255,0.7)', fontSize: rs(12), marginTop: 2 },

  card: { marginTop: 8 },
  emptyText: { fontSize: rs(13), color: colors.textMuted, lineHeight: rs(20) },

  row: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingVertical: 13, paddingHorizontal: 14, borderRadius: radii.md, marginBottom: 6,
    backgroundColor: colors.glassMedium, borderWidth: 1, borderColor: colors.borderLight,
  },
  rowMe: { borderColor: colors.purple, backgroundColor: `${colors.purple}18` },
  rowRank: { width: 34, fontSize: rs(14), fontWeight: '800', color: colors.textMuted, textAlign: 'center' },
  rowRankTop: { fontSize: rs(18) },
  rowInitials: { flex: 1, fontSize: rs(15), fontWeight: '800', color: colors.text, letterSpacing: 1 },
  rowPoints: { fontSize: rs(15), fontWeight: '800', color: colors.cyan },
  rowMeText: { color: colors.text },
});
