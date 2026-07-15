/**
 * Descriptive text for each Teaching Style profile — ported from the
 * webapp's src/app/utils/teachingStyleData.ts (teachingStyleProfiles,
 * axisDescriptions). calculateTeachingStyleScore only returns style names
 * and axis scores; this supplies the strengths/blindSpots/recommendations
 * text the results screen renders. generateDeepDiveQuestions is out of
 * scope (not ported).
 */

export interface TeachingStyleProfile {
  strengths: string[];
  blindSpots: string[];
  recommendations: string[];
}

export const teachingStyleProfiles: Record<string, TeachingStyleProfile> = {
  "Authoritative Instructor": {
    strengths: ["Clear classroom structure", "Effective discipline management", "Direct instruction"],
    blindSpots: ["May inhibit student creativity", "Less adaptable to individual needs", "Risk of disengagement"],
    recommendations: ["Try incorporating more student-led activities", "Allow for flexible seating or grouping", "Practice positive reinforcement over strict discipline"]
  },
  "Structured Educator": {
    strengths: ["Organized lesson plans", "Clear learning objectives", "Data-driven improvement"],
    blindSpots: ["May be too rigid with pacing", "Might overlook emotional cues", "Could stifle spontaneous learning moments"],
    recommendations: ["Build 'flex time' into lessons", "Allow students to choose assessment methods", "Focus on qualitative feedback alongside scores"]
  },
  "Facilitator Coach": {
    strengths: ["High student engagement", "Strong emotional safety", "Encourages critical thinking"],
    blindSpots: ["Classroom may feel chaotic", "Content coverage might suffer", "Assessment can be subjective"],
    recommendations: ["Establish clear boundaries within the freedom", "Ensure core curriculum standards are met", "Use rubrics to standardize subjective assessments"]
  },
  "Engagement Driver": {
    strengths: ["High energy lessons", "Strong student motivation", "Memorable learning experiences"],
    blindSpots: ["May prioritize fun over depth", "Quiet students might feel overwhelmed", "Reliance on extrinsic rewards"],
    recommendations: ["Balance excitement with deep reflection", "Create space for quiet contemplation", "Shift gradually from prizes to intrinsic motivation"]
  },
  "Learning Architect": {
    strengths: ["Constructivist approach", "Deep understanding focus", "Growth-oriented assessment"],
    blindSpots: ["Planning is time-consuming", "Struggling students may get lost", "Less focus on rote memorization checks"],
    recommendations: ["Scaffold complex tasks for lower achievers", "Use quick checks for understanding", "Share planning load with colleagues"]
  },
  "Innovation Leader": {
    strengths: ["Adaptable to change", "Uses technology effectively", "Creative problem solving"],
    blindSpots: ["Constant change can confuse students", "May neglect traditional basics", "Technology reliance"],
    recommendations: ["Ensure consistency in routines", "Don't abandon proven traditional methods entirely", "Have backup plans for tech failures"]
  },
  "Traditionalist": {
    strengths: ["Strong content knowledge transmission", "Clear standards", "Predictable environment"],
    blindSpots: ["Passive student role", "Low engagement", "Resistance to modern needs"],
    recommendations: ["Integrate one active learning strategy per week", "Try formative assessment without grading", "Connect content to students' lives"]
  },
  "Student-Centered Mentor": {
    strengths: ["Strong relationships", "Tailored instruction", "Safe learning environment"],
    blindSpots: ["Boundaries can blur", "High emotional labor for teacher", "May avoid necessary conflict"],
    recommendations: ["Maintain professional boundaries", "Prioritize self-care", "Practice holding students accountable firmly but kindly"]
  }
};

export const axisDescriptions = {
  axisAuthority: {
    title: "Authority vs Facilitation",
    low: "High Authority",
    high: "High Facilitation",
    description: "Measures the balance between teacher control and student empowerment."
  },
  axisKnowledge: {
    title: "Transmission vs Construction",
    low: "Transmission",
    high: "Construction",
    description: "Measures whether you deliver knowledge or help students build it."
  },
  axisMotivation: {
    title: "Motivation Style",
    low: "Extrinsic",
    high: "Intrinsic",
    description: "Measures how you drive student effort (rewards vs interest)."
  },
  axisAssessment: {
    title: "Assessment Mindset",
    low: "Judgment",
    high: "Growth",
    description: "Measures if assessment is used to rank or to improve."
  },
  axisAdaptability: {
    title: "Adaptability",
    low: "Fixed",
    high: "Adaptive",
    description: "Measures cognitive flexibility and willingness to change methods."
  },
  axisClimate: {
    title: "Emotional Climate",
    low: "Fear-based",
    high: "Safe",
    description: "Measures the psychological safety and relationship quality."
  }
};
