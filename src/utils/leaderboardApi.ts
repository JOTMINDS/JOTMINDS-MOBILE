import { callEdgeFn } from './supabase';
import { getBrainGymStats } from './brainGym';

/**
 * Brain Gym leaderboard. One combined score per user = the sum of their best
 * score across all games. Identities are initials only.
 */

export interface LeaderboardEntry {
  rank: number;
  initials: string;
  points: number;
  isMe: boolean;
}

export interface LeaderboardView {
  scope: 'global' | 'class';
  className: string | null;
  total: number;
  entries: LeaderboardEntry[];
  myRank: number | null;
  myPoints: number | null;
}

/** "Ama Serwaa Boateng" -> "ASB" (max 3). Falls back to "??". */
export function initialsFor(name: string | undefined): string {
  const parts = String(name ?? '').trim().split(/\s+/).filter(Boolean);
  const s = parts.map((p) => p[0]).join('').replace(/[^A-Za-z]/g, '').toUpperCase().slice(0, 3);
  return s || '??';
}

/** Sum of best scores across all games — the ranked metric. */
export async function computeBrainGymPoints(): Promise<number> {
  const { bests } = await getBrainGymStats();
  return Object.values(bests).reduce((sum, v) => sum + (Number(v) || 0), 0);
}

/** Push the caller's current combined score. Fire-and-forget; the server keeps the max. */
export async function submitLeaderboardScore(
  name: string | undefined,
  className?: string | null,
): Promise<void> {
  try {
    const points = await computeBrainGymPoints();
    if (points <= 0) return;
    await callEdgeFn('/leaderboard', {
      method: 'POST',
      body: JSON.stringify({ points, initials: initialsFor(name), className: className ?? undefined }),
    });
  } catch {
    // non-critical
  }
}

export async function getLeaderboard(scope: 'global' | 'class'): Promise<LeaderboardView | null> {
  try {
    return await callEdgeFn(`/leaderboard?scope=${scope}`);
  } catch {
    return null;
  }
}
