import { getFriendlyStyleName, getFriendlyStyleDisplay } from '../styleWording';
import { STYLE_DESCRIPTIONS } from '../scoring';

describe('styleWording', () => {
  it('maps every stored style key to a friendly name, case-insensitively', () => {
    expect(getFriendlyStyleName('Accommodating')).toBe('Hands-On Explorer');
    expect(getFriendlyStyleName('analytical')).toBe('Critical Thinker');
    expect(getFriendlyStyleName('Reflective')).toBe('Deliberate Decision-Maker');
  });
  it('keeps the original key visible and is idempotent', () => {
    expect(getFriendlyStyleDisplay('Converging')).toBe('Practical Problem-Solver (Converging)');
    expect(getFriendlyStyleDisplay('Practical Problem-Solver')).toBe('Practical Problem-Solver');
    expect(getFriendlyStyleDisplay(undefined)).toBe('Assessment Profile');
  });
  it('has a description for every style key the scorers can emit', () => {
    for (const k of ['Diverging', 'Assimilating', 'Converging', 'Accommodating', 'Analytical', 'Creative', 'Practical', 'Intuitive', 'Reflective', 'Balanced']) {
      expect(STYLE_DESCRIPTIONS[k]).toBeTruthy();
    }
  });
});
