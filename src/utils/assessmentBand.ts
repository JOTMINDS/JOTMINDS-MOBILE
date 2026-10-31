import { isPreschoolLevel } from './educationLevels';

/**
 * Which question set a student should get. Mirrors the webapp's banks:
 *   kids (6–10) · jhs (11–14, the original educational set) · shs (15–18, teen set)
 *   · tertiary (19–25) · adult (everyone else).
 * The webapp keys off age alone. Mobile also has the education level the school or
 * student chose, and an account with no date of birth would otherwise get the
 * same default questions as everyone, so the level is used first and age fills in.
 */
export type AssessmentBand = 'kids' | 'jhs' | 'shs' | 'tertiary' | 'adult';

export function assessmentBand(user?: { age?: number | null; educationLevel?: string | null } | null): AssessmentBand {
  const level = user?.educationLevel;
  if (level) {
    if (level === 'Elementary' || isPreschoolLevel(level)) return 'kids';
    if (level === 'JHS') return 'jhs';
    if (level === 'SHS') return 'shs';
    if (level === 'Tertiary') return 'tertiary';
  }
  const age = user?.age;
  if (typeof age === 'number') {
    if (age >= 6 && age <= 10) return 'kids';
    if (age >= 11 && age <= 14) return 'jhs';
    if (age >= 15 && age <= 18) return 'shs';
    if (age >= 19 && age <= 25) return 'tertiary';
  }
  return 'adult';
}
