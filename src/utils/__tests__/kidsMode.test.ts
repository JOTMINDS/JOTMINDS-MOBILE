import { isKidsAge, isValidPin, pinMatches, isWeakPin, PinAttempts, MAX_ATTEMPTS, LOCKOUT_MS } from '../kidsMode';

describe('isKidsAge (webapp rule: 6–10)', () => {
  it.each([[6, true], [10, true], [8, true], [5, false], [11, false], [12, false], [17, false]])('age %s → %s', (age, want) => {
    expect(isKidsAge(age)).toBe(want);
  });
  it('is false for missing ages', () => {
    expect(isKidsAge(undefined)).toBe(false);
    expect(isKidsAge(null)).toBe(false);
  });
});

describe('PIN validation', () => {
  it('accepts exactly four digits', () => {
    expect(isValidPin('0420')).toBe(true);
    ['123', '12345', 'abcd', '12 4', ''].forEach((p) => expect(isValidPin(p)).toBe(false));
  });
  it('never matches when nothing valid is stored', () => {
    expect(pinMatches('1234', undefined)).toBe(false);
    expect(pinMatches('1234', '')).toBe(false);
    expect(pinMatches('1234', 'junk')).toBe(false);
    expect(pinMatches('1234', '1234')).toBe(true);
    expect(pinMatches('1235', '1234')).toBe(false);
  });
  it('rejects easy-to-guess PINs when setting one', () => {
    ['0000', '1111', '1234', '4321'].forEach((p) => expect(isWeakPin(p)).toBe(true));
    expect(isWeakPin('7391')).toBe(false);
    expect(isWeakPin('12')).toBe(true);
  });
});

describe('PinAttempts lockout', () => {
  it('locks for a minute after too many wrong entries, then allows again', () => {
    let t = 1_000;
    const a = new PinAttempts(() => t);
    for (let i = 0; i < MAX_ATTEMPTS; i++) expect(a.attempt('0000', '7391')).toBe(false);
    expect(a.lockedForMs).toBe(LOCKOUT_MS);
    expect(a.attempt('7391', '7391')).toBe(false); // correct PIN ignored while locked
    t += LOCKOUT_MS + 1;
    expect(a.lockedForMs).toBe(0);
    expect(a.attempt('7391', '7391')).toBe(true);
  });
  it('a correct entry resets the failure count', () => {
    const a = new PinAttempts(() => 0);
    for (let i = 0; i < MAX_ATTEMPTS - 1; i++) a.attempt('0000', '7391');
    expect(a.attempt('7391', '7391')).toBe(true);
    for (let i = 0; i < MAX_ATTEMPTS - 1; i++) expect(a.attempt('0000', '7391')).toBe(false);
    expect(a.lockedForMs).toBe(0); // not locked: counter restarted
  });
});
