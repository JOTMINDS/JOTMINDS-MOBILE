# JotMinds Mobile

A React Native mobile application for JotMinds - a collaborative knowledge-management, note-taking, and learning platform.

## Features

### Authentication & Onboarding
- ✅ Multi-step signup flow (Email/Password → Personal Info → Role Selection → Consent)
- ✅ Login with email/password
- ✅ Organization code validation for teachers and professionals
- ✅ Role-based access (Student, Teacher, Parent, Professional)
- ✅ Automatic age calculation and minor consent handling

### Role-Specific Dashboards
- ✅ **Student Dashboard**: View assessments, track progress, daily challenges
- ✅ **Teacher Dashboard**: Manage students, view class analytics
- ✅ **Parent Dashboard**: Link children, view access requests, monitor progress
- ✅ **Professional Dashboard**: Organization members, team analytics

### Assessments
- ✅ Learning Style Assessment (Kolb's model)
- ✅ Thinking Style Assessment (Sternberg's model)
- ✅ Decision Style Assessment
- ✅ Progress tracking during assessments
- ✅ Detailed results with strengths, weaknesses, and recommendations

### Parent-Child Linking
- ✅ Access request system
- ✅ Approve/deny requests
- ✅ View linked children's progress

### Profile Management
- ✅ View user profile information
- ✅ Track assessment completion
- ✅ Sign out functionality

## Setup Instructions

### Prerequisites
- Node.js 18+ (already available in this environment)
- React Native development environment
- Xcode (for iOS) or Android Studio (for Android)
- Supabase account with project set up

### 1. Install Dependencies

```bash
cd jotminds-mobile
pnpm install
```

### 2. Configure Supabase Credentials

Update the Supabase configuration in `src/utils/api.ts`:

```typescript
// Replace these with your actual Supabase project details
const PROJECT_ID = 'your-project-id';
const PUBLIC_ANON_KEY = 'your-anon-key';
```

You can find these values in your Supabase project dashboard:
1. Go to https://app.supabase.com
2. Select your project
3. Navigate to Settings > API
4. Copy the "Project URL" (extract the project ID from it)
5. Copy the "anon/public" key

### 3. Backend Server

This mobile app connects to the same Supabase backend as the webapp located at:
```
https://{PROJECT_ID}.supabase.co/functions/v1/make-server-fc8eb847
```

Make sure your Supabase Edge Functions are deployed and running.

### 4. Run the App

#### For iOS:
```bash
pnpm ios
```

#### For Android:
```bash
pnpm android
```

#### Start Metro Bundler:
```bash
pnpm start
```

## Project Structure

```
jotminds-mobile/
├── src/
│   ├── components/         # Reusable UI components (if needed)
│   ├── context/
│   │   └── AuthContext.tsx # Authentication state management
│   ├── navigation/
│   │   └── AppNavigator.tsx # Main navigation setup
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   └── SignupScreen.tsx
│   │   ├── dashboards/
│   │   │   ├── StudentDashboard.tsx
│   │   │   ├── TeacherDashboard.tsx
│   │   │   ├── ParentDashboard.tsx
│   │   │   └── ProfessionalDashboard.tsx
│   │   ├── assessments/
│   │   │   ├── AssessmentListScreen.tsx
│   │   │   ├── AssessmentTakingScreen.tsx
│   │   │   └── AssessmentResultsScreen.tsx
│   │   └── ProfileScreen.tsx
│   └── utils/
│       └── api.ts          # API utility functions
├── App.tsx                 # Root component
├── index.tsx               # Entry point
├── package.json
├── tsconfig.json
└── README.md
```

## Key Differences from Webapp

### No Landing Page
- Mobile app goes directly to authentication screens
- If already logged in, users see their role-specific dashboard immediately

### AsyncStorage Instead of localStorage
- All local storage uses `@react-native-async-storage/async-storage`
- Session tokens are persisted across app restarts

### Native Navigation
- Uses React Navigation instead of web routing
- Stack navigation for auth flow
- Tab navigation for authenticated users

### Touch-Optimized UI
- Large tap targets (minimum 44x44 points)
- Mobile-first responsive design
- Native components (no HTML/CSS)

## API Integration

All API calls are defined in `src/utils/api.ts` and include:

**Authentication:**
- `signup()` - Create new user account
- `signin()` - Log in with credentials
- `getSession()` - Get current user session
- `validateOrgCode()` - Verify organization invitation code

**Assessments:**
- `saveProgress()` - Save assessment progress
- `getProgress()` - Retrieve saved progress
- `submitAssessment()` - Submit completed assessment
- `getAssessmentResults()` - Get results for specific assessment
- `getAllAssessmentResults()` - Get all user's assessment results

**Parent Features:**
- `getLinkedChildren()` - Get linked children
- `createAccessRequest()` - Request access to child's data
- `getPendingAccessRequests()` - Get pending requests
- `approveAccessRequest()` - Approve access request
- `denyAccessRequest()` - Deny access request

**Teacher Features:**
- `getStudentsForTeacher()` - Get students in teacher's class

**Professional Features:**
- `getOrganizationMembers()` - Get organization members

## Color Scheme

- Primary Purple: `#7B61FF`
- Cyan: `#1FC8E1`
- Dark Purple: `#2C2E83`
- Text Dark: `#1a1a1a`
- Text Gray: `#6b7280`
- Background: `#f9fafb`

## Assessment Types

1. **Learning Style** (`learning`) - Based on Kolb's Experiential Learning Theory
2. **Thinking Style** (`thinking`) - Based on Sternberg's Theory of Mental Self-Government
3. **Decision Style** (`decision`) - Intuitive vs Analytical decision-making

## User Roles

- **student** - K-12 or tertiary students
- **teacher** - Educators managing classes
- **parent** - Parents monitoring children's progress
- **professional** - Corporate/enterprise users
- **admin** - System administrators (webapp only)

## Next Steps

To enhance the mobile app further:

1. **Implement full assessment questions** - Currently using sample questions
2. **Add gamification features** - Stars, badges, avatars
3. **Implement push notifications** - For access requests, daily challenges
4. **Add offline support** - Save assessments locally when offline
5. **Enhance profile editing** - Allow users to update their information
6. **Add social features** - Share results with friends/classmates
7. **Implement dark mode** - Respect system theme preferences
8. **Add biometric authentication** - Face ID / Touch ID for quick login

## Troubleshooting

### Common Issues

**1. "Network request failed"**
- Check that your Supabase project URL is correct
- Verify your internet connection
- Ensure the backend server is running

**2. "Invalid credentials"**
- Double-check email and password
- Ensure account was created successfully

**3. "Organization code invalid"**
- Verify the code with your organization admin
- Codes are case-insensitive but must be exact

## Support

For issues or questions:
- Check the webapp documentation
- Review Supabase backend logs
- Contact the development team

## License

© 2026 JotMinds. All rights reserved.
