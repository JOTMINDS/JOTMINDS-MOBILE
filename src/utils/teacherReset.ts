import { readScoped, writeScoped } from './userStorage';
import { consecutiveDayStreak } from './streaks';

/**
 * "Teacher Reset": a two-minute activity for the Mind tab. Box-breathing (3 rounds),
 * then one reflection prompt, then an intention for the next lesson. Completions are
 * kept on the device (per user) to show a streak.
 */
export const BREATH_PHASES = [
  { label: 'Breathe in', seconds: 4 },
  { label: 'Hold', seconds: 4 },
  { label: 'Breathe out', seconds: 4 },
  { label: 'Hold', seconds: 4 },
] as const;
export const BREATH_ROUNDS = 3;
/** Total breathing time in seconds. */
export const BREATH_SECONDS = BREATH_PHASES.reduce((t, p) => t + p.seconds, 0) * BREATH_ROUNDS;

export const REFLECTION_PROMPTS = [
  'Which student’s small win this week made you smile?',
  'What went better in class today than you expected?',
  'Which student needs a little more of your attention tomorrow, and why?',
  'What is one thing you did today that you would do again?',
  'What is weighing on you that you can put down for tonight?',
  'Who helped you this week, and how could you thank them?',
  'What is one thing you are curious to try in your teaching?',
];

export const INTENTIONS = [
  'Stay patient',
  'Notice the quiet ones',
  'Praise effort',
  'Slow down',
  'Stay curious',
  'Smile first',
];

/** The same prompt all day, a new one tomorrow. */
export function promptForDay(date: Date = new Date()): string {
  const start = new Date(date.getFullYear(), 0, 0).getTime();
  const dayOfYear = Math.floor((new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() - start) / 86_400_000);
  return REFLECTION_PROMPTS[dayOfYear % REFLECTION_PROMPTS.length];
}

/** What to show on the breathing circle at `elapsed` seconds (clamped to the final hold). */
export function breathAt(elapsed: number): { label: string; round: number; phaseIndex: number; secondsLeft: number } {
  const cycle = BREATH_PHASES.reduce((t, p) => t + p.seconds, 0);
  const t = Math.min(Math.max(0, Math.floor(elapsed)), BREATH_SECONDS - 1);
  const round = Math.floor(t / cycle);
  let within = t % cycle;
  for (let i = 0; i < BREATH_PHASES.length; i++) {
    if (within < BREATH_PHASES[i].seconds) {
      return { label: BREATH_PHASES[i].label, round: round + 1, phaseIndex: i, secondsLeft: BREATH_PHASES[i].seconds - within };
    }
    within -= BREATH_PHASES[i].seconds;
  }
  return { label: BREATH_PHASES[0].label, round: round + 1, phaseIndex: 0, secondsLeft: BREATH_PHASES[0].seconds };
}

const KEY = 'jotminds.teacherResets';

export async function getResets(): Promise<string[]> {
  try {
    const raw = await readScoped(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

export async function recordReset(now: Date = new Date()): Promise<string[]> {
  const next = [...(await getResets()), now.toISOString()].slice(-60);
  try { await writeScoped(KEY, JSON.stringify(next)); } catch { /* best effort */ }
  return next;
}

export const resetStreak = (isoDates: string[], now: Date = new Date()): number => consecutiveDayStreak(isoDates, now);

export const didResetToday = (isoDates: string[], now: Date = new Date()): boolean =>
  isoDates.some((iso) => {
    const d = new Date(iso);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
  });
