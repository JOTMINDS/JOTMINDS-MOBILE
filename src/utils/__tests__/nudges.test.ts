jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'));

import { buildNudges } from '../nudges';
import { emptyProfile } from '../gamification';

const base = () => emptyProfile('u1');

describe('buildNudges', () => {
  it('nudges an incomplete cognitive profile as high priority', () => {
    const nudges = buildNudges({ profile: base(), completedTypes: [] });
    const profileNudge = nudges.find((n) => n.id === 'profile-complete');
    expect(profileNudge?.priority).toBe('high');
    expect(profileNudge?.action?.route).toBe('AssessmentList');
  });

  it('drops the profile nudge once all core domains are done', () => {
    const nudges = buildNudges({
      profile: { ...base(), profileComplete: true },
      completedTypes: ['kolb', 'sternberg', 'dual-process'],
    });
    expect(nudges.find((n) => n.id === 'profile-complete')).toBeUndefined();
  });

  it('prompts today\'s daily challenge when not done', () => {
    const nudges = buildNudges({ profile: base(), dailyChallengeDoneToday: false });
    expect(nudges.find((n) => n.id === 'daily-challenge')?.action?.route).toBe('DailyChallenge');
  });

  it('shows a streak-keeper only once the challenge is handled', () => {
    const withPending = buildNudges({ profile: { ...base(), currentStreak: 5 }, dailyChallengeDoneToday: false });
    expect(withPending.find((n) => n.id === 'streak-keep')).toBeUndefined();
    const done = buildNudges({ profile: { ...base(), currentStreak: 5 }, dailyChallengeDoneToday: true });
    expect(done.find((n) => n.id === 'streak-keep')).toBeDefined();
  });

  it('surfaces a comeback nudge first after 3+ days away', () => {
    const stale = new Date(Date.now() - 5 * 86400000).toISOString();
    const nudges = buildNudges({ profile: base(), lastActiveISO: stale });
    expect(nudges[0].id).toBe('comeback');
  });

  it('sorts high-priority nudges ahead of low', () => {
    const nudges = buildNudges({ profile: base(), completedTypes: [], dailyChallengeDoneToday: false });
    const priorities = nudges.map((n) => n.priority);
    const order = { high: 0, medium: 1, low: 2 } as const;
    expect(priorities).toEqual([...priorities].sort((a, b) => order[a] - order[b]));
  });
});
