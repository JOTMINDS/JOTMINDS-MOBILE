/**
 * Daily Mind Check data — client-side only. The backend's /checkin/* routes
 * don't exist on the deployed edge function (verified against the live
 * backend), so rather than deploying new backend routes just for this, the
 * whole daily check-in flow is a real, device-local journal. Mirrors the
 * AsyncStorage pattern already established in coachingProgress.ts.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { focusTrend } from './scoring';

export interface Checkin {
  focus_score: number;
  decision_delay: boolean;
  emotional_state: string;
  created_at: string; // ISO
}

const STORAGE_KEY = 'jotminds.mind.checkins';

async function readAll(): Promise<Checkin[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const list: Checkin[] = raw ? JSON.parse(raw) : [];
    return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } catch {
    return [];
  }
}

function dateKey(iso: string): string {
  return new Date(iso).toDateString();
}

/** Saves a check-in, replacing any existing one from the same calendar day. */
export async function saveCheckin(checkin: Checkin): Promise<void> {
  try {
    const existing = await readAll();
    const today = dateKey(checkin.created_at);
    const filtered = existing.filter((c) => dateKey(c.created_at) !== today);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([checkin, ...filtered]));
  } catch {
    // non-critical; local-only journal
  }
}

export async function getTodayCheckin(): Promise<Checkin | null> {
  const all = await readAll();
  const today = new Date().toDateString();
  return all.find((c) => dateKey(c.created_at) === today) ?? null;
}

/** Consecutive-day streak, counting back from today (or yesterday if today isn't done yet). */
export async function getStreak(): Promise<number> {
  const all = await readAll();
  if (all.length === 0) return 0;

  const dates = [...new Set(all.map((c) => dateKey(c.created_at)))]
    .map((d) => new Date(d).getTime())
    .sort((a, b) => b - a);

  const dayMs = 86400000;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  let cursor = today.getTime();

  // If today has no check-in, streak can still be "alive" through yesterday.
  if (dates[0] !== cursor) {
    if (dates[0] === cursor - dayMs) cursor -= dayMs;
    else return 0;
  }

  let streak = 0;
  for (const d of dates) {
    if (d === cursor) { streak += 1; cursor -= dayMs; }
    else break;
  }
  return streak;
}

function lastNDays(all: Checkin[], n: number): Checkin[] {
  const cutoff = Date.now() - n * 86400000;
  return all.filter((c) => new Date(c.created_at).getTime() >= cutoff);
}

export interface WeeklyReport {
  avg_focus: number;
  delay_count: number;
  dominant_emotion: string;
  trend_direction: 'improving' | 'stable' | 'declining';
  total_checkins: number;
  recommendation_text: string;
}

export async function getWeeklyReport(): Promise<WeeklyReport> {
  const all = await readAll();
  const week = lastNDays(all, 7);

  if (week.length === 0) {
    return {
      avg_focus: 0,
      delay_count: 0,
      dominant_emotion: '—',
      trend_direction: 'stable',
      total_checkins: 0,
      recommendation_text: 'Complete a daily check-in to start seeing your weekly trends here.',
    };
  }

  const chronological = [...week].reverse(); // oldest first, for trend calc
  const avgFocus = week.reduce((s, c) => s + c.focus_score, 0) / week.length;
  const delayCount = week.filter((c) => c.decision_delay).length;

  const emotionCounts: Record<string, number> = {};
  week.forEach((c) => { emotionCounts[c.emotional_state] = (emotionCounts[c.emotional_state] ?? 0) + 1; });
  const dominantEmotion = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0][0];

  const trend = focusTrend(chronological.map((c) => c.focus_score));

  const trendText = trend === 'improving'
    ? 'Your focus trend is improving this week.'
    : trend === 'declining'
    ? 'Your focus has dipped a bit this week — consider protecting time for your highest-priority work.'
    : 'Your focus has been steady this week.';
  const emotionText = `Your most common emotional state was "${dominantEmotion}".`;
  const delayText = delayCount > 0
    ? ` You delayed a decision on ${delayCount} of ${week.length} day${week.length === 1 ? '' : 's'} — worth noticing if a pattern forms.`
    : '';

  return {
    avg_focus: avgFocus,
    delay_count: delayCount,
    dominant_emotion: dominantEmotion,
    trend_direction: trend,
    total_checkins: week.length,
    recommendation_text: `${trendText} ${emotionText}${delayText}`,
  };
}

export interface DayEntry {
  label: string;
  checkin: Checkin | null;
}

/** Last 7 calendar days (oldest first, ending today), each with its real check-in or null. */
export async function getLast7Days(): Promise<DayEntry[]> {
  const all = await readAll();
  const byDate = new Map(all.map((c) => [dateKey(c.created_at), c]));
  const days: DayEntry[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({
      label: d.toLocaleDateString('en-US', { weekday: 'short' }),
      checkin: byDate.get(d.toDateString()) ?? null,
    });
  }
  return days;
}
