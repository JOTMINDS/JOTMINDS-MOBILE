import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PREF_KEY = 'jotminds.reminder';
const REMINDER_ID_KEY = 'jotminds.reminder.id';
const STREAK_ID_KEY = 'jotminds.nudge.streak.id';
const STREAK_DATE_KEY = 'jotminds.nudge.streak.date'; // date it was last (re)scheduled for
const PROFILE_ID_KEY = 'jotminds.nudge.profile.id';

export interface ReminderPref {
  enabled: boolean;
  hour: number;   // 0-23
  minute: number; // 0-59
}

export const DEFAULT_REMINDER: ReminderPref = { enabled: false, hour: 19, minute: 0 };

// Foreground display behaviour
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function getReminderPref(): Promise<ReminderPref> {
  try {
    const raw = await AsyncStorage.getItem(PREF_KEY);
    return raw ? { ...DEFAULT_REMINDER, ...JSON.parse(raw) } : DEFAULT_REMINDER;
  } catch {
    return DEFAULT_REMINDER;
  }
}

async function ensurePermission(): Promise<boolean> {
  const settings = await Notifications.getPermissionsAsync();
  if (settings.granted || settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) {
    return true;
  }
  const req = await Notifications.requestPermissionsAsync();
  return req.granted;
}

/**
 * Read-only permission check — for the event-driven nudges below, which
 * should silently no-op if permission was never granted, or if the user has
 * switched the Notifications toggle off, rather than prompting. Only the
 * explicit Settings toggle (setDailyReminder, via ensurePermission) should
 * ever trigger the OS permission dialog. Also honors the in-app toggle so
 * that turning it off silences every nudge, not just the Daily Mind Check.
 */
async function hasPermission(): Promise<boolean> {
  const pref = await getReminderPref();
  if (!pref.enabled) return false;
  const settings = await Notifications.getPermissionsAsync();
  return settings.granted || settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
}

async function cancelScheduled(idKey: string) {
  try {
    const id = await AsyncStorage.getItem(idKey);
    if (id) await Notifications.cancelScheduledNotificationAsync(id);
    await AsyncStorage.removeItem(idKey);
  } catch {
    // ignore
  }
}

const cancelExisting = () => cancelScheduled(REMINDER_ID_KEY);

/**
 * Enable/disable the daily "Mind Check" reminder. Returns the effective pref
 * (enabled may be false if permission was denied).
 */
export async function setDailyReminder(pref: ReminderPref): Promise<ReminderPref> {
  await cancelExisting();

  if (!pref.enabled) {
    await AsyncStorage.setItem(PREF_KEY, JSON.stringify({ ...pref, enabled: false }));
    return { ...pref, enabled: false };
  }

  const ok = await ensurePermission();
  if (!ok) {
    await AsyncStorage.setItem(PREF_KEY, JSON.stringify({ ...pref, enabled: false }));
    return { ...pref, enabled: false };
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('daily-reminder', {
      name: 'Daily Mind Check',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Your Daily Mind Check 🧠',
      body: 'Take 60 seconds to log your focus and mood — keep your streak alive.',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: pref.hour,
      minute: pref.minute,
    },
  });

  await AsyncStorage.setItem(REMINDER_ID_KEY, id);
  await AsyncStorage.setItem(PREF_KEY, JSON.stringify({ ...pref, enabled: true }));
  return { ...pref, enabled: true };
}

// ── Smart nudges ─────────────────────────────────────────────────────────
// Re-evaluated on app load (see AssessmentListScreen) using real state —
// the Cognitive Growth streak/profile-completeness this session's
// gamification work introduced — instead of the webapp's in-app nudge feed
// (nudgeSystem.ts), which is driven by a separate localStorage engagement
// tracker with no mobile equivalent. Silently no-ops without permission;
// gated by the same toggle as the daily reminder (hasPermission()).

/**
 * If the user has an active streak and hasn't been notified today, schedule
 * a one-time evening reminder to keep it alive. Skipped once it's already
 * past that time today (no point nudging about a deadline that's passed),
 * and cancelled outright once the streak drops to 0.
 */
export async function scheduleStreakReminder(currentStreak: number): Promise<void> {
  if (!(await hasPermission())) return;
  const today = new Date().toISOString().slice(0, 10);
  const lastScheduledFor = await AsyncStorage.getItem(STREAK_DATE_KEY);

  if (currentStreak <= 0) {
    await cancelScheduled(STREAK_ID_KEY);
    await AsyncStorage.removeItem(STREAK_DATE_KEY);
    return;
  }
  if (lastScheduledFor === today) return; // already scheduled for today

  await cancelScheduled(STREAK_ID_KEY);
  const target = new Date();
  target.setHours(20, 0, 0, 0);
  if (target.getTime() <= Date.now()) return; // 8pm already passed today

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: `${currentStreak} Day Streak! 🔥`,
      body: "Keep it alive — complete an assessment or a Brain Gym game before the day's out.",
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: target },
  });
  await AsyncStorage.setItem(STREAK_ID_KEY, id);
  await AsyncStorage.setItem(STREAK_DATE_KEY, today);
}

/**
 * If the Core Profile (Learning/Thinking/Decision) isn't complete, schedule
 * a reminder a couple of days out — re-scheduling every app open would just
 * keep pushing it back, so this only fires again once the previous one
 * would have already landed.
 */
export async function scheduleProfileCompletionReminder(missingCount: number): Promise<void> {
  if (!(await hasPermission())) return;

  if (missingCount <= 0) {
    await cancelScheduled(PROFILE_ID_KEY);
    return;
  }

  const existingId = await AsyncStorage.getItem(PROFILE_ID_KEY);
  if (existingId) return; // one is already pending; let it land before scheduling another

  const target = new Date(Date.now() + 2 * 86400000);
  target.setHours(11, 0, 0, 0);

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Your Cognitive Profile is waiting 🧠',
      body: `You're ${missingCount} assessment${missingCount > 1 ? 's' : ''} away from your full profile — and unlocking the Thinking Styles bonus.`,
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: target },
  });
  await AsyncStorage.setItem(PROFILE_ID_KEY, id);
}

/** Immediate (not scheduled) — fire right when a level-up is detected. */
export async function fireLevelUpNotification(levelTitle: string, levelSubtitle: string): Promise<void> {
  if (!(await hasPermission())) return;
  try {
    await Notifications.scheduleNotificationAsync({
      content: { title: 'Level Up! ⚡', body: `You've reached ${levelTitle} — ${levelSubtitle}` },
      trigger: null,
    });
  } catch {
    // non-critical
  }
}

/** Immediate (not scheduled) — fire right when a new badge is earned. */
export async function fireBadgeEarnedNotification(badgeName: string, badgeDescription: string): Promise<void> {
  if (!(await hasPermission())) return;
  try {
    await Notifications.scheduleNotificationAsync({
      content: { title: `New Badge: ${badgeName} 🏆`, body: badgeDescription },
      trigger: null,
    });
  } catch {
    // non-critical
  }
}
