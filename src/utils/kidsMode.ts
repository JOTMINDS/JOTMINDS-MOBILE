/**
 * Kids mode rules, matching the webapp (App.tsx: `age >= 6 && age <= 10`).
 * The webapp stores the parent PIN as `parentPin` on the user profile
 * (PATCH /user/profile allows it), so a PIN set on either client works on both.
 */
export const KIDS_MIN_AGE = 6;
export const KIDS_MAX_AGE = 10;

export const isKidsAge = (age?: number | null): boolean =>
  typeof age === 'number' && age >= KIDS_MIN_AGE && age <= KIDS_MAX_AGE;

export const isValidPin = (pin: string): boolean => /^\d{4}$/.test(pin);

/** Constant-shape comparison; an unset/invalid stored PIN never matches. */
export const pinMatches = (input: string, stored?: string | null): boolean =>
  !!stored && isValidPin(stored) && isValidPin(input) && input === stored;

/** 1234 / 0000 / 1111… are rejected as PINs a child would guess first. */
export function isWeakPin(pin: string): boolean {
  if (!isValidPin(pin)) return true;
  if (/^(\d)\1{3}$/.test(pin)) return true;
  return pin === '1234' || pin === '4321' || pin === '0123';
}

export const MAX_ATTEMPTS = 5;
export const LOCKOUT_MS = 60_000;

/** Tracks wrong PIN entries and locks entry for a minute after too many. Pure, injectable clock. */
export class PinAttempts {
  private failures = 0;
  private lockedUntil = 0;
  constructor(private readonly now: () => number = Date.now) {}

  get lockedForMs(): number {
    return Math.max(0, this.lockedUntil - this.now());
  }

  /** Returns true if the PIN was accepted. Ignores attempts while locked. */
  attempt(input: string, stored?: string | null): boolean {
    if (this.lockedForMs > 0) return false;
    if (pinMatches(input, stored)) {
      this.failures = 0;
      return true;
    }
    this.failures += 1;
    if (this.failures >= MAX_ATTEMPTS) {
      this.lockedUntil = this.now() + LOCKOUT_MS;
      this.failures = 0;
    }
    return false;
  }
}
