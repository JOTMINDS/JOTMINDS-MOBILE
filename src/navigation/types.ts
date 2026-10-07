import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';

/**
 * Central route map. Screens can type their props as
 *   ScreenProps<'RoleFitResult'>
 * to get autocompletion + checked params, and use useAppNavigation() for
 * type-safe navigation. Existing `any`-typed screens keep working; adopt
 * these incrementally.
 */
export type RootStackParamList = {
  // Auth / onboarding
  Splash: undefined;
  Welcome: undefined;
  Login: { email?: string; studentCode?: string } | undefined;
  Signup: { role?: string; organizationCode?: string } | undefined;
  OtpVerification: { mode: 'signup' | 'login'; email: string; signupData?: any };
  FirstWin: undefined;
  Main: undefined;

  // Discover
  InsightDetail: { insight: any };

  // Mind
  DailyCheckIntro: undefined;
  DailyCheckQuestions: undefined;
  InstantFeedback: { checkin: any; feedback?: any };
  WeeklySnapshot: undefined;
  BehavioralDashboard: undefined;

  // Brain Gym
  BrainGym: undefined;
  MemoryMatch: undefined;
  NBack: undefined;
  Stroop: undefined;
  Leaderboard: undefined;

  // Role Fit
  RoleDemandBuilder: undefined;
  RoleFitResult: { result?: any; roleName?: string; role?: any };
  AdaptationRecommendations: { result: any; roleName: string };
  CandidateComparison: undefined;
  CareerMatches: undefined;
  DreamCareers: undefined;

  // Profile
  Accessibility: undefined;
  Notifications: undefined;
  Subscription: undefined;

  // Assessments
  AssessmentList: undefined;
  AssessmentTaking: { assessmentType: string };
  AssessmentResults: { assessmentType: string };

  // Teacher / Parent / Learning / Kids / Shared
  TeacherDevelopment: undefined;
  TeachingStyleAssessment: undefined;
  TeachingStyleResults: undefined;
  JTIAAssessment: undefined;
  JTIAResults: { report?: import('../utils/jtiaScoring').JTIAReportData };
  GrowthTracker: undefined;
  CoachingPathways: { childId: string; childName: string };
  PathwayDetail: { childId: string; childName: string; pathway: any };
  SupportRequest: undefined;
  SkillBuilder: undefined;
  PracticeModule: { moduleId: string };
  PracticeResults: { score: number; total: number; moduleId: string };
  KidsAssessment: undefined;
  KidsAssessmentResults: undefined;
  ExpertChat: undefined;
  AskJotti: { prompt?: string } | undefined;
  DailyChallenge: undefined;
  ClassManagement: undefined;
  LessonPlanner: undefined;
  ObservationLog: undefined;
  ClassAnalytics: undefined;
  CurriculumTracker: undefined;
  StudentDetail: { student: any };
  PreschoolChildren: undefined;
  PreschoolChildProgress: { child: import('../types/preschoolDevelopmental').PreschoolUser & { classId?: string } };
  PreschoolAssess: { child?: import('../types/preschoolDevelopmental').PreschoolUser & { classId?: string }; indicatorId?: string } | undefined;
  PreschoolActivities: undefined;

  // Professional Intelligence V2
  ProfessionalV2Intro: undefined;
  ProfessionalV2Session: { sessionId: string };
  ProfessionalV2Results: { sessionId: string };
  ProfessionalCognitive: undefined;
  ProfessionalReport: { entryId?: string } | undefined;
  TrackRecord: undefined;
  Reflections: undefined;
  Feedback: undefined;
};

export type AppNavigation = NativeStackNavigationProp<RootStackParamList>;

/**
 * Props a screen component receives. Alias of React Navigation's own
 * NativeStackScreenProps so a screen typed with this is assignable to
 * `<Stack.Screen component={...} />` (a plain object of navigation/route is
 * not — it lacks the internal component brand).
 */
export type ScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<RootStackParamList, T>;

/** Type-safe navigation hook for components that aren't screens. */
export const useAppNavigation = () => useNavigation<AppNavigation>();
