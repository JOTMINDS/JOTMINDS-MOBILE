import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { getAllAssessmentResults } from '../../utils/api';
import { getGamificationProfile } from '../../utils/gamificationApi';
import { kidsStickers, stickersEarned } from '../../utils/kidsStickers';
import ScreenBackground from '../../components/ScreenBackground';
import ListenButton from '../../components/kids/ListenButton';
import { radii, spacing, Palette } from '../../theme';
import { useThemedStyles } from '../../context/ThemeContext';

/** The elementary sticker book: big pictures for what you have earned, and what to do for the rest. */
export default function KidsStickersScreen({ navigation }: any) {
  const styles = useThemedStyles(makeStyles);
  const { user } = useAuth();
  const [data, setData] = useState({ completedTypes: [] as string[], gamesPlayed: 0, streak: 0 });

  useEffect(() => {
    let live = true;
    const load = async () => {
      if (!user?.id) return;
      const [results, profile] = await Promise.all([
        getAllAssessmentResults().catch(() => ({ results: [] })),
        getGamificationProfile(user.id),
      ]);
      if (!live) return;
      setData({
        completedTypes: [...new Set<string>((results?.results ?? []).map((r: any) => r.assessmentType).filter(Boolean))],
        gamesPlayed: profile.totalBrainGymSessions,
        streak: profile.currentStreak,
      });
    };
    void load();
    const unsub = navigation?.addListener?.('focus', () => { void load(); });
    return () => { live = false; unsub?.(); };
  }, [user?.id, navigation]);

  const stickers = useMemo(() => kidsStickers(data), [data]);
  const earned = stickersEarned(stickers);
  const spoken = `You have ${earned} ${earned === 1 ? 'sticker' : 'stickers'}. ` +
    stickers.map((s) => (s.unlocked ? `${s.title}.` : `To get ${s.title}: ${s.howToUnlock}.`)).join(' ');

  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title} accessibilityRole="header">My Stickers</Text>
        <Text style={styles.count}>{earned} of {stickers.length}</Text>
        <ListenButton text={spoken} style={styles.listen} />

        <View style={styles.grid}>
          {stickers.map((s) => (
            <View
              key={s.id}
              style={styles.cell}
              accessible
              accessibilityLabel={s.unlocked ? `${s.title}, earned` : `${s.title}, locked. ${s.howToUnlock}`}
            >
              {s.unlocked ? (
                <LinearGradient colors={['#6E4D9C', '#3D52C9']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.sticker}>
                  <Text style={styles.emoji}>{s.emoji}</Text>
                  <Text style={styles.name}>{s.title}</Text>
                </LinearGradient>
              ) : (
                <View style={[styles.sticker, styles.locked]}>
                  <Text style={[styles.emoji, styles.dim]}>🔒</Text>
                  <Text style={styles.lockedName}>{s.howToUnlock}</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </ScreenBackground>
  );
}

const makeStyles = (c: Palette) => StyleSheet.create({
  scroll: { padding: spacing.xl, paddingBottom: 120 },
  title: { fontSize: 32, fontWeight: '900', color: c.textPrimary, textAlign: 'center' },
  count: { fontSize: 20, fontWeight: '800', color: c.textMuted, textAlign: 'center', marginTop: 4 },
  listen: { marginTop: spacing.lg, backgroundColor: c.purple },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: spacing.xl },
  cell: { flexBasis: '47%', flexGrow: 1, aspectRatio: 1 },
  sticker: { flex: 1, borderRadius: radii.xl, alignItems: 'center', justifyContent: 'center', padding: spacing.md },
  locked: { backgroundColor: c.glassMedium, borderWidth: 2, borderColor: c.borderLight, borderStyle: 'dashed' },
  emoji: { fontSize: 60 },
  dim: { opacity: 0.6 },
  name: { fontSize: 19, fontWeight: '900', color: '#FFFFFF', marginTop: spacing.sm, textAlign: 'center' },
  lockedName: { fontSize: 15, fontWeight: '700', color: c.textMuted, marginTop: spacing.sm, textAlign: 'center' },
});
