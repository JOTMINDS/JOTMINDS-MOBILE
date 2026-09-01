/**
 * In-app nudge feed — actionable prompt cards for the dashboard.
 *
 * The webapp's nudgeSystem.ts is driven by a separate localStorage
 * engagement tracker with no mobile equivalent. This is a leaner,
 * mobile-native version derived from state mobile already has: the
 * Cognitive Growth profile (streak, level, profile completeness),
 * assessment completion, and daily-challenge status. It complements the
 * scheduled *push* nudges in notifications.ts — this is the in-app list.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { GamificationProfile } from './gamification';
import { missingCognitiveDomains } from './profileCompleteness';

export interface Nudge {
  id: string;
  priority: 'high' | 'medium' | 'low';
  icon: string;
  title: string;
  message: string;
  /** Route name in RootStackParamList + optional params. */
  action?: { label: string; route: string; params?: Record<string, any> };
}

export interface NudgeInputs {
  profile: GamificationProfile;
  completedTypes?: string[];
  dailyChallengeDoneToday?: boolean;
  /** ISO date string of the most recent app activity, if tracked. */
  lastActiveISO?: string;
}

const DISMISS_KEY = 'jotminds.nudges.dismissed';
const todayBucket = () => new Date().toISOString().slice(0, 10);

/** Dismissals are scoped to the day so a nudge can resurface tomorrow. */
async function getDismissed(): Promise<Set<string>> {
  try {
    const raw = await AsyncStorage.getItem(DISMISS_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as { date: string; ids: string[] };
    return parsed.date === todayBucket() ? new Set(parsed.ids) : new Set();
  } catch {
    return new Set();
  }
}

export async function dismissNudge(id: string): Promise<void> {
  try {
    const current = await getDismissed();
    current.add(id);
    await AsyncStorage.setItem(
      DISMISS_KEY,
      JSON.stringify({ date: todayBucket(), ids: [...current] }),
    );
  } catch {
    // non-critical
  }
}

export async function clearDismissedNudges(): Promise<void> {
  try {
    await AsyncStorage.removeItem(DISMISS_KEY);
  } catch {
    // non-critical
  }
}

/** Pure generator — all the rules live here. */
export function buildNudges(inputs: NudgeInputs): Nudge[] {
  const { profile, completedTypes = [], dailyChallengeDoneToday, lastActiveISO } = inputs;
  const out: Nudge[] = [];

  if (dailyChallengeDoneToday === false) {
    out.push({
      id: 'daily-challenge',
      priority: 'high',
      icon: '🔥',
      title: "Today's challenge is waiting",
      message: profile.currentStreak > 0
        ? `Complete it to extend your ${profile.currentStreak}-day streak.`
        : 'A two-minute brain workout to start a streak.',
      action: { label: 'Start', route: 'DailyChallenge' },
    });
  }

  if (profile.currentStreak >= 3 && dailyChallengeDoneToday !== false) {
    out.push({
      id: 'streak-keep',
      priority: 'medium',
      icon: '⚡',
      title: `${profile.currentStreak}-day streak`,
      message: "Do anything today — an assessment or a Brain Gym game — to keep it alive.",
      action: { label: 'Brain Gym', route: 'BrainGym' },
    });
  }

  const missing = missingCognitiveDomains(completedTypes);
  if (missing.length > 0) {
    out.push({
      id: 'profile-complete',
      priority: 'high',
      icon: '🧠',
      title: 'Finish your cognitive profile',
      message: `You're ${missing.length} assessment${missing.length > 1 ? 's' : ''} away from your full profile — and the Thinking Styles bonus.`,
      action: { label: 'Continue', route: 'AssessmentList' },
    });
  }

  if (profile.totalBrainGymSessions === 0) {
    out.push({
      id: 'try-brain-gym',
      priority: 'low',
      icon: '🏋️',
      title: 'Try Brain Gym',
      message: 'Three quick games that train working memory and focus.',
      action: { label: 'Open', route: 'BrainGym' },
    });
  }

  if (!profile.roleFitExplored && missing.length === 0) {
    out.push({
      id: 'try-role-fit',
      priority: 'low',
      icon: '🎯',
      title: 'See your career matches',
      message: 'Your full profile unlocks Role Fit — match your thinking to real roles.',
      action: { label: 'Explore', route: 'CareerMatches' },
    });
  }

  if (lastActiveISO) {
    const daysAway = Math.floor((Date.now() - new Date(lastActiveISO).getTime()) / 86400000);
    if (daysAway >= 3) {
      out.unshift({
        id: 'comeback',
        priority: 'high',
        icon: '👋',
        title: 'Welcome back',
        message: `It's been ${daysAway} days. Pick up where you left off with a quick session.`,
      });
    }
  }

  const order = { high: 0, medium: 1, low: 2 } as const;
  return out.sort((a, b) => order[a.priority] - order[b.priority]);
}

/** Convenience: build then drop anything dismissed today. */
export async function getActiveNudges(inputs: NudgeInputs): Promise<Nudge[]> {
  const dismissed = await getDismissed();
  return buildNudges(inputs).filter((n) => !dismissed.has(n.id));
}
