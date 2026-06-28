import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PREF_KEY = 'jotminds.reminder';
const REMINDER_ID_KEY = 'jotminds.reminder.id';

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

async function cancelExisting() {
  try {
    const id = await AsyncStorage.getItem(REMINDER_ID_KEY);
    if (id) await Notifications.cancelScheduledNotificationAsync(id);
    await AsyncStorage.removeItem(REMINDER_ID_KEY);
  } catch {
    // ignore
  }
}

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
