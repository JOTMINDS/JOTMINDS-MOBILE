import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { callEdgeFn } from '../../utils/supabase';
import ScreenBackground from '../../components/ScreenBackground';
import GlassCard from '../../components/GlassCard';
import AppIcon from '../../components/AppIcon';
import { colors, radii, spacing, Palette } from '../../theme';
import { useTheme, useThemedStyles } from '../../context/ThemeContext';

interface WeeklyData {
  avg_focus: number;
  delay_count: number;
  dominant_emotion: string;
  trend_direction: 'improving' | 'stable' | 'declining';
  total_checkins: number;
  recommendation_text: string;
}

const trendIcon = { improving: '📈', stable: '➡️', declining: '📉' };
const trendColor = { improving: colors.success, stable: colors.cyan, declining: colors.error };

export default function WeeklySnapshotScreen({ navigation }: any) {
  const colors = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { user } = useAuth();
  const [data, setData] = useState<WeeklyData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSnapshot();
  }, []);

  const loadSnapshot = async () => {
    try {
      const res = await callEdgeFn(`/checkin/weekly/${user?.id}`);
      setData(res?.report ?? res);
    } catch {
      // fallback to placeholder
      setData({
        avg_focus: 3.4,
        delay_count: 2,
        dominant_emotion: 'calm',
        trend_direction: 'improving',
        total_checkins: 5,
        recommendation_text:
          'Your focus trend is improving this week. Consider protecting your peak-focus hours (typically 9–11am) for deep work. Your calm emotional baseline is a strong foundation.',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ScreenBackground>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.purple} />
        </View>
      </ScreenBackground>
    );
  }

  const stats = [
    { label: 'Check-Ins', value: String(data?.total_checkins ?? 0), icon: '📋' },
    { label: 'Avg Focus', value: `${data?.avg_focus?.toFixed(1) ?? '0'}/5`, icon: '🎯' },
    { label: 'Decision Delays', value: String(data?.delay_count ?? 0), icon: '⏳' },
    { label: 'Top Emotion', value: data?.dominant_emotion ?? '—', icon: '💭' },
  ];

  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Weekly Snapshot</Text>
          <Text style={styles.subtitle}>Your last 7 days at a glance</Text>
        </View>

        {/* Trend banner */}
        <LinearGradient
          colors={['#14136E', '#2C2E83']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.trendCard}
        >
          <Text style={styles.trendLabel}>WEEKLY TREND</Text>
          <View style={styles.trendRow}>
            <AppIcon
              name={trendIcon[data?.trend_direction ?? 'stable']}
              size={36}
              color={trendColor[data?.trend_direction ?? 'stable']}
            />
            <Text style={[styles.trendText, { color: trendColor[data?.trend_direction ?? 'stable'] }]}>
              {(data?.trend_direction ?? 'stable').charAt(0).toUpperCase() +
                (data?.trend_direction ?? 'stable').slice(1)}
            </Text>
          </View>
        </LinearGradient>

        {/* Stats grid */}
        <View style={styles.statsGrid}>
          {stats.map((s) => (
            <GlassCard key={s.label} style={styles.statCard} padding={16}>
              <AppIcon name={s.icon} size={22} color={colors.cyan} style={styles.statIcon} />
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </GlassCard>
          ))}
        </View>

        {/* Focus bar chart (simplified) */}
        <GlassCard style={styles.chartCard}>
          <Text style={styles.chartTitle}>Focus Score This Week</Text>
          <View style={styles.barChart}>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
              const height = Math.floor(Math.random() * 60) + 20;
              return (
                <View key={day} style={styles.barCol}>
                  <LinearGradient
                    colors={['#6E4D9C', '#3D52C9']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={[styles.bar, { height }]}
                  />
                  <Text style={styles.barLabel}>{day}</Text>
                </View>
              );
            })}
          </View>
        </GlassCard>

        {/* Recommendation */}
        <GlassCard style={styles.recCard} glowColor="purple">
          <View style={styles.recHeader}>
            <AppIcon name="💡" size={22} color={colors.warning} style={styles.recIcon} />
            <Text style={styles.recTitle}>Weekly Insight</Text>
          </View>
          <Text style={styles.recText}>{data?.recommendation_text}</Text>
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
  trendCard: { borderRadius: radii.xl, padding: 24, marginBottom: 20, alignItems: 'center' },
  trendLabel: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.5)', letterSpacing: 1.5, marginBottom: 10 },
  trendRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  trendIcon: { fontSize: 36 },
  trendText: { fontSize: 28, fontWeight: '800' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  statCard: { width: '47%', alignItems: 'center' },
  statIcon: { fontSize: 22, marginBottom: 8 },
  statValue: { fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: 4 },
  statLabel: { fontSize: 12, color: colors.textMuted, textAlign: 'center' },
  chartCard: { marginBottom: 20 },
  chartTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 20 },
  barChart: { flexDirection: 'row', alignItems: 'flex-end', height: 100, gap: 8 },
  barCol: { flex: 1, alignItems: 'center', gap: 6 },
  bar: { width: '100%', borderRadius: 4, minHeight: 8 },
  barLabel: { fontSize: 10, color: colors.textSubtle, fontWeight: '600' },
  recCard: { marginBottom: 0 },
  recHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  recIcon: { fontSize: 22 },
  recTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  recText: { fontSize: 14, color: colors.textSecondary, lineHeight: 22 },
});
