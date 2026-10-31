import { QUESTION_POOLS, PoolBand } from '../data/questionPools';
import type { AssessmentBank, AssessmentType, BankQuestion } from '../data/questionBank';
import type { AssessmentBand } from './assessmentBand';

/**
 * Builds the 12 questions for one sitting from the student's level pool, like the webapp's
 * getPersonalizedQuestions: an equal number per dimension, picked at random, in mixed order, so a
 * retake or a classmate gets different questions. Scoring is unchanged: the same dimensions and
 * the same count per dimension as the fixed bank.
 */
const PLAN: Record<AssessmentType, { framework: string; dimensions: string[]; perDimension: number }> = {
  learning: { framework: 'Kolb Learning Styles', dimensions: ['CE', 'RO', 'AC', 'AE'], perDimension: 3 },
  thinking: { framework: 'Sternberg Thinking Styles', dimensions: ['analytical', 'creative', 'practical'], perDimension: 4 },
  decision: { framework: 'Dual-Process Decision Making', dimensions: ['system1', 'system2'], perDimension: 6 },
};

function shuffled<T>(list: T[], rng: () => number): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Returns null when this level has no pool (kids and adults use other question sets). */
export function buildSessionBank(
  band: AssessmentBand,
  type: AssessmentType,
  rng: () => number = Math.random,
): AssessmentBank | null {
  if (band !== 'jhs' && band !== 'shs' && band !== 'tertiary') return null;
  const rows = QUESTION_POOLS[band as PoolBand]?.[type];
  const plan = PLAN[type];
  if (!rows || !plan) return null;

  const picked: BankQuestion[] = [];
  const used = new Set<number>();
  for (const dimension of plan.dimensions) {
    const pool = rows.filter((r) => r[2] === dimension);
    if (pool.length < plan.perDimension) return null; // a short pool would skew scoring
    for (const [id, question] of shuffled(pool, rng).slice(0, plan.perDimension)) {
      if (used.has(id)) return null;
      used.add(id);
      picked.push({ id, question, dimension });
    }
  }
  return { framework: plan.framework, dimensions: plan.dimensions, questions: shuffled(picked, rng) };
}
