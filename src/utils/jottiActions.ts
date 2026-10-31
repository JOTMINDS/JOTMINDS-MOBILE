import { classStyles, styleDistribution, DOMAINS } from './classInsights';

/**
 * What Jotti can help with, by role. Each action is a starter on the Ask Jotti
 * screen and a quick chip on the Home card. `send` actions have a complete
 * prompt and are sent straight away; `prefill` actions need a topic from the
 * user, so they fill the input and wait.
 */
export interface JottiAction {
  id: string;
  icon: string;
  label: string;
  prompt: string;
  mode: 'send' | 'prefill';
}

const TEACHER: JottiAction[] = [
  { id: 'class', icon: '📊', label: 'Understand my class', mode: 'send',
    prompt: 'Using my class profile, what are the main learning, thinking and decision patterns, and what should I change in my teaching this week?' },
  { id: 'differentiate', icon: '🎯', label: 'Differentiate a lesson', mode: 'prefill',
    prompt: 'Show me how to adapt a lesson for the different learner types in my class. The lesson is about: ' },
  { id: 'parent', icon: '✉️', label: 'Draft a parent message', mode: 'prefill',
    prompt: 'Draft a short, kind and professional message to a parent about: ' },
  { id: 'quiz', icon: '📝', label: 'Make a quick quiz', mode: 'prefill',
    prompt: 'Create a 5-question quiz with answers on: ' },
  { id: 'support', icon: '🤝', label: 'Support a struggling learner', mode: 'prefill',
    prompt: 'A student is struggling with: ' },
  { id: 'manage', icon: '🏫', label: 'Classroom management idea', mode: 'send',
    prompt: 'Give me 3 practical classroom management strategies that suit the learning styles in my class.' },
  { id: 'plan', icon: '🗂️', label: 'Plan a lesson', mode: 'prefill',
    prompt: 'Help me plan a lesson on: ' },
  { id: 'reflect', icon: '💭', label: 'Reflect on a lesson', mode: 'prefill',
    prompt: 'Help me reflect on a lesson. Here is what happened: ' },
  { id: 'energy', icon: '🌿', label: 'Manage my workload', mode: 'send',
    prompt: 'Suggest one small, realistic habit that would help me manage my workload and energy this week.' },
];

const STUDENT: JottiAction[] = [
  { id: 'study', icon: '📚', label: 'Study plan', mode: 'send', prompt: 'How can I study more effectively for my exams?' },
  { id: 'style', icon: '🧠', label: 'Use my thinking style', mode: 'send', prompt: 'What learning strategies fit my thinking style?' },
  { id: 'explain', icon: '💡', label: 'Explain a topic simply', mode: 'prefill', prompt: 'Explain this in simple words: ' },
  { id: 'quiz', icon: '📝', label: 'Quiz me', mode: 'prefill', prompt: 'Quiz me with 5 questions on: ' },
];

const PARENT: JottiAction[] = [
  { id: 'home', icon: '🏠', label: 'Support learning at home', mode: 'send', prompt: 'How can I support my child’s learning at home?' },
  { id: 'profile', icon: '🧠', label: 'Understand their profile', mode: 'send', prompt: 'What does my child’s cognitive profile mean for homework?' },
  { id: 'teacher', icon: '✉️', label: 'Talk to the teacher', mode: 'prefill', prompt: 'Help me write a message to my child’s teacher about: ' },
];

const PROFESSIONAL: JottiAction[] = [
  { id: 'strengths', icon: '💪', label: 'Play to my strengths', mode: 'send', prompt: 'How do I play to my cognitive strengths at work?' },
  { id: 'decision', icon: '🎯', label: 'Prepare a decision', mode: 'prefill', prompt: 'Help me prepare for a high-stakes decision: ' },
  { id: 'growth', icon: '📈', label: 'Plan my growth', mode: 'send', prompt: 'Suggest a 30-day plan to grow the skill I most need to develop.' },
];

const BY_ROLE: Record<string, JottiAction[]> = { teacher: TEACHER, student: STUDENT, parent: PARENT, professional: PROFESSIONAL };

export const jottiActionsFor = (role?: string): JottiAction[] => BY_ROLE[role ?? ''] ?? STUDENT;

/** One line under the Home card title, so the card says what Jotti can do for this role. */
export const JOTTI_BLURB: Record<string, string> = {
  teacher: 'Understand your class, plan lessons, draft parent notes, write quizzes',
  student: 'Study plans, simple explanations and quizzes',
  parent: 'Support your child’s learning at home',
  professional: 'Decisions, growth and workplace coaching',
};

export interface ClassSummary {
  studentCount: number;
  studentsWithResults: number;
  learning: string[];
  thinking: string[];
  decision: string[];
}

/**
 * Compact, anonymous snapshot of a teacher's class for Jotti's context: counts and
 * style shares only, never names or emails. Undefined when there is no roster.
 */
export function buildClassSummary(students: any[]): ClassSummary | undefined {
  if (!Array.isArray(students) || students.length === 0) return undefined;
  const dist = styleDistribution(students);
  const top = (d: (typeof DOMAINS)[number]) => dist[d].rows.slice(0, 4).map((r) => `${r.style} ${r.percent}%`);
  return {
    studentCount: students.length,
    studentsWithResults: classStyles(students).profiled,
    learning: top('learning'),
    thinking: top('thinking'),
    decision: top('decision'),
  };
}
