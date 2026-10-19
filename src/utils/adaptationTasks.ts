import { readScoped, writeScoped } from './userStorage';
import { consecutiveDayStreak } from './streaks';

/**
 * Daily micro-tasks derived from an Adaptation Plan's top gap areas.
 * Completion is tracked per user, per role, per local day, on-device.
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

/** Local calendar day (YYYY-MM-DD). Not toISOString(), which is UTC and rolls the day over at the wrong hour. */
export const dayStamp = (d: Date = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const completedKey = (rk: string) => `jotminds.adaptTasks.${rk}`;

interface Store { [date: string]: string[] } // date -> completed task ids

async function readStore(rk: string): Promise<Store> {
  try {
    const raw = await readScoped(completedKey(rk));
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
  await writeScoped(completedKey(rk), JSON.stringify(trimmed)); // throws; callers tell the user
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

/** Consecutive local days (ending today or yesterday) with at least one task completed. */
export async function getAdaptationStreak(rk: string): Promise<number> {
  const store = await readStore(rk);
  const days = Object.entries(store)
    .filter(([, ids]) => ids.length > 0)
    .map(([d]) => {
      const [y, m, day] = d.split('-').map(Number);
      return new Date(y, m - 1, day, 12).toISOString();
    });
  return consecutiveDayStreak(days);
}
