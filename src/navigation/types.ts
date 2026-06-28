import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
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
  Login: undefined;
  Signup: undefined;
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

  // Role Fit
  RoleDemandBuilder: undefined;
  RoleFitResult: { result?: any; roleName?: string; role?: any };
  AdaptationRecommendations: { result: any; roleName: string };
  CandidateComparison: undefined;
  CareerMatches: undefined;

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
  GrowthTracker: undefined;
  CoachingPathways: undefined;
  ExpertConsultation: undefined;
  SkillBuilder: undefined;
  PracticeModule: { moduleId: string };
  PracticeResults: { score: number; total: number; moduleId: string };
  KidsAssessment: undefined;
  KidsAssessmentResults: undefined;
  ExpertChat: undefined;
};

export type AppNavigation = NativeStackNavigationProp<RootStackParamList>;

export type ScreenProps<T extends keyof RootStackParamList> = {
  navigation: NativeStackNavigationProp<RootStackParamList, T>;
  route: RouteProp<RootStackParamList, T>;
};

/** Type-safe navigation hook for components that aren't screens. */
export const useAppNavigation = () => useNavigation<AppNavigation>();
