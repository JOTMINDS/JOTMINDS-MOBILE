import { insightsFor, discoverAudience } from '../discoverContent';

describe('discoverAudience', () => {
  it('gives teachers and elementary learners their own sets', () => {
    expect(discoverAudience('teacher', 'adult')).toBe('teacher');
    expect(discoverAudience('student', 'kids')).toBe('kids');
    expect(discoverAudience('student', 'shs')).toBe('general');
    expect(discoverAudience('parent', 'adult')).toBe('general');
    expect(discoverAudience('professional', 'adult')).toBe('general');
  });
});

describe('insightsFor', () => {
  it('has unique ids across all sets, so quiz progress is never shared between articles', () => {
    const ids = (['general', 'teacher', 'kids'] as const).flatMap((a) => insightsFor(a).map((i) => i.id));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('keeps each article in the set it belongs to', () => {
    (['general', 'teacher', 'kids'] as const).forEach((a) => insightsFor(a).forEach((i) => expect(i.audience).toBe(a)));
  });

  it('writes elementary pieces in short, simple words with a try-it step', () => {
    for (const i of insightsFor('kids')) {
      expect(i.readTime).toBe('1 min');
      expect(i.sections?.map((s) => s.heading)).toEqual(['Did you know?', 'Why it matters', 'Try it!']);
      for (const s of i.sections ?? []) expect(s.body.split(/\s+/).length).toBeLessThanOrEqual(30);
      // none of the adult-only subject matter from the general set
      expect(`${i.title} ${i.preview}`).not.toMatch(/career|imposter|overconfiden|System 1|decision/i);
    }
  });

  it('gives teacher articles their own body text', () => {
    for (const i of insightsFor('teacher')) expect(i.sections?.length).toBe(3);
  });
});
