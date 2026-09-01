/**
 * Daily Challenge network layer. The /daily-challenge/* routes are already
 * deployed on the shared edge function (server owns streak/points/badges in
 * the KV store under `daily_challenge:{userId}`) — mobile just calls them.
 */
import { callEdgeFn } from './supabase';

export interface ChallengeProgress {
  currentStreak: number;
  longestStreak: number;
  totalPoints: number;
  badges: string[];
  completedDays: string[];
  lastCompletedDate: string | null;
  todayCompleted: boolean;
  notificationFrequency: 'daily' | 'weekly' | 'monthly' | 'off';
}

const EMPTY: ChallengeProgress = {
  currentStreak: 0,
  longestStreak: 0,
  totalPoints: 0,
  badges: [],
  completedDays: [],
  lastCompletedDate: null,
  todayCompleted: false,
  notificationFrequency: 'daily',
};

export async function getDailyChallengeProgress(userId: string): Promise<ChallengeProgress> {
  try {
    const d = await callEdgeFn(`/daily-challenge/progress/${userId}`);
    return d?.progress ?? EMPTY;
  } catch {
    return EMPTY;
  }
}

export async function completeDailyChallenge(
  userId: string,
  challengeId: string,
  response: any,
): Promise<{ pointsEarned: number; newBadges: string[]; updatedProgress: ChallengeProgress }> {
  const d = await callEdgeFn('/daily-challenge/complete', {
    method: 'POST',
    body: JSON.stringify({ userId, challengeId, response, completedAt: new Date().toISOString() }),
  });
  return {
    pointsEarned: d?.pointsEarned ?? 0,
    newBadges: d?.newBadges ?? [],
    updatedProgress: d?.updatedProgress ?? EMPTY,
  };
}
