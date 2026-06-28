// AUTO-GENERATED from the JotMinds web question bank (full-question-bank.tsx).
// Verbatim wording; a balanced 12-question subset per assessment.
export type AssessmentType = 'learning' | 'thinking' | 'decision';
export interface BankQuestion { id: number; question: string; style: string; }
export interface AssessmentBank { framework: string; styles: string[]; questions: BankQuestion[]; }

export const QUESTION_BANK: Record<AssessmentType, AssessmentBank> = {
  learning: {
    framework: 'Kolb Learning Styles',
    styles: ["Diverging","Assimilating","Converging","Accommodating"],
    questions: [
    { id: 1, question: "I enjoy exploring ideas from multiple angles.", style: "Diverging" },
    { id: 26, question: "I prefer learning through reading and listening.", style: "Assimilating" },
    { id: 51, question: "I like finding practical solutions.", style: "Converging" },
    { id: 76, question: "I enjoy learning by doing.", style: "Accommodating" },
    { id: 2, question: "I like observing situations before participating.", style: "Diverging" },
    { id: 27, question: "I enjoy organizing information.", style: "Assimilating" },
    { id: 52, question: "I enjoy solving problems independently.", style: "Converging" },
    { id: 77, question: "I like trying new things.", style: "Accommodating" },
    { id: 3, question: "I learn best through watching others.", style: "Diverging" },
    { id: 28, question: "I like clear explanations.", style: "Assimilating" },
    { id: 53, question: "I enjoy hands-on experiments.", style: "Converging" },
    { id: 78, question: "I enjoy taking risks in learning.", style: "Accommodating" },
    ],
  },
  thinking: {
    framework: "Sternberg's Triarchic Theory",
    styles: ["Analytical","Creative","Practical"],
    questions: [
    { id: 1, question: "I enjoy solving problems with clear right or wrong answers.", style: "Analytical" },
    { id: 35, question: "I enjoy coming up with new ideas.", style: "Creative" },
    { id: 68, question: "I like solving real-life problems.", style: "Practical" },
    { id: 2, question: "I like finding mistakes and fixing them.", style: "Analytical" },
    { id: 36, question: "I like imagining different possibilities.", style: "Creative" },
    { id: 69, question: "I use common sense to figure things out.", style: "Practical" },
    { id: 3, question: "I question information to see if it makes sense.", style: "Analytical" },
    { id: 37, question: "I enjoy drawing, writing, or creating things.", style: "Creative" },
    { id: 70, question: "I enjoy fixing things around me.", style: "Practical" },
    { id: 4, question: "I enjoy comparing two ideas to see which is better.", style: "Analytical" },
    { id: 38, question: "I think of ideas that others might not consider.", style: "Creative" },
    { id: 71, question: "I can solve problems without needing full instructions.", style: "Practical" },
    ],
  },
  decision: {
    framework: 'Dual-Process Theory',
    styles: ["Intuitive","Reflective"],
    questions: [
    { id: 1, question: "I often make decisions quickly.", style: "Intuitive" },
    { id: 51, question: "I take time to think before making decisions.", style: "Reflective" },
    { id: 2, question: "I trust my first instinct.", style: "Intuitive" },
    { id: 52, question: "I like checking information before acting.", style: "Reflective" },
    { id: 3, question: "I choose answers based on what feels right.", style: "Intuitive" },
    { id: 53, question: "I consider all options carefully.", style: "Reflective" },
    { id: 4, question: "I react fast in unexpected situations.", style: "Intuitive" },
    { id: 54, question: "I analyze problems step-by-step.", style: "Reflective" },
    { id: 5, question: "I make decisions without overthinking.", style: "Intuitive" },
    { id: 55, question: "I double-check information before drawing conclusions.", style: "Reflective" },
    { id: 6, question: "I follow my gut feelings.", style: "Intuitive" },
    { id: 56, question: "I think about long-term consequences.", style: "Reflective" },
    ],
  },
};
