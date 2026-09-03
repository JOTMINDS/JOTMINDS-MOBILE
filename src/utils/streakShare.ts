import { Share } from 'react-native';

/**
 * Share the user's streak with a "start your own" nudge + app link.
 * Text-only (works everywhere, no capture). `kind` tags what the streak is:
 * 'check-in' for the Daily Mind Check, 'growth' for the Cognitive Growth streak.
 */
export async function shareStreak(days: number, kind: 'check-in' | 'growth' = 'growth'): Promise<void> {
  if (days <= 0) return;
  const what = kind === 'check-in' ? 'daily mind check-in' : 'cognitive growth';
  const flames = '🔥'.repeat(Math.min(5, Math.max(1, Math.ceil(days / 7))));
  const message = [
    `${flames} ${days}-day ${what} streak on JotMinds ${flames}`,
    '',
    days >= 7
      ? `That's ${Math.floor(days / 7)} week${days >= 14 ? 's' : ''} of showing up for my mind.`
      : 'Building the habit one day at a time.',
    '',
    'Start your own streak → jotminds.com',
  ].join('\n');

  try {
    await Share.share({ message });
  } catch {
    // user cancelled / share unavailable — nothing to do
  }
}
