import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import DarkScreenBackground from '../../components/DarkScreenBackground';
import DarkGlassCard from '../../components/DarkGlassCard';
import DarkInput from '../../components/DarkInput';
import DarkButton from '../../components/DarkButton';
import { darkColors, darkRadii, darkSpacing, darkTypography } from '../../theme-dark';

export default function DarkLoginScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    console.log('Login:', { email, password });
  };

  const handleSocialLogin = (provider: string) => {
    console.log('Social login:', provider);
  };

  return (
    <DarkScreenBackground>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={darkColors.gradientPurple}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.logo}
              >
                <View style={styles.logoInner}>
                  <View style={styles.logoSquare} />
                </View>
              </LinearGradient>
            </View>
            <Text style={styles.appName}>
              Jot<Text style={styles.appNameAccent}>Minds</Text>
            </Text>
            <Text style={styles.tagline}>
              Unlock your cognitive potential
            </Text>
          </View>

          {/* Auth Card */}
          <DarkGlassCard padding={24} variant="dark" style={styles.authCard}>
            {/* Tab Switcher */}
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={styles.tab}
                onPress={() => setActiveTab('login')}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === 'login' && styles.tabTextActive,
                  ]}
                >
                  Log In
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.tab}
                onPress={() => setActiveTab('signup')}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === 'signup' && styles.tabTextActive,
                  ]}
                >
                  Sign Up
                </Text>
              </TouchableOpacity>
              <View
                style={[
                  styles.tabIndicator,
                  activeTab === 'signup' && styles.tabIndicatorRight,
                ]}
              />
            </View>

            {/* Form */}
            <View style={styles.form}>
              <DarkInput
                placeholder="Email Address"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                icon={<Text style={styles.inputIcon}>✉️</Text>}
              />
              <DarkInput
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                icon={<Text style={styles.inputIcon}>🔒</Text>}
              />

              <TouchableOpacity
                onPress={() => navigation.navigate('ResetPassword')}
                style={styles.forgotPassword}
              >
                <Text style={styles.forgotPasswordText}>
                  Forgot Password?
                </Text>
              </TouchableOpacity>

              <DarkButton
                label="Sign In"
                onPress={handleLogin}
                variant="purple"
                icon="→"
              />
            </View>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Login */}
            <View style={styles.socialButtons}>
              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => handleSocialLogin('google')}
              >
                <Text style={styles.socialIcon}>G</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => handleSocialLogin('apple')}
              >
                <Text style={styles.socialIcon}>🍎</Text>
              </TouchableOpacity>
            </View>
          </DarkGlassCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </DarkScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    paddingTop: 16,
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoContainer: {
    marginBottom: 12,
  },
  logo: {
    width: 90,
    height: 90,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '45deg' }],
  },
  logoInner: {
    width: 45,
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-45deg' }],
  },
  logoSquare: {
    width: 32,
    height: 32,
    backgroundColor: darkColors.bgPrimary,
    borderRadius: 10,
  },
  appName: {
    fontSize: 36,
    fontWeight: '900',
    fontStyle: 'italic',
    color: darkColors.textPrimary,
    letterSpacing: -1.4,
  },
  appNameAccent: {
    color: darkColors.primary,
  },
  tagline: {
    fontSize: 16,
    color: darkColors.textMuted,
    marginTop: 4,
    fontWeight: '500',
    letterSpacing: -0.3,
  },
  authCard: {
    marginBottom: 0,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    position: 'relative',
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '700',
    color: darkColors.textSubtle,
    textAlign: 'center',
    letterSpacing: -0.15,
  },
  tabTextActive: {
    color: darkColors.textPrimary,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '50%',
    height: 2,
    backgroundColor: darkColors.primary,
    borderRadius: 2,
  },
  tabIndicatorRight: {
    left: '50%',
  },
  form: {
    marginBottom: 24,
  },
  inputIcon: {
    fontSize: 18,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 12,
    color: darkColors.textMuted,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: darkColors.border,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 12,
    color: darkColors.textSubtle,
    fontWeight: '500',
  },
  socialButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  socialButton: {
    flex: 1,
    height: 48,
    backgroundColor: darkColors.bgSecondary,
    borderRadius: darkRadii.md,
    borderWidth: 1,
    borderColor: darkColors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialIcon: {
    fontSize: 20,
  },
});
