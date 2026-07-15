/**
 * Cognitive Growth engine — pure logic, no RN/network imports (unit
 * testable, same pattern as scoring.ts/roleFitEngine.ts). Unifies the
 * webapp's two separate, overlapping leveling systems (gamification.ts's
 * badges/levels/streak-insurance, and cognitiveXP.ts's narrative levels
 * used for school/teacher-facing growth display) into one mobile system.
 * Theme unlocks are dropped entirely (not a reward type this app uses).
 * The network layer (get/save profile, the record* entry points screens
 * actually call) lives in src/utils/gamificationApi.ts.
 */
import { missingCognitiveDomains } from './profileCompleteness';

// ── Levels (verbatim from webapp's cognitiveXP.ts COGNITIVE_LEVELS — the
// narrative naming is what makes "visible growth score" actually readable,
// vs. gamification.ts's plain "Level 7") ──────────────────────────────────
export interface GamificationLevel {
  level: number; title: string; subtitle: string; minXP: number; maxXP: number; color: string; icon: string;
}

export const LEVELS: GamificationLevel[] = [
  { level: 1, title: 'Cognitive Seedling', subtitle: 'Just sprouting', minXP: 0, maxXP: 500, color: '#10b981', icon: '🌱' },
  { level: 2, title: 'Curious Thinker', subtitle: 'Questions everything', minXP: 500, maxXP: 1200, color: '#3b82f6', icon: '🔍' },
  { level: 3, title: 'Pattern Seeker', subtitle: 'Connects the dots', minXP: 1200, maxXP: 2200, color: '#8b5cf6', icon: '🧩' },
  { level: 4, title: 'Mind Mapper', subtitle: 'Charts new territory', minXP: 2200, maxXP: 3500, color: '#f59e0b', icon: '🗺️' },
  { level: 5, title: 'Strategy Builder', subtitle: 'Plans with precision', minXP: 3500, maxXP: 5000, color: '#ef4444', icon: '⚡' },
  { level: 6, title: 'Insight Architect', subtitle: 'Designs understanding', minXP: 5000, maxXP: 7000, color: '#06b6d4', icon: '🏛️' },
  { level: 7, title: 'Neural Navigator', subtitle: 'Masters complexity', minXP: 7000, maxXP: 9500, color: '#ec4899', icon: '🧭' },
  { level: 8, title: 'Cognitive Catalyst', subtitle: 'Sparks transformation', minXP: 9500, maxXP: 12500, color: '#f97316', icon: '💎' },
  { level: 9, title: 'Wisdom Weaver', subtitle: 'Synthesizes mastery', minXP: 12500, maxXP: 16000, color: '#a855f7', icon: '🌟' },
  { level: 10, title: 'Cognitive Sage', subtitle: 'The pinnacle of growth', minXP: 16000, maxXP: Infinity, color: '#fbbf24', icon: '👑' },
];

export function getLevelForXP(xp: number): GamificationLevel {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXP) return LEVELS[i];
  }
  return LEVELS[0];
}

export function getXPProgress(xp: number): { percentage: number; xpToNext: number; level: GamificationLevel } {
  const level = getLevelForXP(xp);
  if (level.level === LEVELS.length) return { percentage: 100, xpToNext: 0, level };
  const percentage = Math.min(99, Math.round(((xp - level.minXP) / (level.maxXP - level.minXP)) * 100));
  return { percentage, xpToNext: level.maxXP - xp, level };
}

// ── XP amounts (cognitiveXP.ts's fixed XP_RATES — preferred over
// gamification.ts's design of awarding the raw Brain Gym score as XP,
// which would let a single high-scoring game dwarf assessment completion) ──
export const XP_RATES = {
  assessmentComplete: 150,
  brainGymSession: 50,
  badgeEarned: 25,
  exploration: 25, // one-time bonus for trying Role Fit / Thinking Styles for the first time
};

// ── Badges — pruned from webapp's 60-badge BADGE_LIBRARY to only what
// mobile has real counters for. Dropped: skill_plan_* (Skill Builder is
// mock data), career_favorites/career_explorer (no such actions exist in
// CareerMatchesScreen), ai_coach_* (no AI coach), weekly/daily challenge
// badges (that system isn't part of this port). ─────────────────────────
export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface Badge {
  id: string; name: string; description: string; icon: string; rarity: BadgeRarity;
  unlockedAt?: string;
}

interface BadgeDef extends Omit<Badge, 'unlockedAt'> {
  isEarned: (p: GamificationProfile) => boolean;
}

const BADGE_LIBRARY: BadgeDef[] = [
  { id: 'streak_3', name: 'Spark', description: '3-day streak', icon: '✨', rarity: 'common', isEarned: (p) => p.longestStreak >= 3 },
  { id: 'streak_7', name: 'On Fire', description: '7-day streak', icon: '🔥', rarity: 'rare', isEarned: (p) => p.longestStreak >= 7 },
  { id: 'streak_14', name: 'Unstoppable', description: '14-day streak', icon: '💪', rarity: 'epic', isEarned: (p) => p.longestStreak >= 14 },
  { id: 'streak_30', name: 'Legend', description: '30-day streak', icon: '👑', rarity: 'legendary', isEarned: (p) => p.longestStreak >= 30 },
  { id: 'assessments_1', name: 'First Step', description: 'Complete your first assessment', icon: '🎯', rarity: 'common', isEarned: (p) => p.totalAssessments >= 1 },
  { id: 'profile_complete', name: 'Triple Thinker', description: 'Complete your full Core Profile', icon: '🧠', rarity: 'rare', isEarned: (p) => p.profileComplete },
  { id: 'assessments_5', name: 'Deep Diver', description: 'Complete 5 assessments', icon: '🏊', rarity: 'rare', isEarned: (p) => p.totalAssessments >= 5 },
  { id: 'assessments_10', name: 'Assessment Master', description: 'Complete 10 assessments', icon: '🏆', rarity: 'epic', isEarned: (p) => p.totalAssessments >= 10 },
  { id: 'brain_gym_10', name: 'Brain Trainer', description: '10 Brain Gym sessions', icon: '🏋️', rarity: 'common', isEarned: (p) => p.totalBrainGymSessions >= 10 },
  { id: 'brain_gym_25', name: 'Mind Athlete', description: '25 Brain Gym sessions', icon: '🥇', rarity: 'rare', isEarned: (p) => p.totalBrainGymSessions >= 25 },
  { id: 'brain_gym_50', name: 'Cognitive Champion', description: '50 Brain Gym sessions', icon: '🏅', rarity: 'epic', isEarned: (p) => p.totalBrainGymSessions >= 50 },
  { id: 'xp_500', name: 'Rising', description: 'Reach 500 XP', icon: '⭐', rarity: 'common', isEarned: (p) => p.xp >= 500 },
  { id: 'xp_2500', name: 'Momentum', description: 'Reach 2,500 XP', icon: '🌟', rarity: 'rare', isEarned: (p) => p.xp >= 2500 },
  { id: 'xp_10000', name: 'Powerhouse', description: 'Reach 10,000 XP', icon: '💥', rarity: 'epic', isEarned: (p) => p.xp >= 10000 },
  { id: 'level_5', name: 'Halfway There', description: 'Reach Level 5 — Strategy Builder', icon: '🎗️', rarity: 'rare', isEarned: (p) => p.level >= 5 },
  { id: 'level_10', name: 'Cognitive Sage', description: 'Reach Level 10 — the top', icon: '👑', rarity: 'legendary', isEarned: (p) => p.level >= 10 },
  { id: 'thinking_styles_unlocked', name: 'Adventurer', description: 'Unlock the Thinking Styles bonus assessment', icon: '🎨', rarity: 'rare', isEarned: (p) => p.thinkingStylesExplored },
  { id: 'role_fit_explored', name: 'Career Scout', description: 'Run your first Role Fit match', icon: '🧭', rarity: 'common', isEarned: (p) => p.roleFitExplored },
  { id: 'early_bird', name: 'Early Bird', description: 'Complete an activity before 7am', icon: '🌅', rarity: 'common', isEarned: (p) => p.earlyBird },
  { id: 'night_owl', name: 'Night Owl', description: 'Complete an activity after 10pm', icon: '🌙', rarity: 'common', isEarned: (p) => p.nightOwl },
];

/** Plain metadata for every badge (no isEarned closures) — for rendering the full badge grid including locked ones. */
export const ALL_BADGES: Omit<Badge, 'unlockedAt'>[] = BADGE_LIBRARY.map(({ isEarned, ...b }) => b);

export interface GamificationProfile {
  userId: string;
  xp: number;
  level: number;
  badges: Badge[];
  currentStreak: number;
  longestStreak: number;
  lastActiveDate?: string; // YYYY-MM-DD
  streakInsurance: { available: number; total: number; lastUsed?: string };
  totalAssessments: number;
  totalBrainGymSessions: number;
  profileComplete: boolean;
  thinkingStylesExplored: boolean;
  roleFitExplored: boolean;
  earlyBird: boolean;
  nightOwl: boolean;
  updatedAt: string;
}

export function emptyProfile(userId: string): GamificationProfile {
  return {
    userId, xp: 0, level: 1, badges: [],
    currentStreak: 0, longestStreak: 0,
    streakInsurance: { available: 0, total: 0 },
    totalAssessments: 0, totalBrainGymSessions: 0,
    profileComplete: false, thinkingStylesExplored: false, roleFitExplored: false,
    earlyBird: false, nightOwl: false,
    updatedAt: new Date().toISOString(),
  };
}

export function checkForNewBadges(profile: GamificationProfile): Badge[] {
  const earnedIds = new Set(profile.badges.map((b) => b.id));
  const newBadges: Badge[] = [];
  for (const def of BADGE_LIBRARY) {
    if (earnedIds.has(def.id)) continue;
    if (def.isEarned(profile)) {
      const { isEarned, ...badge } = def;
      newBadges.push({ ...badge, unlockedAt: new Date().toISOString() });
    }
  }
  return newBadges;
}

/** Level-up + streak-insurance-grant on reaching level 5 (mirrors webapp's reward-string-triggered grant). */
export function addXP(profile: GamificationProfile, amount: number): { leveledUp: boolean; newBadges: Badge[] } {
  const oldLevel = profile.level;
  profile.xp += amount;
  profile.level = getLevelForXP(profile.xp).level;
  const leveledUp = profile.level > oldLevel;
  if (leveledUp && profile.level === 5) {
    profile.streakInsurance.available += 1;
    profile.streakInsurance.total += 1;
  }

  const newBadges = checkForNewBadges(profile);
  if (newBadges.length > 0) {
    profile.badges.push(...newBadges);
    profile.xp += newBadges.length * XP_RATES.badgeEarned;
    profile.level = getLevelForXP(profile.xp).level;
  }

  const hour = new Date().getHours();
  if (hour < 7) profile.earlyBird = true;
  if (hour >= 22) profile.nightOwl = true;

  return { leveledUp, newBadges };
}

/** Consecutive-calendar-day streak, consuming a streak-insurance token to preserve a missed day. */
export function updateStreak(profile: GamificationProfile) {
  const today = new Date().toISOString().slice(0, 10);
  if (profile.lastActiveDate === today) return; // already counted today

  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (profile.lastActiveDate === yesterday) {
    profile.currentStreak += 1;
  } else if (profile.lastActiveDate && profile.streakInsurance.available > 0) {
    // missed a day, but a streak saver covers it
    profile.streakInsurance.available -= 1;
    profile.streakInsurance.lastUsed = today;
    profile.currentStreak += 1;
  } else {
    profile.currentStreak = 1;
  }
  profile.longestStreak = Math.max(profile.longestStreak, profile.currentStreak);
  profile.lastActiveDate = today;
}

export interface AwardResult { profile: GamificationProfile; leveledUp: boolean; newBadges: Badge[] }

/** Marks the profile complete/incomplete from a completed-assessment-types list — used by gamificationApi.ts's recordAssessmentCompletion. */
export function markProfileCompleteness(profile: GamificationProfile, completedTypes: string[]): void {
  profile.profileComplete = missingCognitiveDomains(completedTypes).length === 0;
}
