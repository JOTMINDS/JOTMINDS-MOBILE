import {
  calculateKolbScore, calculateSternbergScore, calculateDualProcessScore,
  fitCategory, focusTrend, normalizeAssessmentResult,
} from '../scoring';

describe('calculateKolbScore', () => {
  const questions = [{ dimension: 'CE' }, { dimension: 'RO' }, { dimension: 'AC' }, { dimension: 'AE' }];

  it('derives Converging when AC>CE and AE>RO', () => {
    expect(calculateKolbScore([1, 1, 5, 5], questions).style).toBe('Converging');
  });
  it('derives Assimilating when AC>CE and AE<RO', () => {
    expect(calculateKolbScore([1, 5, 5, 1], questions).style).toBe('Assimilating');
  });
  it('derives Diverging when AC<CE and AE<RO', () => {
    expect(calculateKolbScore([5, 5, 1, 1], questions).style).toBe('Diverging');
  });
  it('derives Accommodating otherwise', () => {
    expect(calculateKolbScore([5, 1, 1, 5], questions).style).toBe('Accommodating');
  });
  it('sums responses per axis', () => {
    const result = calculateKolbScore([1, 2, 3, 4], questions);
    expect(result.scores).toEqual({ CE: 1, RO: 2, AC: 3, AE: 4 });
  });
});

describe('calculateSternbergScore', () => {
  const questions = [{ dimension: 'analytical' }, { dimension: 'creative' }, { dimension: 'practical' }];

  it('picks the highest-scoring dimension as style', () => {
    expect(calculateSternbergScore([5, 1, 1], questions).style).toBe('Analytical');
    expect(calculateSternbergScore([1, 5, 1], questions).style).toBe('Creative');
    expect(calculateSternbergScore([1, 1, 5], questions).style).toBe('Practical');
  });
});

describe('calculateDualProcessScore', () => {
  const questions = [{ dimension: 'system1' }, { dimension: 'system2' }];

  it('is Balanced when the gap is under 5', () => {
    expect(calculateDualProcessScore([10, 8], questions).style).toBe('Balanced');
  });
  it('is Intuitive when system1 clearly leads', () => {
    expect(calculateDualProcessScore([15, 5], questions).style).toBe('Intuitive');
  });
  it('is Reflective when system2 clearly leads', () => {
    expect(calculateDualProcessScore([5, 15], questions).style).toBe('Reflective');
  });
});

describe('fitCategory', () => {
  it('bands scores per PRD thresholds', () => {
    expect(fitCategory(92)).toBe('Natural Accelerator');
    expect(fitCategory(85)).toBe('Natural Accelerator');
    expect(fitCategory(84)).toBe('Strong Alignment');
    expect(fitCategory(70)).toBe('Strong Alignment');
    expect(fitCategory(60)).toBe('Adaptable Fit');
    expect(fitCategory(45)).toBe('Strain Risk');
    expect(fitCategory(20)).toBe('Misalignment Risk');
  });
});

describe('focusTrend', () => {
  it('detects improvement and decline', () => {
    expect(focusTrend([2, 2, 4, 5])).toBe('improving');
    expect(focusTrend([5, 4, 2, 1])).toBe('declining');
    expect(focusTrend([3, 3, 3, 3])).toBe('stable');
  });
  it('is stable with too little data', () => {
    expect(focusTrend([4])).toBe('stable');
  });
});

describe('normalizeAssessmentResult', () => {
  it('normalizes the real nested shape (raw sums) to 0-100 for display', () => {
    // 3 questions/axis, max 15 (webapp's own Kolb ratio)
    const raw = { kolb: { style: 'Accommodating', scores: { CE: 15, RO: 0, AC: 9, AE: 3 } } };
    const result = normalizeAssessmentResult(raw);
    expect(result.primaryStyle).toBe('Accommodating');
    expect(result.scores).toEqual({ CE: 100, RO: 0, AC: 60, AE: 20 });
  });

  it('renames dual-process system1/system2 to Intuitive/Reflective for display', () => {
    // 6 questions/axis, max 30
    const raw = { dualProcess: { style: 'Intuitive', scores: { system1: 30, system2: 15 } } };
    const result = normalizeAssessmentResult(raw);
    expect(result.primaryStyle).toBe('Intuitive');
    expect(result.scores).toEqual({ Intuitive: 100, Reflective: 50 });
  });

  it('falls back to the legacy flat mobile shape (already 0-100)', () => {
    const raw = { primaryStyle: 'Creative', scores: { Analytical: 40, Creative: 90, Practical: 60 } };
    const result = normalizeAssessmentResult(raw);
    expect(result).toEqual({ primaryStyle: 'Creative', scores: { Analytical: 40, Creative: 90, Practical: 60 } });
  });
});
