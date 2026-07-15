import { getRecommendedPathways } from '../coachingPathways';
import { calculateParentObservationScore } from '../parentObservationData';

describe('getRecommendedPathways', () => {
  it('returns all 4 pathways', () => {
    const score = calculateParentObservationScore(new Array(24).fill(3));
    expect(getRecommendedPathways(score)).toHaveLength(4);
  });

  it('sorts the weakest-scoring section first', () => {
    // Section D (indices 18-23) scored lowest on purpose.
    const responses = [
      ...new Array(6).fill(5), // A: 30
      ...new Array(6).fill(5), // B: 30
      ...new Array(6).fill(5), // C: 30
      ...new Array(6).fill(1), // D: 6 (lowest)
    ];
    const score = calculateParentObservationScore(responses);
    const pathways = getRecommendedPathways(score);
    expect(pathways[0].section).toBe('D');
    expect(pathways[0].title).toBe('Motivation & Self-Management');
  });

  it('every pathway has exactly 4 weeks with real content', () => {
    const score = calculateParentObservationScore(new Array(24).fill(4));
    getRecommendedPathways(score).forEach((pathway) => {
      expect(pathway.weeks).toHaveLength(4);
      pathway.weeks.forEach((week) => {
        expect(week.theme.length).toBeGreaterThan(0);
        expect(week.conversationStarters).toHaveLength(3);
        expect(week.weekendActivity.length).toBeGreaterThan(0);
        expect(week.watchFor.length).toBeGreaterThan(0);
      });
    });
  });
});
