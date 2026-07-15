/**
 * SHS Thinking Styles Assessment questions (Ages 15-18) — verbatim port of
 * the webapp's src/app/utils/shsThinkingData.ts's shsQuestions.
 */
export interface SHSQuestion {
  id: number;
  text: string;
  style: 'creative' | 'analytical' | 'practical' | 'reflective';
  section: string;
}

export const shsQuestions: SHSQuestion[] = [
  // Creative Thinking (6 questions)
  { id: 1, text: 'When working on a group project, I prefer to brainstorm innovative solutions rather than follow traditional methods', style: 'creative', section: 'Creative Thinking' },
  { id: 2, text: 'I enjoy exploring artistic or creative subjects like design, music, or writing in my free time', style: 'creative', section: 'Creative Thinking' },
  { id: 3, text: 'I find it easy to think of multiple ways to solve a problem, even unconventional ones', style: 'creative', section: 'Creative Thinking' },
  { id: 4, text: 'I get excited about projects that allow me to express my original ideas and imagination', style: 'creative', section: 'Creative Thinking' },
  { id: 5, text: 'When reading or watching stories, I often imagine alternative endings or plotlines', style: 'creative', section: 'Creative Thinking' },
  { id: 6, text: "I'm comfortable taking creative risks, even if the outcome is uncertain", style: 'creative', section: 'Creative Thinking' },

  // Analytical Thinking (6 questions)
  { id: 7, text: 'I enjoy solving complex math or logic problems that require systematic thinking', style: 'analytical', section: 'Analytical Thinking' },
  { id: 8, text: 'Before making decisions, I carefully analyze all available information and evidence', style: 'analytical', section: 'Analytical Thinking' },
  { id: 9, text: 'I prefer subjects that involve clear rules, patterns, and logical reasoning', style: 'analytical', section: 'Analytical Thinking' },
  { id: 10, text: 'I question claims and arguments until I understand the underlying logic', style: 'analytical', section: 'Analytical Thinking' },
  { id: 11, text: 'I excel at identifying patterns and relationships between different concepts', style: 'analytical', section: 'Analytical Thinking' },
  { id: 12, text: 'I enjoy researching topics in depth to understand how things work', style: 'analytical', section: 'Analytical Thinking' },

  // Practical Thinking (6 questions)
  { id: 13, text: 'I prefer learning through hands-on activities and real-world applications', style: 'practical', section: 'Practical Thinking' },
  { id: 14, text: 'When faced with a problem, I focus on finding solutions that work in practice', style: 'practical', section: 'Practical Thinking' },
  { id: 15, text: "I'm skilled at organizing tasks and managing my time effectively", style: 'practical', section: 'Practical Thinking' },
  { id: 16, text: 'I value efficiency and like to find the most practical way to achieve goals', style: 'practical', section: 'Practical Thinking' },
  { id: 17, text: "I'm comfortable using tools, technology, or resources to complete tasks", style: 'practical', section: 'Practical Thinking' },
  { id: 18, text: 'I prefer subjects that have clear, real-world applications and uses', style: 'practical', section: 'Practical Thinking' },

  // Reflective Thinking (6 questions)
  { id: 19, text: 'I regularly think about my experiences and what I can learn from them', style: 'reflective', section: 'Reflective Thinking' },
  { id: 20, text: 'I enjoy exploring philosophical questions and discussing deeper meanings', style: 'reflective', section: 'Reflective Thinking' },
  { id: 21, text: "I'm aware of my strengths and weaknesses and actively work on self-improvement", style: 'reflective', section: 'Reflective Thinking' },
  { id: 22, text: 'Before making important decisions, I take time to consider different perspectives', style: 'reflective', section: 'Reflective Thinking' },
  { id: 23, text: 'I find value in understanding my emotions and how they influence my choices', style: 'reflective', section: 'Reflective Thinking' },
  { id: 24, text: 'I enjoy journaling, meditation, or other activities that promote self-awareness', style: 'reflective', section: 'Reflective Thinking' },
];
