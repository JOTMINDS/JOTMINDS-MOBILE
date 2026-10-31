import { teachingFocus, DOMAIN_LABEL } from '../teachingFocus';

const report = (domainScores: any) => ({ domainScores } as any);

describe('teachingFocus', () => {
  it('finds the strongest domain and the growth edge', () => {
    const f = teachingFocus(report({ cognitive: 72, instructional: 80, leadership: 55, relationship: 91, professional: 64 }))!;
    expect(f.strength).toMatchObject({ key: 'relationship', score: 91, label: 'Relationships' });
    expect(f.growth).toMatchObject({ key: 'leadership', score: 55 });
    expect(f.domains.map((d) => d.key)).toEqual(['relationship', 'instructional', 'cognitive', 'professional', 'leadership']);
  });

  it('aims the intention and reflection prompt at the growth domain', () => {
    const f = teachingFocus(report({ cognitive: 90, instructional: 90, leadership: 90, relationship: 40, professional: 90 }))!;
    expect(f.growth.key).toBe('relationship');
    expect(f.intention).toBe('Connect with one student');
    expect(f.prompt).toMatch(/connect/i);
  });

  it('has an intention for every domain', () => {
    for (const key of Object.keys(DOMAIN_LABEL)) {
      const others = { cognitive: 80, instructional: 80, leadership: 80, relationship: 80, professional: 80 } as any;
      others[key] = 10;
      expect(teachingFocus(report(others))!.intention.length).toBeGreaterThan(3);
    }
  });

  it('returns null without usable scores', () => {
    expect(teachingFocus(null)).toBeNull();
    expect(teachingFocus({} as any)).toBeNull();
    expect(teachingFocus(report({ cognitive: 'x' }))).toBeNull();
  });
});
