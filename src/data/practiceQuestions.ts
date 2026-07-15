export interface PracticeQuestion {
  id: string;
  type: 'multiple-choice' | 'scenario' | 'reflection';
  question: string;
  options?: string[];
  correctAnswer?: number;
  explanation?: string;
}

export interface PracticeModuleData {
  questions: PracticeQuestion[];
  strengthNote: string;
  growthNote: string;
}

export const PRACTICE_MODULES: Record<string, PracticeModuleData> = {
  'critical-thinking-1': {
    questions: [
      {
        id: 'q1',
        type: 'multiple-choice',
        question: 'When analyzing an argument, what is the first step you should take?',
        options: [
          'Identify the conclusion',
          'Look for emotional language',
          "Check the author's credentials",
          'Count the number of premises',
        ],
        correctAnswer: 0,
        explanation: 'Identifying the conclusion helps you understand what the argument is trying to prove, which is essential before evaluating the supporting evidence.',
      },
      {
        id: 'q2',
        type: 'scenario',
        question: 'A friend claims: "This diet works because I lost 5 pounds in a week!" What critical thinking skill should you apply?',
        options: [
          'Accept their personal experience as evidence',
          'Question whether correlation implies causation',
          'Immediately try the diet yourself',
          'Ignore their claim entirely',
        ],
        correctAnswer: 1,
        explanation: 'Personal anecdotes are not reliable evidence. Weight loss could be due to many factors, not just the diet.',
      },
      {
        id: 'q3',
        type: 'multiple-choice',
        question: 'Which of these is an example of confirmation bias?',
        options: [
          'Reading multiple perspectives on a topic',
          'Only seeking information that supports your existing beliefs',
          'Changing your mind based on new evidence',
          'Asking questions to clarify understanding',
        ],
        correctAnswer: 1,
        explanation: 'Confirmation bias occurs when we selectively seek or interpret information that confirms our pre-existing beliefs.',
      },
    ],
    strengthNote: 'You excel at analyzing arguments and identifying conclusions. Keep building on this skill!',
    growthNote: 'Practice recognizing cognitive biases in real-world scenarios to strengthen your critical thinking.',
  },
  'problem-solving-1': {
    questions: [
      {
        id: 'q1',
        type: 'multiple-choice',
        question: "You're stuck on a hard problem. What's the most effective first strategy?",
        options: [
          'Break it into smaller sub-problems',
          'Guess randomly until it works',
          'Give up and move on',
          'Memorize the answer',
        ],
        correctAnswer: 0,
        explanation: 'Breaking a problem into smaller, manageable pieces makes it easier to identify where to start and track progress.',
      },
      {
        id: 'q2',
        type: 'multiple-choice',
        question: 'Working backward from the goal is most useful when...',
        options: [
          'The goal state is clearly defined',
          "You don't know the goal",
          'The problem has one step',
          "There's no time pressure",
        ],
        correctAnswer: 0,
        explanation: 'Working backward is a powerful strategy specifically when you know exactly what the end result should look like.',
      },
      {
        id: 'q3',
        type: 'scenario',
        question: "What's the value of trying a simpler, related problem first?",
        options: [
          'It wastes time',
          'It reveals a pattern or method you can reuse on the harder problem',
          "It's required by tests",
          'It has no value',
        ],
        correctAnswer: 1,
        explanation: 'Solving a simpler version of a problem often uncovers the underlying pattern needed to solve the real one.',
      },
    ],
    strengthNote: 'You break problems down methodically instead of guessing — a core problem-solving strength.',
    growthNote: 'Practice working backward from the goal on your next tricky problem to build a second strategy in your toolkit.',
  },
  'creative-thinking-1': {
    questions: [
      {
        id: 'q1',
        type: 'multiple-choice',
        question: 'Brainstorming produces more ideas when you...',
        options: [
          'Judge each idea immediately',
          'Withhold judgment until many ideas exist',
          'Stop after the first good idea',
          "Only build on others' ideas",
        ],
        correctAnswer: 1,
        explanation: 'Deferring judgment prevents early self-censorship, which is one of the biggest blockers to idea generation.',
      },
      {
        id: 'q2',
        type: 'multiple-choice',
        question: 'Combining two unrelated concepts is a technique for...',
        options: [
          'Slowing down decisions',
          'Generating novel ideas',
          'Avoiding creativity',
          'Memorization',
        ],
        correctAnswer: 1,
        explanation: 'Forcing connections between unrelated concepts is a classic technique (sometimes called "forced association") for producing genuinely novel ideas.',
      },
      {
        id: 'q3',
        type: 'scenario',
        question: "What's a sign you're anchored too closely to one existing solution?",
        options: [
          'You keep proposing small variations of the same idea',
          'You explore multiple directions',
          'You ask "what if" questions',
          'You seek outside perspectives',
        ],
        correctAnswer: 0,
        explanation: 'Repeatedly tweaking the same idea instead of exploring different directions is a classic sign of anchoring.',
      },
    ],
    strengthNote: "You're comfortable generating ideas without immediately judging them — that's core to creative ideation.",
    growthNote: 'Practice deliberately combining unrelated concepts to push past your first, most obvious idea.',
  },
  'memory-techniques-1': {
    questions: [
      {
        id: 'q1',
        type: 'multiple-choice',
        question: "The 'spacing effect' means you remember better when you...",
        options: [
          'Cram the night before',
          'Space repetitions out over days/weeks',
          'Study only once',
          'Avoid repetition entirely',
        ],
        correctAnswer: 1,
        explanation: 'Distributing practice over time (rather than cramming) leads to much stronger long-term retention.',
      },
      {
        id: 'q2',
        type: 'multiple-choice',
        question: 'Linking new information to something you already know is called...',
        options: [
          'Elaborative encoding',
          'Rote memorization',
          'Passive review',
          'Cramming',
        ],
        correctAnswer: 0,
        explanation: 'Elaborative encoding builds richer memory connections than simple repetition alone.',
      },
      {
        id: 'q3',
        type: 'scenario',
        question: 'Which is a real technique for remembering a list?',
        options: [
          "The 'memory palace' (placing items along a familiar route)",
          'Reading it once silently',
          'Highlighting it in one color',
          'Ignoring the order',
        ],
        correctAnswer: 0,
        explanation: 'The memory palace (method of loci) is a well-documented technique that uses spatial memory to anchor a list.',
      },
    ],
    strengthNote: 'You recognize that spacing and elaboration beat cramming — a genuinely evidence-based memory strategy.',
    growthNote: "Try building a simple 'memory palace' for your next list to practice elaborative encoding.",
  },
  'decision-making-1': {
    questions: [
      {
        id: 'q1',
        type: 'multiple-choice',
        question: 'The 10-10-10 framework asks how a decision will feel in...',
        options: [
          '10 seconds, 10 minutes, 10 hours',
          '10 minutes, 10 months, 10 years',
          '10 days, 10 weeks, 10 months',
          '10 years only',
        ],
        correctAnswer: 1,
        explanation: 'The 10-10-10 framework helps separate short-term emotional reactions from long-term consequences.',
      },
      {
        id: 'q2',
        type: 'multiple-choice',
        question: "A 'sunk cost' is...",
        options: [
          "Money or time already spent that shouldn't influence future decisions",
          "A future cost you're planning for",
          'A cost you can still avoid',
          'A type of investment return',
        ],
        correctAnswer: 0,
        explanation: 'Sunk costs are gone regardless of what you decide next — rational decisions should ignore them.',
      },
      {
        id: 'q3',
        type: 'scenario',
        question: 'When facing a big decision with incomplete information, a good approach is to...',
        options: [
          'Wait indefinitely for certainty',
          'Set a decision deadline and decide with the best available information',
          'Let someone else decide',
          'Avoid deciding at all',
        ],
        correctAnswer: 1,
        explanation: 'Perfect information rarely exists. Setting a deadline prevents analysis paralysis.',
      },
    ],
    strengthNote: 'You think in terms of frameworks (like 10-10-10) rather than just gut instinct — a real decision-making strength.',
    growthNote: "Watch for the sunk cost trap next time you're tempted to stick with a choice just because you've already invested in it.",
  },
  'logical-reasoning-1': {
    questions: [
      {
        id: 'q1',
        type: 'scenario',
        question: "'All birds can fly. Penguins are birds. Therefore penguins can fly.' What's wrong with this argument?",
        options: [
          "Nothing, it's valid",
          'The first premise is false',
          "Penguins aren't birds",
          'It has no conclusion',
        ],
        correctAnswer: 1,
        explanation: 'The logical structure is valid, but the argument is unsound because the premise "all birds can fly" is factually false.',
      },
      {
        id: 'q2',
        type: 'multiple-choice',
        question: 'A conclusion that follows necessarily from true premises is...',
        options: [
          'Invalid',
          'Logically valid',
          'A correlation',
          'An assumption',
        ],
        correctAnswer: 1,
        explanation: 'A logically valid argument is one where the conclusion must be true if the premises are true.',
      },
      {
        id: 'q3',
        type: 'scenario',
        question: "'Since the rooster crows before sunrise, the crowing causes the sunrise.' This is an example of...",
        options: [
          'Valid causation',
          'Correlation mistaken for causation',
          'A syllogism',
          'A tautology',
        ],
        correctAnswer: 1,
        explanation: 'Two events happening in sequence doesn\'t mean one causes the other — a classic reasoning error.',
      },
    ],
    strengthNote: "You can spot a false premise even when the argument's structure looks valid — a strong logical-reasoning skill.",
    growthNote: 'Keep practicing spotting "correlation vs. causation" errors — they show up constantly in real-world claims.',
  },
};
