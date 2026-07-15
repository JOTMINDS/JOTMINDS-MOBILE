import { callEdgeFn, supabase } from './supabase';
import { recordBrainGymCompletion } from './gamificationApi';

export type BrainGame = 'memory-match' | 'n-back' | 'stroop';

export interface BrainGymResult {
  game: BrainGame;
  score: number;
  durationMs?: number;
  accuracy?: number; // 0-1
}

/**
 * Save a game result. Fire-and-forget — never blocks gameplay UX. Also
 * awards Cognitive Growth XP; done here (not in each game screen) so
 * MemoryMatchScreen/NBackScreen/StroopScreen don't each need their own
 * useAuth() wiring for something orthogonal to gameplay.
 */
export async function saveBrainGymResult(result: BrainGymResult): Promise<void> {
  try {
    await callEdgeFn('/brain-gym', { method: 'POST', body: JSON.stringify(result) });
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.id) recordBrainGymCompletion(session.user.id).catch(() => {});
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
