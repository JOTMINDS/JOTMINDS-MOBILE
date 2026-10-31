import { articleSpeech } from '../articleSpeech';

describe('articleSpeech', () => {
  it('reads the title, then each heading with its body', () => {
    expect(articleSpeech('Mistakes Help You Grow', [
      { heading: 'Did you know?', body: 'Your brain grows.' },
      { heading: 'Try it!', body: 'Say “not yet”.' },
    ])).toBe('Mistakes Help You Grow\n\nDid you know?. Your brain grows.\n\nTry it!. Say “not yet”.');
  });

  it('collapses stray whitespace and skips empty parts', () => {
    expect(articleSpeech('  Title ', [{ heading: 'A', body: 'one\n  two' }])).toBe('Title\n\nA. one two');
    expect(articleSpeech('', [])).toBe('');
  });
});
