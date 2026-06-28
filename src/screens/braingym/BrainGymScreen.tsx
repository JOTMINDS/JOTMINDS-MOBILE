import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getBrainGymStats } from '../../utils/brainGym';
import ScreenBackground from '../../components/ScreenBackground';
import GlassCard from '../../components/GlassCard';
import AppIcon from '../../components/AppIcon';
import { colors, radii, spacing } from '../../theme';

const GAMES = [
  {
    key: 'memory-match', route: 'MemoryMatch', title: 'Memory Match',
    desc: 'Flip and match pairs. Trains working memory.',
    icon: '🧩', gradient: ['#3D52C9', '#2E3FA8'] as [string, string], statKey: 'memory-match',
  },
  {
    key: 'n-back', route: 'NBack', title: 'N-Back',
    desc: 'Spot when a letter repeats. Trains attention & recall.',
    icon: '🧠', gradient: ['#6E4D9C', '#5A3E82'] as [string, string], statKey: 'n-back',
  },
  {
    key: 'stroop', route: 'Stroop', title: 'Stroop Task',
    desc: 'Name the ink colour, not the word. Trains focus.',
    icon: '🎨', gradient: ['#EC4899', '#DB2777'] as [string, string], statKey: 'stroop',
  },
];

export default function BrainGymScreen({ navigation }: any) {
  const [bests, setBests] = useState<Record<string, number>>({});
  const [plays, setPlays] = useState(0);

  const load = () => getBrainGymStats().then((s) => { setBests(s.bests); setPlays(s.plays); });
  useEffect(() => {
    const unsub = navigation.addListener('focus', load);
    return unsub;
  }, [navigation]);

  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <TouchableOpacity
          style={styles.back}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <AppIcon name="arrow-back" size={22} color={colors.textMuted} />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Brain Gym</Text>
          <Text style={styles.subtitle}>Quick games that train how you think</Text>
        </View>

        <LinearGradient
          colors={['#14136E', '#2C2E83']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.statCard}
        >
          <Text style={styles.statValue}>{plays}</Text>
          <Text style={styles.statLabel}>games played</Text>
        </LinearGradient>

        {GAMES.map((g) => (
          <TouchableOpacity
            key={g.key}
            activeOpacity={0.88}
            onPress={() => navigation.navigate(g.route)}
            accessibilityRole="button"
            accessibilityLabel={`Play ${g.title}`}
          >
            <GlassCard style={styles.gameCard}>
              <View style={styles.gameRow}>
                <LinearGradient colors={g.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gameIcon}>
                  <AppIcon name={g.icon} size={24} color="#FFFFFF" />
                </LinearGradient>
                <View style={styles.gameText}>
                  <Text style={styles.gameTitle}>{g.title}</Text>
                  <Text style={styles.gameDesc}>{g.desc}</Text>
                </View>
                <View style={styles.gameBest}>
                  <Text style={styles.gameBestValue}>{bests[g.statKey] ?? 0}</Text>
                  <Text style={styles.gameBestLabel}>best</Text>
                </View>
              </View>
            </GlassCard>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingTop: 56, paddingHorizontal: spacing.xl, paddingBottom: 120 },
  back: { width: 44, height: 44, justifyContent: 'center', marginBottom: 4 },
  header: { marginBottom: 20 },
  title: { fontSize: 30, fontWeight: '800', color: colors.textPrimary, letterSpacing: -1 },
  subtitle: { fontSize: 15, color: colors.textMuted, marginTop: 4 },
  statCard: { borderRadius: radii.xl, padding: 22, marginBottom: 20, alignItems: 'center' },
  statValue: { fontSize: 34, fontWeight: '800', color: '#FFFFFF' },
  statLabel: { fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  gameCard: { marginBottom: 14 },
  gameRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  gameIcon: { width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  gameText: { flex: 1 },
  gameTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  gameDesc: { fontSize: 13, color: colors.textMuted, marginTop: 3, lineHeight: 18 },
  gameBest: { alignItems: 'center' },
  gameBestValue: { fontSize: 20, fontWeight: '800', color: colors.cyan },
  gameBestLabel: { fontSize: 10, color: colors.textSubtle },
});
