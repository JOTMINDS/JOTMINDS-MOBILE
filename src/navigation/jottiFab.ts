import { assessmentBand } from '../utils/assessmentBand';
import { isPreschoolLevel } from '../utils/educationLevels';
import { isInstitutionAccount } from '../utils/accountKind';

/**
 * Where the floating "Ask Jotti" button shows. It is on every signed-in page except:
 * the chat itself, onboarding, and screens where help would defeat the point or get in the way
 * (assessments, quizzes, games, check-ins). Elementary and early-years learners don't get an
 * open-ended chat button.
 */
const HIDDEN_ROUTES = new Set([
  'AskJotti', 'FirstWin', 'SetNewPassword',
  'AssessmentTaking', 'ThinkingStylesAssessment', 'KidsAssessment', 'JTIAAssessment', 'TeachingStyleAssessment',
  'ProfessionalV2Session', 'ProfessionalCognitive', 'PracticeModule',
  'MemoryMatch', 'NBack', 'Stroop', 'DailyCheckQuestions', 'DailyChallenge', 'PreschoolAssess',
]);

/** Routes that sit above the bottom menu, so the button must clear it. */
export const TAB_ROUTES = new Set([
  'Home', 'Students', 'PreSchool', 'Analytics', 'Planner', 'Insights', 'Discover', 'MindHome', 'RoleFit', 'Profile',
]);

export function shouldShowJottiFab(
  routeName: string | undefined,
  user: { role?: string; age?: number | null; educationLevel?: string | null; organizationType?: string | null; industrySector?: string | null } | null | undefined,
): boolean {
  if (!user || !routeName) return false;
  if (HIDDEN_ROUTES.has(routeName)) return false;
  if (isInstitutionAccount(user)) return false;
  if (user.role === 'student' && (assessmentBand(user) === 'kids' || isPreschoolLevel(user.educationLevel))) return false;
  return true;
}
