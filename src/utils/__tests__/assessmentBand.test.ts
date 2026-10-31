import { assessmentBand } from '../assessmentBand';
import { bankForBand, TEEN_QUESTION_BANK, TERTIARY_QUESTION_BANK } from '../../data/questionBankByAge';

describe('assessmentBand', () => {
  it('uses the education level a school or student chose, even with no date of birth', () => {
    expect(assessmentBand({ educationLevel: 'Elementary' })).toBe('kids');
    expect(assessmentBand({ educationLevel: 'JHS' })).toBe('jhs');
    expect(assessmentBand({ educationLevel: 'SHS' })).toBe('shs');
    expect(assessmentBand({ educationLevel: 'Tertiary' })).toBe('tertiary');
  });

  it('falls back to the webapp age bands when there is no level', () => {
    expect(assessmentBand({ age: 8 })).toBe('kids');
    expect(assessmentBand({ age: 12 })).toBe('jhs');
    expect(assessmentBand({ age: 16 })).toBe('shs');
    expect(assessmentBand({ age: 21 })).toBe('tertiary');
    expect(assessmentBand({ age: 40 })).toBe('adult');
  });

  it('prefers the level over age when both are present', () => {
    expect(assessmentBand({ age: 12, educationLevel: 'SHS' })).toBe('shs');
  });

  it('defaults to adult when nothing is known', () => {
    expect(assessmentBand(undefined)).toBe('adult');
    expect(assessmentBand({})).toBe('adult');
  });

  it('gives JHS, SHS and elementary students different question sets', () => {
    const jhs = bankForBand('jhs');
    const shs = bankForBand('shs');
    expect(jhs).toBeNull(); // null = the default (11–14) bank
    expect(shs).toBe(TEEN_QUESTION_BANK);
    expect(bankForBand('tertiary')).toBe(TERTIARY_QUESTION_BANK);
    expect(shs!.learning.questions.map((q) => q.question)).not.toEqual(
      TERTIARY_QUESTION_BANK.learning.questions.map((q) => q.question),
    );
  });
});
