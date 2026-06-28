import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { callEdgeFn } from '../../utils/supabase';
import ScreenBackground from '../../components/ScreenBackground';
import GlassCard from '../../components/GlassCard';
import AppIcon from '../../components/AppIcon';
import { colors, radii, spacing, Palette } from '../../theme';
import { useTheme, useThemedStyles } from '../../context/ThemeContext';

export default function MindHomeScreen({ navigation }: any) {
  const colors = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { user } = useAuth();
  const [todayDone, setTodayDone] = useState(false);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [lastCheckin, setLastCheckin] = useState<any>(null);

  useEffect(() => {
    loadCheckinStatus();
  }, []);

  const loadCheckinStatus = async () => {
    try {
      const data = await callEdgeFn(`/checkin/latest/${user?.id}`);
      if (data?.checkin) {
        const checkinDate = new Date(data.checkin.created_at).toDateString();
        const today = new Date().toDateString();
        setTodayDone(checkinDate === today);
        setLastCheckin(data.checkin);
      }
      setStreak(data?.streak ?? 0);
    } catch {
      // No check-ins yet
    } finally {
      setLoading(false);
    }
  };

  const emotionColors: Record<string, string> = {
    calm: colors.success,
    confident: colors.cyan,
    anxious: colors.warning,
    overwhelmed: colors.error,
    distracted: colors.textMuted,
  };

  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Mind</Text>
          <Text style={styles.subtitle}>Track your daily cognitive state</Text>
        </View>

        {/* Streak card */}
        <LinearGradient
          colors={['#14136E', '#2C2E83', '#6E4D9C']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.streakCard}
        >
          <View style={styles.streakContent}>
            <View>
              <Text style={styles.streakLabel}>CURRENT STREAK</Text>
              <View style={styles.streakValueRow}>
                <Text style={styles.streakValue}>{streak} days</Text>
                <AppIcon name="🔥" size={22} color="#FF9F43" />
              </View>
              <Text style={styles.streakSub}>Keep checking in daily!</Text>
            </View>
            <View style={styles.streakIcon}>
              <AppIcon name="🧠" size={28} color="#FFFFFF" />
            </View>
          </View>
        </LinearGradient>

        {/* Today's check-in */}
        <GlassCard style={styles.checkinCard}>
          <View style={styles.checkinHeader}>
            <Text style={styles.checkinTitle}>Daily Mind Check</Text>
            {todayDone && (
              <View style={styles.doneBadge}>
                <AppIcon name="✓" size={13} color={colors.success} />
                <Text style={styles.doneText}>Done</Text>
              </View>
            )}
          </View>
          <Text style={styles.checkinSub}>3 questions · Less than 1 minute</Text>

          {lastCheckin && todayDone && (
            <View style={styles.lastCheckin}>
              <View style={styles.lastRow}>
                <Text style={styles.lastLabel}>Focus score</Text>
                <Text style={styles.lastValue}>{lastCheckin.focus_score}/5</Text>
              </View>
              <View style={styles.lastRow}>
                <Text style={styles.lastLabel}>Emotion</Text>
                <Text style={[styles.lastValue, { color: emotionColors[lastCheckin.emotional_state] ?? colors.cyan }]}>
                  {lastCheckin.emotional_state}
                </Text>
              </View>
            </View>
          )}

          <TouchableOpacity
            style={[styles.checkinBtn, todayDone && styles.checkinBtnDisabled]}
            onPress={() => navigation.navigate('DailyCheckIntro')}
            disabled={todayDone}
          >
            <LinearGradient
              colors={todayDone ? [colors.bgTertiary, colors.bgTertiary] : ['#6E4D9C', '#3D52C9']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.checkinBtnGradient}
            >
              <Text style={[styles.checkinBtnText, todayDone && styles.checkinBtnTextDone]}>
                {todayDone ? 'Completed Today' : "Start Today's Check →"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </GlassCard>

        {/* Weekly Snapshot */}
        <GlassCard
          style={styles.snapshotCard}
          onPress={() => navigation.navigate('WeeklySnapshot')}
        >
          <View style={styles.snapshotRow}>
            <View style={styles.snapshotIconWrap}>
              <LinearGradient
                colors={['#3D52C9', '#2E3FA8']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.snapshotIconGradient}
              >
                <AppIcon name="📊" size={22} color="#FFFFFF" />
              </LinearGradient>
            </View>
            <View style={styles.snapshotText}>
              <Text style={styles.snapshotTitle}>Weekly Cognitive Snapshot</Text>
              <Text style={styles.snapshotSub}>7-day behavioral trends & insights</Text>
            </View>
            <Text style={styles.snapshotArrow}>→</Text>
          </View>
        </GlassCard>

        {/* 7-Day Dashboard */}
        <GlassCard
          style={styles.snapshotCard}
          onPress={() => navigation.navigate('BehavioralDashboard')}
        >
          <View style={styles.snapshotRow}>
            <View style={styles.snapshotIconWrap}>
              <LinearGradient
                colors={['#EC4899', '#DB2777']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.snapshotIconGradient}
              >
                <AppIcon name="📈" size={22} color="#FFFFFF" />
              </LinearGradient>
            </View>
            <View style={styles.snapshotText}>
              <Text style={styles.snapshotTitle}>7-Day Dashboard</Text>
              <Text style={styles.snapshotSub}>Focus trends & emotion distribution</Text>
            </View>
            <Text style={styles.snapshotArrow}>→</Text>
          </View>
        </GlassCard>

        {/* Brain Gym */}
        <GlassCard
          style={styles.snapshotCard}
          onPress={() => navigation.navigate('BrainGym')}
        >
          <View style={styles.snapshotRow}>
            <View style={styles.snapshotIconWrap}>
              <LinearGradient
                colors={['#3D52C9', '#6E4D9C']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.snapshotIconGradient}
              >
                <AppIcon name="🧩" size={22} color="#FFFFFF" />
              </LinearGradient>
            </View>
            <View style={styles.snapshotText}>
              <Text style={styles.snapshotTitle}>Brain Gym</Text>
              <Text style={styles.snapshotSub}>Memory, attention & focus mini-games</Text>
            </View>
            <Text style={styles.snapshotArrow}>→</Text>
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
  streakCard: { borderRadius: radii.xl, padding: 24, marginBottom: 20 },
  streakContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  streakLabel: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.6)', letterSpacing: 1.5, marginBottom: 6 },
  streakValueRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  streakValue: { fontSize: 28, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.5 },
  streakSub: { fontSize: 13, color: 'rgba(255,255,255,0.55)', marginTop: 4 },
  streakIcon: { width: 56, height: 56, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.12)', justifyContent: 'center', alignItems: 'center' },
  streakEmoji: { fontSize: 28 },
  checkinCard: { marginBottom: 16 },
  checkinHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  checkinTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  doneBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.successSoft, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radii.pill },
  doneText: { fontSize: 12, fontWeight: '700', color: colors.success },
  checkinSub: { fontSize: 13, color: colors.textMuted, marginBottom: 16 },
  lastCheckin: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: radii.sm, padding: 12, marginBottom: 16, gap: 8 },
  lastRow: { flexDirection: 'row', justifyContent: 'space-between' },
  lastLabel: { fontSize: 13, color: colors.textMuted },
  lastValue: { fontSize: 13, fontWeight: '700', color: colors.text },
  checkinBtn: { borderRadius: radii.md, overflow: 'hidden' },
  checkinBtnDisabled: { opacity: 0.6 },
  checkinBtnGradient: { paddingVertical: 14, alignItems: 'center' },
  checkinBtnText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  checkinBtnTextDone: { color: colors.textMuted },
  snapshotCard: { marginBottom: 14 },
  snapshotRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  snapshotIconWrap: {},
  snapshotIconGradient: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  snapshotIconText: { fontSize: 22 },
  snapshotText: { flex: 1 },
  snapshotTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  snapshotSub: { fontSize: 13, color: colors.textMuted, marginTop: 3 },
  snapshotArrow: { fontSize: 18, color: colors.textSubtle },
  bgTertiary: {},
});

const bgTertiary = colors.bgTertiary;
