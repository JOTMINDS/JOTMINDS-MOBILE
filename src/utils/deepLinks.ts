/**
 * Invite / code links, matching the webapp's `?code=` and `?role=` params
 * (`?invite=` tokens are handled on the web). Accepts the app scheme
 * (`jotminds://…`) and the site (`https://jotminds.com/…`).
 *
 * `code` is ambiguous on the web (an organisation/institution code or a student
 * code), so it's told apart by shape: student codes are JM-XXXX-XXXX.
 */
export type DeepLink =
  | { kind: 'student-code'; code: string }
  | { kind: 'join'; role?: JoinRole; code?: string };

/** Only end-user roles can be chosen from a link; admin/organisation roles are web-only. */
export type JoinRole = 'student' | 'teacher' | 'parent' | 'professional';
const ROLES: JoinRole[] = ['student', 'teacher', 'parent', 'professional'];

const HOSTS = new Set(['jotminds.com', 'www.jotminds.com']);
const STUDENT_CODE = /^JM-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
const ANY_CODE = /^[A-Z0-9][A-Z0-9-]{2,31}$/;

export function parseDeepLink(url: string | null | undefined): DeepLink | null {
  if (!url || typeof url !== 'string') return null;
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return null;
  }
  const isApp = u.protocol === 'jotminds:';
  const isSite = (u.protocol === 'https:' || u.protocol === 'http:') && HOSTS.has(u.hostname.toLowerCase());
  if (!isApp && !isSite) return null;

  const rawCode = (u.searchParams.get('code') ?? '').trim().toUpperCase();
  const code = ANY_CODE.test(rawCode) ? rawCode : undefined;
  const rawRole = (u.searchParams.get('role') ?? '').trim().toLowerCase();
  const role = (ROLES as string[]).includes(rawRole) ? (rawRole as JoinRole) : undefined;

  if (code && STUDENT_CODE.test(code)) return { kind: 'student-code', code };
  if (code || role) return { kind: 'join', role, code };
  return null;
}
