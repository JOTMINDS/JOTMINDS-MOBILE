/**
 * Derives per-student and class-level cognitive styles from the
 * /teacher/students payload (and a teacher's own results), mirroring the
 * webapp's extractors in TeacherAnalyticsComparison. Each student carries
 *   assessments: [{ type, completedAt, score: { <key>: { style, scores } } }]
 * where the wire `type`/key names vary by client and education level
 * (kolb|learning, sternberg|jhs-thinking|…|thinking, dual-process|decision).
 */

export type Domain = 'learning' | 'thinking' | 'decision';
export interface StudentStyles { learning?: string; thinking?: string; decision?: string }

const DOMAIN_OF: Record<string, Domain> = {
  kolb: 'learning', learning: 'learning',
  sternberg: 'thinking', thinking: 'thinking', 'jhs-thinking': 'thinking', 'shs-thinking': 'thinking',
  'adult-thinking': 'thinking', 'child-thinking': 'thinking',
  'dual-process': 'decision', decision: 'decision',
};

const SCORE_KEYS: Record<Domain, string[]> = {
  learning: ['kolb', 'learning'],
  thinking: ['sternberg', 'jhs-thinking', 'shs-thinking', 'adult-thinking', 'child-thinking', 'thinking'],
  decision: ['dualProcess', 'decision', 'dual-process'],
};

export const DOMAINS: Domain[] = ['learning', 'thinking', 'decision'];

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

function readStyle(a: any, domain: Domain): string | undefined {
  const score = a?.score;
  if (!score || typeof score !== 'object') return undefined;
  for (const key of SCORE_KEYS[domain]) {
    const s = score[key];
    const raw = s?.style ?? s?.primaryStyle ?? s?.dominantStyle;
    if (typeof raw === 'string' && raw) return cap(raw);
  }
  const flat = score.style ?? score.primaryStyle;
  return typeof flat === 'string' && flat ? cap(flat) : undefined;
}

function readScores(a: any, domain: Domain): Record<string, number> | undefined {
  for (const key of SCORE_KEYS[domain]) {
    const sc = a?.score?.[key]?.scores;
    if (sc && typeof sc === 'object') return sc;
  }
  return undefined;
}

/** Newest assessment per domain (web takes the latest by completedAt). */
function latestPerDomain(student: any): Partial<Record<Domain, any>> {
  const out: Partial<Record<Domain, any>> = {};
  for (const a of student?.assessments ?? []) {
    const domain = DOMAIN_OF[a?.type];
    if (!domain) continue;
    const cur = out[domain];
    const t = new Date(a?.completedAt ?? 0).getTime() || 0;
    if (!cur || t >= (new Date(cur?.completedAt ?? 0).getTime() || 0)) out[domain] = a;
  }
  return out;
}

export function studentStyles(student: any): StudentStyles {
  const out: StudentStyles = {};
  const latest = latestPerDomain(student);
  for (const d of DOMAINS) {
    const style = latest[d] && readStyle(latest[d], d);
    if (style) out[d] = style;
  }
  return out;
}

export function studentScores(student: any): Record<string, any> {
  const out: Record<string, any> = {};
  const latest = latestPerDomain(student);
  for (const d of DOMAINS) {
    const sc = latest[d] && readScores(latest[d], d);
    if (sc) out[d] = sc;
  }
  return out;
}

function mostCommon(values: (string | undefined)[]): string | undefined {
  const counts = new Map<string, number>();
  values.forEach((v) => { if (v) counts.set(v, (counts.get(v) ?? 0) + 1); });
  let best: string | undefined;
  let n = 0;
  counts.forEach((c, v) => { if (c > n) { best = v; n = c; } });
  return best;
}

export interface ClassStyles {
  dominantLearning?: string;
  dominantThinking?: string;
  dominantDecision?: string;
  /** students with at least one style result */
  profiled: number;
}

export function classStyles(students: any[] = []): ClassStyles {
  const per = students.map(studentStyles);
  return {
    dominantLearning: mostCommon(per.map((s) => s.learning)),
    dominantThinking: mostCommon(per.map((s) => s.thinking)),
    dominantDecision: mostCommon(per.map((s) => s.decision)),
    profiled: per.filter((s) => s.learning || s.thinking || s.decision).length,
  };
}

// ── Distributions, completion, alignment ─────────────────────────────────────

export interface DistributionRow { style: string; count: number; percent: number }
export type ClassDistribution = Record<Domain, { total: number; rows: DistributionRow[] }>;

export function styleDistribution(students: any[] = []): ClassDistribution {
  const per = students.map(studentStyles);
  const out = {} as ClassDistribution;
  for (const d of DOMAINS) {
    const counts = new Map<string, number>();
    per.forEach((s) => { const v = s[d]; if (v) counts.set(v, (counts.get(v) ?? 0) + 1); });
    const total = [...counts.values()].reduce((a, b) => a + b, 0);
    out[d] = {
      total,
      rows: [...counts.entries()]
        .map(([style, count]) => ({ style, count, percent: total ? Math.round((count / total) * 100) : 0 }))
        .sort((a, b) => b.count - a.count || a.style.localeCompare(b.style)),
    };
  }
  return out;
}

/** How many of the class have completed each cognitive module. */
export function completionProgress(students: any[] = []): { total: number; done: Record<Domain, number> } {
  const per = students.map(studentStyles);
  return {
    total: students.length,
    done: {
      learning: per.filter((s) => s.learning).length,
      thinking: per.filter((s) => s.thinking).length,
      decision: per.filter((s) => s.decision).length,
    },
  };
}

/**
 * Overall alignment (0–100): average, over the domains where both the teacher
 * and at least one student have a style, of the share of students who share the
 * teacher's style. null when there is nothing to compare (matches the webapp).
 */
export function alignmentScore(teacher: StudentStyles, dist: ClassDistribution): number | null {
  let sum = 0;
  let n = 0;
  for (const d of DOMAINS) {
    const t = teacher[d];
    if (!t || dist[d].total === 0) continue;
    const row = dist[d].rows.find((r) => r.style === t);
    sum += ((row?.count ?? 0) / dist[d].total) * 100;
    n += 1;
  }
  return n > 0 ? Math.round(sum / n) : null;
}

export function alignmentInsight(score: number | null): string {
  if (score === null) {
    return 'Complete your own Learning, Thinking or Decision assessments and have your students complete theirs to calculate live classroom alignment.';
  }
  if (score >= 50) {
    return 'Your profile naturally aligns with most of your students, so your default communication style likely resonates with the class.';
  }
  if (score >= 25) {
    return 'Your profile overlaps moderately with your students. Adapt your methods now and then to reach students with different styles.';
  }
  return 'Your profile is quite distinct from your students’ dominant styles — a good chance to stretch your teaching approaches while accommodating their preferred ways of learning.';
}
