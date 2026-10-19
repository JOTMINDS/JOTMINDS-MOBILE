/**
 * Consecutive-calendar-day streak (local time) from a set of ISO timestamps.
 * Alive through yesterday if today has no entry yet; 0 once a full day is missed.
 * Steps by calendar day, not 24h, so daylight-saving changes can't break a streak.
 */
export function consecutiveDayStreak(isoDates: string[], now: Date = new Date()): number {
  const day = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const days = new Set(isoDates.map((iso) => day(new Date(iso))).filter((t) => !Number.isNaN(t)));
  const cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (!days.has(cursor.getTime())) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (days.has(cursor.getTime())) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
