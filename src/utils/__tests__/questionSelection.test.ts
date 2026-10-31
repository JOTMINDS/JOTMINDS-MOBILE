import { buildSessionBank } from '../questionSelection';
import { QUESTION_POOLS } from '../../data/questionPools';

const types = ['learning', 'thinking', 'decision'] as const;
const bands = ['jhs', 'shs', 'tertiary'] as const;
const PER = { learning: { CE: 3, RO: 3, AC: 3, AE: 3 }, thinking: { analytical: 4, creative: 4, practical: 4 }, decision: { system1: 6, system2: 6 } };

describe('buildSessionBank', () => {
  it('draws 12 questions with the same number per dimension as the fixed bank, for every level', () => {
    for (const band of bands) for (const type of types) {
      const bank = buildSessionBank(band, type)!;
      expect(bank.questions).toHaveLength(12);
      const counts: Record<string, number> = {};
      bank.questions.forEach((q) => { counts[q.dimension] = (counts[q.dimension] ?? 0) + 1; });
      expect(counts).toEqual(PER[type]);
      expect(new Set(bank.questions.map((q) => q.id)).size).toBe(12);
      expect(bank.dimensions).toEqual(Object.keys(PER[type]));
    }
  });

  it('only uses questions from that level\'s pool, so JHS and SHS students never share a question', () => {
    const texts = (band: (typeof bands)[number]) => new Set(types.flatMap((t) => QUESTION_POOLS[band][t].map((r) => r[1])));
    const jhs = texts('jhs'); const shs = texts('shs');
    for (let i = 0; i < 20; i++) {
      buildSessionBank('jhs', 'learning')!.questions.forEach((q) => expect(jhs.has(q.question)).toBe(true));
      buildSessionBank('shs', 'learning')!.questions.forEach((q) => expect(shs.has(q.question)).toBe(true));
    }
    expect([...jhs].filter((t) => shs.has(t))).toEqual([]);
  });

  it('gives different questions on different attempts, and is repeatable with a fixed random source', () => {
    const ids = (b: ReturnType<typeof buildSessionBank>) => b!.questions.map((q) => q.id).join(',');
    const sets = new Set(Array.from({ length: 8 }, () => ids(buildSessionBank('shs', 'thinking'))));
    expect(sets.size).toBeGreaterThan(1);
    let n = 0; const seeded = () => ((n = (n * 9301 + 49297) % 233280) / 233280);
    n = 7; const a = ids(buildSessionBank('tertiary', 'decision', seeded));
    n = 7; const b = ids(buildSessionBank('tertiary', 'decision', seeded));
    expect(a).toBe(b);
  });

  it('mixes the order instead of grouping by dimension', () => {
    const grouped = Array.from({ length: 10 }, () => {
      const dims = buildSessionBank('shs', 'learning')!.questions.map((q) => q.dimension);
      return dims.every((d, i) => i === 0 || d === dims[i - 1] || !dims.slice(0, i).includes(d));
    });
    expect(grouped.every(Boolean)).toBe(false);
  });

  it('has no pool for kids or adults (they use other question sets)', () => {
    expect(buildSessionBank('kids', 'learning')).toBeNull();
    expect(buildSessionBank('adult', 'learning')).toBeNull();
  });
});
