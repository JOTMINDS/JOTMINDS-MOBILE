import { accountNotices, resourcePicks } from '../notificationPanel';

describe('accountNotices', () => {
  it('asks a new teacher for a photo and school', () => {
    expect(accountNotices({ role: 'teacher' }).map((n) => n.id)).toEqual(['photo', 'school']);
  });

  it('has nothing to say about a complete account', () => {
    expect(accountNotices({ role: 'teacher', avatarUrl: 'data:x', school: 'Accra Academy' })).toEqual([]);
  });

  it('asks a young child\'s grown-up to set the PIN, but nobody else', () => {
    const kid = { role: 'student', age: 8, avatarUrl: 'x', school: 's', educationLevel: 'Elementary' };
    expect(accountNotices(kid).map((n) => n.id)).toEqual(['pin']);
    expect(accountNotices({ ...kid, parentPin: '4821' })).toEqual([]);
    expect(accountNotices({ ...kid, age: 15 })).toEqual([]);
  });

  it('asks a student with no level to pick one, and handles no user', () => {
    expect(accountNotices({ role: 'student', avatarUrl: 'x', school: 's' }).map((n) => n.id)).toEqual(['level']);
    expect(accountNotices(null)).toEqual([]);
  });
});

describe('resourcePicks', () => {
  it('returns articles for the audience and rotates by day', () => {
    const a = resourcePicks('teacher', 2, new Date(2026, 9, 31));
    const b = resourcePicks('teacher', 2, new Date(2026, 10, 1));
    expect(a).toHaveLength(2);
    a.forEach((x) => expect(x.audience).toBe('teacher'));
    expect(a.map((x) => x.id)).not.toEqual(b.map((x) => x.id));
    expect(resourcePicks('kids', 2, new Date(2026, 9, 31)).every((x) => x.audience === 'kids')).toBe(true);
  });

  it('never returns more than exist or duplicates', () => {
    const picks = resourcePicks('general', 99);
    expect(new Set(picks.map((p) => p.id)).size).toBe(picks.length);
  });
});
