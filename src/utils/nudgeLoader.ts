import { getGamificationProfile } from './gamificationApi';
import { getAllAssessmentResults } from './api';
import { getDailyChallengeProgress } from './dailyChallengeApi';
import { getActiveNudges, Nudge } from './nudges';

/**
 * Gathers the inputs for the in-app nudge list and builds it. The dashboard
 * feed and the header bell both need the same list, so a load started within
 * SHARE_MS is reused rather than fetched twice.
 */
const SHARE_MS = 5000;
let recent: { userId: string; at: number; promise: Promise<Nudge[]> } | null = null;

export function loadActiveNudges(userId: string): Promise<Nudge[]> {
  if (recent && recent.userId === userId && Date.now() - recent.at < SHARE_MS) return recent.promise;

  const promise = (async () => {
    const [profile, assessments, challenge] = await Promise.all([
      getGamificationProfile(userId),
      getAllAssessmentResults().catch(() => ({ results: [] })),
      getDailyChallengeProgress(userId).catch(() => null),
    ]);
    const completedTypes = (assessments?.results ?? []).map((r: any) => r.assessmentType);
    return getActiveNudges({
      profile,
      completedTypes,
      dailyChallengeDoneToday: challenge ? challenge.todayCompleted : undefined,
      lastActiveISO: profile.lastActiveDate,
    });
  })();

  const entry = { userId, at: Date.now(), promise };
  recent = entry;
  // A failed load must not be served again for the rest of the window.
  promise.catch(() => { if (recent === entry) recent = null; });
  return promise;
}

/** Call after a nudge is dismissed so the next load reflects it. */
export function invalidateNudges(): void {
  recent = null;
}
