import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

/**
 * Device-local data (check-ins, lesson plans, trackers) must be scoped to the
 * signed-in user, or accounts sharing a phone see each other's records.
 */
export async function scopedKey(base: string): Promise<string> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user?.id ? `${base}.${session.user.id}` : base;
  } catch {
    return base;
  }
}

/**
 * Read a user-scoped value. Data written before scoping existed lives under the
 * bare key; the first user to read adopts it (moved, so it is never shared).
 */
export async function readScoped(base: string): Promise<string | null> {
  const key = await scopedKey(base);
  const own = await AsyncStorage.getItem(key);
  if (own !== null || key === base) return own;
  const legacy = await AsyncStorage.getItem(base);
  if (legacy !== null) {
    await AsyncStorage.setItem(key, legacy);
    await AsyncStorage.removeItem(base);
  }
  return legacy;
}

export async function writeScoped(base: string, value: string): Promise<void> {
  await AsyncStorage.setItem(await scopedKey(base), value);
}
