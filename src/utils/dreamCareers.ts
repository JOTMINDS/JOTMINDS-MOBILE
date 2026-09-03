import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * The user's shortlist of target careers ("dream careers"). Stored on-device
 * as an ordered list of GLOBAL_CAREERS ids, capped at 5. Role Fit uses it to
 * recommend training/tools aligned to where the user *wants* to go, not just
 * where the assessment points.
 */
const KEY = 'jotminds.dreamCareers';
export const MAX_DREAM_CAREERS = 5;

export async function getDreamCareers(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

async function write(ids: string[]): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(ids.slice(0, MAX_DREAM_CAREERS))).catch(() => {});
}

export async function addDreamCareer(id: string): Promise<string[]> {
  const cur = await getDreamCareers();
  if (cur.includes(id) || cur.length >= MAX_DREAM_CAREERS) return cur;
  const next = [...cur, id];
  await write(next);
  return next;
}

export async function removeDreamCareer(id: string): Promise<string[]> {
  const next = (await getDreamCareers()).filter((x) => x !== id);
  await write(next);
  return next;
}

export async function toggleDreamCareer(id: string): Promise<string[]> {
  const cur = await getDreamCareers();
  return cur.includes(id) ? removeDreamCareer(id) : addDreamCareer(id);
}
