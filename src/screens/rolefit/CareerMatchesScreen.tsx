import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { callEdgeFn } from '../../utils/supabase';
import { useToast } from '../../context/ToastContext';
import ScreenBackground from '../../components/ScreenBackground';
import GlassCard from '../../components/GlassCard';
import AppIcon from '../../components/AppIcon';
import { colors, radii, spacing, Palette } from '../../theme';
import { useTheme, useThemedStyles } from '../../context/ThemeContext';

interface Match {
  career: { id: string; title: string; category: string; description: string };
  matchScore: number;
  matchLevel: string;
  gaps?: { dimension: string }[];
}

function levelColor(score: number) {
  if (score >= 85) return colors.success;
  if (score >= 70) return colors.cyan;
  if (score >= 55) return colors.warning;
  return colors.coral;
}

export default function CareerMatchesScreen({ navigation }: any) {
  const colors = useTheme();
  const styles = useThemedStyles(makeStyles);
  const toast = useToast();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [needsProfile, setNeedsProfile] = useState(false);
  const [generating, setGenerating] = useState(false);

  const load = async () => {
    try {
      const data = await callEdgeFn('/career/matches');
      setMatches(data.matches ?? []);
    } catch {
      // none stored yet — try to generate from the profile
      await generate(true);
    } finally {
      setLoading(false);
    }
  };

  const generate = async (silent = false) => {
    if (!silent) setGenerating(true);
    try {
      const data = await callEdgeFn('/career/match', { method: 'POST', body: '{}' });
      setMatches(data.matches ?? []);
      setNeedsProfile(false);
      if (!silent) toast.success('Career matches updated');
    } catch (err: any) {
      // 400 → no cognitive profile yet
      if (String(err.message).toLowerCase().includes('profile')) setNeedsProfile(true);
      else if (!silent) toast.error('Could not generate matches');
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => { load(); }, []);

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
          <Text style={styles.title}>Career Matches</Text>
          <Text style={styles.subtitle}>Roles aligned to your cognitive profile</Text>
        </View>

        {loading ? (
          <View style={styles.centered}><ActivityIndicator size="large" color={colors.purple} /></View>
        ) : needsProfile ? (
          <GlassCard style={styles.empty}>
            <AppIcon name="🎯" size={40} color={colors.textSubtle} />
            <Text style={styles.emptyTitle}>Complete an assessment first</Text>
            <Text style={styles.emptyText}>
              Career matching uses your cognitive profile. Take an assessment, then come back to see your top 10 career fits.
            </Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.navigate('Main')}>
              <Text style={styles.emptyBtnText}>Go to Assessments →</Text>
            </TouchableOpacity>
          </GlassCard>
        ) : (
          <>
            {matches.map((m, i) => (
              <GlassCard key={m.career.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={styles.rankWrap}>
                    <Text style={styles.rank}>#{i + 1}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.careerTitle}>{m.career.title}</Text>
                    <Text style={styles.careerCat}>{m.career.category}</Text>
                  </View>
                  <View style={styles.scoreCol}>
                    <Text style={[styles.score, { color: levelColor(m.matchScore) }]}>{m.matchScore}</Text>
                    <Text style={[styles.level, { color: levelColor(m.matchScore) }]}>{m.matchLevel}</Text>
                  </View>
                </View>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { width: `${m.matchScore}%`, backgroundColor: levelColor(m.matchScore) }]} />
                </View>
                {m.gaps && m.gaps.length > 0 && (
                  <Text style={styles.gapText}>
                    Grow: {m.gaps.slice(0, 2).map((g) => g.dimension).join(', ')}
                  </Text>
                )}
              </GlassCard>
            ))}

            <TouchableOpacity style={styles.regen} onPress={() => generate(false)} disabled={generating}>
              {generating
                ? <ActivityIndicator color={colors.cyan} />
                : <Text style={styles.regenText}>↻ Regenerate from latest profile</Text>}
            </TouchableOpacity>

            <Text style={styles.disclaimer}>
              Note: Cognitive fit is one signal — not a substitute for skills, interests, or experience.
            </Text>
          </>
        )}
      </ScrollView>
    </ScreenBackground>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  scroll: { paddingTop: 8, paddingHorizontal: spacing.xl, paddingBottom: 120 },
  back: { width: 44, height: 44, justifyContent: 'center', marginBottom: 4 },
  header: { marginBottom: 20 },
  title: { fontSize: 30, fontWeight: '800', color: colors.textPrimary, letterSpacing: -1 },
  subtitle: { fontSize: 15, color: colors.textMuted, marginTop: 4 },
  centered: { paddingVertical: 60, alignItems: 'center' },
  empty: { alignItems: 'center', paddingVertical: 32, gap: 8 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: colors.text, marginTop: 8 },
  emptyText: { fontSize: 14, color: colors.textMuted, textAlign: 'center', lineHeight: 21, marginBottom: 8 },
  emptyBtn: { backgroundColor: colors.purple, paddingHorizontal: 20, paddingVertical: 12, borderRadius: radii.pill },
  emptyBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  card: { marginBottom: 12 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  rankWrap: { width: 34, height: 34, borderRadius: 10, backgroundColor: colors.bgTertiary, justifyContent: 'center', alignItems: 'center' },
  rank: { fontSize: 13, fontWeight: '800', color: colors.textMuted },
  careerTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  careerCat: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  scoreCol: { alignItems: 'flex-end' },
  score: { fontSize: 22, fontWeight: '800' },
  level: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  barTrack: { height: 6, backgroundColor: colors.bgTertiary, borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3 },
  gapText: { fontSize: 12, color: colors.textSubtle, marginTop: 10 },
  regen: { alignItems: 'center', paddingVertical: 16, marginTop: 8 },
  regenText: { fontSize: 14, color: colors.cyan, fontWeight: '700' },
  disclaimer: { fontSize: 11, color: colors.textSubtle, textAlign: 'center', lineHeight: 17, marginTop: 8 },
});
