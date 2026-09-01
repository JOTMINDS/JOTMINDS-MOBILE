/**
 * Daily Challenge content generators — ported from the webapp's
 * DailyChallengeTab.tsx. Four challenge types rotate by day number
 * (questions → puzzle → reflection → practical), each with youth / teen /
 * adult variants. Server scores completion by the challenge id prefix, so
 * ids MUST stay `{type}-{timestamp}`.
 */

export type ChallengeType = 'questions' | 'puzzle' | 'reflection' | 'practical';

export interface DailyChallenge {
  id: string;
  type: ChallengeType;
  content: any;
  points: number;
}

type AgeGroup = 'youth' | 'teen' | 'adult';

// Webapp collapsed adults into 'teen' by accident; mobile routes them to the
// adult content set they were always meant to see.
function getAgeGroup(age: number): AgeGroup {
  const a = age || 16;
  if (a >= 6 && a <= 14) return 'youth';
  if (a >= 15 && a <= 18) return 'teen';
  return 'adult';
}

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// ── Questions ────────────────────────────────────────────────────────────
const QUESTION_SETS: Record<AgeGroup, { domainLabel: string; question: string; options: string[]; dimension: string[] }[]> = {
  youth: [
    {
      domainLabel: 'Learning Style',
      question: 'When learning something new in class, how do you like to learn best?',
      options: [
        'Watching video demonstrations and diagrams (Visual / Abstract)',
        'Doing hands-on experiments and building things (Concrete / Active)',
        'Listening quietly and reflecting on examples (Reflective Observation)',
        'Reading step-by-step summary guides (Assimilating)',
      ],
      dimension: ['visual', 'kinesthetic', 'reflective', 'analytical'],
    },
    {
      domainLabel: 'Thinking Style',
      question: 'When solving a fun class puzzle or assignment, what is your primary strategy?',
      options: [
        'Logical step-by-step reasoning and checking details (Analytical)',
        'Thinking of creative, non-traditional ideas (Creative)',
        'Using real-life examples and practical tools (Practical)',
        'Reflecting deeply about why the puzzle matters (Reflective)',
      ],
      dimension: ['analytical', 'creative', 'practical', 'reflective'],
    },
    {
      domainLabel: 'Decision Style (Dual-Process)',
      question: 'When making a quick choice during a quiz or game, how do you decide?',
      options: [
        'Go with my rapid first gut feeling (Intuitive - System 1)',
        'Stop to check the facts carefully first (Deliberate - System 2)',
        'Ask my team members what they think (Collaborative)',
        'Combine a quick initial guess with a logic check (Balanced)',
      ],
      dimension: ['intuitive', 'deliberate', 'collaborative', 'balanced'],
    },
  ],
  teen: [
    {
      domainLabel: 'Learning Style',
      question: 'When reviewing complex study material for an exam, how do you learn best?',
      options: [
        'Visual diagrams, flowcharts, and mind maps (Visual / Abstract)',
        'Hands-on practice problems and physical experiments (Concrete / Active)',
        'Quiet reflection and watching video walkthroughs (Reflective Observation)',
        'Reading comprehensive notes and organizing theoretical concepts (Assimilating)',
      ],
      dimension: ['visual', 'kinesthetic', 'reflective', 'analytical'],
    },
    {
      domainLabel: 'Thinking Style',
      question: 'When tasked with analyzing a multi-step project, what is your primary approach?',
      options: [
        'Break down data logically and evaluate evidence (Analytical)',
        'Brainstorm innovative ideas and non-traditional angles (Creative)',
        'Focus on real-world execution and practical steps (Practical)',
        'Connect the project to broader goals and ethical outcomes (Reflective)',
      ],
      dimension: ['analytical', 'creative', 'practical', 'reflective'],
    },
    {
      domainLabel: 'Decision Style (Dual-Process)',
      question: 'When making a decision under time pressure, how do you balance speed and accuracy?',
      options: [
        'Rely on rapid gut intuition and pattern matching (Intuitive - System 1)',
        'Pause to deliberate, compare options, and double-check facts (Deliberate - System 2)',
        'Consult peers or mentors before reaching a conclusion (Collaborative)',
        'Combine initial intuition with a quick mental logic check (Balanced)',
      ],
      dimension: ['intuitive', 'deliberate', 'collaborative', 'balanced'],
    },
  ],
  adult: [
    {
      domainLabel: 'Learning Style',
      question: 'When learning new methods or concepts, how do you process information best?',
      options: [
        'Visual maps and structured conceptual diagrams (Visual / Abstract)',
        'Direct application and hands-on practice (Concrete / Active)',
        'Observing expert demos and reflective analysis (Reflective Observation)',
        'Synthesizing theoretical frameworks and literature (Assimilating)',
      ],
      dimension: ['visual', 'kinesthetic', 'reflective', 'analytical'],
    },
    {
      domainLabel: 'Thinking Style',
      question: 'When approaching a professional challenge, what is your default thinking strategy?',
      options: [
        'Conduct systematic analysis and data-driven evaluation (Analytical)',
        'Develop innovative strategies and non-linear solutions (Creative)',
        'Implement proven frameworks and actionable steps (Practical)',
        'Consider long-term systemic implications and ethics (Reflective)',
      ],
      dimension: ['analytical', 'creative', 'practical', 'reflective'],
    },
    {
      domainLabel: 'Decision Style (Dual-Process)',
      question: 'In key decision-making scenarios, how do you make high-stakes choices?',
      options: [
        'Leverage rapid pattern recognition and intuition (Intuitive - System 1)',
        'Conduct structured risk analysis and evidence checks (Deliberate - System 2)',
        'Seek consensus and collaborative feedback (Collaborative)',
        'Integrate rapid intuition with deliberate verification (Balanced)',
      ],
      dimension: ['intuitive', 'deliberate', 'collaborative', 'balanced'],
    },
  ],
};

// ── Puzzles ──────────────────────────────────────────────────────────────
const PUZZLES: Record<AgeGroup, { title: string; description: string; hint: string; answer: string; explanation: string }[]> = {
  youth: [
    { title: 'Pattern Detective 🔍', description: 'Look at this sequence: 2, 4, 8, 16, ___. What comes next and why?', hint: 'Each number is double the previous one!', answer: '32', explanation: 'Each number is multiplied by 2, so 16 × 2 = 32' },
    { title: 'Word Wizard 🎨', description: "How many words can you make from the letters in 'CREATIVE'? (Minimum 3 letters)", hint: 'Try mixing the letters in different ways!', answer: '10', explanation: 'Examples: CREATE, REACT, ACTIVE, TRACE, CRATE, etc.' },
    { title: 'Logic Puzzle 🧩', description: 'If all Bloops are Razzies and all Razzies are Lazzies, are all Bloops definitely Lazzies?', hint: 'Think step by step!', answer: 'yes', explanation: 'If A=B and B=C, then A=C. So yes, all Bloops are Lazzies!' },
  ],
  teen: [
    { title: 'Strategic Thinking 🎯', description: 'You have 100 meters of fencing to create a rectangular garden. What dimensions give you the maximum area?', hint: 'Think about squares vs rectangles!', answer: '25x25', explanation: 'A square (25m × 25m = 625 m²) gives the maximum area for a fixed perimeter' },
    { title: 'Analytical Challenge 📊', description: 'If it takes 5 machines 5 minutes to make 5 widgets, how long would it take 100 machines to make 100 widgets?', hint: "Don't overthink it!", answer: '5', explanation: 'Each machine takes 5 minutes to make 1 widget, so 100 machines still take 5 minutes' },
  ],
  adult: [
    { title: 'Business Logic 💼', description: "A company's revenue grew from $100k to $121k. What was the percentage increase?", hint: 'Calculate the difference first!', answer: '21', explanation: '($121k - $100k) / $100k = 21% increase' },
    { title: 'Systems Thinking 🔄', description: 'In a circular meeting table with 8 seats, how many unique seating arrangements are possible?', hint: 'Rotations that look the same should count as one!', answer: '5040', explanation: '(8-1)! = 7! = 5,040 unique arrangements when accounting for rotational symmetry' },
  ],
};

// ── Reflection prompts ───────────────────────────────────────────────────
const REFLECTIONS: Record<AgeGroup, string[]> = {
  youth: [
    'Think about a time when you solved a problem in a creative way. What did you do differently? How did it feel?',
    'What\'s one thing you learned this week that made you think differently about something?',
    'If you could teach one skill to everyone in your class, what would it be and why?',
    'Describe a moment when you had to think really carefully before making a decision. What helped you decide?',
  ],
  teen: [
    'Reflect on a recent academic challenge. Which thinking style (creative, analytical, practical, reflective) did you use most? Why?',
    'How has your approach to problem-solving changed over the past year? What influenced this change?',
    'Consider a subject you find difficult. How could you apply different thinking styles to improve your understanding?',
    'What role does reflection play in your learning process? Give a specific example.',
  ],
  adult: [
    'Analyze a recent professional decision. How did your dominant thinking style influence the outcome?',
    'What thinking style do you use least often? How might developing it benefit your career?',
    'Reflect on a workplace challenge that required balancing multiple thinking approaches. What did you learn?',
    'How do you adapt your thinking style when collaborating with colleagues who think differently than you?',
  ],
};

// ── Practical challenges ─────────────────────────────────────────────────
const PRACTICALS: Record<AgeGroup, { title: string; task: string; checkboxes: string[] }[]> = {
  youth: [
    { title: 'Creative Thinking Mission 🎨', task: 'Today, try to come up with 3 different ways to solve ONE problem you face. It could be organizing your homework, remembering something, or anything else!', checkboxes: ['I identified a problem I want to solve', 'I thought of at least 3 different solutions', 'I tried the most creative solution'] },
    { title: 'Analytical Thinking Quest 🔍', task: 'Pick something you use every day (like a pencil, phone, or backpack). Ask yourself: Why is it designed this way? What makes it work well? What could be improved?', checkboxes: ['I chose an everyday object to analyze', "I thought about why it's designed that way", 'I came up with one improvement idea'] },
    { title: 'Practical Thinking Challenge 🛠️', task: 'Find one thing in your daily routine that could be more efficient. Make a simple plan to improve it, then try it out!', checkboxes: ['I identified something to improve', 'I made a practical plan', 'I tested my improvement'] },
  ],
  teen: [
    { title: 'Creative Innovation Task 💡', task: 'Identify a common frustration in your school or community. Design an innovative solution using creative thinking approaches.', checkboxes: ['I identified a real problem worth solving', 'I brainstormed multiple creative solutions', 'I developed one solution in detail', 'I considered how to implement it'] },
    { title: 'Analytical Deep Dive 📊', task: 'Choose a current event or news story. Analyze it from multiple perspectives, identifying assumptions, evidence, and logical connections.', checkboxes: ['I selected a current event to analyze', 'I identified different perspectives', 'I evaluated the evidence critically', 'I drew my own informed conclusion'] },
  ],
  adult: [
    { title: 'Strategic Innovation Exercise 🚀', task: 'Identify a process in your work that could be improved. Apply design thinking to develop and prototype a creative solution.', checkboxes: ['I mapped out the current process', 'I identified pain points and opportunities', 'I designed an innovative solution', 'I created an implementation plan', 'I identified success metrics'] },
    { title: 'Systems Analysis Project 🔄', task: 'Analyze a complex system in your professional domain. Map its components, relationships, and feedback loops.', checkboxes: ['I selected a complex system to analyze', 'I identified key components', 'I mapped relationships and dependencies', 'I recognized feedback loops', 'I proposed one optimization'] },
  ],
};

const TYPES: ChallengeType[] = ['questions', 'puzzle', 'reflection', 'practical'];

/** Rotates through the four types by day number, mirroring the webapp. */
export function generateDailyChallenge(dayNumber: number, age: number): DailyChallenge {
  const type = TYPES[dayNumber % 4];
  const group = getAgeGroup(age);

  switch (type) {
    case 'questions':
      return { id: `questions-${Date.now()}`, type, content: { questions: QUESTION_SETS[group] }, points: 20 };
    case 'puzzle':
      return { id: `puzzle-${Date.now()}`, type, content: pick(PUZZLES[group]), points: 30 };
    case 'reflection':
      return {
        id: `reflection-${Date.now()}`,
        type,
        content: { prompt: pick(REFLECTIONS[group]), minWords: group === 'youth' ? 30 : group === 'teen' ? 50 : 75 },
        points: 25,
      };
    case 'practical':
      return { id: `practical-${Date.now()}`, type, content: pick(PRACTICALS[group]), points: 35 };
  }
}
