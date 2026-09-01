import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import GlassCard from './GlassCard';
import AppIcon from './AppIcon';
import { useAuth } from '../context/AuthContext';
import { useAppNavigation } from '../navigation/types';
import { getGamificationProfile } from '../utils/gamificationApi';
import { getAllAssessmentResults } from '../utils/api';
import { getDailyChallengeProgress } from '../utils/dailyChallengeApi';
import { getActiveNudges, dismissNudge, Nudge } from '../utils/nudges';
import { rs } from '../utils/responsive';
import { radii, spacing, Palette } from '../theme';
import { useThemedStyles } from '../context/ThemeContext';

/**
 * Dashboard nudge feed. Fetches its own inputs (gamification profile,
 * assessment completion, daily-challenge status), builds the nudge list,
 * and renders dismissible cards. Renders nothing when there's nothing to say.
 */
export default function NudgeFeed({ limit = 2 }: { limit?: number }) {
  const { user } = useAuth();
  const navigation = useAppNavigation();
  const styles = useThemedStyles(makeStyles);
  const [nudges, setNudges] = useState<Nudge[]>([]);

  const load = useCallback(async () => {
    if (!user?.id) return;
    const [profile, assessments, challenge] = await Promise.all([
      getGamificationProfile(user.id),
      getAllAssessmentResults().catch(() => ({ results: [] })),
      getDailyChallengeProgress(user.id).catch(() => null),
    ]);
    const completedTypes = (assessments?.results ?? []).map((r: any) => r.assessmentType);
    const list = await getActiveNudges({
      profile,
      completedTypes,
      dailyChallengeDoneToday: challenge ? challenge.todayCompleted : undefined,
      lastActiveISO: profile.lastActiveDate,
    });
    setNudges(list);
  }, [user?.id]);

  useEffect(() => {
    load();
    const unsub = navigation?.addListener?.('focus', load);
    return unsub;
  }, [load, navigation]);

  const handleDismiss = async (id: string) => {
    setNudges((cur) => cur.filter((n) => n.id !== id));
    await dismissNudge(id);
  };

  if (nudges.length === 0) return null;

  return (
    <View style={styles.wrap}>
      {nudges.slice(0, limit).map((n) => (
        <GlassCard key={n.id} padding={14} style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.icon}>{n.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{n.title}</Text>
              <Text style={styles.message}>{n.message}</Text>
              {n.action && (
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => (navigation as any).navigate(n.action!.route, n.action!.params)}
                  accessibilityRole="button"
                  accessibilityLabel={n.action.label}
                >
                  <Text style={styles.actionText}>{n.action.label} →</Text>
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity
              onPress={() => handleDismiss(n.id)}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Dismiss"
            >
              <AppIcon name="✕" size={15} color={styles.dismissColor.color} />
            </TouchableOpacity>
          </View>
        </GlassCard>
      ))}
    </View>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  wrap: { marginBottom: spacing.lg, gap: spacing.sm },
  card: {},
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  icon: { fontSize: rs(18), marginTop: 1 },
  title: { fontSize: rs(14), fontWeight: '800', color: colors.textPrimary },
  message: { fontSize: rs(12), color: colors.textMuted, lineHeight: rs(17), marginTop: 2 },
  actionBtn: { marginTop: 8, alignSelf: 'flex-start' },
  actionText: { fontSize: rs(12), fontWeight: '800', color: colors.cyan },
  dismissColor: { color: colors.textMuted },
});
