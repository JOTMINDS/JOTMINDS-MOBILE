/**
 * Derives per-student and class-level cognitive styles from the
 * /teacher/students payload. Each student carries
 *   assessments: [{ type: 'kolb'|'sternberg'|'dual-process', score: { kolb|sternberg|dualProcess: { style, scores } } }]
 * (the server normalises learning/thinking/decision to those wire names).
 */

export interface StudentStyles { learning?: string; thinking?: string; decision?: string }

const SLOT: Record<string, { domain: keyof StudentStyles; key: string }> = {
  kolb: { domain: 'learning', key: 'kolb' },
  learning: { domain: 'learning', key: 'kolb' },
  sternberg: { domain: 'thinking', key: 'sternberg' },
  thinking: { domain: 'thinking', key: 'sternberg' },
  'dual-process': { domain: 'decision', key: 'dualProcess' },
  decision: { domain: 'decision', key: 'dualProcess' },
};

export function studentStyles(student: any): StudentStyles {
  const out: StudentStyles = {};
  for (const a of student?.assessments ?? []) {
    const slot = SLOT[a?.type];
    const style = slot && a?.score?.[slot.key]?.style;
    if (style && typeof style === 'string' && !out[slot.domain]) out[slot.domain] = style;
  }
  return out;
}

export function studentScores(student: any): Record<string, any> {
  const out: Record<string, any> = {};
  for (const a of student?.assessments ?? []) {
    const slot = SLOT[a?.type];
    const sc = slot && a?.score?.[slot.key]?.scores;
    if (sc && !out[slot.domain]) out[slot.domain] = sc;
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
