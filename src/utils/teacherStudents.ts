import { callEdgeFn } from './supabase';
import { readScoped, writeScoped } from './userStorage';

/**
 * The teacher's roster, shared by every teacher screen.
 *
 * GET /teacher/students returns each student's full answer history (and, for older accounts, the
 * whole stored profile), so on a big class it can be several megabytes and the phone's connection
 * sometimes drops mid-download ("Network request failed"). The app only reads names, class, codes and
 * each assessment's type/date/style scores, so it asks for the slim form (?slim=1), trims again on
 * arrival in case the server is older, keeps a copy on the device, and shows that copy when a
 * refresh fails instead of leaving the screen empty.
 */
const KEY = 'jotminds.teacherStudents';
// Large rosters are slow to build on the server, so allow longer than the default 20s.
const TIMEOUT_MS = 45_000;

export interface RosterResult {
  students: any[];
  /** True when the live request failed and this is the last saved copy. */
  stale: boolean;
  /** ISO time the shown copy was saved (set when stale). */
  savedAt?: string;
  /** Why the live request failed (set when stale). */
  error?: string;
}

/** Keeps only what the app uses; drops answer histories and any profile fields (avatar, PIN…). */
export function slimStudent(s: any): any {
  return {
    id: s?.id,
    name: s?.name,
    email: s?.email,
    studentCode: s?.studentCode,
    classId: s?.classId,
    className: s?.className,
    status: s?.status,
    dateOfBirth: s?.dateOfBirth,
    assessments: (Array.isArray(s?.assessments) ? s.assessments : []).map((a: any) => ({
      id: a?.id,
      type: a?.type,
      completedAt: a?.completedAt,
      score: a?.score,
    })),
  };
}

export async function loadTeacherStudents(): Promise<RosterResult> {
  try {
    // slim=1 asks the server to leave out answer histories; older servers ignore it and slimStudent still trims.
    const res = await callEdgeFn('/teacher/students?slim=1', {}, TIMEOUT_MS);
    const students = (Array.isArray(res?.students) ? res.students : []).map(slimStudent);
    try { await writeScoped(KEY, JSON.stringify({ savedAt: new Date().toISOString(), students })); } catch { /* cache is best effort */ }
    return { students, stale: false };
  } catch (e: any) {
    const cached = await readCache();
    if (cached) return { students: cached.students, stale: true, savedAt: cached.savedAt, error: e?.message };
    throw e;
  }
}

async function readCache(): Promise<{ savedAt: string; students: any[] } | null> {
  try {
    const raw = await readScoped(KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed && Array.isArray(parsed.students) ? { savedAt: String(parsed.savedAt ?? ''), students: parsed.students } : null;
  } catch {
    return null;
  }
}

/** "saved 2h ago" style text for the stale banner. */
export function savedAgo(savedAt?: string, now: Date = new Date()): string {
  const t = savedAt ? new Date(savedAt).getTime() : NaN;
  if (!Number.isFinite(t)) return 'earlier';
  const mins = Math.max(0, Math.round((now.getTime() - t) / 60000));
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}
