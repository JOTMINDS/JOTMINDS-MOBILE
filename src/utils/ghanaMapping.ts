/**
 * Ghana-specific SHS-track / tertiary-focus / career mapping — ported from
 * the webapp's src/app/utils/scoring.ts (getGhanaMapping). Body logic is
 * unchanged; the signature is adapted from the webapp's nested
 * {kolb, sternberg, dualProcess} AssessmentScore shape to mobile's flat
 * primary-style strings, since mobile only stores a primaryStyle per
 * assessment (see src/utils/scoring.ts's determineStyle), not the full
 * per-axis score object.
 */

export interface GhanaMapping {
  shsTrack: string[];
  tertiaryFocus: string[];
  decisionTip: string;
  careerSuggestions: string[];
}

export interface GhanaMappingInput {
  kolbStyle?: string; // learning assessment primaryStyle
  sternbergStyle?: string; // thinking assessment primaryStyle
  dualProcessStyle?: string; // decision assessment primaryStyle
}

export function getGhanaMapping({ kolbStyle, sternbergStyle, dualProcessStyle }: GhanaMappingInput): GhanaMapping {
  const shsTrack: string[] = [];
  const tertiaryFocus: string[] = [];
  const careerSuggestions: string[] = [];
  let decisionTip = '';

  // SHS Track recommendations
  if (kolbStyle === 'Converging' || sternbergStyle === 'Analytical') {
    shsTrack.push('Science', 'General Science');
    tertiaryFocus.push('Engineering', 'Computer Science', 'Medicine', 'Mathematics');
    careerSuggestions.push('Engineer', 'Doctor', 'Scientist', 'IT Specialist', 'Researcher');
  }

  if (kolbStyle === 'Diverging' || sternbergStyle === 'Creative') {
    shsTrack.push('Visual Arts', 'General Arts');
    tertiaryFocus.push('Fine Arts', 'Communication Studies', 'Design', 'Creative Writing');
    careerSuggestions.push('Artist', 'Designer', 'Writer', 'Media Professional', 'Architect');
  }

  if (kolbStyle === 'Assimilating') {
    shsTrack.push('General Arts', 'General Science');
    tertiaryFocus.push('Law', 'Social Sciences', 'Research', 'Academia');
    careerSuggestions.push('Lawyer', 'Researcher', 'Professor', 'Analyst', 'Consultant');
  }

  if (kolbStyle === 'Accommodating' || sternbergStyle === 'Practical') {
    shsTrack.push('Business', 'Technical/Vocational', 'Agricultural Science');
    tertiaryFocus.push('Business Administration', 'Entrepreneurship', 'Applied Sciences');
    careerSuggestions.push('Entrepreneur', 'Business Manager', 'Project Manager', 'Technician');
  }

  // Decision tip based on dual process style
  if (dualProcessStyle) {
    if (dualProcessStyle === 'Intuitive') {
      decisionTip = 'You make quick decisions. Balance this with careful planning for important academic choices.';
    } else if (dualProcessStyle === 'Reflective') {
      decisionTip = 'You think carefully before deciding. Trust your preparation and don\'t overthink during exams.';
    } else {
      decisionTip = 'You balance intuition and reflection well. Use both approaches as situations require.';
    }
  } else {
    // Provide a general tip based on learning and thinking styles when decision style is not available
    if (kolbStyle === 'Diverging') {
      decisionTip = 'Consider multiple perspectives before making important choices. Seek input from others.';
    } else if (kolbStyle === 'Assimilating') {
      decisionTip = 'Gather all the facts and analyze systematically before making major decisions.';
    } else if (kolbStyle === 'Converging') {
      decisionTip = 'Trust your problem-solving skills. Test ideas practically before committing.';
    } else if (kolbStyle === 'Accommodating') {
      decisionTip = 'Be flexible and ready to adapt. Learn from experiences as you go.';
    } else if (sternbergStyle === 'Analytical') {
      decisionTip = 'Break down complex choices into smaller parts. Evaluate pros and cons carefully.';
    } else if (sternbergStyle === 'Creative') {
      decisionTip = 'Explore creative alternatives. Don\'t limit yourself to conventional options.';
    } else if (sternbergStyle === 'Practical') {
      decisionTip = 'Focus on what works in real-world situations. Choose practical, actionable paths.';
    } else {
      decisionTip = 'Take your "Decision Style" assessment to get personalized decision-making tips.';
    }
  }

  return {
    shsTrack: [...new Set(shsTrack)],
    tertiaryFocus: [...new Set(tertiaryFocus)],
    decisionTip,
    careerSuggestions: [...new Set(careerSuggestions)],
  };
}
