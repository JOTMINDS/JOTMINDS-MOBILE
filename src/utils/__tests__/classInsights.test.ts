import { studentStyles, classStyles, studentScores } from '../classInsights';

const student = (styles: { k?: string; s?: string; d?: string }) => ({
  assessments: [
    ...(styles.k ? [{ type: 'kolb', score: { kolb: { style: styles.k, scores: { CE: 3 } } } }] : []),
    ...(styles.s ? [{ type: 'sternberg', score: { sternberg: { style: styles.s, scores: { analytical: 5 } } } }] : []),
    ...(styles.d ? [{ type: 'dual-process', score: { dualProcess: { style: styles.d, scores: { system1: 2 } } } }] : []),
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
