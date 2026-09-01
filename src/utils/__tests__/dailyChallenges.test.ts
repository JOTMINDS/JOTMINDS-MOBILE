import { generateDailyChallenge } from '../../data/dailyChallenges';

describe('generateDailyChallenge', () => {
  it('rotates type by day number: questions → puzzle → reflection → practical', () => {
    expect(generateDailyChallenge(0, 16).type).toBe('questions');
    expect(generateDailyChallenge(1, 16).type).toBe('puzzle');
    expect(generateDailyChallenge(2, 16).type).toBe('reflection');
    expect(generateDailyChallenge(3, 16).type).toBe('practical');
    expect(generateDailyChallenge(4, 16).type).toBe('questions');
  });

  it('ids are prefixed with the type — the server scores points off this', () => {
    for (let d = 0; d < 4; d++) {
      const c = generateDailyChallenge(d, 16);
      expect(c.id.startsWith(`${c.type}-`)).toBe(true);
    }
  });

  it('picks age-appropriate content sets', () => {
    // youth reflection asks for fewer words than adult
    const youth = generateDailyChallenge(2, 10).content.minWords;
    const adult = generateDailyChallenge(2, 40).content.minWords;
    expect(youth).toBeLessThan(adult);
  });

  it('questions challenge carries 3 domain-tagged items', () => {
    const c = generateDailyChallenge(0, 16);
    expect(c.content.questions).toHaveLength(3);
    expect(c.content.questions.map((q: any) => q.domainLabel)).toEqual([
      'Learning Style',
      'Thinking Style',
      'Decision Style (Dual-Process)',
    ]);
  });
});
