import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import AppIcon from '../components/AppIcon';
import { colors } from '../theme';

// ── Auth & Onboarding ─────────────────────────────────────────────────────────
import SplashScreen from '../screens/auth/SplashScreen';
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import OtpVerificationScreen from '../screens/auth/OtpVerificationScreen';
import FirstWinScreen from '../screens/onboarding/FirstWinScreen';

// ── Brain Gym ─────────────────────────────────────────────────────────────────
import BrainGymScreen from '../screens/braingym/BrainGymScreen';
import MemoryMatchScreen from '../screens/braingym/MemoryMatchScreen';
import NBackScreen from '../screens/braingym/NBackScreen';
import StroopScreen from '../screens/braingym/StroopScreen';

// ── Role-Based Home Dashboards ────────────────────────────────────────────────
import StudentDashboard from '../screens/dashboards/StudentDashboard';
import TeacherDashboard from '../screens/dashboards/TeacherDashboard';
import ParentDashboard from '../screens/dashboards/ParentDashboard';
import ProfessionalDashboard from '../screens/dashboards/ProfessionalDashboard';

// ── Discover ──────────────────────────────────────────────────────────────────
import DiscoverScreen from '../screens/discover/DiscoverScreen';
import InsightDetailScreen from '../screens/discover/InsightDetailScreen';

// ── Mind ──────────────────────────────────────────────────────────────────────
import MindHomeScreen from '../screens/mind/MindHomeScreen';
import DailyCheckIntroScreen from '../screens/mind/DailyCheckIntroScreen';
import DailyCheckQuestionsScreen from '../screens/mind/DailyCheckQuestionsScreen';
import InstantFeedbackScreen from '../screens/mind/InstantFeedbackScreen';
import WeeklySnapshotScreen from '../screens/mind/WeeklySnapshotScreen';
import BehavioralDashboardScreen from '../screens/mind/BehavioralDashboardScreen';

// ── Role Fit ──────────────────────────────────────────────────────────────────
import RoleFitHomeScreen from '../screens/rolefit/RoleFitHomeScreen';
import RoleDemandBuilderScreen from '../screens/rolefit/RoleDemandBuilderScreen';
import RoleFitResultScreen from '../screens/rolefit/RoleFitResultScreen';
import AdaptationScreen from '../screens/rolefit/AdaptationScreen';
import CandidateComparisonScreen from '../screens/rolefit/CandidateComparisonScreen';
import CareerMatchesScreen from '../screens/rolefit/CareerMatchesScreen';

// ── Profile ───────────────────────────────────────────────────────────────────
import ProfileScreen from '../screens/ProfileScreen';
import AccessibilityScreen from '../screens/profile/AccessibilityScreen';
import NotificationsScreen from '../screens/profile/NotificationsScreen';
// import SubscriptionScreen from '../screens/profile/SubscriptionScreen'; // disabled

// ── Assessments ───────────────────────────────────────────────────────────────
import AssessmentListScreen from '../screens/assessments/AssessmentListScreen';
import AssessmentTakingScreen from '../screens/assessments/AssessmentTakingScreen';
import AssessmentResultsScreen from '../screens/assessments/AssessmentResultsScreen';

// ── Teacher ───────────────────────────────────────────────────────────────────
import TeacherDevelopmentScreen from '../screens/teacher/TeacherDevelopmentScreen';
import TeachingStyleAssessmentScreen from '../screens/teacher/TeachingStyleAssessmentScreen';
import TeachingStyleResultsScreen from '../screens/teacher/TeachingStyleResultsScreen';
import GrowthTrackerScreen from '../screens/teacher/GrowthTrackerScreen';

// ── Parent ────────────────────────────────────────────────────────────────────
import CoachingPathwaysScreen from '../screens/parent/CoachingPathwaysScreen';
import ExpertConsultationScreen from '../screens/parent/ExpertConsultationScreen';

// ── Learning ──────────────────────────────────────────────────────────────────
import SkillBuilderScreen from '../screens/learning/SkillBuilderScreen';
import PracticeModuleScreen from '../screens/learning/PracticeModuleScreen';
import PracticeResultsScreen from '../screens/learning/PracticeResultsScreen';

// ── Kids ──────────────────────────────────────────────────────────────────────
import KidsAssessmentScreen from '../screens/kids/KidsAssessmentScreen';
import KidsAssessmentResultsScreen from '../screens/kids/KidsAssessmentResultsScreen';

// ── Shared ────────────────────────────────────────────────────────────────────
import ExpertChatScreen from '../screens/shared/ExpertChatScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabIcon({ icon, color }: { icon: string; color: string }) {
  return <AppIcon name={icon} size={24} color={color} />;
}

function HomeTabScreen(props: any) {
  const { user } = useAuth();
  // Forward navigation/route — without this the dashboards get an undefined
  // `navigation` prop and crash the moment a card's onPress calls .navigate().
  switch (user?.role) {
    case 'teacher': return <TeacherDashboard {...props} />;
    case 'parent': return <ParentDashboard {...props} />;
    case 'professional': return <ProfessionalDashboard {...props} />;
    default: return <StudentDashboard {...props} />;
  }
}

function MainTabs() {
  const t = useTheme();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: [styles.tabBar, { backgroundColor: t.bgSecondary, borderTopColor: t.borderLight }],
        tabBarActiveTintColor: t.purple,
        tabBarInactiveTintColor: t.textSubtle,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeTabScreen}
        options={{
          tabBarIcon: ({ color }) => <TabIcon icon="🏠" color={color} />,
        }}
      />
      <Tab.Screen
        name="Discover"
        component={DiscoverScreen}
        options={{
          tabBarIcon: ({ color }) => <TabIcon icon="💡" color={color} />,
        }}
      />
      <Tab.Screen
        name="MindHome"
        component={MindHomeScreen}
        options={{
          title: 'Mind',
          tabBarIcon: ({ color }) => <TabIcon icon="🧠" color={color} />,
        }}
      />
      <Tab.Screen
        name="RoleFit"
        component={RoleFitHomeScreen}
        options={{
          title: 'Role Fit',
          tabBarIcon: ({ color }) => <TabIcon icon="🎯" color={color} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color }) => <TabIcon icon="👤" color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();
  // First-Win onboarding gate: shown once per user before the main app.
  const [firstWinDone, setFirstWinDone] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user) { setFirstWinDone(null); return; }
    AsyncStorage.getItem(`jotminds.firstwin.${user.id}`)
      .then((v) => setFirstWinDone(!!v))
      .catch(() => setFirstWinDone(true));
  }, [user?.id]);

  if (loading || (user && firstWinDone === null)) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={colors.purple} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName={user ? (firstWinDone ? 'Main' : 'FirstWin') : 'Welcome'}
      >
        {user ? (
          // ── Authenticated Stack ────────────────────────────────────────────
          <>
            <Stack.Screen name="FirstWin" component={FirstWinScreen} />
            <Stack.Screen name="Main" component={MainTabs} />

            {/* Discover */}
            <Stack.Screen name="InsightDetail" component={InsightDetailScreen} />

            {/* Mind */}
            <Stack.Screen name="DailyCheckIntro" component={DailyCheckIntroScreen} />
            <Stack.Screen name="DailyCheckQuestions" component={DailyCheckQuestionsScreen} />
            <Stack.Screen name="InstantFeedback" component={InstantFeedbackScreen} />
            <Stack.Screen name="WeeklySnapshot" component={WeeklySnapshotScreen} />
            <Stack.Screen name="BehavioralDashboard" component={BehavioralDashboardScreen} />

            {/* Brain Gym */}
            <Stack.Screen name="BrainGym" component={BrainGymScreen} />
            <Stack.Screen name="MemoryMatch" component={MemoryMatchScreen} />
            <Stack.Screen name="NBack" component={NBackScreen} />
            <Stack.Screen name="Stroop" component={StroopScreen} />

            {/* Role Fit */}
            <Stack.Screen name="RoleDemandBuilder" component={RoleDemandBuilderScreen} />
            <Stack.Screen name="RoleFitResult" component={RoleFitResultScreen} />
            <Stack.Screen name="AdaptationRecommendations" component={AdaptationScreen} />
            <Stack.Screen name="CandidateComparison" component={CandidateComparisonScreen} />
            <Stack.Screen name="CareerMatches" component={CareerMatchesScreen} />

            {/* Profile */}
            <Stack.Screen name="Accessibility" component={AccessibilityScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            {/* Subscription disabled */}

            {/* Assessments */}
            <Stack.Screen
              name="AssessmentList"
              component={AssessmentListScreen}
              options={{ headerShown: true, title: 'Assessments' }}
            />
            <Stack.Screen
              name="AssessmentTaking"
              component={AssessmentTakingScreen}
              options={{ headerShown: true, title: 'Assessment' }}
            />
            <Stack.Screen
              name="AssessmentResults"
              component={AssessmentResultsScreen}
              options={{ headerShown: true, title: 'Results' }}
            />

            {/* Teacher */}
            <Stack.Screen name="TeacherDevelopment" component={TeacherDevelopmentScreen} options={{ headerShown: true, title: 'Professional Development' }} />
            <Stack.Screen name="TeachingStyleAssessment" component={TeachingStyleAssessmentScreen} options={{ headerShown: true, title: 'Teaching Style' }} />
            <Stack.Screen name="TeachingStyleResults" component={TeachingStyleResultsScreen} options={{ headerShown: true, title: 'Your Teaching Style' }} />
            <Stack.Screen name="GrowthTracker" component={GrowthTrackerScreen} options={{ headerShown: true, title: 'Growth Tracker' }} />

            {/* Parent */}
            <Stack.Screen name="CoachingPathways" component={CoachingPathwaysScreen} options={{ headerShown: true, title: 'Coaching Pathways' }} />
            <Stack.Screen name="ExpertConsultation" component={ExpertConsultationScreen} options={{ headerShown: true, title: 'Expert Consultation' }} />

            {/* Learning */}
            <Stack.Screen name="SkillBuilder" component={SkillBuilderScreen} options={{ headerShown: true, title: 'Skill Builder' }} />
            <Stack.Screen name="PracticeModule" component={PracticeModuleScreen} options={{ headerShown: true, title: 'Practice' }} />
            <Stack.Screen name="PracticeResults" component={PracticeResultsScreen} options={{ headerShown: true, title: 'Practice Results' }} />

            {/* Kids */}
            <Stack.Screen name="KidsAssessment" component={KidsAssessmentScreen} options={{ headerShown: true, title: 'Fun Quiz' }} />
            <Stack.Screen name="KidsAssessmentResults" component={KidsAssessmentResultsScreen} options={{ headerShown: true, title: 'Your Results' }} />

            {/* Shared */}
            <Stack.Screen name="ExpertChat" component={ExpertChatScreen} options={{ headerShown: true, title: 'Chat with Expert' }} />
          </>
        ) : (
          // ── Auth Stack ─────────────────────────────────────────────────────
          <>
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
            <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bgPrimary,
  },
  tabBar: {
    backgroundColor: colors.bgSecondary,
    borderTopColor: colors.borderLight,
    borderTopWidth: 1,
    height: 84,
    paddingBottom: 20,
    paddingTop: 10,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
});
