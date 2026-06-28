# JotMinds Mobile - Setup Guide

## Quick Start

This guide will help you get the JotMinds mobile app running on your development machine.

## Prerequisites

### Required Software
1. **Node.js** (v18 or higher)
   - Already available in this environment
   - Check: `node --version`

2. **Package Manager**
   - pnpm (already available)
   - Check: `pnpm --version`

3. **React Native CLI**
   ```bash
   npm install -g react-native-cli
   ```

4. **iOS Development** (Mac only)
   - Xcode 15+
   - iOS Simulator
   - CocoaPods: `sudo gem install cocoapods`

5. **Android Development**
   - Android Studio
   - Android SDK
   - Java JDK 11+

### Required Accounts
1. **Supabase Account**
   - Sign up at https://supabase.com
   - Create a new project
   - Note your project credentials

## Step-by-Step Setup

### 1. Install Dependencies

```bash
cd jotminds-mobile
pnpm install
```

### 2. Configure Supabase

#### Get Your Supabase Credentials

1. Go to https://app.supabase.com
2. Select your project (or create a new one)
3. Navigate to **Settings → API**
4. Copy the following:
   - **Project URL**: `https://abcdefghijk.supabase.co`
   - **Project ID**: `abcdefghijk` (extract from URL)
   - **Anon/Public Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

#### Update API Configuration

Open `src/utils/api.ts` and update these lines:

```typescript
// BEFORE (line 4-5):
const PROJECT_ID = 'your-project-id';
const PUBLIC_ANON_KEY = 'your-anon-key';

// AFTER:
const PROJECT_ID = 'abcdefghijk'; // Your actual project ID
const PUBLIC_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // Your actual anon key
```

### 3. Verify Backend Server

The mobile app connects to the same backend server as the webapp. Ensure your Supabase Edge Function is deployed:

**Expected URL:**
```
https://[PROJECT_ID].supabase.co/functions/v1/make-server-fc8eb847
```

**Test the server:**
```bash
curl https://[PROJECT_ID].supabase.co/functions/v1/make-server-fc8eb847/health
```

### 4. iOS Setup (Mac only)

#### Install iOS Dependencies
```bash
cd ios
pod install
cd ..
```

#### Run on iOS Simulator
```bash
pnpm ios
```

Or specify a device:
```bash
pnpm ios -- --simulator="iPhone 15 Pro"
```

### 5. Android Setup

#### Configure Android SDK

1. Open Android Studio
2. Go to **Preferences → Appearance & Behavior → System Settings → Android SDK**
3. Install:
   - Android SDK Platform 34
   - Android SDK Build-Tools
   - Android Emulator
   - Android SDK Platform-Tools

#### Set Environment Variables

Add to your `~/.bash_profile` or `~/.zshrc`:

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

Reload:
```bash
source ~/.bash_profile  # or source ~/.zshrc
```

#### Run on Android Emulator
```bash
pnpm android
```

### 6. Start Metro Bundler

In a separate terminal:
```bash
pnpm start
```

## Testing the App

### Create Test Accounts

#### Student Account
```
Email: student@test.com
Password: Student123!
Role: Student
School: Test High School
Date of Birth: 2008-01-01
```

#### Teacher Account
```
Email: teacher@test.com
Password: Teacher123!
Role: Teacher
School: Test High School
Organization Code: (get from admin)
```

#### Parent Account
```
Email: parent@test.com
Password: Parent123!
Role: Parent
```

#### Professional Account
```
Email: professional@test.com
Password: Professional123!
Role: Professional
Organization: Test Corp
Position: Software Engineer
Organization Code: (get from admin)
```

### Test Flows

1. **Signup Flow**
   - Open app → Sign Up
   - Complete all 4 steps
   - Verify account creation

2. **Login Flow**
   - Use created credentials
   - Verify dashboard loads correctly

3. **Assessment Flow**
   - Navigate to Assessments tab
   - Start Learning Style assessment
   - Complete all questions
   - View results

4. **Parent-Child Linking**
   - Create parent account
   - Create student account
   - Parent sends access request to student email
   - Student approves request
   - Parent views child's progress

## Common Issues & Solutions

### Issue: "Module not found"
**Solution:**
```bash
# Clear cache
pnpm start -- --reset-cache

# Reinstall dependencies
rm -rf node_modules
pnpm install
```

### Issue: "Unable to resolve module"
**Solution:**
```bash
# iOS
cd ios && pod install && cd ..
pnpm ios

# Android
cd android && ./gradlew clean && cd ..
pnpm android
```

### Issue: "Network request failed"
**Solution:**
1. Check Supabase project URL is correct
2. Verify backend server is deployed
3. Check internet connection
4. For Android emulator, use `10.0.2.2` instead of `localhost`

### Issue: iOS build fails
**Solution:**
```bash
cd ios
pod deintegrate
pod install
cd ..
pnpm ios
```

### Issue: Android build fails
**Solution:**
```bash
cd android
./gradlew clean
cd ..
pnpm android
```

### Issue: "AsyncStorage not found"
**Solution:**
```bash
pnpm install @react-native-async-storage/async-storage
cd ios && pod install && cd ..
```

## Development Tips

### Hot Reload
- iOS: Cmd+D → Enable Fast Refresh
- Android: Cmd+M → Enable Fast Refresh

### Debug Menu
- iOS: Cmd+D
- Android: Cmd+M
- Shake device (on physical device)

### Console Logs
```bash
# iOS
npx react-native log-ios

# Android
npx react-native log-android
```

### Debugging
1. Open Debug Menu
2. Select "Debug"
3. Chrome DevTools will open
4. Use Console/Network tabs

### Running on Physical Device

#### iOS
1. Open `ios/jotminds-mobile.xcworkspace` in Xcode
2. Select your device
3. Click Run

#### Android
1. Enable USB Debugging on device
2. Connect via USB
3. Run `adb devices` to verify connection
4. Run `pnpm android`

## Project Structure Reference

```
jotminds-mobile/
├── android/                 # Android native code
├── ios/                     # iOS native code
├── src/
│   ├── context/            # React Context providers
│   ├── navigation/         # Navigation configuration
│   ├── screens/            # All app screens
│   │   ├── auth/          # Login/Signup
│   │   ├── dashboards/    # Role-specific dashboards
│   │   └── assessments/   # Assessment screens
│   └── utils/             # API & helpers
├── App.tsx                 # Root component
├── index.tsx              # Entry point
├── package.json           # Dependencies
└── tsconfig.json          # TypeScript config
```

## Environment-Specific Configuration

### Development
- Uses Supabase dev/staging environment
- Detailed logging enabled
- Debug mode active

### Production
- Uses Supabase production environment
- Minimal logging
- Release builds optimized

## Next Steps

1. ✅ Install dependencies
2. ✅ Configure Supabase credentials
3. ✅ Run app on simulator/emulator
4. ✅ Create test account
5. ✅ Test main flows
6. 🔄 Customize branding
7. 🔄 Add real assessment content
8. 🔄 Implement push notifications
9. 🔄 Build for production
10. 🔄 Submit to App Store / Play Store

## Support Resources

- **React Native Docs**: https://reactnative.dev/docs/getting-started
- **React Navigation**: https://reactnavigation.org/docs/getting-started
- **Supabase Docs**: https://supabase.com/docs
- **JotMinds Webapp**: Reference the webapp code for any clarifications

## Production Build

### iOS
```bash
cd ios
xcodebuild -workspace jotminds-mobile.xcworkspace \
  -scheme jotminds-mobile \
  -configuration Release \
  -archivePath build/jotminds-mobile.xcarchive \
  archive
```

### Android
```bash
cd android
./gradlew assembleRelease
# APK will be at: android/app/build/outputs/apk/release/app-release.apk
```

## App Store Submission

### iOS (App Store)
1. Archive app in Xcode
2. Upload to App Store Connect
3. Fill in app metadata
4. Submit for review

### Android (Play Store)
1. Generate signed APK/AAB
2. Upload to Google Play Console
3. Fill in app metadata
4. Submit for review

---

**Need Help?**
- Check the main README.md
- Review IMPLEMENTATION_SUMMARY.md
- Check webapp documentation for backend details
