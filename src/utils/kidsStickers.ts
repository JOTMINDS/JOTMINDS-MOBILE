/**
 * The sticker book for elementary learners, after the webapp's kids sticker book. Stickers are
 * earned by finishing the three quizzes, playing a brain game and coming back day after day, so
 * everything here comes from data the app already has.
 */
export interface Sticker {
  id: string;
  emoji: string;
  title: string;
  /** Said to the child while the sticker is still locked. */
  howToUnlock: string;
  unlocked: boolean;
}

export interface StickerInput {
  /** Assessment types the child has finished: 'learning' | 'thinking' | 'decision'. */
  completedTypes: string[];
  /** Brain games played so far. */
  gamesPlayed: number;
  /** Days in a row the child has been back. */
  streak: number;
}

export function kidsStickers({ completedTypes, gamesPlayed, streak }: StickerInput): Sticker[] {
  const done = (t: string) => completedTypes.includes(t);
  const allQuizzes = ['learning', 'thinking', 'decision'].every(done);
  return [
    { id: 'learning', emoji: '📚', title: 'Super Learner', howToUnlock: 'Finish the learning quiz', unlocked: done('learning') },
    { id: 'thinking', emoji: '🧠', title: 'Big Thinker', howToUnlock: 'Finish the thinking quiz', unlocked: done('thinking') },
    { id: 'decision', emoji: '🎯', title: 'Smart Chooser', howToUnlock: 'Finish the choosing quiz', unlocked: done('decision') },
    { id: 'champion', emoji: '🏆', title: 'Quiz Champion', howToUnlock: 'Finish all three quizzes', unlocked: allQuizzes },
    { id: 'player', emoji: '🎮', title: 'Game Star', howToUnlock: 'Play a brain game', unlocked: gamesPlayed >= 1 },
    { id: 'streak', emoji: '🔥', title: 'On Fire', howToUnlock: 'Come back 3 days in a row', unlocked: streak >= 3 },
  ];
}

export function stickersEarned(stickers: Sticker[]): number {
  return stickers.filter((s) => s.unlocked).length;
}
