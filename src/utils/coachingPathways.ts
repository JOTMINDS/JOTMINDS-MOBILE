import { ParentObservationScore } from './parentObservationData';

export interface CoachingWeek {
  theme: string;
  conversationStarters: string[];
  weekendActivity: string;
  watchFor: string[];
}

export interface CoachingPathway {
  id: string;
  section: 'A' | 'B' | 'C' | 'D';
  title: string;
  icon: string;
  focusLabel: string;
  weeks: CoachingWeek[];
}

type PathwayContent = Omit<CoachingPathway, 'focusLabel'>;

const PATHWAYS: Record<'A' | 'B' | 'C' | 'D', PathwayContent> = {
  A: {
    id: 'learning-habits',
    section: 'A',
    title: 'Learning Habits',
    icon: '📚',
    weeks: [
      {
        theme: 'Learn Through Your Senses',
        conversationStarters: [
          "What's one thing you learned today that you could explain to me using a drawing?",
          'Would it help to see a video or diagram before we read the instructions together?',
          "What's your favorite way to remember something — saying it out loud, writing it, or doing it?",
        ],
        weekendActivity: 'Turn one piece of homework into a hands-on project — build a model, act it out, or draw a diagram instead of just reading.',
        watchFor: ['Gets restless during long reading sessions', 'Perks up when shown a picture or example', "Prefers 'show me' over 'tell me'"],
      },
      {
        theme: 'Ask Better Questions',
        conversationStarters: [
          "What's the most interesting question you asked today?",
          "Is there something you're curious about that we haven't looked into yet?",
          'If you could ask any expert one question, what would it be?',
        ],
        weekendActivity: "Pick one 'why' question your child has asked recently and spend 20 minutes looking up the answer together.",
        watchFor: ['Asks a lot of follow-up questions', 'Loses interest when given answers without explanation', 'Enjoys open-ended exploration over worksheets'],
      },
      {
        theme: 'Learn by Doing',
        conversationStarters: [
          "What's something you got better at by practicing, not just reading about it?",
          'Was there a moment this week you learned something by trying it and getting it wrong first?',
          "What's a skill you'd like to practice with your hands this weekend?",
        ],
        weekendActivity: 'Do a simple hands-on experiment or craft together related to something they\'re studying.',
        watchFor: ['Learns faster with repetition and practice', 'Frustrated by pure theory without application', 'Remembers steps better after doing them once'],
      },
      {
        theme: 'Reflect and Connect',
        conversationStarters: [
          "What's one thing you learned this month that surprised you?",
          'Who taught you something valuable recently — and how did they explain it?',
          'If you had to teach a younger kid what you learned this month, how would you do it?',
        ],
        weekendActivity: "Have your child 'teach' you something they learned this month, in their own words.",
        watchFor: ['Can explain ideas back in their own words', 'Enjoys watching others before trying something new', "Shows pride explaining what they've learned"],
      },
    ],
  },
  B: {
    id: 'thinking-patterns',
    section: 'B',
    title: 'Thinking Patterns',
    icon: '🧩',
    weeks: [
      {
        theme: 'Puzzle It Out',
        conversationStarters: [
          'What was the trickiest problem you solved today, and how did you crack it?',
          'Did you get stuck on anything today? What did you try first?',
          "What's a puzzle or riddle you'd like to try together?",
        ],
        weekendActivity: 'Do a puzzle, brain teaser, or strategy game together and talk through your thinking out loud.',
        watchFor: ['Enjoys figuring things out independently', 'Gets frustrated if given the answer too quickly', 'Tries multiple approaches before giving up'],
      },
      {
        theme: 'Ideas Without Limits',
        conversationStarters: [
          'If you could invent anything, what would it be?',
          "What's the most creative idea you had today?",
          'Is there a different way we could solve a recent problem than how we usually do it?',
        ],
        weekendActivity: 'Give your child an everyday object and challenge them to invent 5 unusual uses for it.',
        watchFor: ['Comes up with unexpected solutions', 'Enjoys imaginative or open-ended tasks', "Gets bored with only one 'right' way to do things"],
      },
      {
        theme: 'Plan Before You Leap',
        conversationStarters: [
          "What's your plan for finishing your homework this week?",
          'Why did you decide to do it that way?',
          'What would you do differently if you started this again?',
        ],
        weekendActivity: 'Plan a small weekend project together — write down the steps before starting.',
        watchFor: ['Likes making lists or plans before starting', 'Can explain their reasoning when asked', 'Gets overwhelmed without a clear structure'],
      },
      {
        theme: 'Think of Others',
        conversationStarters: [
          'How do you think your friend felt today when something happened?',
          'Did keeping things organized help or slow you down this week?',
          'What\'s one thing you noticed about how someone else was feeling?',
        ],
        weekendActivity: "Practice a 'perspective swap' — pick a recent disagreement and retell it from the other person's point of view.",
        watchFor: ['Notices how others are feeling', 'Likes tidy, organized spaces or routines', 'Considers consequences before acting'],
      },
    ],
  },
  C: {
    id: 'decision-making',
    section: 'C',
    title: 'Decision-Making',
    icon: '⚖️',
    weeks: [
      {
        theme: 'Weigh It Up',
        conversationStarters: [
          'What was a decision you made today, and what were your options?',
          'How long did you think about it before deciding?',
          'What would you do if you had more time to decide?',
        ],
        weekendActivity: 'Let your child make a real decision this weekend (what to cook, where to go) and talk through the pros and cons together first.',
        watchFor: ['Takes time to consider options', 'Can list pros and cons when asked', 'Second-guesses decisions after making them'],
      },
      {
        theme: 'Trust Your Gut, Check Your Work',
        conversationStarters: [
          "Was there a moment today you just 'knew' the answer without thinking it through?",
          'How did that gut decision turn out?',
          'When is it okay to go with your first instinct?',
        ],
        weekendActivity: 'Play a quick-decision game (like 20 questions or a timed choice game) and afterward ask how it felt to decide fast.',
        watchFor: ['Makes quick decisions based on feelings', 'Comfortable acting without all the information', 'May act before considering consequences'],
      },
      {
        theme: 'Own Your Choices',
        conversationStarters: [
          'Tell me about a decision you felt confident about this week.',
          'Was there a time someone disagreed with your choice? What did you do?',
          'What makes you feel sure about a decision?',
        ],
        weekendActivity: 'Give your child full control over one small weekend plan and let them own the outcome, good or bad.',
        watchFor: ['Stands by decisions even when challenged', 'Comfortable making choices without asking permission first', "Handles a 'wrong' choice without excessive worry"],
      },
      {
        theme: 'Learn and Adjust',
        conversationStarters: [
          "What's a decision you'd make differently now that you know more?",
          'What did a recent mistake teach you?',
          'How do you decide when to ask for advice versus deciding on your own?',
        ],
        weekendActivity: "Look back at a decision from earlier this month together and talk about what you'd both do differently.",
        watchFor: ['Learns from past mistakes', 'Open to changing their mind with new information', 'Asks for advice on bigger decisions'],
      },
    ],
  },
  D: {
    id: 'motivation-self-management',
    section: 'D',
    title: 'Motivation & Self-Management',
    icon: '🔥',
    weeks: [
      {
        theme: 'Find What Lights You Up',
        conversationStarters: [
          'What part of today did you enjoy the most?',
          "What's something you'd do even if no one asked you to?",
          'What makes a task feel fun instead of like a chore?',
        ],
        weekendActivity: 'Let your child choose one activity purely because they want to, no grades or rewards attached.',
        watchFor: ['Lights up talking about specific interests', "Needs prompting to start tasks they don't enjoy", 'Motivated more by interest than by rewards'],
      },
      {
        theme: 'Celebrate the Effort',
        conversationStarters: [
          "What's something you worked hard on today, even if it wasn't perfect?",
          'How did it feel when I noticed your effort instead of the result?',
          "What's a goal you're proud of working toward?",
        ],
        weekendActivity: 'Praise effort, not outcome, at least three times this weekend and notice how your child responds.',
        watchFor: ['Responds well to specific praise', 'Gives up faster after criticism', 'Seeks reassurance during difficult tasks'],
      },
      {
        theme: 'Push Through the Hard Part',
        conversationStarters: [
          'What was the hardest part of your day, and how did you get through it?',
          'Was there a moment you wanted to quit something? What happened next?',
          'What helps you keep going when something is difficult?',
        ],
        weekendActivity: 'Pick one challenging task and break it into small steps together, celebrating each step completed.',
        watchFor: ['Gets frustrated quickly with difficult tasks', 'Needs breaks to reset before continuing', 'Shows pride finishing something hard'],
      },
      {
        theme: 'Grow Independence',
        conversationStarters: [
          "What's something you did on your own this week that you used to need help with?",
          "What's one thing you'd like to try without my help next?",
          'How did it feel to figure that out by yourself?',
        ],
        weekendActivity: 'Hand over one task fully — no reminders, no checking in — and let your child manage it start to finish.',
        watchFor: ['Seeks independence on familiar tasks', 'Still relies on reminders for new tasks', 'Takes pride in doing things solo'],
      },
    ],
  },
};

/**
 * All 4 pathways, sorted with the child's lowest-scoring observation
 * section first — the pathway they'd benefit most from surfaces at the top,
 * rather than a fixed/arbitrary order.
 */
export function getRecommendedPathways(score: ParentObservationScore): CoachingPathway[] {
  const sections: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];
  return sections
    .map((s) => {
      const sectionScore = score[`section${s}` as 'sectionA' | 'sectionB' | 'sectionC' | 'sectionD'];
      return { pathway: PATHWAYS[s], total: sectionScore.total, style: sectionScore.style };
    })
    .sort((a, b) => a.total - b.total)
    .map(({ pathway, style }) => ({ ...pathway, focusLabel: style }));
}
