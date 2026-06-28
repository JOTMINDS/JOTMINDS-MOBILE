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
