import {
  studentStyles, classStyles, studentScores, styleDistribution, completionProgress, alignmentScore, alignmentInsight,
} from '../classInsights';

const student = (styles: { k?: string; s?: string; d?: string }, extra: any[] = []) => ({
  assessments: [
    ...(styles.k ? [{ type: 'kolb', score: { kolb: { style: styles.k, scores: { CE: 3 } } } }] : []),
    ...(styles.s ? [{ type: 'sternberg', score: { sternberg: { style: styles.s, scores: { analytical: 5 } } } }] : []),
    ...(styles.d ? [{ type: 'dual-process', score: { dualProcess: { style: styles.d, scores: { system1: 2 } } } }] : []),
    ...extra,
  ],
});

describe('studentStyles', () => {
  it('reads the three wire shapes', () => {
    expect(studentStyles(student({ k: 'Diverging', s: 'Creative', d: 'Intuitive' }))).toEqual({
      learning: 'Diverging', thinking: 'Creative', decision: 'Intuitive',
    });
  });
  it('tolerates missing/empty data', () => {
    expect(studentStyles(undefined)).toEqual({});
    expect(studentStyles({ assessments: [{ type: 'weird', score: {} }] })).toEqual({});
  });
  it('exposes per-domain scores for the AI prompt', () => {
    expect(studentScores(student({ k: 'A' }))).toEqual({ learning: { CE: 3 } });
  });
  it('understands level-specific thinking assessments and normalises case', () => {
    const s = { assessments: [{ type: 'jhs-thinking', score: { 'jhs-thinking': { style: 'CREATIVE' } } }] };
    expect(studentStyles(s)).toEqual({ thinking: 'Creative' });
  });
  it('uses the latest assessment per domain', () => {
    const s = { assessments: [
      { type: 'kolb', completedAt: '2026-01-01', score: { kolb: { style: 'old' } } },
      { type: 'learning', completedAt: '2026-06-01', score: { learning: { style: 'new' } } },
    ] };
    expect(studentStyles(s).learning).toBe('New');
  });
  it('falls back to a flat style field', () => {
    expect(studentStyles({ assessments: [{ type: 'decision', score: { style: 'balanced' } }] })).toEqual({ decision: 'Balanced' });
  });
});

describe('classStyles', () => {
  it('picks the most common style per domain and counts profiled students', () => {
    const r = classStyles([
      student({ k: 'Diverging', s: 'Creative' }),
      student({ k: 'Diverging', s: 'Analytical' }),
      student({ k: 'Converging', s: 'Analytical' }),
      student({}),
    ]);
    expect(r.dominantLearning).toBe('Diverging');
    expect(r.dominantThinking).toBe('Analytical');
    expect(r.dominantDecision).toBeUndefined();
    expect(r.profiled).toBe(3);
  });
  it('handles an empty class', () => {
    expect(classStyles([])).toEqual({ profiled: 0 });
  });
});

describe('styleDistribution / completionProgress', () => {
  const cls = [
    student({ k: 'Diverging', s: 'Creative', d: 'Intuitive' }),
    student({ k: 'Diverging', s: 'Analytical' }),
    student({ k: 'Converging' }),
    student({}),
  ];
  it('computes counts and rounded percentages, biggest first', () => {
    const d = styleDistribution(cls);
    expect(d.learning.total).toBe(3);
    expect(d.learning.rows).toEqual([
      { style: 'Diverging', count: 2, percent: 67 },
      { style: 'Converging', count: 1, percent: 33 },
    ]);
    expect(d.decision.rows).toEqual([{ style: 'Intuitive', count: 1, percent: 100 }]);
  });
  it('counts module completion across the whole roster', () => {
    expect(completionProgress(cls)).toEqual({ total: 4, done: { learning: 3, thinking: 2, decision: 1 } });
  });
});

describe('alignment', () => {
  const dist = styleDistribution([
    student({ k: 'Diverging', s: 'Creative' }),
    student({ k: 'Diverging', s: 'Analytical' }),
    student({ k: 'Converging', s: 'Analytical' }),
    student({ k: 'Diverging', s: 'Creative' }),
  ]);
  it('averages the share of students matching the teacher per domain', () => {
    // learning: 3/4 Diverging = 75; thinking: 2/4 Creative = 50; decision skipped (no students)
    expect(alignmentScore({ learning: 'Diverging', thinking: 'Creative', decision: 'Reflective' }, dist)).toBe(63);
  });
  it('is 0 when the teacher matches nobody, null when nothing is comparable', () => {
    expect(alignmentScore({ learning: 'Accommodating' }, dist)).toBe(0);
    expect(alignmentScore({}, dist)).toBeNull();
    expect(alignmentScore({ learning: 'Diverging' }, styleDistribution([]))).toBeNull();
  });
  it('gives banded advice', () => {
    expect(alignmentInsight(null)).toMatch(/Complete your own/);
    expect(alignmentInsight(60)).toMatch(/naturally aligns/);
    expect(alignmentInsight(30)).toMatch(/moderately/);
    expect(alignmentInsight(5)).toMatch(/distinct/);
  });
});
