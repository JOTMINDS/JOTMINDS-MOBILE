export interface StudentGroup { name: string; students: any[] }

const NO_CLASS = 'No class yet';

/**
 * Groups a roster by class name (A–Z, unassigned last) and sorts each class by student name.
 * `query` filters by name, email or student code, case-insensitively; empty groups are dropped.
 */
export function groupStudentsByClass(students: any[], query = ''): StudentGroup[] {
  const q = query.trim().toLowerCase();
  const matches = (s: any) =>
    !q || [s?.name, s?.email, s?.studentCode].some((v) => typeof v === 'string' && v.toLowerCase().includes(q));

  const map = new Map<string, any[]>();
  for (const s of students ?? []) {
    if (!matches(s)) continue;
    const key = (typeof s?.className === 'string' && s.className.trim()) || NO_CLASS;
    map.set(key, [...(map.get(key) ?? []), s]);
  }
  return [...map.entries()]
    .map(([name, list]) => ({ name, students: [...list].sort((a, b) => String(a?.name ?? '').localeCompare(String(b?.name ?? ''))) }))
    .sort((a, b) => (a.name === NO_CLASS ? 1 : b.name === NO_CLASS ? -1 : a.name.localeCompare(b.name)));
}
