/**
 * Adult Thinking Styles Assessment questions (Ages 19+) — verbatim port of
 * the webapp's src/app/utils/adultThinkingData.ts's adultQuestions.
 */
export interface AdultQuestion {
  id: number;
  text: string;
  style: 'creative' | 'analytical' | 'practical' | 'reflective';
  section: string;
}

export const adultQuestions: AdultQuestion[] = [
  // Creative Thinking (6 questions)
  { id: 1, text: 'In my professional work, I actively seek innovative solutions and unconventional approaches to challenges', style: 'creative', section: 'Creative Thinking' },
  { id: 2, text: 'I thrive in environments that encourage experimentation and value original ideas', style: 'creative', section: 'Creative Thinking' },
  { id: 3, text: 'When brainstorming, I can easily generate multiple creative alternatives to any given problem', style: 'creative', section: 'Creative Thinking' },
  { id: 4, text: 'I find satisfaction in developing new concepts, designs, or strategies from scratch', style: 'creative', section: 'Creative Thinking' },
  { id: 5, text: "I'm comfortable with ambiguity and can transform abstract ideas into tangible outcomes", style: 'creative', section: 'Creative Thinking' },
  { id: 6, text: 'I regularly challenge conventional wisdom and established practices to find better ways of doing things', style: 'creative', section: 'Creative Thinking' },

  // Analytical Thinking (6 questions)
  { id: 7, text: 'I excel at breaking down complex problems into manageable components for systematic analysis', style: 'analytical', section: 'Analytical Thinking' },
  { id: 8, text: 'I make decisions based on data, evidence, and logical reasoning rather than intuition alone', style: 'analytical', section: 'Analytical Thinking' },
  { id: 9, text: "I'm skilled at identifying patterns, trends, and relationships in information", style: 'analytical', section: 'Analytical Thinking' },
  { id: 10, text: 'I critically evaluate arguments and claims by examining their underlying assumptions and logic', style: 'analytical', section: 'Analytical Thinking' },
  { id: 11, text: 'I enjoy conducting research and analyzing information to solve problems or answer questions', style: 'analytical', section: 'Analytical Thinking' },
  { id: 12, text: "I'm adept at using quantitative methods and metrics to evaluate performance and outcomes", style: 'analytical', section: 'Analytical Thinking' },

  // Practical Thinking (6 questions)
  { id: 13, text: 'I focus on implementing solutions that produce tangible, measurable results', style: 'practical', section: 'Practical Thinking' },
  { id: 14, text: "I'm skilled at resource management and optimizing processes for maximum efficiency", style: 'practical', section: 'Practical Thinking' },
  { id: 15, text: 'I excel at translating strategic plans into actionable steps and deliverables', style: 'practical', section: 'Practical Thinking' },
  { id: 16, text: 'I prioritize pragmatic solutions that work within real-world constraints and limitations', style: 'practical', section: 'Practical Thinking' },
  { id: 17, text: "I'm effective at project management and ensuring tasks are completed on time and within budget", style: 'practical', section: 'Practical Thinking' },
  { id: 18, text: 'I value hands-on experience and learn best through direct application and practice', style: 'practical', section: 'Practical Thinking' },

  // Reflective Thinking (6 questions)
  { id: 19, text: 'I regularly engage in self-assessment to understand my strengths, weaknesses, and growth areas', style: 'reflective', section: 'Reflective Thinking' },
  { id: 20, text: 'I value deep contemplation and take time to consider multiple perspectives before acting', style: 'reflective', section: 'Reflective Thinking' },
  { id: 21, text: "I'm skilled at understanding complex interpersonal dynamics and emotional intelligence", style: 'reflective', section: 'Reflective Thinking' },
  { id: 22, text: "I learn from experiences by analyzing what worked, what didn't, and why", style: 'reflective', section: 'Reflective Thinking' },
  { id: 23, text: "I'm conscious of ethical implications and consider the broader impact of decisions on stakeholders", style: 'reflective', section: 'Reflective Thinking' },
  { id: 24, text: 'I engage in continuous professional development and seek feedback to improve my practice', style: 'reflective', section: 'Reflective Thinking' },
];
