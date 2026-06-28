import {
  normalizeLikert, dimensionScore, compositeScore, fitCategory, focusTrend,
} from '../scoring';

describe('normalizeLikert', () => {
  it('maps 1-5 to 0-1', () => {
    expect(normalizeLikert(1)).toBe(0);
    expect(normalizeLikert(3)).toBe(0.5);
    expect(normalizeLikert(5)).toBe(1);
  });
  it('reverse-codes', () => {
    expect(normalizeLikert(1, true)).toBe(1);
    expect(normalizeLikert(5, true)).toBe(0);
  });
  it('clamps out-of-range input', () => {
    expect(normalizeLikert(0)).toBe(0);
    expect(normalizeLikert(9)).toBe(1);
  });
});

describe('dimensionScore', () => {
  it('weighted-averages then scales to 0-100', () => {
    expect(dimensionScore([{ normalized: 1, weight: 1 }, { normalized: 0, weight: 1 }])).toBe(50);
    expect(dimensionScore([{ normalized: 1, weight: 3 }, { normalized: 0, weight: 1 }])).toBe(75);
  });
  it('handles zero weight safely', () => {
    expect(dimensionScore([])).toBe(0);
  });
});

describe('compositeScore', () => {
  it('weights dimension scores', () => {
    expect(compositeScore([{ score: 80, weight: 1 }, { score: 40, weight: 1 }])).toBe(60);
    expect(compositeScore([{ score: 90, weight: 2 }, { score: 30, weight: 1 }])).toBe(70);
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
