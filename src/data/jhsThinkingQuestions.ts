/**
 * JHS Thinking Styles Assessment questions (Ages 11-14) — verbatim port of
 * the webapp's src/app/utils/jhsThinkingData.ts (JHS_QUESTIONS only —
 * calculateJHSScores is self-contained and doesn't use the rest of that
 * file; SHS_PROGRAMS/CAREER_PATHS/THINKING_STYLES/MIXED_STYLES there only
 * feed the webapp's "Career Explorer" modal, which mobile doesn't replicate).
 * Fixed order matters: calculateJHSScores is slice-based (6 questions per
 * style block, in this exact order), not id-lookup.
 */
export interface JHSQuestion {
  id: number;
  section: 'creative' | 'analytical' | 'practical' | 'reflective';
  text: string;
}

export const JHS_QUESTIONS: JHSQuestion[] = [
  // Creative Thinking (1-6)
  { id: 1, section: 'creative', text: "I like to think of new ways to do things — even if it's not the normal way." },
  { id: 2, section: 'creative', text: 'I often have ideas that surprise people.' },
  { id: 3, section: 'creative', text: 'I enjoy drawing, building, writing, or designing something original.' },
  { id: 4, section: 'creative', text: 'I can turn a small idea into a bigger one.' },
  { id: 5, section: 'creative', text: 'When I see a problem, I like to ask, "What if we tried this instead?"' },
  { id: 6, section: 'creative', text: 'I love to mix imagination with real-life stuff — like creating, inventing, or dreaming.' },

  // Analytical Thinking (7-12)
  { id: 7, section: 'analytical', text: 'I enjoy puzzles, riddles, or brain games that make me think deeply.' },
  { id: 8, section: 'analytical', text: 'I like to find out why or how something works.' },
  { id: 9, section: 'analytical', text: 'I notice small details that others often miss.' },
  { id: 10, section: 'analytical', text: 'I like when facts and reasons help me understand something clearly.' },
  { id: 11, section: 'analytical', text: 'Before I decide, I like to look at all sides of a situation.' },
  { id: 12, section: 'analytical', text: 'I get excited when I find the right answer after thinking hard.' },

  // Practical Thinking (13-18)
  { id: 13, section: 'practical', text: "I like using what I've learned to fix or improve things." },
  { id: 14, section: 'practical', text: 'I enjoy helping others solve real-life problems.' },
  { id: 15, section: 'practical', text: 'I remember lessons better when I can try them in real life.' },
  { id: 16, section: 'practical', text: 'I can find a simple way to solve tricky problems.' },
  { id: 17, section: 'practical', text: 'I prefer doing things that have visible results (like building, organizing, or planning).' },
  { id: 18, section: 'practical', text: 'I like seeing how my ideas work outside the classroom.' },

  // Reflective Thinking (19-24)
  { id: 19, section: 'reflective', text: "After I finish something, I like to think about what went well and what didn't." },
  { id: 20, section: 'reflective', text: "I try to understand other people's ideas or feelings, even when I don't agree." },
  { id: 21, section: 'reflective', text: 'When I make a mistake, I learn from it and try again.' },
  { id: 22, section: 'reflective', text: 'I sometimes stop and ask myself, "Why did I choose that?"' },
  { id: 23, section: 'reflective', text: 'I notice how my feelings affect my choices.' },
  { id: 24, section: 'reflective', text: 'I like talking about what I learned from a situation or activity.' },
];
