/**
 * Lesson-plan format per curriculum, ported from the webapp's aiService
 * (getCurriculumFormatGuide). Each framework names its own sections, so the plan is
 * asked to use that framework's terminology instead of one generic template.
 */
export const CURRICULUM_FRAMEWORKS = [
  'National Curriculum (NaCCA / GES)',
  'British Curriculum (Cambridge / Pearson Edexcel)',
  'International Baccalaureate (IB)',
  'Oxford International Curriculum',
] as const;

export const DEFAULT_CURRICULUM: string = CURRICULUM_FRAMEWORKS[0];

/** Short chip label for a framework. */
export function curriculumShortName(framework?: string): string {
  const f = (framework || '').toLowerCase();
  if (/\bnational\b/.test(f) || f.includes('nacca') || /\bges\b/.test(f)) return 'NaCCA / GES';
  if (f.includes('british') || f.includes('cambridge') || f.includes('edexcel') || f.includes('pearson')) return 'Cambridge / Edexcel';
  if (f.includes('baccalaureate') || /\bib\b/.test(f)) return 'IB';
  if (f.includes('oxford')) return 'Oxford';
  return framework || '';
}

export interface CurriculumFormat { name: string; guide: string; alignmentLabels: string[] }

export function curriculumFormat(framework?: string): CurriculumFormat {
  const f = (framework || '').toLowerCase();
  if (/\bnational\b/.test(f) || f.includes('nacca') || /\bges\b/.test(f)) {
    return {
      name: 'Ghana National Curriculum (NaCCA / GES)',
      alignmentLabels: ['Strand', 'Sub-strand', 'Content Standard', 'Indicators', 'Core Competencies', 'Teaching & Learning Resources'],
      guide: `Follow the NaCCA / GES lesson plan format:
- Organise by Strand, Sub-strand, Content Standard and Learning Indicators (use NaCCA codes such as B7.1.1.1.1 when you know them for this grade and subject, otherwise describe them without inventing codes).
- Objectives must be written as learning indicators ("By the end of the lesson, the learner will be able to ...").
- Name the Core Competencies developed (Critical Thinking and Problem Solving, Creativity and Innovation, Communication and Collaboration, Cultural Identity and Global Citizenship, Personal Development and Leadership, Digital Literacy).
- The three-part lesson is Phase 1: Starter, Phase 2: Main (New Learning), Phase 3: Plenary / Reflection. Map them onto the phases as: Introduction = Starter, Main Lesson + Guided Practice = Main, Assessment + Conclusion = Plenary / Reflection.
- Include Teaching & Learning Resources and a Key Assessment of learning.
- Use local, Ghanaian examples and contexts.`,
    };
  }
  if (f.includes('british') || f.includes('cambridge') || f.includes('edexcel') || f.includes('pearson')) {
    return {
      name: 'British Curriculum (Cambridge / Pearson Edexcel)',
      alignmentLabels: ['Syllabus Reference', 'Learning Objectives', 'Success Criteria', 'Key Vocabulary', 'Command Words'],
      guide: `Follow the Cambridge / Edexcel lesson plan format:
- Use Learning Objectives (with the syllabus reference where known) plus student-friendly Success Criteria ("I can ...").
- Include Key Vocabulary and the exam Command Words students must practise (describe, explain, evaluate, compare ...).
- Structure as Starter, Main Activities, Plenary, mapped onto the phases as: Introduction = Starter, Main Lesson + Guided Practice = Main Activities, Assessment + Conclusion = Plenary.
- Include a check-for-understanding with exam-style questions and note Assessment for Learning strategies.`,
    };
  }
  if (f.includes('baccalaureate') || /\bib\b/.test(f)) {
    return {
      name: 'International Baccalaureate (IB)',
      alignmentLabels: ['Statement of Inquiry', 'Key Concept', 'Related Concepts', 'Global Context', 'Inquiry Questions', 'ATL Skills', 'Learner Profile Attributes'],
      guide: `Follow the IB inquiry-based lesson plan format:
- Include a Statement of Inquiry, Key Concept, Related Concepts and Global Context, plus Factual, Conceptual and Debatable inquiry questions.
- Identify Approaches to Learning (ATL) skills and the IB Learner Profile attributes developed.
- Structure the lesson as Engage, Explore, Explain / Apply, Reflect, mapped onto the phases as: Introduction = Engage, Main Lesson = Explore, Guided Practice = Explain / Apply, Assessment + Conclusion = Reflect.
- Objectives are written as what students will inquire into and be able to do.`,
    };
  }
  if (f.includes('oxford')) {
    return {
      name: 'Oxford International Curriculum',
      alignmentLabels: ['Learning Intentions', 'Success Criteria', 'Key Vocabulary', 'Cross-curricular Links'],
      guide: `Follow the Oxford International lesson plan format:
- Open with Learning Intentions and student-friendly Success Criteria.
- Include Key Vocabulary and Cross-curricular Links.
- Structure as Hook, Teach, Practise, Review, mapped onto the phases as: Introduction = Hook, Main Lesson = Teach, Guided Practice = Practise, Assessment + Conclusion = Review.`,
    };
  }
  return {
    name: framework || 'the curriculum the teacher selected',
    alignmentLabels: ['Learning Outcomes', 'Key Vocabulary', 'Resources'],
    guide: 'Use clear, standard lesson-plan sections: learning outcomes, key vocabulary, resources, a structured sequence of activities and a closing check for understanding.',
  };
}

export interface LessonPhase { name: string; durationMinutes: number; activity: string; teachingNotes?: string; materialsNeeded?: string[] }

/** Makes phase times add up to the requested duration even when the model drifts (as the webapp does). */
export function fitPhasesToDuration(phases: LessonPhase[], duration: number): LessonPhase[] {
  const sum = phases.reduce((t, p) => t + (Number(p.durationMinutes) || 0), 0);
  if (!phases.length || sum <= 0 || sum === duration) return phases.map((p) => ({ ...p, durationMinutes: Number(p.durationMinutes) || 0 }));
  let used = 0;
  return phases.map((p, i) => {
    if (i === phases.length - 1) return { ...p, durationMinutes: Math.max(1, duration - used) };
    const minutes = Math.max(1, Math.round(((Number(p.durationMinutes) || 0) / sum) * duration));
    used += minutes;
    return { ...p, durationMinutes: minutes };
  });
}
