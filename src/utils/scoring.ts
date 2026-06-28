/**
 * Pure cognitive-scoring helpers (no React Native imports — unit-testable).
 * Mirrors the math defined in the JotMinds reference (§3 Core Algorithms) and
 * the Role Fit thresholds (§4.4), centralised so screens/backend stay in sync.
 */

/** Likert 1-5 → 0-1. Reverse-coded items are mirrored (1 - value). */
export function normalizeLikert(response: number, reverse = false): number {
  const clamped = Math.max(1, Math.min(5, response));
  const n = (clamped - 1) / 4;
  return reverse ? 1 - n : n;
}

export interface WeightedItem { normalized: number; weight: number }

/** Weighted average of a dimension's normalized items → 0-100 (rounded). */
export function dimensionScore(items: WeightedItem[]): number {
  const totalWeight = items.reduce((s, i) => s + i.weight, 0);
  if (totalWeight === 0) return 0;
  const raw = items.reduce((s, i) => s + i.normalized * i.weight, 0) / totalWeight;
  return Math.round(raw * 100);
}

export interface WeightedScore { score: number; weight: number }

/** Weighted aggregate of dimension scores → 0-100 (rounded). */
export function compositeScore(dimensions: WeightedScore[]): number {
  const totalWeight = dimensions.reduce((s, d) => s + d.weight, 0);
  if (totalWeight === 0) return 0;
  const raw = dimensions.reduce((s, d) => s + d.score * d.weight, 0) / totalWeight;
  return Math.round(raw);
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

// ── Style determination (mirrors the webapp's src/app/utils/scoring.ts) ──────
// Sternberg: highest trait wins. Dual-Process: "Balanced" when the two poles are
// close, else the higher. Kolb: highest quadrant (our bank tags items by quadrant).
const BALANCED_THRESHOLD = 10; // on the 0-100 scale

export interface StyleOutcome { primaryStyle: string; secondaryStyle?: string }

export function determineStyle(
  assessmentType: 'learning' | 'thinking' | 'decision',
  scores: Record<string, number>,
): StyleOutcome {
  const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  if (ranked.length === 0) return { primaryStyle: '' };

  if (assessmentType === 'decision') {
    const intuitive = scores['Intuitive'] ?? 0;
    const reflective = scores['Reflective'] ?? 0;
    if (Math.abs(intuitive - reflective) < BALANCED_THRESHOLD) {
      return { primaryStyle: 'Balanced', secondaryStyle: ranked[0][0] };
    }
  }
  return { primaryStyle: ranked[0][0], secondaryStyle: ranked[1]?.[0] };
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
