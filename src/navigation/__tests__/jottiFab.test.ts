import { shouldShowJottiFab, TAB_ROUTES } from '../jottiFab';
import { tabsForUser } from '../tabsForUser';

const teacher = { role: 'teacher' };

describe('shouldShowJottiFab', () => {
  it('shows on the main pages for every grown-up role', () => {
    for (const role of ['teacher', 'parent', 'professional']) {
      for (const route of ['Home', 'Discover', 'Profile', 'Notifications', 'StudentDetail']) {
        expect(shouldShowJottiFab(route, { role })).toBe(true);
      }
    }
    expect(shouldShowJottiFab('Home', { role: 'student', educationLevel: 'SHS' })).toBe(true);
  });

  it('is hidden on the chat itself, onboarding and signed-out screens', () => {
    expect(shouldShowJottiFab('AskJotti', teacher)).toBe(false);
    expect(shouldShowJottiFab('FirstWin', teacher)).toBe(false);
    expect(shouldShowJottiFab('Home', null)).toBe(false);
    expect(shouldShowJottiFab(undefined, teacher)).toBe(false);
  });

  it('is hidden inside assessments, quizzes, games and check-ins', () => {
    for (const route of ['AssessmentTaking', 'JTIAAssessment', 'KidsAssessment', 'NBack', 'Stroop', 'MemoryMatch', 'DailyChallenge', 'DailyCheckQuestions', 'PracticeModule', 'ProfessionalV2Session']) {
      expect(shouldShowJottiFab(route, teacher)).toBe(false);
    }
  });

  it('is hidden for elementary and early-years learners', () => {
    expect(shouldShowJottiFab('Home', { role: 'student', educationLevel: 'Elementary' })).toBe(false);
    expect(shouldShowJottiFab('Home', { role: 'student', age: 8 })).toBe(false);
    expect(shouldShowJottiFab('Home', { role: 'student', educationLevel: 'Pre-school' })).toBe(false);
  });

  it('is hidden for school and organization accounts', () => {
    expect(shouldShowJottiFab('Home', { role: 'school_admin' })).toBe(false);
    expect(shouldShowJottiFab('Profile', { role: 'organization' })).toBe(false);
  });

  it('knows every bottom-menu tab so the button clears the bar', () => {
    for (const role of ['teacher', 'parent', 'professional', 'student']) {
      tabsForUser({ role }).forEach((t) => expect(TAB_ROUTES.has(t)).toBe(true));
    }
  });
});
