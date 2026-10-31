import type { CognitiveDomain } from '../utils/profileCompleteness';

/**
 * Discover articles by audience. The general set is written for teens and adults, so
 * elementary learners and teachers each get their own: kids' pieces are short, concrete
 * and playful; teachers' pieces are classroom-ready and drawn from teaching research.
 */
export type DiscoverAudience = 'general' | 'teacher' | 'kids';

export interface DiscoverInsight {
  id: string;
  audience: DiscoverAudience;
  tag: string;
  title: string;
  preview: string;
  icon: string;
  gradient: [string, string];
  readTime: string;
  category: string;
  domain: CognitiveDomain;
  /** When present, the detail screen shows these instead of its generic sections. */
  sections?: { heading: string; body: string }[];
  /** A video on the same idea. It opens on YouTube, from an official channel. */
  video?: DiscoverVideo;
}

export interface DiscoverVideo {
  url: string;
  /** The channel, shown on the button. */
  source: string;
}

/** Official-channel videos only, each checked against YouTube before it was added. */
const VIDEOS = {
  powerOfYet: { url: 'https://www.youtube.com/watch?v=_y5jkSQDC5E', source: 'Sesame Street' },
  zoeAndElmo: { url: 'https://www.youtube.com/watch?v=46UhAtPyXw4', source: 'Khan Academy' },
  studyTips: { url: 'https://www.youtube.com/watch?v=TjPFZaMe2yw', source: 'TED-Ed' },
  practice: { url: 'https://www.youtube.com/watch?v=f2O6mQkFiiw', source: 'TED-Ed' },
  dweck: { url: 'https://www.youtube.com/watch?v=_X0mgOOSpLU', source: 'TED' },
} satisfies Record<string, DiscoverVideo>;

const withVideo = (list: DiscoverInsight[], videos: Record<string, DiscoverVideo>): DiscoverInsight[] =>
  list.map((i) => (videos[i.id] ? { ...i, video: videos[i.id] } : i));

const GENERAL: DiscoverInsight[] = withVideo([
  {
    id: '1', audience: 'general', tag: 'COGNITIVE SCIENCE', title: 'Why You Think Differently Under Pressure',
    preview: 'Stress activates System 1 thinking — fast, intuitive, and prone to errors. Understanding this can help you slow down when it matters most.',
    icon: '🧠', gradient: ['#6E4D9C', '#4F46E5'], readTime: '3 min', category: 'pattern', domain: 'decision',
  },
  {
    id: '2', audience: 'general', tag: 'LEARNING SCIENCE', title: 'The Spacing Effect: Why Cramming Fails',
    preview: 'Distributed practice consistently outperforms massed practice ("cramming") for long-term retention. Your brain consolidates memory during rest, not during study.',
    icon: '📚', gradient: ['#3D52C9', '#2E3FA8'], readTime: '4 min', category: 'snapshot', domain: 'learning',
  },
  {
    id: '3', audience: 'general', tag: 'DECISION MAKING', title: 'The Paradox of Choice in Career Decisions',
    preview: 'More options don\'t lead to better decisions. Too many choices can make complex life decisions harder, not easier.',
    icon: '🎯', gradient: ['#EC4899', '#DB2777'], readTime: '5 min', category: 'strategic', domain: 'decision',
  },
  {
    id: '4', audience: 'general', tag: 'METACOGNITION', title: 'Imposter Syndrome vs. Overconfidence',
    preview: 'High confidence + wrong answers = overconfidence. Low confidence + right answers = imposter syndrome. Where do you fall?',
    icon: '🪞', gradient: ['#F59E0B', '#D97706'], readTime: '4 min', category: 'coach', domain: 'thinking',
  },
  {
    id: '5', audience: 'general', tag: 'PERFORMANCE', title: 'The Ultradian Rhythm: Your Brain\'s 90-Minute Cycle',
    preview: 'Your brain naturally cycles between high and low focus every 90 minutes. Working with this rhythm can meaningfully boost your output and focus.',
    icon: '⏱️', gradient: ['#10B981', '#059669'], readTime: '3 min', category: 'snapshot', domain: 'learning',
  },
], { '2': VIDEOS.studyTips, '5': VIDEOS.practice });

const TEACHER: DiscoverInsight[] = withVideo([
  {
    id: 't1', audience: 'teacher', tag: 'QUESTIONING', title: 'The 3-Second Pause',
    preview: 'Waiting a few seconds after you ask a question changes who answers and how well.',
    icon: '⏱️', gradient: ['#6E4D9C', '#4F46E5'], readTime: '2 min', category: 'classroom', domain: 'thinking',
    sections: [
      { heading: 'The idea', body: 'Research on “wait time” found that when teachers pause for about three seconds after a question, answers get longer and better, and more students take part. Most of us wait less than one second.' },
      { heading: 'In your classroom', body: 'The fastest hand is rarely the only student who knows. A pause gives slower, more careful thinkers time to build an answer, and it lowers the pressure on shy students.' },
      { heading: 'Try it tomorrow', body: 'Ask the question, count “one-two-three” silently, then choose who answers. Use it for just one question per lesson at first.' },
    ],
  },
  {
    id: 't2', audience: 'teacher', tag: 'MEMORY', title: 'Quiz to Remember, Not to Grade',
    preview: 'Low-stakes recall practice helps students keep what you taught.',
    icon: '📝', gradient: ['#3D52C9', '#2E3FA8'], readTime: '3 min', category: 'classroom', domain: 'learning',
    sections: [
      { heading: 'The idea', body: 'Pulling information out of memory strengthens it more than hearing or reading it again. Short, ungraded questions at the start of a lesson are one of the best-supported ways to improve retention.' },
      { heading: 'In your classroom', body: 'Students often feel that re-reading is working because it feels familiar. Recall feels harder, which is exactly why it helps.' },
      { heading: 'Try it tomorrow', body: 'Open with three questions on last week’s topic. Students answer on paper without notes, then check. No marks needed.' },
    ],
  },
  {
    id: 't3', audience: 'teacher', tag: 'FEEDBACK', title: 'Feedback That Moves Learning',
    preview: 'Specific, task-focused feedback helps more than general praise.',
    icon: '💬', gradient: ['#EC4899', '#DB2777'], readTime: '3 min', category: 'classroom', domain: 'decision',
    sections: [
      { heading: 'The idea', body: 'The most useful feedback tells a student where they are going, how they are doing, and what to do next. Comments about the work help more than comments about the person.' },
      { heading: 'In your classroom', body: '“You’re so clever” can make students avoid hard tasks. “Your second paragraph gives a clear example. Add one more to the first” gives them a next step.' },
      { heading: 'Try it tomorrow', body: 'Give each student one specific strength and one next step on their next piece of work.' },
    ],
  },
  {
    id: 't4', audience: 'teacher', tag: 'COGNITIVE LOAD', title: 'Say Less, Show More',
    preview: 'Working memory is small. Chunk your lesson so students can keep up.',
    icon: '🧩', gradient: ['#F59E0B', '#D97706'], readTime: '3 min', category: 'classroom', domain: 'thinking',
    sections: [
      { heading: 'The idea', body: 'Students can hold only a few new things in mind at once. Too many steps, or words and pictures competing for attention, overload them and learning stalls.' },
      { heading: 'In your classroom', body: 'Break new material into small steps, show a worked example before asking for independent work, and avoid reading slides aloud word for word.' },
      { heading: 'Try it tomorrow', body: 'Take one lesson and split the explanation into three short chunks, with a quick check after each.' },
    ],
  },
  {
    id: 't5', audience: 'teacher', tag: 'DIFFERENTIATION', title: 'Teach the Same Idea Four Ways',
    preview: 'Mix showing, telling, doing and discussing so more students connect.',
    icon: '🎯', gradient: ['#10B981', '#059669'], readTime: '3 min', category: 'classroom', domain: 'learning',
    sections: [
      { heading: 'The idea', body: 'Your class thinks and learns in different ways. Presenting an idea through a picture, a short explanation, a hands-on task and a discussion reaches more students, and the repetition helps everyone remember.' },
      { heading: 'In your classroom', body: 'Your Class Analytics show which learning and thinking styles are most common, so you can see which of these routes your class may need more of.' },
      { heading: 'Try it tomorrow', body: 'Pick one idea and give students a choice of two ways to practise it, such as draw it or explain it to a partner.' },
    ],
  },
  {
    id: 't6', audience: 'teacher', tag: 'WELLBEING', title: 'Small Resets Beat Big Breaks',
    preview: 'A two-minute pause between lessons is easier to keep than a long rest you never get.',
    icon: '🌿', gradient: ['#3D52C9', '#10B981'], readTime: '2 min', category: 'wellbeing', domain: 'decision',
    sections: [
      { heading: 'The idea', body: 'Slow breathing for a couple of minutes can calm the body’s stress response. Short, regular pauses fit a teaching day better than breaks that rarely happen.' },
      { heading: 'In your classroom', body: 'Students pick up on your pace. A settled teacher makes it easier for a class to settle.' },
      { heading: 'Try it tomorrow', body: 'Open Mind and try the Teacher Reset between two lessons. It takes about two minutes.' },
    ],
  },
], { t2: VIDEOS.studyTips, t3: VIDEOS.dweck });

const KIDS: DiscoverInsight[] = withVideo([
  {
    id: 'k1', audience: 'kids', tag: 'BRAIN FACT', title: 'Your Brain Is Like a Muscle',
    preview: 'The more you practise, the stronger your brain gets!',
    icon: '🧠', gradient: ['#6E4D9C', '#4F46E5'], readTime: '1 min', category: 'fun', domain: 'learning',
    sections: [
      { heading: 'Did you know?', body: 'When you practise something, your brain makes new paths, like a trail through grass. The more you walk it, the easier it gets.' },
      { heading: 'Why it matters', body: 'It means hard things get easier when you keep trying!' },
      { heading: 'Try it!', body: 'Pick one thing that feels hard. Practise it for 5 minutes today.' },
    ],
  },
  {
    id: 'k2', audience: 'kids', tag: 'GROW', title: 'Mistakes Help You Grow',
    preview: 'Every mistake teaches your brain something new.',
    icon: '🌱', gradient: ['#10B981', '#059669'], readTime: '1 min', category: 'fun', domain: 'thinking',
    sections: [
      { heading: 'Did you know?', body: 'When you make a mistake and try again, your brain works extra hard. That is how it grows.' },
      { heading: 'Why it matters', body: 'Nobody gets everything right the first time, not even grown-ups!' },
      { heading: 'Try it!', body: 'Next time something goes wrong, say: “Not yet! Let me try again.”' },
    ],
  },
  {
    id: 'k3', audience: 'kids', tag: 'SLEEP', title: 'Sleep Helps You Remember',
    preview: 'Your brain sorts what you learned while you sleep.',
    icon: '😴', gradient: ['#3D52C9', '#2E3FA8'], readTime: '1 min', category: 'fun', domain: 'learning',
    sections: [
      { heading: 'Did you know?', body: 'While you sleep, your brain puts the things you learned today in the right places.' },
      { heading: 'Why it matters', body: 'A good night’s sleep makes it easier to remember at school.' },
      { heading: 'Try it!', body: 'Go to bed at the same time tonight and see how you feel tomorrow.' },
    ],
  },
  {
    id: 'k4', audience: 'kids', tag: 'FOCUS', title: 'Super Focus Tricks',
    preview: 'Take a big breath and do one thing at a time.',
    icon: '🎯', gradient: ['#EC4899', '#DB2777'], readTime: '1 min', category: 'fun', domain: 'decision',
    sections: [
      { heading: 'Did you know?', body: 'Your brain is best at one thing at a time. Doing many things at once makes it tired.' },
      { heading: 'Why it matters', body: 'Focus helps you finish faster and feel proud.' },
      { heading: 'Try it!', body: 'Put other things away. Take 3 slow breaths. Then do one task.' },
    ],
  },
  {
    id: 'k5', audience: 'kids', tag: 'MEMORY', title: 'Pictures Help You Remember',
    preview: 'Draw it or imagine it, and it sticks!',
    icon: '🎨', gradient: ['#F59E0B', '#D97706'], readTime: '1 min', category: 'fun', domain: 'learning',
    sections: [
      { heading: 'Did you know?', body: 'Your brain loves pictures. A drawing or a picture in your mind is easier to remember than words alone.' },
      { heading: 'Why it matters', body: 'You can use pictures to remember spellings, facts and stories.' },
      { heading: 'Try it!', body: 'Pick a new word. Draw a tiny picture of what it means.' },
    ],
  },
  {
    id: 'k6', audience: 'kids', tag: 'CALM', title: 'Calm Breaths, Calm Brain',
    preview: 'Slow breathing helps you feel calm and ready.',
    icon: '🌬️', gradient: ['#3D52C9', '#10B981'], readTime: '1 min', category: 'fun', domain: 'decision',
    sections: [
      { heading: 'Did you know?', body: 'Slow breaths tell your body it is safe to relax.' },
      { heading: 'Why it matters', body: 'When you feel worried or wiggly, calm breathing helps your brain think clearly.' },
      { heading: 'Try it!', body: 'Breathe in for 4 counts. Breathe out for 4 counts. Do it 3 times.' },
    ],
  },
], { k1: VIDEOS.zoeAndElmo, k2: VIDEOS.powerOfYet });

export const insightsFor = (audience: DiscoverAudience): DiscoverInsight[] =>
  audience === 'teacher' ? TEACHER : audience === 'kids' ? KIDS : GENERAL;

/** Which Discover set a user sees: teachers and elementary learners have their own. */
export function discoverAudience(role: string | undefined, band: string): DiscoverAudience {
  if (role === 'teacher') return 'teacher';
  if (role === 'student' && band === 'kids') return 'kids';
  return 'general';
}
