/**
 * Network layer for the Cognitive Growth engine (src/utils/gamification.ts
 * has the pure logic). Server-first via the live, verified
 * GET /gamification/:userId + POST /gamification/update routes — a thin,
 * unvalidated KV passthrough — mirroring the fire-and-forget pattern
 * src/utils/brainGym.ts already uses (not the webapp's localStorage-primary
 * approach, which has no mobile precedent).
 */
import { callEdgeFn } from './supabase';
import { getAllAssessmentResults } from './api';
import {
  GamificationProfile, AwardResult, XP_RATES, emptyProfile, addXP, updateStreak, markProfileCompleteness,
  getLevelForXP,
} from './gamification';
import { fireLevelUpNotification, fireBadgeEarnedNotification } from './notifications';

export async function getGamificationProfile(userId: string): Promise<GamificationProfile> {
  try {
    const d = await callEdgeFn(`/gamification/${userId}`);
    return d?.profile ?? emptyProfile(userId);
  } catch {
    return emptyProfile(userId);
  }
}

async function saveGamificationProfile(profile: GamificationProfile): Promise<void> {
  try {
    await callEdgeFn('/gamification/update', { method: 'POST', body: JSON.stringify({ profile }) });
  } catch {
    // non-critical; ignore, matches src/utils/brainGym.ts's fire-and-forget pattern
  }
}

async function award(userId: string, xp: number, mutate?: (p: GamificationProfile) => void): Promise<AwardResult> {
  const profile = await getGamificationProfile(userId);
  updateStreak(profile);
  mutate?.(profile);
  const { leveledUp, newBadges } = addXP(profile, xp);
  profile.updatedAt = new Date().toISOString();
  await saveGamificationProfile(profile);

  // Immediate nudges — single choke point for every XP-granting flow, so
  // this is the one place that needs to know about level-ups/new badges
  // rather than every call site.
  if (leveledUp) {
    const level = getLevelForXP(profile.xp);
    fireLevelUpNotification(level.title, level.subtitle).catch(() => {});
  }
  newBadges.forEach((b) => fireBadgeEarnedNotification(b.name, b.description).catch(() => {}));

  return { profile, leveledUp, newBadges };
}

/**
 * Call after a successful assessment submission (core 3, Thinking Styles, or
 * Teaching Style). Fetches the fresh completed-types list itself so call
 * sites don't each need to track it — this fires right after a submit
 * succeeds, so the list is already up to date server-side.
 *
 * `exploration` bundles the one-time Thinking-Styles/Role-Fit bonus into
 * the *same* award() call rather than a second one — two independent
 * award() calls for the same event would each GET-mutate-POST
 * concurrently and race (the backend is a blind kv.set overwrite, not a
 * read-modify-write transaction), silently losing whichever write lands
 * first.
 */
export async function recordAssessmentCompletion(
  userId: string,
  exploration?: 'thinking-styles' | 'role-fit',
): Promise<AwardResult> {
  let completedTypes: string[] = [];
  try {
    const all = await getAllAssessmentResults();
    completedTypes = (all?.results ?? []).map((r: any) => r.assessmentType);
  } catch { /* profileComplete just won't update this time; non-critical */ }

  return award(userId, XP_RATES.assessmentComplete, (p) => {
    p.totalAssessments += 1;
    markProfileCompleteness(p, completedTypes);
    applyExplorationBonus(p, exploration);
  });
}

/** Call after a successful Brain Gym result save. */
export function recordBrainGymCompletion(userId: string): Promise<AwardResult> {
  return award(userId, XP_RATES.brainGymSession, (p) => { p.totalBrainGymSessions += 1; });
}

function applyExplorationBonus(p: GamificationProfile, exploration?: 'thinking-styles' | 'role-fit') {
  if (exploration === 'thinking-styles' && !p.thinkingStylesExplored) {
    p.thinkingStylesExplored = true; p.xp += XP_RATES.exploration;
  } else if (exploration === 'role-fit' && !p.roleFitExplored) {
    p.roleFitExplored = true; p.xp += XP_RATES.exploration;
  }
}

/** One-time exploration bonus, standalone — for triggers with no accompanying assessment completion (e.g. Role Fit). */
export function recordExploration(userId: string, exploration: 'thinking-styles' | 'role-fit'): Promise<AwardResult> {
  return award(userId, 0, (p) => applyExplorationBonus(p, exploration));
}
