import { findResultForDomain } from './profileCompleteness';
import { normalizeAssessmentResult } from './scoring';

export interface ProfileStyles {
  learning?: string;
  thinking?: string;
  decision?: string;
  scores: { learning?: Record<string, number>; thinking?: Record<string, number>; decision?: Record<string, number> };
}

/** Primary style per cognitive domain from a user's stored results (any client's shape). */
export function stylesFromResults<T extends { assessmentType: string; results?: any }>(results: T[] = []): ProfileStyles {
  const out: ProfileStyles = { scores: {} };
  (['learning', 'thinking', 'decision'] as const).forEach((d) => {
    const entry = findResultForDomain(results, d);
    if (!entry?.results) return;
    const n = normalizeAssessmentResult(entry.results);
    if (n.primaryStyle) {
      out[d] = n.primaryStyle;
      out.scores[d] = n.scores;
    }
  });
  return out;
}

export const hasAllStyles = (s: ProfileStyles): s is ProfileStyles & { learning: string; thinking: string; decision: string } =>
  !!(s.learning && s.thinking && s.decision);
