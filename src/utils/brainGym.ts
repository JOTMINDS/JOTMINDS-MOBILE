import { callEdgeFn } from './supabase';

export type BrainGame = 'memory-match' | 'n-back' | 'stroop';

export interface BrainGymResult {
  game: BrainGame;
  score: number;
  durationMs?: number;
  accuracy?: number; // 0-1
}

/** Save a game result. Fire-and-forget — never blocks gameplay UX. */
export async function saveBrainGymResult(result: BrainGymResult): Promise<void> {
  try {
    await callEdgeFn('/brain-gym', { method: 'POST', body: JSON.stringify(result) });
  } catch {
    // non-critical; ignore (could be queued via outbox later)
  }
}

export async function getBrainGymStats(): Promise<{ bests: Record<string, number>; plays: number }> {
  try {
    const d = await callEdgeFn('/brain-gym');
    return { bests: d?.bests ?? {}, plays: d?.plays ?? 0 };
  } catch {
    return { bests: {}, plays: 0 };
  }
}
