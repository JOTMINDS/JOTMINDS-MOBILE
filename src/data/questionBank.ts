// Real questions ported from the webapp's src/app/utils/assessmentQuestions.ts
// (kolbQuestions/sternbergQuestions/dualProcessQuestions — the bank actually
// used by AssessmentTaking.tsx, confirmed live). Mobile's earlier bank was
// sourced from a different, unused file (full-question-bank.tsx) with
// different wording and — for Kolb — a different tagging scheme entirely
// (direct style tags instead of the real CE/RO/AC/AE axis model). Dimension
// counts per assessment match the webapp's own ratio (getPersonalizedQuestions):
// Kolb 3/axis (12 total), Sternberg 4/dimension (12), Dual-Process 6/dimension (12).
export type AssessmentType = 'learning' | 'thinking' | 'decision';
export interface BankQuestion { id: number; question: string; dimension: string; }
export interface AssessmentBank { framework: string; dimensions: string[]; questions: BankQuestion[]; }

export const QUESTION_BANK: Record<AssessmentType, AssessmentBank> = {
  learning: {
    framework: 'Kolb Learning Styles',
    dimensions: ['CE', 'RO', 'AC', 'AE'],
    questions: [
      // Concrete Experience
      { id: 1, question: "I learn best when I'm personally involved in an experience", dimension: 'CE' },
      { id: 2, question: 'I prefer to learn through doing rather than just reading or listening', dimension: 'CE' },
      { id: 3, question: 'I often rely on gut feelings or intuition to make decisions', dimension: 'CE' },
      // Reflective Observation
      { id: 11, question: 'I prefer to observe and think before taking action', dimension: 'RO' },
      { id: 12, question: 'I often take time to reflect on what happened after an experience', dimension: 'RO' },
      { id: 13, question: 'I learn best by watching others and considering different perspectives', dimension: 'RO' },
      // Abstract Conceptualization
      { id: 21, question: 'I like to understand the theory behind things', dimension: 'AC' },
      { id: 22, question: 'I enjoy analyzing problems logically', dimension: 'AC' },
      { id: 23, question: 'I prefer facts and ideas over emotions when learning', dimension: 'AC' },
      // Active Experimentation
      { id: 31, question: 'I enjoy putting new ideas into action', dimension: 'AE' },
      { id: 32, question: 'I learn best by trying things out for myself', dimension: 'AE' },
      { id: 33, question: 'I like to experiment to see what works', dimension: 'AE' },
    ],
  },
  thinking: {
    framework: "Sternberg's Triarchic Theory",
    dimensions: ['analytical', 'creative', 'practical'],
    questions: [
      // Analytical
      { id: 1, question: 'I enjoy solving problems that require logic and reasoning', dimension: 'analytical' },
      { id: 2, question: 'I like breaking complex ideas into smaller parts to understand them', dimension: 'analytical' },
      { id: 3, question: 'I prefer clear facts and evidence over opinions when making decisions', dimension: 'analytical' },
      { id: 4, question: 'I can easily spot errors or inconsistencies in information', dimension: 'analytical' },
      // Creative
      { id: 11, question: 'I enjoy coming up with original ideas or solutions', dimension: 'creative' },
      { id: 12, question: 'I like finding new ways to solve old problems', dimension: 'creative' },
      { id: 13, question: "I often think of creative alternatives when something doesn't work", dimension: 'creative' },
      { id: 14, question: 'I enjoy imagining possibilities that others might not consider', dimension: 'creative' },
      // Practical
      { id: 21, question: "I'm good at finding practical solutions that work in real life", dimension: 'practical' },
      { id: 22, question: 'I can quickly adapt when situations change', dimension: 'practical' },
      { id: 23, question: "I'm confident applying what I know to new or unfamiliar situations", dimension: 'practical' },
      { id: 24, question: 'I prefer solutions that are realistic and doable', dimension: 'practical' },
    ],
  },
  decision: {
    framework: 'Dual-Process Theory',
    dimensions: ['system1', 'system2'],
    questions: [
      // Intuitive/Automatic Thinking
      { id: 1, question: 'I often make decisions based on my gut feeling', dimension: 'system1' },
      { id: 2, question: 'I can sense when something feels right or wrong without much thought', dimension: 'system1' },
      { id: 3, question: 'I trust my instincts more than detailed analysis', dimension: 'system1' },
      { id: 4, question: 'I make choices quickly, even with limited information', dimension: 'system1' },
      { id: 5, question: 'I often go with what feels natural instead of overthinking', dimension: 'system1' },
      { id: 6, question: 'I can recognize patterns or problems almost instantly', dimension: 'system1' },
      // Analytical/Deliberate Thinking
      { id: 11, question: 'I prefer to think carefully before making important decisions', dimension: 'system2' },
      { id: 12, question: 'I take time to evaluate all options before choosing one', dimension: 'system2' },
      { id: 13, question: 'I rely on facts and evidence rather than feelings when deciding', dimension: 'system2' },
      { id: 14, question: 'I like to plan my actions and anticipate possible outcomes', dimension: 'system2' },
      { id: 15, question: 'I double-check information before drawing conclusions', dimension: 'system2' },
      { id: 16, question: 'I enjoy solving problems that require logical reasoning', dimension: 'system2' },
    ],
  },
};
