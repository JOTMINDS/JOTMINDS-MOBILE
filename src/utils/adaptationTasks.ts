import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Daily micro-tasks derived from an Adaptation Plan's top gap areas.
 * Completion is tracked per role, per day, on-device.
 *
 * A "role key" is a slug of the role name so tasks for "Product Manager" and
 * "Data Analyst" track independently.
 */

export interface DailyTask {
  id: string;      // stable: `${roleKey}:${dim}:${idx}`
  focus: string;   // e.g. "Analytical Depth"
  icon: string;
  text: string;
}

export const roleKey = (roleName: string) =>
  roleName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');

const dayStamp = () => new Date().toISOString().slice(0, 10);
const completedKey = (rk: string) => `jotminds.adaptTasks.${rk}`;

interface Store { [date: string]: string[] } // date -> completed task ids

async function readStore(rk: string): Promise<Store> {
  try {
    const raw = await AsyncStorage.getItem(completedKey(rk));
    return raw ? (JSON.parse(raw) as Store) : {};
  } catch {
    return {};
  }
}

async function writeStore(rk: string, store: Store): Promise<void> {
  // keep only the last 60 days
  const dates = Object.keys(store).sort().slice(-60);
  const trimmed: Store = {};
  dates.forEach((d) => { trimmed[d] = store[d]; });
  await AsyncStorage.setItem(completedKey(rk), JSON.stringify(trimmed)).catch(() => {});
}

/** One rotating task per gap dimension — rotates by day so it doesn't feel stale. */
export function buildDailyTasks(
  rk: string,
  gapDims: { dim: string; focus: string; icon: string; actions: string[] }[],
): DailyTask[] {
  const dayIndex = Math.floor(Date.now() / 86_400_000);
  return gapDims.map(({ dim, focus, icon, actions }) => {
    const idx = actions.length ? dayIndex % actions.length : 0;
    return { id: `${rk}:${dim}:${idx}`, focus, icon, text: actions[idx] ?? focus };
  });
}

export async function getCompletedToday(rk: string): Promise<Set<string>> {
  const store = await readStore(rk);
  return new Set(store[dayStamp()] ?? []);
}

export async function toggleTaskDone(rk: string, taskId: string): Promise<Set<string>> {
  const store = await readStore(rk);
  const today = dayStamp();
  const set = new Set(store[today] ?? []);
  set.has(taskId) ? set.delete(taskId) : set.add(taskId);
  store[today] = [...set];
  await writeStore(rk, store);
  return set;
}

/** Consecutive days (ending today or yesterday) with at least one task completed. */
export async function getAdaptationStreak(rk: string): Promise<number> {
  const store = await readStore(rk);
  const done = new Set(Object.entries(store).filter(([, ids]) => ids.length > 0).map(([d]) => d));
  if (done.size === 0) return 0;

  const today = new Date();
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  if (!done.has(iso(today))) {
    today.setDate(today.getDate() - 1);
    if (!done.has(iso(today))) return 0;
  }
  let streak = 0;
  const cursor = new Date(today);
  while (done.has(iso(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
