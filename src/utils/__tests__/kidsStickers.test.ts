import { kidsStickers, stickersEarned } from '../kidsStickers';

const none = { completedTypes: [], gamesPlayed: 0, streak: 0 };

describe('kidsStickers', () => {
  it('starts with every sticker locked and a way to unlock each', () => {
    const s = kidsStickers(none);
    expect(stickersEarned(s)).toBe(0);
    s.forEach((x) => expect(x.howToUnlock.length).toBeGreaterThan(0));
  });

  it('unlocks a quiz sticker for each finished quiz, and the champion for all three', () => {
    const one = kidsStickers({ ...none, completedTypes: ['learning'] });
    expect(one.find((x) => x.id === 'learning')?.unlocked).toBe(true);
    expect(one.find((x) => x.id === 'champion')?.unlocked).toBe(false);

    const all = kidsStickers({ ...none, completedTypes: ['learning', 'thinking', 'decision'] });
    expect(all.find((x) => x.id === 'champion')?.unlocked).toBe(true);
    expect(stickersEarned(all)).toBe(4);
  });

  it('rewards the first game and a three-day streak', () => {
    const s = kidsStickers({ ...none, gamesPlayed: 1, streak: 3 });
    expect(s.find((x) => x.id === 'player')?.unlocked).toBe(true);
    expect(s.find((x) => x.id === 'streak')?.unlocked).toBe(true);
    expect(kidsStickers({ ...none, streak: 2 }).find((x) => x.id === 'streak')?.unlocked).toBe(false);
  });
});
