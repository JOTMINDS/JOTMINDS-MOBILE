import { EDUCATION_LEVELS, levelFromAge, isPreschoolLevel } from '../educationLevels';
import { getThinkingStylesTrack } from '../thinkingStylesTrack';

describe('educationLevels', () => {
  it('offers Pre-school first, using the webapp value', () => {
    expect(EDUCATION_LEVELS[0]).toEqual({ value: 'Pre-school', label: 'Pre-school' });
    expect(EDUCATION_LEVELS.map((l) => l.value)).toEqual(['Pre-school', 'Elementary', 'JHS', 'SHS', 'Tertiary']);
  });
  it('derives level from young ages like the webapp migration', () => {
    expect(levelFromAge(4)).toBe('Pre-school');
    expect(levelFromAge(6)).toBe('Pre-school');
    expect(levelFromAge(7)).toBe('Elementary');
    expect(levelFromAge(10)).toBe('Elementary');
    expect(levelFromAge(11)).toBeUndefined();
    expect(levelFromAge(0)).toBeUndefined();
  });
  it('recognises the pre-school aliases', () => {
    ['Pre-school', 'preschool', 'Early Years', 'Nursery', 'Kindergarten', 'Crèche'].forEach((l) => expect(isPreschoolLevel(l)).toBe(true));
    ['JHS', 'Elementary', '', undefined].forEach((l) => expect(isPreschoolLevel(l)).toBe(false));
  });
  it('gives Pre-school users no thinking-styles track', () => {
    expect(getThinkingStylesTrack({ educationLevel: 'Pre-school', age: 5 } as any)).toBeNull();
  });
});
