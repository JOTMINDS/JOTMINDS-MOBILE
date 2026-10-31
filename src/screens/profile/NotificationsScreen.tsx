import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Switch, Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useToast } from '../../context/ToastContext';
import {
  getReminderPref, setDailyReminder, DEFAULT_REMINDER, ReminderPref,
} from '../../utils/notifications';
import ScreenBackground from '../../components/ScreenBackground';
import GlassCard from '../../components/GlassCard';
import AppIcon from '../../components/AppIcon';
import NudgeFeed from '../../components/NudgeFeed';
import { useAuth } from '../../context/AuthContext';
import { getGamificationProfile } from '../../utils/gamificationApi';
import { getStreak } from '../../utils/mindCheckins';
import { accountNotices, resourcePicks } from '../../utils/notificationPanel';
import { discoverAudience } from '../../data/discoverContent';
import { assessmentBand } from '../../utils/assessmentBand';
import { TAB_ROUTES } from '../../navigation/jottiFab';
import { colors, radii, spacing, Palette } from '../../theme';
import { useTheme, useThemedStyles } from '../../context/ThemeContext';

function formatTime(hour: number, minute: number): string {
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  const ampm = hour < 12 ? 'AM' : 'PM';
  return `${h12}:${String(minute).padStart(2, '0')} ${ampm}`;
}

export default function NotificationsScreen({ navigation }: any) {
  const colors = useTheme();
  const styles = useThemedStyles(makeStyles);
  const toast = useToast();
  const [pref, setPref] = useState<ReminderPref>(DEFAULT_REMINDER);
  const [showTime, setShowTime] = useState(false);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const [week, setWeek] = useState<{ streak: number; mind: number; assessments: number } | null>(null);

  useEffect(() => { getReminderPref().then(setPref); }, []);

  useEffect(() => {
    if (!user?.id) return;
    Promise.all([getGamificationProfile(user.id), getStreak()])
      .then(([p, mind]) => setWeek({ streak: p.currentStreak, mind, assessments: p.totalAssessments }))
      .catch(() => {});
  }, [user?.id]);

  const notices = accountNotices(user);
  const reads = resourcePicks(discoverAudience(user?.role, assessmentBand(user)), 2);
  // Tabs live inside Main, so a notice that points at one has to go through it.
  const open = (route: string, params?: Record<string, any>) =>
    TAB_ROUTES.has(route) ? navigation.navigate('Main', { screen: route }) : navigation.navigate(route, params);

  const apply = async (next: ReminderPref) => {
    setSaving(true);
    const effective = await setDailyReminder(next);
    setPref(effective);
    setSaving(false);
    if (next.enabled && !effective.enabled) {
      toast.error('Enable notifications in your device settings to get reminders.');
    } else if (effective.enabled) {
      toast.success(`Daily reminder set for ${formatTime(effective.hour, effective.minute)}`);
    } else {
      toast.info('Daily reminder turned off');
    }
  };

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
          <Text style={styles.title}>Notifications</Text>
          <Text style={styles.subtitle}>Your updates in one place</Text>
        </View>

        <NudgeFeed limit={6} />

        {week && (
          <>
            <Text style={styles.sectionLabel}>YOUR WEEK</Text>
            <GlassCard padding={16} style={styles.row}>
              <View style={styles.weekRow}>
                {[
                  { n: week.streak, l: 'Day streak' },
                  { n: week.mind, l: 'Mind streak' },
                  { n: week.assessments, l: 'Assessments' },
                ].map((w) => (
                  <View key={w.l} style={styles.weekStat}>
                    <Text style={styles.weekNum}>{w.n}</Text>
                    <Text style={styles.weekLabel}>{w.l}</Text>
                  </View>
                ))}
              </View>
            </GlassCard>
          </>
        )}

        {notices.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>ACCOUNT</Text>
            {notices.map((n) => (
              <GlassCard key={n.id} padding={14} style={styles.row} onPress={() => open(n.route, n.params)}>
                <View style={styles.rowInner}>
                  <AppIcon name={n.icon} size={20} color={colors.purpleSoft} />
                  <Text style={[styles.rowTitle, { flex: 1, marginBottom: 0 }]}>{n.title}</Text>
                  <AppIcon name="arrow-forward" size={16} color={colors.purple} />
                </View>
              </GlassCard>
            ))}
          </>
        )}

        {reads.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>WORTH A READ</Text>
            {reads.map((r) => (
              <GlassCard key={r.id} padding={14} style={styles.row} onPress={() => navigation.navigate('InsightDetail', { insight: r })}>
                <View style={styles.rowInner}>
                  <AppIcon name={r.icon} size={20} color={colors.purpleSoft} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.rowTitle, { marginBottom: 0 }]}>{r.title}</Text>
                    <Text style={styles.rowDesc}>{r.readTime} read</Text>
                  </View>
                  <AppIcon name="arrow-forward" size={16} color={colors.purple} />
                </View>
              </GlassCard>
            ))}
          </>
        )}

        <Text style={styles.sectionLabel}>REMINDERS</Text>

        <GlassCard style={styles.row}>
          <View style={styles.rowInner}>
            <View style={[styles.iconWrap, { backgroundColor: `${colors.purple}22` }]}>
              <AppIcon name="🧠" size={22} color={colors.purpleSoft} />
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Daily Mind Check reminder</Text>
              <Text style={styles.rowDesc}>A once-a-day nudge to log your focus and mood.</Text>
            </View>
            <Switch
              value={pref.enabled}
              disabled={saving}
              onValueChange={(v) => apply({ ...pref, enabled: v })}
              trackColor={{ false: colors.bgTertiary, true: colors.purple }}
              thumbColor="#FFFFFF"
              ios_backgroundColor={colors.bgTertiary}
            />
          </View>

          {pref.enabled && (
            <TouchableOpacity
              style={styles.timeRow}
              onPress={() => setShowTime(true)}
              accessibilityRole="button"
              accessibilityLabel={`Reminder time ${formatTime(pref.hour, pref.minute)}. Tap to change`}
            >
              <Text style={styles.timeLabel}>Reminder time</Text>
              <View style={styles.timeValueWrap}>
                <Text style={styles.timeValue}>{formatTime(pref.hour, pref.minute)}</Text>
                <AppIcon name="arrow-forward" size={16} color={colors.cyan} />
              </View>
            </TouchableOpacity>
          )}
        </GlassCard>

        {showTime && (
          <DateTimePicker
            value={new Date(2000, 0, 1, pref.hour, pref.minute)}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selected) => {
              setShowTime(Platform.OS === 'ios');
              if (event.type === 'set' && selected) {
                apply({ ...pref, enabled: true, hour: selected.getHours(), minute: selected.getMinutes() });
              }
            }}
          />
        )}

        <View style={styles.note}>
          <AppIcon name="💡" size={16} color={colors.textSubtle} />
          <Text style={styles.noteText}>
            Also covers streak and badge reminders. Change permissions in device settings.
          </Text>
        </View>
      </ScrollView>
    </ScreenBackground>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  scroll: { paddingTop: 8, paddingHorizontal: spacing.xl, paddingBottom: 120 },
  back: { width: 44, height: 44, justifyContent: 'center', marginBottom: 4 },
  header: { marginBottom: 24 },
  title: { fontSize: 30, fontWeight: '800', color: colors.textPrimary, letterSpacing: -1 },
  subtitle: { fontSize: 15, color: colors.textMuted, marginTop: 4 },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: colors.textSubtle, letterSpacing: 1.4, marginTop: 12, marginBottom: 10 },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between' },
  weekStat: { flex: 1, alignItems: 'center' },
  weekNum: { fontSize: 26, fontWeight: '800', color: colors.purpleSoft },
  weekLabel: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  row: { marginBottom: 12 },
  rowInner: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  iconWrap: { width: 44, height: 44, borderRadius: 13, justifyContent: 'center', alignItems: 'center' },
  rowText: { flex: 1 },
  rowTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 3 },
  rowDesc: { fontSize: 13, color: colors.textMuted, lineHeight: 19 },
  timeRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.borderLight,
  },
  timeLabel: { fontSize: 15, color: colors.textSecondary, fontWeight: '600' },
  timeValueWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  timeValue: { fontSize: 15, fontWeight: '700', color: colors.cyan },
  note: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', marginTop: 16, paddingHorizontal: 4 },
  noteText: { flex: 1, fontSize: 12, color: colors.textSubtle, lineHeight: 18 },
});
