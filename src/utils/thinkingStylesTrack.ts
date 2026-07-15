/**
 * Age/education-band derivation for the bonus JHS/SHS/Adult "Thinking
 * Styles" assessment. Mobile-only — the webapp derives this from a
 * dedicated ageGroup concept; mobile already collects educationLevel and
 * age at signup (AuthContext.tsx's AppUser), so it's derived from those
 * instead rather than adding new signup fields.
 */
import { AppUser } from '../context/AuthContext';
import { missingCognitiveDomains } from './profileCompleteness';

export type ThinkingStylesTrack = 'jhs' | 'shs' | 'adult';

/** null means no track applies (e.g. Elementary-level users — out of scope). */
export function getThinkingStylesTrack(user: AppUser | null | undefined): ThinkingStylesTrack | null {
  const level = user?.educationLevel;
  if (level === 'JHS') return 'jhs';
  if (level === 'SHS') return 'shs';
  if (level === 'Elementary') return null;
  if (level === 'Tertiary') return 'adult';
  // No educationLevel set: fall back to age, defaulting to adult (mirrors
  // the webapp's own fallback in StudentDashboard.tsx's education-band routing).
  if (typeof user?.age === 'number') {
    if (user.age <= 14) return 'jhs';
    if (user.age <= 18) return 'shs';
  }
  return 'adult';
}

/** Mirrors the webapp's hasCompletedAllThree() gate — the bonus only unlocks once the core 3 are done. */
export function isThinkingStylesUnlocked(completedTypes: string[]): boolean {
  return missingCognitiveDomains(completedTypes).length === 0;
}
