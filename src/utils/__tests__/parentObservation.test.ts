import { calculateParentObservationScore, calculateHarmonyScore, getAlignmentLabel } from '../parentObservationData';
import { getSternbergPairing, getKolbPairing, getDualProcessPairing } from '../cognitivePairingData';

describe('calculateParentObservationScore', () => {
  const responsesFor = (a: number, b: number, c: number, d: number) => [
    ...new Array(6).fill(a),
    ...new Array(6).fill(b),
    ...new Array(6).fill(c),
    ...new Array(6).fill(d),
  ];

  it('lands section A in the top tier at a total of 24', () => {
    const score = calculateParentObservationScore(responsesFor(4, 3, 3, 3));
    expect(score.sectionA.total).toBe(24);
    expect(score.sectionA.style).toBe('Hands-on Visual Learner');
  });

  it('lands section A one tier down at a total of 23', () => {
    // 5 questions at 4 + 1 at 3 = 23, still >= 18 (Practical Learner tier)
    const responses = [4, 4, 4, 4, 4, 3, ...new Array(18).fill(3)];
    const score = calculateParentObservationScore(responses);
    expect(score.sectionA.total).toBe(23);
    expect(score.sectionA.style).toBe('Practical Learner');
  });

  it('lands section D in the lowest tier at a total of 11', () => {
    const responses = [...new Array(18).fill(3), ...new Array(5).fill(2), 1];
    const score = calculateParentObservationScore(responses);
    expect(score.sectionD.total).toBe(11);
    expect(score.sectionD.style).toBe('Reluctant Learner');
  });

  it('builds an overall summary sentence from all four section styles', () => {
    const score = calculateParentObservationScore(responsesFor(5, 5, 5, 5));
    expect(score.overallSummary).toContain('Hands-on Visual Learner');
    expect(score.overallSummary.toLowerCase()).toContain('self-driven learner');
  });
});

describe('calculateHarmonyScore + getAlignmentLabel', () => {
  it('returns 0 with no child assessment data', () => {
    const parentScore = calculateParentObservationScore(new Array(24).fill(3));
    expect(calculateHarmonyScore({}, parentScore)).toBe(0);
  });

  it('averages alignment across whichever child assessments are present', () => {
    const parentScore = calculateParentObservationScore(new Array(24).fill(5));
    const harmony = calculateHarmonyScore({ kolb: { style: 'Diverging' } }, parentScore);
    expect(harmony).toBeGreaterThanOrEqual(0);
    expect(harmony).toBeLessThanOrEqual(100);
  });

  it('labels a high score as High Alignment', () => {
    expect(getAlignmentLabel(90).label).toBe('High Alignment');
  });

  it('labels a low score as Low Alignment', () => {
    expect(getAlignmentLabel(20).label).toBe('Low Alignment');
  });
});

describe('cognitivePairingData pairing functions', () => {
  it('matches Analytical parent + Analytical child to The Logic Team', () => {
    const insight = getSternbergPairing('analytical', 'Analytical');
    expect(insight.title).toBe('The Logic Team');
    expect(insight.alignmentLevel).toBe('High');
  });

  it('matches a Creative-style child against a creative/reflective parent (real backend vocabulary, not "imaginative")', () => {
    const insight = getSternbergPairing('creative', 'Creative');
    expect(insight.title).toBe('The Visionaries');
  });

  it('falls back to a generic pairing for an unrecognized combination', () => {
    const insight = getKolbPairing('creative', 'SomeUnknownStyle');
    expect(insight.title).toBe('Balanced Learning');
    expect(insight.alignmentLevel).toBe('Moderate');
  });

  it('matches reflective parent + reflective/analytical dual-process child', () => {
    const insight = getDualProcessPairing('analytical', 'Analytical');
    expect(insight.title).toBe('The Deliberators');
  });
});
