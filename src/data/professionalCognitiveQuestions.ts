/**
 * Professional Cognitive Assessment items — ported verbatim from the webapp's
 * ProfessionalCognitiveAssessment.tsx. 1–5 Likert; the last section is optional.
 */
export type ProfessionalSectionId = 'learning' | 'thinking' | 'decisionMaking' | 'motivation';

export interface ProfessionalSection {
  id: ProfessionalSectionId;
  title: string;
  icon: string;
  description: string;
  benefit: string;
  questions: string[];
  optional?: boolean;
}

export const PROFESSIONAL_SECTIONS: ProfessionalSection[] = [
  {
    id: 'learning', title: 'Learning Preferences', icon: '🧠',
    description: 'How you prefer to acquire and apply knowledge',
    benefit: 'Understanding how you learn best helps you adapt quickly, collaborate more effectively, and retain information better.',
    questions: [
      'I learn best by trying things out rather than only reading about them.',
      'I prefer to reflect and analyze before putting ideas into action.',
      'I like to connect ideas and build frameworks before starting a task.',
      'I learn best when I can observe and take notes before participating.',
      'I enjoy experimenting with new approaches to test my understanding.',
      'I prefer when learning is linked to real-world challenges or outcomes.',
    ],
  },
  {
    id: 'thinking', title: 'Thinking Orientation', icon: '💡',
    description: 'How you process, organize, and interpret ideas',
    benefit: 'Thinking orientation reveals how you approach problems, innovate, and combine creativity with logic.',
    questions: [
      'I enjoy finding new ways to solve familiar problems.',
      'I often back my ideas with data, logic, or clear reasoning.',
      'I can see patterns and relationships between unrelated ideas.',
      "I'm comfortable switching between big-picture and details.",
      'I like to question assumptions and explore alternative solutions.',
      'I feel most productive when balancing creativity with structure.',
    ],
  },
  {
    id: 'decisionMaking', title: 'Decision-Making Behavior', icon: '⚖️',
    description: 'How you evaluate information and take action',
    benefit: 'Understanding your decision-making style improves leadership, judgment, and problem-solving under pressure.',
    questions: [
      'I make decisions by weighing pros and cons before acting.',
      'I trust my intuition when a quick choice is needed.',
      'I prefer to collect enough information before committing.',
      'Under pressure, I rely on experience more than analysis.',
      'I seek feedback before finalizing important decisions.',
      'I can balance logic with instinct when leading a project.',
    ],
  },
  {
    id: 'motivation', title: 'Professional Motivation & Collaboration', icon: '🤝',
    description: 'Your motivation drivers and collaboration preferences',
    benefit: 'Optional section for extended insights on teamwork and autonomy.',
    questions: [
      'I perform best in environments that allow autonomy and experimentation.',
      'I feel most engaged when I can see the results of my work.',
      'Constructive feedback helps me refine my approach.',
      'I value collaboration and brainstorming before final execution.',
    ],
    optional: true,
  },
];

export const LIKERT = [
  { value: 1, label: 'Strongly disagree' },
  { value: 2, label: 'Disagree' },
  { value: 3, label: 'Neutral' },
  { value: 4, label: 'Agree' },
  { value: 5, label: 'Strongly agree' },
];
