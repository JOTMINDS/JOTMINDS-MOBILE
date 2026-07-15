import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getLast7Days, DayEntry } from '../../utils/mindCheckins';
import ScreenBackground from '../../components/ScreenBackground';
import GlassCard from '../../components/GlassCard';
import { colors, radii, spacing, Palette } from '../../theme';
import { useTheme, useThemedStyles } from '../../context/ThemeContext';

const EMOTION_COLORS: Record<string, string> = {
  calm: colors.success,
  confident: colors.cyan,
  anxious: colors.warning,
  overwhelmed: colors.error,
  distracted: colors.textMuted,
};

export default function BehavioralDashboardScreen({ navigation }: any) {
  const colors = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [days, setDays] = useState<DayEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLast7Days().then(setDays).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <ScreenBackground>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.purple} />
        </View>
      </ScreenBackground>
    );
  }

  // Count emotion distribution
  const emotionCounts: Record<string, number> = {};
  days.forEach((d) => {
    if (d.checkin) emotionCounts[d.checkin.emotional_state] = (emotionCounts[d.checkin.emotional_state] ?? 0) + 1;
  });

  const maxCount = Math.max(...Object.values(emotionCounts), 1);

  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>7-Day Dashboard</Text>
          <Text style={styles.subtitle}>Behavioral patterns this week</Text>
        </View>

        {/* Focus trend */}
        <GlassCard style={styles.card}>
          <Text style={styles.cardTitle}>Focus Score Trend</Text>
          <Text style={styles.cardSub}>Daily performance over 7 days</Text>
          <View style={styles.focusChart}>
            {days.map((d, i) => {
              const score = d.checkin?.focus_score ?? 0;
              const height = (score / 5) * 80;
              return (
                <View key={i} style={styles.focusBarCol}>
                  <Text style={styles.focusScore}>{d.checkin ? score : '—'}</Text>
                  <LinearGradient
                    colors={score >= 4 ? ['#10B981', '#059669'] : score >= 3 ? ['#6E4D9C', '#5A3E82'] : ['#EF4444', '#DC2626']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={[styles.focusBar, { height: Math.max(height, 8) }]}
                  />
                  <Text style={styles.focusDay}>{d.label}</Text>
                </View>
              );
            })}
          </View>
        </GlassCard>

        {/* Emotion distribution */}
        <GlassCard style={styles.card}>
          <Text style={styles.cardTitle}>Emotion Distribution</Text>
          <Text style={styles.cardSub}>How you felt across check-ins</Text>
          {Object.entries(emotionCounts).map(([emotion, count]) => (
            <View key={emotion} style={styles.emotionRow}>
              <Text style={styles.emotionName}>
                {emotion.charAt(0).toUpperCase() + emotion.slice(1)}
              </Text>
              <View style={styles.emotionBarTrack}>
                <View
                  style={[
                    styles.emotionBarFill,
                    {
                      width: `${(count / maxCount) * 100}%`,
                      backgroundColor: EMOTION_COLORS[emotion] ?? colors.purple,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.emotionCount, { color: EMOTION_COLORS[emotion] ?? colors.purple }]}>
                {count}x
              </Text>
            </View>
          ))}
          {Object.keys(emotionCounts).length === 0 && (
            <Text style={styles.emptyText}>No check-ins yet this week</Text>
          )}
        </GlassCard>

        {/* Decision delays */}
        <GlassCard style={styles.card}>
          <Text style={styles.cardTitle}>Decision Delay Log</Text>
          <View style={styles.delayRow}>
            {days.map((d, i) => (
              <View key={i} style={styles.delayCol}>
                <View
                  style={[
                    styles.delayDot,
                    {
                      backgroundColor: !d.checkin
                        ? colors.bgTertiary
                        : d.checkin.decision_delay
                        ? colors.error
                        : colors.success,
                    },
                  ]}
                />
                <Text style={styles.delayDay}>{d.label}</Text>
              </View>
            ))}
          </View>
          <View style={styles.delayLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
              <Text style={styles.legendText}>No delay</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.error }]} />
              <Text style={styles.legendText}>Delayed</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.bgTertiary }]} />
              <Text style={styles.legendText}>No data</Text>
            </View>
          </View>
        </GlassCard>
      </ScrollView>
    </ScreenBackground>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  scroll: { paddingTop: 8, paddingHorizontal: spacing.xl, paddingBottom: 120 },
  header: { marginBottom: 24 },
  title: { fontSize: 32, fontWeight: '800', color: colors.textPrimary, letterSpacing: -1 },
  subtitle: { fontSize: 15, color: colors.textMuted, marginTop: 4 },
  card: { marginBottom: 16 },
  cardTitle: { fontSize: 17, fontWeight: '700', color: colors.text, marginBottom: 4 },
  cardSub: { fontSize: 13, color: colors.textMuted, marginBottom: 20 },
  focusChart: { flexDirection: 'row', alignItems: 'flex-end', height: 120, gap: 8 },
  focusBarCol: { flex: 1, alignItems: 'center', gap: 4 },
  focusScore: { fontSize: 11, fontWeight: '700', color: colors.textSubtle },
  focusBar: { width: '100%', borderRadius: 4, minHeight: 8 },
  focusDay: { fontSize: 10, color: colors.textSubtle, fontWeight: '600' },
  emotionRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  emotionName: { width: 90, fontSize: 13, color: colors.text, fontWeight: '600' },
  emotionBarTrack: { flex: 1, height: 10, backgroundColor: colors.bgTertiary, borderRadius: 5, overflow: 'hidden' },
  emotionBarFill: { height: '100%', borderRadius: 5 },
  emotionCount: { fontSize: 12, fontWeight: '700', width: 28, textAlign: 'right' },
  emptyText: { fontSize: 14, color: colors.textMuted, textAlign: 'center', paddingVertical: 16 },
  delayRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  delayCol: { alignItems: 'center', gap: 6 },
  delayDot: { width: 28, height: 28, borderRadius: 14 },
  delayDay: { fontSize: 10, color: colors.textSubtle, fontWeight: '600' },
  delayLegend: { flexDirection: 'row', gap: 20, justifyContent: 'center' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 11, color: colors.textMuted },
});
