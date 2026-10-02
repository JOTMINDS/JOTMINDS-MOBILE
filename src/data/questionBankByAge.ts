// Age-specific core-assessment question banks — 12 questions each
// (3/4/6 per dimension, same shape as QUESTION_BANK in ./questionBank.ts).
// Pulled from the webapp's assessmentQuestions_teen.ts / _tertiary.ts pools
// so a JHS/SHS/tertiary student gets age-appropriate wording instead of the
// adult phrasing. Under 15 uses the default bank (or Kids mode under 13).
import { AssessmentType, AssessmentBank } from './questionBank';

export const TEEN_QUESTION_BANK: Record<AssessmentType, AssessmentBank> = {
  learning: {
    framework: 'Kolb Learning Styles',
    dimensions: ['CE', 'RO', 'AC', 'AE'],
    questions: [
      { id: 1, question: "I learn best when I can experience something directly.", dimension: 'CE' },
      { id: 2, question: "I remember lessons better when they connect with real-life examples.", dimension: 'CE' },
      { id: 3, question: "I prefer learning through activities rather than long explanations.", dimension: 'CE' },
      { id: 4, question: "I like to think quietly before I answer a question.", dimension: 'RO' },
      { id: 5, question: "I learn best when I have time to reflect on new ideas.", dimension: 'RO' },
      { id: 6, question: "I prefer watching others before I try something new.", dimension: 'RO' },
      { id: 7, question: "I like learning rules and formulas.", dimension: 'AC' },
      { id: 8, question: "I prefer structured lessons with clear explanations.", dimension: 'AC' },
      { id: 9, question: "I enjoy solving logical problems.", dimension: 'AC' },
      { id: 10, question: "I like trying out new ideas right away.", dimension: 'AE' },
      { id: 11, question: "I learn best by doing something with what I have learned.", dimension: 'AE' },
      { id: 12, question: "I prefer to test things instead of just thinking about them.", dimension: 'AE' },
    ],
  },
  thinking: {
    framework: 'Sternberg Thinking Styles',
    dimensions: ['analytical', 'creative', 'practical'],
    questions: [
      { id: 1, question: "I enjoy solving logic puzzles.", dimension: 'analytical' },
      { id: 2, question: "I like comparing different ideas to see which one is best.", dimension: 'analytical' },
      { id: 3, question: "I can easily spot errors in arguments.", dimension: 'analytical' },
      { id: 4, question: "I like looking for evidence before believing something.", dimension: 'analytical' },
      { id: 5, question: "I enjoy coming up with unusual ideas.", dimension: 'creative' },
      { id: 6, question: "I like imagining new possibilities.", dimension: 'creative' },
      { id: 7, question: "I enjoy drawing, designing, or building creative things.", dimension: 'creative' },
      { id: 8, question: "I like thinking outside the box.", dimension: 'creative' },
      { id: 9, question: "I enjoy solving real-world problems.", dimension: 'practical' },
      { id: 10, question: "I like applying what I learn to real-life situations.", dimension: 'practical' },
      { id: 11, question: "I prefer practical tasks over theoretical ones.", dimension: 'practical' },
      { id: 12, question: "I enjoy fixing or improving things around me.", dimension: 'practical' },
    ],
  },
  decision: {
    framework: 'Dual-Process Decision Making',
    dimensions: ['system1', 'system2'],
    questions: [
      { id: 1, question: "I make decisions quickly based on my first feeling.", dimension: 'system1' },
      { id: 2, question: "I often rely on my instincts when making choices.", dimension: 'system1' },
      { id: 3, question: "I can decide fast without overthinking.", dimension: 'system1' },
      { id: 4, question: "I trust my first reaction in most situations.", dimension: 'system1' },
      { id: 5, question: "I can solve problems quickly when under pressure.", dimension: 'system1' },
      { id: 6, question: "I often choose what feels right at the time.", dimension: 'system1' },
      { id: 7, question: "I take time to analyse a situation before making a decision.", dimension: 'system2' },
      { id: 8, question: "I prefer to think carefully before acting.", dimension: 'system2' },
      { id: 9, question: "I weigh the pros and cons before choosing.", dimension: 'system2' },
      { id: 10, question: "I double-check information before I decide.", dimension: 'system2' },
      { id: 11, question: "I enjoy slow and thoughtful decision-making.", dimension: 'system2' },
      { id: 12, question: "I rely on logic more than feelings.", dimension: 'system2' },
    ],
  },
};

export const TERTIARY_QUESTION_BANK: Record<AssessmentType, AssessmentBank> = {
  learning: {
    framework: 'Kolb Learning Styles',
    dimensions: ['CE', 'RO', 'AC', 'AE'],
    questions: [
      { id: 1, question: "I enjoy learning by watching others before trying something myself", dimension: 'CE' },
      { id: 2, question: "I enjoy subjects that allow creativity or storytelling", dimension: 'CE' },
      { id: 3, question: "I find it easy to understand how others feel", dimension: 'CE' },
      { id: 4, question: "I like to look at situations from many different angles", dimension: 'RO' },
      { id: 5, question: "I prefer group discussions to hands-on activities", dimension: 'RO' },
      { id: 6, question: "I learn best when I can reflect quietly on new ideas", dimension: 'RO' },
      { id: 7, question: "I enjoy learning through clear explanations and theories", dimension: 'AC' },
      { id: 8, question: "I prefer structured lessons with defined goals", dimension: 'AC' },
      { id: 9, question: "I learn best when information is organized logically", dimension: 'AC' },
      { id: 10, question: "I learn best by applying ideas to real problems", dimension: 'AE' },
      { id: 11, question: "I enjoy experimenting with solutions", dimension: 'AE' },
      { id: 12, question: "I enjoy learning new tools or technologies", dimension: 'AE' },
    ],
  },
  thinking: {
    framework: 'Sternberg Thinking Styles',
    dimensions: ['analytical', 'creative', 'practical'],
    questions: [
      { id: 1, question: "I enjoy breaking problems into smaller parts to understand them", dimension: 'analytical' },
      { id: 2, question: "I like evaluating different arguments before choosing one", dimension: 'analytical' },
      { id: 3, question: "I prefer tasks that require logical thinking", dimension: 'analytical' },
      { id: 4, question: "I enjoy identifying mistakes in reasoning", dimension: 'analytical' },
      { id: 5, question: "I enjoy coming up with new ideas", dimension: 'creative' },
      { id: 6, question: "I like imagining different ways to solve a problem", dimension: 'creative' },
      { id: 7, question: "I enjoy thinking of creative alternatives", dimension: 'creative' },
      { id: 8, question: "I prefer assignments that allow creativity", dimension: 'creative' },
      { id: 9, question: "I enjoy applying what I learn to real-life situations", dimension: 'practical' },
      { id: 10, question: "I prefer tasks that have practical value", dimension: 'practical' },
      { id: 11, question: "I like solving everyday problems", dimension: 'practical' },
      { id: 12, question: "I enjoy figuring out how to make things work", dimension: 'practical' },
    ],
  },
  decision: {
    framework: 'Dual-Process Decision Making',
    dimensions: ['system1', 'system2'],
    questions: [
      { id: 1, question: "I often rely on my first impression when making decisions", dimension: 'system1' },
      { id: 2, question: "I can usually sense the right choice without much thought", dimension: 'system1' },
      { id: 3, question: "I trust my gut feelings in tough situations", dimension: 'system1' },
      { id: 4, question: "I make decisions quickly without needing lots of information", dimension: 'system1' },
      { id: 5, question: "I often go with what feels right in the moment", dimension: 'system1' },
      { id: 6, question: "I rely on instinct when there isn't time to think", dimension: 'system1' },
      { id: 7, question: "I prefer thinking carefully before making decisions", dimension: 'system2' },
      { id: 8, question: "I like gathering information before choosing", dimension: 'system2' },
      { id: 9, question: "I evaluate pros and cons before acting", dimension: 'system2' },
      { id: 10, question: "I reflect deeply on important choices", dimension: 'system2' },
      { id: 11, question: "I double-check information before deciding", dimension: 'system2' },
      { id: 12, question: "I prefer structured and thoughtful decision-making", dimension: 'system2' },
    ],
  },
};

/** Pick the core-assessment bank for a user's age. undefined age → default (adult) bank. */
export function bankForAge(age: number | undefined): Record<AssessmentType, AssessmentBank> | null {
  if (typeof age !== 'number') return null;
  if (age >= 15 && age <= 18) return TEEN_QUESTION_BANK;
  if (age >= 19 && age <= 25) return TERTIARY_QUESTION_BANK;
  return null;
}
