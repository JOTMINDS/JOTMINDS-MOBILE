import { calculateJTIAScore } from '../jtiaScoring';
import {
  jtiaQuestions,
  getFullJTIAQuestionBank,
  getShuffledJTIAQuestionSet,
} from '../../data/jtiaQuestions';

/**
 * Parity guard for the JTIA scoring + session sampling ported verbatim from
 * the webapp (src/app/utils/jtiaScoring.ts + jtiaQuestions.ts).
 */

describe('JTIA question bank', () => {
  it('has 120 core + 120 expanded = 240 pooled items', () => {
    expect(jtiaQuestions).toHaveLength(120);
    expect(getFullJTIAQuestionBank()).toHaveLength(240);
  });

  it('covers all 5 domains in the core bank', () => {
    const domains = new Set(jtiaQuestions.map((q) => q.domain));
    expect(domains.size).toBe(5);
  });
});

describe('getShuffledJTIAQuestionSet', () => {
  it.each([12, 60, 120])('returns ~%i domain-balanced items', (total) => {
    const set = getShuffledJTIAQuestionSet({ totalQuestions: total, useFullBank: true });
    expect(set.length).toBe(total);
    // every domain represented
    expect(new Set(set.map((q) => q.domain)).size).toBe(5);
    // no duplicate items
    expect(new Set(set.map((q) => q.id)).size).toBe(set.length);
  });
});

describe('calculateJTIAScore (webapp parity)', () => {
  it('maps a uniform "4" response to 80 across every domain', () => {
    const responses = new Array(jtiaQuestions.length).fill(4);
    const report = calculateJTIAScore(responses, jtiaQuestions);
    expect(report.domainScores).toEqual({
      cognitive: 80,
      instructional: 80,
      leadership: 80,
      relationship: 80,
      professional: 80,
    });
    expect(report.overallScore).toBe(80);
    expect(report.strengths).toHaveLength(5);
    expect(report.growthOpportunities).toHaveLength(4);
  });

  it('defaults unrated items to proficient (4 -> 80)', () => {
    const report = calculateJTIAScore([], jtiaQuestions);
    expect(report.overallScore).toBe(80);
  });

  it('clamps a uniform "5" response to 100 and floors low scores at 20', () => {
    expect(calculateJTIAScore(new Array(120).fill(5), jtiaQuestions).overallScore).toBe(100);
    expect(calculateJTIAScore(new Array(120).fill(1), jtiaQuestions).overallScore).toBe(20);
  });
});
