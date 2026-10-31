import { recommendTeacherArticles, orderByRecommendation } from '../teacherRecommendations';
import { styleDistribution } from '../classInsights';

const student = (learning: string, decision: string) => ({
  assessments: [
    { type: 'kolb', completedAt: '2026-10-01', score: { kolb: { style: learning } } },
    { type: 'dual-process', completedAt: '2026-10-01', score: { dualProcess: { style: decision } } },
  ],
});
const focus = (key: string) => ({ growth: { key, label: key, score: 40 } } as any);

describe('recommendTeacherArticles', () => {
  it('suggests varied teaching routes when no learning style has a majority', () => {
    const dist = styleDistribution([student('Diverging', 'Reflective'), student('Converging', 'Reflective'), student('Assimilating', 'Reflective'), student('Accommodating', 'Reflective')]);
    expect(recommendTeacherArticles(dist, null)).toEqual([{ id: 't5', reason: 'Your class mixes 4 learning styles' }]);
  });

  it('suggests the wait-time article when most of the class decide by instinct', () => {
    const dist = styleDistribution([student('Diverging', 'Intuitive'), student('Diverging', 'Intuitive'), student('Diverging', 'Intuitive'), student('Diverging', 'Reflective')]);
    const recs = recommendTeacherArticles(dist, null);
    expect(recs[0]).toMatchObject({ id: 't1' });
    expect(recs[0].reason).toMatch(/75%/);
  });

  it('adds an article for the teacher\'s own growth domain and caps the list', () => {
    const dist = styleDistribution([student('Diverging', 'Intuitive'), student('Converging', 'Intuitive'), student('Assimilating', 'Intuitive')]);
    const recs = recommendTeacherArticles(dist, focus('relationship'));
    expect(recs).toHaveLength(2);
    expect(recommendTeacherArticles(dist, focus('relationship'), 3).map((r) => r.id)).toEqual(['t5', 't1', 't3']);
  });

  it('does not repeat an article and says nothing without data', () => {
    expect(recommendTeacherArticles(null, null)).toEqual([]);
    const dist = styleDistribution([student('Diverging', 'Intuitive'), student('Diverging', 'Intuitive'), student('Diverging', 'Intuitive')]);
    const ids = recommendTeacherArticles(dist, focus('leadership'), 5).map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('orderByRecommendation', () => {
  it('moves recommended items first and keeps the rest in order', () => {
    const items = [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }];
    expect(orderByRecommendation(items, [{ id: 'c', reason: '' }, { id: 'b', reason: '' }]).map((i) => i.id)).toEqual(['c', 'b', 'a', 'd']);
    expect(orderByRecommendation(items, []).map((i) => i.id)).toEqual(['a', 'b', 'c', 'd']);
  });
});
