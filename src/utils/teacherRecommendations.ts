import type { ClassDistribution } from './classInsights';
import type { TeachingFocus, TeachingDomainKey } from './teachingFocus';

/**
 * Which teacher articles to suggest first, and why, from what the app knows: the mix of styles in
 * the class and the teacher's own growth domain from Teaching Insights. At most `max` suggestions,
 * each with a one-line reason shown on the card.
 */
export interface Recommendation { id: string; reason: string }

const FOR_GROWTH_DOMAIN: Record<TeachingDomainKey, { id: string; reason: string }> = {
  cognitive: { id: 't2', reason: 'Builds on your Cognitive domain' },
  instructional: { id: 't4', reason: 'Supports your Instruction growth area' },
  leadership: { id: 't1', reason: 'Supports your Classroom leadership growth area' },
  relationship: { id: 't3', reason: 'Supports your Relationships growth area' },
  professional: { id: 't6', reason: 'Supports your Professional growth area' },
};

const share = (rows: { style: string; percent: number }[], style: string) => rows.find((r) => r.style === style)?.percent ?? 0;

export function recommendTeacherArticles(
  dist: ClassDistribution | null | undefined,
  focus: TeachingFocus | null | undefined,
  max = 2,
): Recommendation[] {
  const out: Recommendation[] = [];
  const add = (r: Recommendation) => { if (!out.some((o) => o.id === r.id)) out.push(r); };

  if (dist) {
    const learning = dist.learning;
    // Several learning styles with no clear majority: teach through more than one route.
    if (learning.total >= 3 && (learning.rows[0]?.percent ?? 100) < 50 && learning.rows.length >= 3) {
      add({ id: 't5', reason: `Your class mixes ${learning.rows.length} learning styles` });
    }
    const decision = dist.decision;
    if (decision.total >= 3 && share(decision.rows, 'Intuitive') >= 60) {
      add({ id: 't1', reason: `${share(decision.rows, 'Intuitive')}% of your class decide by instinct` });
    }
  }
  if (focus) add(FOR_GROWTH_DOMAIN[focus.growth.key]);
  return out.slice(0, max);
}

/** Recommended articles first (in recommendation order), the rest in their original order. */
export function orderByRecommendation<T extends { id: string }>(items: T[], recs: Recommendation[]): T[] {
  const rank = new Map(recs.map((r, i) => [r.id, i]));
  return [...items].sort((a, b) => (rank.get(a.id) ?? 99) - (rank.get(b.id) ?? 99));
}
