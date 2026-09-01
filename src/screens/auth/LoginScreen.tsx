import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { validateStudentCode } from '../../utils/api';
import ScreenBackground from '../../components/ScreenBackground';
import GlassCard from '../../components/GlassCard';
import GradientButton from '../../components/GradientButton';
import AppIcon from '../../components/AppIcon';
import Logo from '../../components/Logo';
import { colors, radii, shadow, spacing, Palette } from '../../theme';
import { useTheme, useThemedStyles } from '../../context/ThemeContext';

export default function LoginScreen({ navigation, route }: any) {
  const colors = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { signIn, requestLoginOtp, signInWithStudentCode } = useAuth();
  const toast = useToast();
  const [mode, setMode] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState(route?.params?.email ?? '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [emailError, setEmailError] = useState('');

  // Student-code sign-in (institutional / school-issued codes)
  const [code, setCode] = useState('');
  const [codeValidated, setCodeValidated] = useState(false);
  const [codeStudentName, setCodeStudentName] = useState('');
  const [codeSchoolName, setCodeSchoolName] = useState('');

  const validateEmail = (text: string) => {
    setEmail(text);
    if (text && !text.includes('@')) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
    } catch (error: any) {
      console.error('[Login] Error:', error);
      toast.error(error.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const resetCodeFlow = () => {
    setCodeValidated(false);
    setCodeStudentName('');
    setCodeSchoolName('');
  };

  const handleCodeSubmit = async () => {
    const entered = code.trim().toUpperCase();
    if (!entered) {
      toast.error('Enter your student code.');
      return;
    }
    setLoading(true);
    try {
      if (!codeValidated) {
        const result = await validateStudentCode(entered);
        if (!result.valid) {
          toast.error('Invalid student code. Please check and try again.');
          return;
        }
        setCodeStudentName(result.studentName ?? '');
        setCodeSchoolName(result.schoolName ?? '');
        setCodeValidated(true);
        return;
      }
      await signInWithStudentCode(entered);
      // onAuthStateChange in AuthContext takes it from here.
    } catch (error: any) {
      console.error('[Login] Student code error:', error);
      toast.error(error.message || 'Could not sign in with that student code.');
      resetCodeFlow();
    } finally {
      setLoading(false);
    }
  };

  const handleOtpLogin = async () => {
    if (!email || !email.includes('@')) {
      toast.info('Type your account email, then tap "Email me a code".');
      return;
    }
    setLoading(true);
    try {
      await requestLoginOtp(email);
      navigation.navigate('OtpVerification', { mode: 'login', email });
    } catch (error: any) {
      toast.error(error.message || 'Could not send code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenBackground>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.logoWrap}>
              <Logo size="md" />
            </View>
            <Text style={styles.tagline}>Discover How You Think</Text>
          </View>

          <GlassCard variant="dark" padding={28} style={styles.card} glowColor="purple">
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to your account</Text>

            <View style={styles.modeToggle}>
              <TouchableOpacity
                style={[styles.modeOption, mode === 'email' && styles.modeOptionActive]}
                onPress={() => setMode('email')}
                accessibilityRole="button"
                accessibilityState={{ selected: mode === 'email' }}
              >
                <Text style={[styles.modeOptionText, mode === 'email' && styles.modeOptionTextActive]}>Email</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modeOption, mode === 'code' && styles.modeOptionActive]}
                onPress={() => { setMode('code'); resetCodeFlow(); }}
                accessibilityRole="button"
                accessibilityState={{ selected: mode === 'code' }}
              >
                <Text style={[styles.modeOptionText, mode === 'code' && styles.modeOptionTextActive]}>Student code</Text>
              </TouchableOpacity>
            </View>

            {mode === 'code' ? (
              <>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>STUDENT CODE</Text>
                  <View style={[
                    styles.inputWrapper,
                    focusedField === 'code' && styles.inputWrapperFocused,
                  ]}>
                    <AppIcon name="🎟️" size={18} color={colors.textMuted} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. JOTM-AB12CD"
                      placeholderTextColor={colors.textSubtle}
                      value={code}
                      onChangeText={(t) => { setCode(t); if (codeValidated) resetCodeFlow(); }}
                      onFocus={() => setFocusedField('code')}
                      onBlur={() => setFocusedField(null)}
                      autoCapitalize="characters"
                      autoCorrect={false}
                      editable={!loading}
                    />
                  </View>
                  <Text style={styles.helperText}>
                    Your school gives you this code. No email or password needed.
                  </Text>
                </View>

                {codeValidated ? (
                  <View style={styles.codeConfirmBox}>
                    <Text style={styles.codeConfirmName}>
                      {codeStudentName ? `Welcome, ${codeStudentName}` : 'Code verified'}
                    </Text>
                    {codeSchoolName ? (
                      <Text style={styles.codeConfirmSchool}>{codeSchoolName}</Text>
                    ) : null}
                  </View>
                ) : null}

                <GradientButton
                  label={codeValidated ? 'Sign In' : 'Continue'}
                  onPress={handleCodeSubmit}
                  loading={loading}
                  variant="primary"
                  icon="→"
                  style={styles.button}
                />
              </>
            ) : (
            <>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>EMAIL ADDRESS</Text>
              <View style={[
                styles.inputWrapper,
                focusedField === 'email' && styles.inputWrapperFocused,
                emailError && styles.inputWrapperError
              ]}>
                <AppIcon name="✉️" size={18} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="you@example.com"
                  placeholderTextColor={colors.textSubtle}
                  value={email}
                  onChangeText={validateEmail}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              {emailError ? (
                <Text style={styles.errorText}>{emailError}</Text>
              ) : null}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>PASSWORD</Text>
              <View style={[
                styles.inputWrapper,
                focusedField === 'password' && styles.inputWrapperFocused
              ]}>
                <AppIcon name="🔒" size={18} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor={colors.textSubtle}
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                  accessibilityRole="button"
                  accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                >
                  <AppIcon name={showPassword ? 'eye' : 'eye-off'} size={20} color={colors.textMuted} />
                </TouchableOpacity>
              </View>
            </View>

            <GradientButton
              label="Sign In"
              onPress={handleLogin}
              loading={loading}
              variant="primary"
              icon="→"
              style={styles.button}
            />

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity style={styles.otpBtn} onPress={handleOtpLogin} disabled={loading}>
              <AppIcon name="✉️" size={18} color={colors.cyan} />
              <Text style={styles.otpBtnText}>Email me a sign-in code</Text>
            </TouchableOpacity>
            </>
            )}

            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                <Text style={styles.signupLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </GlassCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenBackground>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingVertical: 50,
    paddingTop: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoWrap: {
    marginBottom: 16,
  },
  tagline: {
    fontSize: 15,
    color: colors.textMuted,
    fontWeight: '500',
  },
  card: {
    marginBottom: spacing.xxl,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 8,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textMuted,
    marginBottom: 32,
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: colors.glassMedium,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 4,
    marginBottom: 24,
  },
  modeOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radii.sm,
    alignItems: 'center',
  },
  modeOptionActive: {
    backgroundColor: colors.purple,
  },
  modeOptionText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.3,
  },
  modeOptionTextActive: {
    color: '#fff',
  },
  helperText: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 8,
    marginLeft: 4,
    lineHeight: 17,
  },
  codeConfirmBox: {
    backgroundColor: colors.glassMedium,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 14,
    marginBottom: 4,
  },
  codeConfirmName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  codeConfirmSchool: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSubtle,
    marginBottom: 8,
    letterSpacing: 1.2,
  },
  inputWrapper: {
    backgroundColor: colors.glassMedium,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 56,
  },
  inputWrapperFocused: {
    borderColor: colors.purple,
    backgroundColor: colors.glassDark,
  },
  inputWrapperError: {
    borderColor: colors.error,
  },
  inputIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
  },
  eyeIcon: {
    fontSize: 22,
    paddingHorizontal: 8,
  },
  errorText: {
    fontSize: 11,
    color: colors.error,
    marginTop: 6,
    marginLeft: 4,
    fontWeight: '600',
  },
  button: {
    marginTop: 24,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.borderLight,
  },
  dividerText: {
    fontSize: 12,
    color: colors.textSubtle,
    fontWeight: '700',
    letterSpacing: 1,
  },
  otpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    paddingVertical: 15,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.glassMedium,
  },
  otpBtnText: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 28,
  },
  signupText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  signupLink: {
    fontSize: 14,
    color: colors.purple,
    fontWeight: '700',
  },
});
