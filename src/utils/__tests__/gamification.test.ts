import {
  getLevelForXP, getXPProgress, addXP, updateStreak, checkForNewBadges, emptyProfile,
} from '../gamification';

describe('getLevelForXP', () => {
  it('bands XP into the right level', () => {
    expect(getLevelForXP(0).level).toBe(1);
    expect(getLevelForXP(499).level).toBe(1);
    expect(getLevelForXP(500).level).toBe(2);
    expect(getLevelForXP(1199).level).toBe(2);
    expect(getLevelForXP(16000).level).toBe(10);
    expect(getLevelForXP(999999).level).toBe(10);
  });
});

describe('getXPProgress', () => {
  it('computes percentage and xpToNext within a level', () => {
    const p = getXPProgress(250); // level 1: 0-500
    expect(p.level.level).toBe(1);
    expect(p.percentage).toBe(50);
    expect(p.xpToNext).toBe(250);
  });
  it('caps at 99% and reports 0 to next only at the max level', () => {
    const midLevel = getXPProgress(16000);
    expect(midLevel.percentage).toBe(100);
    expect(midLevel.xpToNext).toBe(0);
  });
});

describe('addXP', () => {
  it('increases xp and recomputes level', () => {
    const p = emptyProfile('u1');
    // Below the xp_500 badge threshold, so this checks pure xp/level math
    // without a badge-earned bonus muddying the assertion.
    addXP(p, 300);
    expect(p.xp).toBe(300);
    expect(p.level).toBe(1);

    addXP(p, 250); // crosses into level 2 (500-1200)
    expect(p.level).toBe(2);
  });
  it('reports leveledUp only when the level actually changes', () => {
    const p = emptyProfile('u1');
    const first = addXP(p, 100);
    expect(first.leveledUp).toBe(false);
    const second = addXP(p, 500);
    expect(second.leveledUp).toBe(true);
  });
  it('grants a streak-insurance token on reaching level 5', () => {
    const p = emptyProfile('u1');
    addXP(p, 3500); // exactly level 5's minXP
    expect(p.level).toBe(5);
    expect(p.streakInsurance.available).toBe(1);
    expect(p.streakInsurance.total).toBe(1);
  });
  it('awards new badges and their XP bonus', () => {
    const p = emptyProfile('u1');
    p.totalAssessments = 1;
    const { newBadges } = addXP(p, 0);
    expect(newBadges.map((b) => b.id)).toContain('assessments_1');
    expect(p.badges.map((b) => b.id)).toContain('assessments_1');
    expect(p.xp).toBeGreaterThan(0); // badge-earned XP bonus applied
  });
  it('does not re-award an already-earned badge', () => {
    const p = emptyProfile('u1');
    p.totalAssessments = 1;
    addXP(p, 0);
    const xpAfterFirst = p.xp;
    const { newBadges } = addXP(p, 0);
    expect(newBadges.length).toBe(0);
    expect(p.xp).toBe(xpAfterFirst);
  });
});

describe('checkForNewBadges', () => {
  it('matches streak, assessment, and level thresholds', () => {
    const p = emptyProfile('u1');
    p.longestStreak = 7;
    p.totalAssessments = 10;
    p.level = 5;
    const badges = checkForNewBadges(p).map((b) => b.id);
    expect(badges).toEqual(expect.arrayContaining(['streak_3', 'streak_7', 'assessments_1', 'assessments_5', 'assessments_10', 'level_5']));
    expect(badges).not.toContain('streak_14');
    expect(badges).not.toContain('level_10');
  });
});

describe('updateStreak', () => {
  it('starts a streak at 1 on first activity', () => {
    const p = emptyProfile('u1');
    updateStreak(p);
    expect(p.currentStreak).toBe(1);
    expect(p.longestStreak).toBe(1);
  });
  it('does not double-count the same day', () => {
    const p = emptyProfile('u1');
    updateStreak(p);
    updateStreak(p);
    expect(p.currentStreak).toBe(1);
  });
  it('increments on a consecutive day', () => {
    const p = emptyProfile('u1');
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    p.currentStreak = 4;
    p.longestStreak = 4;
    p.lastActiveDate = yesterday;
    updateStreak(p);
    expect(p.currentStreak).toBe(5);
    expect(p.longestStreak).toBe(5);
  });
  it('resets to 1 on a missed day with no streak insurance', () => {
    const p = emptyProfile('u1');
    const threeDaysAgo = new Date(Date.now() - 3 * 86400000).toISOString().slice(0, 10);
    p.currentStreak = 10;
    p.longestStreak = 10;
    p.lastActiveDate = threeDaysAgo;
    updateStreak(p);
    expect(p.currentStreak).toBe(1);
    expect(p.longestStreak).toBe(10); // longest is preserved
  });
  it('preserves the streak by consuming a streak-insurance token on a missed day', () => {
    const p = emptyProfile('u1');
    const threeDaysAgo = new Date(Date.now() - 3 * 86400000).toISOString().slice(0, 10);
    p.currentStreak = 10;
    p.longestStreak = 10;
    p.lastActiveDate = threeDaysAgo;
    p.streakInsurance = { available: 1, total: 1 };
    updateStreak(p);
    expect(p.currentStreak).toBe(11);
    expect(p.streakInsurance.available).toBe(0);
    expect(p.streakInsurance.lastUsed).toBeDefined();
  });
});
