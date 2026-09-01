import { calculateProfessionalCognitiveProfile } from '../professionalCognitiveScoring';

/**
 * Parity guard for calculateMatchScore(), which must stay byte-for-byte
 * identical to the webapp's src/app/utils/professionalCognitiveScoring.ts so a
 * mobile-submitted professional profile is interchangeable with a webapp one.
 *
 * Formula (webapp @ c815298):
 *   base   = mean of (score/30*100) across the 3 dimensions
 *   bonus  = max(0, 6 - variance/4)   // variance of the 3 raw sums
 *   result = clamp(round(base + bonus), 50, 98)
 *
 * Expected values below are computed by hand from that formula.
 */
const profileFor = (learning: number, thinking: number, decision: number) =>
  calculateProfessionalCognitiveProfile({
    // only the sum of each array matters
    learning: [learning],
    thinking: [thinking],
    decisionMaking: [decision],
  });

describe('calculateMatchScore (webapp parity)', () => {
  it('balanced mid-high profile: base 80 + full bonus 6', () => {
    expect(profileFor(24, 24, 24).matchScore).toBe(86);
  });

  it('unbalanced profile: bonus collapses to 0', () => {
    // pcts 100 / 33.33 / 66.67 -> base 66.67; variance 66.67 -> bonus 0
    expect(profileFor(30, 10, 20).matchScore).toBe(67);
  });

  it('floors at 50 for a uniformly low profile', () => {
    // base 20 + bonus 6 = 26 -> floored to 50
    expect(profileFor(6, 6, 6).matchScore).toBe(50);
  });

  it('caps at 98 for a maxed-out profile', () => {
    // base 100 + bonus 6 = 106 -> capped at 98
    expect(profileFor(30, 30, 30).matchScore).toBe(98);
  });
});
