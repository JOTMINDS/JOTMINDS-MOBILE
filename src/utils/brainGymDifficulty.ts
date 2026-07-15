/**
 * Brain Gym difficulty tiers — client-side only. The deployed /brain-gym
 * backend route only persists {game, score, durationMs, accuracy} (extra
 * fields are silently dropped) and its "best score" aggregation loops over
 * a hardcoded server-side GAMES = ['memory-match','n-back','stroop'], so a
 * new game value like 'memory-match-hard' would save but never appear in
 * bests. Difficulty therefore only changes gameplay parameters client-side;
 * per-difficulty bests are tracked locally. The single server-synced best
 * (src/utils/brainGym.ts's getBrainGymStats) is untouched.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BrainGame } from './brainGym';

export type Difficulty = 'easy' | 'normal' | 'hard';

export const DIFFICULTIES: Difficulty[] = ['easy', 'normal', 'hard'];

/** Cognitive Growth level required to unlock each tier. */
export const DIFFICULTY_UNLOCK_LEVEL: Record<Difficulty, number> = { easy: 1, normal: 3, hard: 6 };

export function isDifficultyUnlocked(difficulty: Difficulty, level: number): boolean {
  return level >= DIFFICULTY_UNLOCK_LEVEL[difficulty];
}

export interface MemoryMatchParams { pairs: number }
export interface NBackParams { n: number; intervalMs: number }
export interface StroopParams { colorCount: number; incongruentRate: number; trials: number }

export const MEMORY_MATCH_PARAMS: Record<Difficulty, MemoryMatchParams> = {
  easy: { pairs: 6 }, normal: { pairs: 8 }, hard: { pairs: 10 },
};

export const N_BACK_PARAMS: Record<Difficulty, NBackParams> = {
  easy: { n: 1, intervalMs: 2200 }, normal: { n: 2, intervalMs: 1800 }, hard: { n: 3, intervalMs: 1400 },
};

export const STROOP_PARAMS: Record<Difficulty, StroopParams> = {
  easy: { colorCount: 4, incongruentRate: 0.7, trials: 12 },
  normal: { colorCount: 5, incongruentRate: 0.8, trials: 16 },
  hard: { colorCount: 6, incongruentRate: 0.9, trials: 20 },
};

const STORAGE_KEY = 'jotminds.braingym.bests';

async function readBests(): Promise<Record<string, number>> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export async function getDifficultyBests(): Promise<Record<string, number>> {
  return readBests();
}

export async function saveDifficultyBest(game: BrainGame, difficulty: Difficulty, score: number): Promise<void> {
  try {
    const bests = await readBests();
    const key = `${game}:${difficulty}`;
    if (!bests[key] || score > bests[key]) {
      bests[key] = score;
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(bests));
    }
  } catch {
    // non-critical; local-only stat
  }
}
