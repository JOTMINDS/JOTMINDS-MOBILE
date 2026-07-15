/**
 * Pure cognitive-scoring helpers (no React Native imports — unit-testable).
 * calculateKolbScore/calculateSternbergScore/calculateDualProcessScore are
 * verbatim ports of the webapp's src/app/utils/scoring.ts — confirmed live
 * (imported directly by AssessmentTaking.tsx) and confirmed against a real
 * submitted row in production. Matching these exactly (not a simplified
 * equivalent) is what lets a mobile-submitted result be genuinely
 * interchangeable with a webapp one, including the same CE/RO/AC/AE axis
 * breakdown for Kolb.
 */

export interface DimensionQuestion { dimension: string }

export interface KolbResult {
  style: 'Diverging' | 'Assimilating' | 'Converging' | 'Accommodating';
  scores: { CE: number; RO: number; AC: number; AE: number };
}

/** responses[i] must correspond to questions[i].dimension (CE/RO/AC/AE). */
export function calculateKolbScore(responses: number[], questions: DimensionQuestion[]): KolbResult {
  const scores = { CE: 0, RO: 0, AC: 0, AE: 0 };
  responses.forEach((response, index) => {
    const dimension = questions[index]?.dimension as keyof typeof scores | undefined;
    if (dimension && dimension in scores) scores[dimension] += response;
  });

  const acCe = scores.AC - scores.CE;
  const aeRo = scores.AE - scores.RO;

  let style: KolbResult['style'];
  if (acCe > 0 && aeRo > 0) style = 'Converging';
  else if (acCe > 0 && aeRo < 0) style = 'Assimilating';
  else if (acCe < 0 && aeRo < 0) style = 'Diverging';
  else style = 'Accommodating';

  return { style, scores };
}

export interface SternbergResult {
  style: 'Analytical' | 'Creative' | 'Practical';
  scores: { analytical: number; creative: number; practical: number };
}

/** responses[i] must correspond to questions[i].dimension (analytical/creative/practical). */
export function calculateSternbergScore(responses: number[], questions: DimensionQuestion[]): SternbergResult {
  const scores = { analytical: 0, creative: 0, practical: 0 };
  responses.forEach((response, index) => {
    const dimension = questions[index]?.dimension as keyof typeof scores | undefined;
    if (dimension && dimension in scores) scores[dimension] += response;
  });

  const max = Math.max(scores.analytical, scores.creative, scores.practical);
  let style: SternbergResult['style'];
  if (scores.analytical === max) style = 'Analytical';
  else if (scores.creative === max) style = 'Creative';
  else style = 'Practical';

  return { style, scores };
}

export interface DualProcessResult {
  style: 'Intuitive' | 'Reflective' | 'Balanced';
  scores: { system1: number; system2: number };
}

/** responses[i] must correspond to questions[i].dimension (system1/system2). */
export function calculateDualProcessScore(responses: number[], questions: DimensionQuestion[]): DualProcessResult {
  const scores = { system1: 0, system2: 0 };
  responses.forEach((response, index) => {
    const dimension = questions[index]?.dimension as keyof typeof scores | undefined;
    if (dimension && dimension in scores) scores[dimension] += response;
  });

  const diff = Math.abs(scores.system1 - scores.system2);
  let style: DualProcessResult['style'];
  if (diff < 5) style = 'Balanced';
  else if (scores.system1 > scores.system2) style = 'Intuitive';
  else style = 'Reflective';

  return { style, scores };
}

export type FitCategory =
  | 'Natural Accelerator'
  | 'Strong Alignment'
  | 'Adaptable Fit'
  | 'Strain Risk'
  | 'Misalignment Risk';

/** Role-fit band for a 0-100 score (§4.4). */
export function fitCategory(score: number): FitCategory {
  if (score >= 85) return 'Natural Accelerator';
  if (score >= 70) return 'Strong Alignment';
  if (score >= 55) return 'Adaptable Fit';
  if (score >= 40) return 'Strain Risk';
  return 'Misalignment Risk';
}

// Official style descriptions copied verbatim from the webapp.
export const STYLE_DESCRIPTIONS: Record<string, string> = {
  Diverging: 'You prefer to watch, feel, and think. You excel at seeing things from multiple perspectives and working in groups.',
  Assimilating: 'You prefer logical, organized thinking. You excel at understanding theories and creating systematic plans.',
  Converging: 'You prefer to think and do. You excel at solving problems and applying ideas to practical situations.',
  Accommodating: 'You prefer to feel and do. You excel at hands-on experiences and adapting to new situations.',
  Analytical: 'You excel at analyzing, comparing, and evaluating. You enjoy breaking down problems and thinking critically.',
  Creative: 'You excel at creating, imagining, and designing. You enjoy thinking of new possibilities and original solutions.',
  Practical: 'You excel at applying knowledge to real-world situations. You focus on what works in everyday life.',
  Intuitive: 'You tend to make quick decisions based on gut feelings and pattern recognition.',
  Reflective: 'You tend to think carefully and deliberately, analyzing options before deciding.',
  Balanced: 'You effectively use both intuitive and reflective thinking, depending on the situation.',
};

// ── Cross-client assessment identity ─────────────────────────────────────
// Mobile and the webapp share one Supabase backend but historically wrote
// the three core assessments under different assessmentType strings
// (mobile: learning/thinking/decision, webapp: kolb/sternberg/dual-process),
// with mobile using a different question bank and scoring model entirely.
// Both are now aligned: same questions (see src/data/questionBank.ts), same
// algorithms (above), same wire name, same nested result shape
// (`{kolb: {style, scores}}` etc. — confirmed against a real submitted row),
// so a result is genuinely the same thing regardless of which client wrote it.

export type MobileAssessmentType = 'learning' | 'thinking' | 'decision';

/** Mobile's assessmentType → the webapp's assessmentType (what gets sent over the wire). */
export const WIRE_TYPE: Record<MobileAssessmentType, string> = {
  learning: 'kolb',
  thinking: 'sternberg',
  decision: 'dual-process',
};

/** The key `results` is nested under for each wire type, e.g. results.kolb.style. */
export const WIRE_RESULT_KEY: Record<MobileAssessmentType, 'kolb' | 'sternberg' | 'dualProcess'> = {
  learning: 'kolb',
  thinking: 'sternberg',
  decision: 'dualProcess',
};

// Max raw sum per dimension = (questions per dimension in QUESTION_BANK) × 5
// (Likert max). Used only to normalize raw sums into 0-100 for display —
// the stored/submitted value itself stays a raw sum, matching the webapp
// exactly. Ratios match the webapp's own getPersonalizedQuestions.
const MAX_PER_DIMENSION: Record<MobileAssessmentType, number> = {
  learning: 15, // 3 questions × 5
  thinking: 20, // 4 questions × 5
  decision: 30, // 6 questions × 5
};

// Friendlier display labels for raw dimension keys — the webapp itself does
// this too (e.g. its dual-process radar chart shows system1/system2 as
// "Intuitive"/"Reflective").
const DISPLAY_KEY: Record<string, string> = {
  analytical: 'Analytical', creative: 'Creative', practical: 'Practical',
  system1: 'Intuitive', system2: 'Reflective',
};

export interface NormalizedAssessmentResult {
  primaryStyle: string;
  scores: Record<string, number>;
}

/**
 * Read-side adapter for a stored assessment result, regardless of which
 * client produced it. Prefers the real nested shape (`raw.kolb` /
 * `raw.sternberg` / `raw.dualProcess`, each `{style, scores}` with raw
 * per-dimension sums — what both clients now submit); falls back to
 * mobile's pre-migration flat shape (`{primaryStyle, scores}`, already
 * 0-100) for older stored results.
 */
export function normalizeAssessmentResult(raw: any): NormalizedAssessmentResult {
  for (const type of ['learning', 'thinking', 'decision'] as MobileAssessmentType[]) {
    const nested = raw?.[WIRE_RESULT_KEY[type]];
    if (nested?.style && nested?.scores) {
      const max = MAX_PER_DIMENSION[type];
      const scores: Record<string, number> = {};
      Object.entries(nested.scores as Record<string, number>).forEach(([key, value]) => {
        scores[DISPLAY_KEY[key] ?? key] = Math.max(0, Math.min(100, Math.round((value / max) * 100)));
      });
      return { primaryStyle: nested.style, scores };
    }
  }

  // Legacy fallback: mobile's pre-migration flat shape, already 0-100.
  return { primaryStyle: raw?.primaryStyle ?? raw?.dominantStyle ?? '', scores: raw?.scores ?? {} };
}

/** Weekly focus trend from a chronological list of 1-5 focus scores. */
export function focusTrend(scores: number[]): 'improving' | 'stable' | 'declining' {
  if (scores.length < 2) return 'stable';
  const mid = Math.floor(scores.length / 2);
  const first = scores.slice(0, mid || 1);
  const second = scores.slice(mid);
  const avg = (a: number[]) => a.reduce((s, x) => s + x, 0) / a.length;
  const diff = avg(second) - avg(first);
  if (diff > 0.4) return 'improving';
  if (diff < -0.4) return 'declining';
  return 'stable';
}
