/**
 * Coaching Pathways progress — client-side only, per child per pathway.
 * Low-stakes checkbox state; no backend route exists for it and adding one
 * just to sync a weekly checklist isn't worth expanding the shared backend's
 * surface for. Mirrors the local-progress pattern already established in
 * src/utils/brainGymDifficulty.ts.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'jotminds.coaching.progress';

type ProgressMap = Record<string, Record<string, number[]>>; // childId -> pathwayId -> completed week indices

async function readProgress(): Promise<ProgressMap> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export async function getPathwayProgress(childId: string, pathwayId: string): Promise<number[]> {
  const all = await readProgress();
  return all[childId]?.[pathwayId] ?? [];
}

export async function toggleWeekComplete(childId: string, pathwayId: string, weekIndex: number): Promise<number[]> {
  try {
    const all = await readProgress();
    const current = all[childId]?.[pathwayId] ?? [];
    const next = current.includes(weekIndex)
      ? current.filter((w) => w !== weekIndex)
      : [...current, weekIndex].sort((a, b) => a - b);

    all[childId] = { ...(all[childId] ?? {}), [pathwayId]: next };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    return next;
  } catch {
    return getPathwayProgress(childId, pathwayId);
  }
}
