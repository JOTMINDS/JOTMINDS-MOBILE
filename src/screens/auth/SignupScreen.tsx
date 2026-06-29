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
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { callEdgeFn, sendSignupOtp } from '../../utils/supabase';
import ScreenBackground from '../../components/ScreenBackground';
import GlassCard from '../../components/GlassCard';
import GradientButton from '../../components/GradientButton';
import AppIcon from '../../components/AppIcon';
import Logo from '../../components/Logo';
import { colors, radii, shadow, spacing, Palette } from '../../theme';
import { useTheme, useThemedStyles } from '../../context/ThemeContext';

// Education levels — mirrors the jotminds.com web signup (students only).
const EDUCATION_LEVELS = [
  { value: 'Elementary', label: 'Primary' },
  { value: 'JHS', label: 'JHS' },
  { value: 'SHS', label: 'SHS' },
  { value: 'Tertiary', label: 'Tertiary' },
];

export default function SignupScreen({ navigation }: any) {
  const colors = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { signUp } = useAuth();
  const toast = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Step 1: Email & Password
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');

  const validateEmail = (text: string) => {
    setEmail(text);
    if (text && !text.includes('@')) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  // Step 2: Personal Info
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Step 3: Role & Organization
  const [role, setRole] = useState('student');
  const [school, setSchool] = useState('');
  const [educationLevel, setEducationLevel] = useState('JHS');
  const [organizationName, setOrganizationName] = useState('');
  const [organizationType, setOrganizationType] = useState('Corporate');
  const [position, setPosition] = useState('');
  const [department, setDepartment] = useState('');
  const [organizationCode, setOrganizationCode] = useState('');
  const [verifiedOrgName, setVerifiedOrgName] = useState('');

  // Step 4: Consent
  const [hasConsented, setHasConsented] = useState(false);

  const calculateAge = (dob: string): number => {
    if (!dob) return 0;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const isMinor = role === 'student' && dateOfBirth && calculateAge(dateOfBirth) < 18;

  const getPasswordStrength = (pass: string): { label: string; color: string; width: string } => {
    if (!pass) return { label: '', color: '', width: '0%' };
    if (pass.length < 6) return { label: 'Weak', color: '#EF4444', width: '33%' };
    if (pass.length < 10) return { label: 'Fair', color: '#F59E0B', width: '66%' };
    return { label: 'Strong', color: '#10B981', width: '100%' };
  };

  const passwordStrength = getPasswordStrength(password);

  const handleValidateOrgCode = async () => {
    if (!organizationCode.trim()) {
      toast.error('Please enter an organization code');
      return;
    }
    setVerifyingCode(true);
    try {
      const data = await callEdgeFn('/validate-org-code', {
        method: 'POST',
        body: JSON.stringify({ code: organizationCode.toUpperCase() }),
      });
      if (data.valid) {
        setVerifiedOrgName(data.organizationName);
        setOrganizationName(data.organizationName);
        toast.success(`Organization verified: ${data.organizationName}`);
      } else {
        toast.error(data.error || 'Invalid organization code');
        setVerifiedOrgName('');
      }
    } catch {
      toast.error('Failed to validate organization code');
      setVerifiedOrgName('');
    } finally {
      setVerifyingCode(false);
    }
  };

  const validateStep = (): boolean => {
    switch (step) {
      case 1:
        if (!email || !password) {
          toast.error('Please fill in all fields');
          return false;
        }
        if (!email.includes('@')) {
          toast.error('Please enter a valid email address');
          return false;
        }
        if (password.length < 8) {
          toast.error('Password must be at least 8 characters');
          return false;
        }
        return true;

      case 2:
        if (!name || !phone) {
          toast.error('Please fill in all fields');
          return false;
        }
        return true;

      case 3:
        if (role === 'student' || role === 'teacher') {
          if (!school) {
            toast.error('Please enter your school name');
            return false;
          }
        }
        if (role === 'professional') {
          if (!organizationName || !position) {
            toast.error('Please fill in all organization fields');
            return false;
          }
        }
        return true;

      case 4:
        if (!hasConsented) {
          toast.error('Please accept the terms and conditions');
          return false;
        }
        return true;

      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSignup = async () => {
    if (!validateStep()) return;
    setLoading(true);
    try {
      // 1) Verify email ownership BEFORE creating the account.
      //    The backend generates + emails the code.
      await sendSignupOtp(email);

      // 2) Hand the collected details to the OTP screen; it creates the
      //    account only after the code is verified.
      const signupData = {
        email,
        password,
        name,
        phone,
        role,
        dateOfBirth,
        school: role === 'student' || role === 'teacher' ? school : undefined,
        educationLevel: role === 'student' ? educationLevel : undefined,
        organizationName: role === 'professional' ? organizationName : undefined,
        organizationType: role === 'professional' ? organizationType : undefined,
        position: role === 'professional' ? position : undefined,
        department: role === 'professional' ? department : undefined,
        organizationCode: organizationCode || undefined,
        hasConsented,
      };
      navigation.navigate('OtpVerification', { mode: 'signup', email, signupData });
    } catch (error: any) {
      toast.error(error.message || 'Failed to send verification email');
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (r: string) => {
    const roleColors: { [key: string]: [string, string] } = {
      student: colors.gradientCyan,
      parent: colors.gradientCoral,
      teacher: colors.gradientSuccess,
      professional: ['#F59E0B', '#D97706'],
    };
    return roleColors[r] || colors.gradientPurple;
  };

  const getRoleIcon = (r: string) => {
    const icons: { [key: string]: string } = {
      student: '🎓',
      parent: '👥',
      teacher: '👨‍🏫',
      professional: '💼',
    };
    return icons[r] || '📱';
  };

  const getRoleDescription = (r: string) => {
    const descriptions: { [key: string]: string } = {
      student: 'Learning & Growth',
      parent: 'Family Insights',
      teacher: 'Classroom Tools',
      professional: 'Team Analytics',
    };
    return descriptions[r] || '';
  };

  const renderRoleSelector = () => (
    <View style={styles.roleContainer}>
      {['student', 'parent', 'teacher', 'professional'].map((r) => (
        <TouchableOpacity
          key={r}
          style={[styles.roleButton, role === r && styles.roleButtonActive]}
          onPress={() => setRole(r)}
          activeOpacity={0.7}
        >
          {role === r ? (
            <LinearGradient
              colors={getRoleColor(r)}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.roleButtonGradient}
            >
              <AppIcon name={getRoleIcon(r)} size={32} color="#FFFFFF" style={styles.roleIcon} />
              <Text style={styles.roleButtonTextActive}>
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </Text>
              <Text style={styles.roleDescriptionActive}>
                {getRoleDescription(r)}
              </Text>
            </LinearGradient>
          ) : (
            <View style={styles.roleButtonContent}>
              <AppIcon name={getRoleIcon(r)} size={28} color={colors.textMuted} style={styles.roleIconInactive} />
              <Text style={styles.roleButtonText}>
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </Text>
              <Text style={styles.roleDescriptionInactive}>
                {getRoleDescription(r)}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderInput = (
    icon: string,
    placeholder: string,
    value: string,
    onChangeText: (text: string) => void,
    field: string,
    keyboardType: any = 'default',
    autoCapitalize: any = 'none'
  ) => (
    <View style={[
      styles.inputWrapper,
      focusedField === field && styles.inputWrapperFocused
    ]}>
      <AppIcon name={icon} size={18} color={colors.textMuted} style={styles.inputIcon} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={colors.textSubtle}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setFocusedField(field)}
        onBlur={() => setFocusedField(null)}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
      />
    </View>
  );

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
              <Logo size="sm" />
            </View>
            <LinearGradient
              colors={colors.gradientCyan}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.progressBadge}
            >
              <Text style={styles.progress}>Step {step} of 4</Text>
            </LinearGradient>
          </View>

          <GlassCard variant="dark" padding={28} style={styles.card} glowColor="purple">
            {/* Step 1: Email & Password */}
            {step === 1 && (
              <View>
                <Text style={styles.title}>Create Account</Text>
                <Text style={styles.subtitle}>Enter your credentials</Text>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>EMAIL ADDRESS</Text>
                  {renderInput('✉️', 'you@example.com', email, validateEmail, 'email', 'email-address')}
                  {emailError ? (
                    <Text style={styles.errorText}>{emailError}</Text>
                  ) : (
                    <Text style={styles.helperText}>We'll never share your email</Text>
                  )}
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
                      placeholder="Min. 8 characters"
                      placeholderTextColor={colors.textSubtle}
                      value={password}
                      onChangeText={setPassword}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                      <AppIcon name={showPassword ? 'eye' : 'eye-off'} size={20} color={colors.textMuted} style={styles.eyeIcon} />
                    </TouchableOpacity>
                  </View>
                  {password.length > 0 && (
                    <View style={styles.passwordStrengthContainer}>
                      <View style={styles.passwordStrengthBar}>
                        <View style={[styles.passwordStrengthFill, { width: passwordStrength.width, backgroundColor: passwordStrength.color }]} />
                      </View>
                      <Text style={[styles.passwordStrengthText, { color: passwordStrength.color }]}>
                        {passwordStrength.label}
                      </Text>
                    </View>
                  )}
                </View>

                <GradientButton
                  label="Next"
                  onPress={handleNext}
                  variant="purple"
                  icon="→"
                  style={styles.button}
                />
              </View>
            )}

            {/* Step 2: Personal Info */}
            {step === 2 && (
              <View>
                <Text style={styles.title}>Personal Information</Text>
                <Text style={styles.subtitle}>Tell us about yourself</Text>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>FULL NAME</Text>
                  {renderInput('👤', 'John Doe', name, setName, 'name', 'default', 'words')}
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>PHONE NUMBER</Text>
                  {renderInput('📱', '+1 (555) 000-0000', phone, setPhone, 'phone', 'phone-pad')}
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>DATE OF BIRTH</Text>
                  <TouchableOpacity
                    style={styles.inputWrapper}
                    onPress={() => setShowDatePicker(true)}
                    accessibilityRole="button"
                    accessibilityLabel={dateOfBirth ? `Date of birth ${dateOfBirth}. Tap to change` : 'Select date of birth'}
                  >
                    <AppIcon name="🎂" size={18} color={colors.textMuted} style={styles.inputIcon} />
                    <Text style={[styles.input, { paddingVertical: 16 }, !dateOfBirth && { color: colors.textSubtle }]}>
                      {dateOfBirth || 'Select your date of birth'}
                    </Text>
                  </TouchableOpacity>
                  {showDatePicker && (
                    <DateTimePicker
                      value={dateOfBirth ? new Date(dateOfBirth) : new Date(2005, 0, 1)}
                      mode="date"
                      maximumDate={new Date()}
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={(event, selected) => {
                        setShowDatePicker(Platform.OS === 'ios');
                        if (event.type === 'set' && selected) {
                          setDateOfBirth(selected.toISOString().split('T')[0]);
                        }
                      }}
                    />
                  )}
                  <Text style={styles.helperText}>Required for age-appropriate features</Text>
                </View>

                <View style={styles.buttonRow}>
                  <GradientButton
                    label="Back"
                    onPress={handleBack}
                    variant="outline"
                    icon="←"
                    size="medium"
                    style={styles.buttonSecondary}
                  />
                  <GradientButton
                    label="Next"
                    onPress={handleNext}
                    variant="purple"
                    icon="→"
                    size="medium"
                    style={styles.button}
                  />
                </View>
              </View>
            )}

            {/* Step 3: Role & Organization */}
            {step === 3 && (
              <View>
                <Text style={styles.title}>Role & Organization</Text>
                <Text style={styles.subtitle}>Select your role</Text>

                {renderRoleSelector()}

                {(role === 'student' || role === 'teacher') && (
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>SCHOOL NAME</Text>
                    {renderInput('🏫', 'Enter your school', school, setSchool, 'school')}
                  </View>
                )}

                {role === 'student' && (
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>EDUCATION LEVEL</Text>
                    <View style={styles.levelRow}>
                      {EDUCATION_LEVELS.map((lvl) => {
                        const active = educationLevel === lvl.value;
                        return (
                          <TouchableOpacity
                            key={lvl.value}
                            style={[styles.levelPill, active && styles.levelPillActive]}
                            onPress={() => setEducationLevel(lvl.value)}
                            accessibilityRole="button"
                            accessibilityState={{ selected: active }}
                            accessibilityLabel={lvl.label}
                          >
                            <Text style={[styles.levelPillText, active && styles.levelPillTextActive]}>
                              {lvl.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                )}

                {role === 'professional' && (
                  <>
                    <View style={styles.inputContainer}>
                      <Text style={styles.label}>ORGANIZATION NAME</Text>
                      {renderInput('🏢', 'Enter organization', organizationName, setOrganizationName, 'org')}
                    </View>
                    <View style={styles.inputContainer}>
                      <Text style={styles.label}>POSITION</Text>
                      {renderInput('💼', 'Your position', position, setPosition, 'position')}
                    </View>
                    <View style={styles.inputContainer}>
                      <Text style={styles.label}>DEPARTMENT (OPTIONAL)</Text>
                      {renderInput('🏢', 'e.g. Operations', department, setDepartment, 'department')}
                    </View>
                  </>
                )}

                {(role === 'teacher' || role === 'professional') && (
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>ORGANIZATION CODE (OPTIONAL)</Text>
                    <View style={styles.codeContainer}>
                      <View style={[styles.codeInputWrapper, focusedField === 'code' && styles.inputWrapperFocused]}>
                        <AppIcon name="🎫" size={18} color={colors.textMuted} style={styles.inputIcon} />
                        <TextInput
                          style={styles.codeInput}
                          placeholder="JOTM-XXXXXX"
                          placeholderTextColor={colors.textSubtle}
                          value={organizationCode}
                          onChangeText={setOrganizationCode}
                          onFocus={() => setFocusedField('code')}
                          onBlur={() => setFocusedField(null)}
                          autoCapitalize="characters"
                        />
                      </View>
                      <TouchableOpacity
                        onPress={handleValidateOrgCode}
                        disabled={verifyingCode}
                        style={styles.verifyButton}
                      >
                        <LinearGradient
                          colors={colors.gradientCyan}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.verifyButtonGradient}
                        >
                          {verifyingCode ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                          ) : (
                            <Text style={styles.verifyButtonText}>Verify</Text>
                          )}
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                    {verifiedOrgName ? (
                      <View style={styles.verifiedBadge}>
                        <AppIcon name="✓" size={13} color={colors.success} />
                        <Text style={styles.verifiedText}>{verifiedOrgName}</Text>
                      </View>
                    ) : (
                      <Text style={styles.helperText}>If you have a code from your supervisor or school, enter it. Otherwise skip.</Text>
                    )}
                  </View>
                )}

                <View style={styles.buttonRow}>
                  <GradientButton
                    label="Back"
                    onPress={handleBack}
                    variant="outline"
                    icon="←"
                    size="medium"
                    style={styles.buttonSecondary}
                  />
                  <GradientButton
                    label="Next"
                    onPress={handleNext}
                    variant="purple"
                    icon="→"
                    size="medium"
                    style={styles.button}
                  />
                </View>
              </View>
            )}

            {/* Step 4: Consent */}
            {step === 4 && (
              <View>
                <Text style={styles.title}>Terms & Conditions</Text>
                <Text style={styles.subtitle}>Review and accept</Text>

                <TouchableOpacity
                  style={styles.checkbox}
                  onPress={() => setHasConsented(!hasConsented)}
                >
                  <View style={[styles.checkboxBox, hasConsented && styles.checkboxBoxChecked]}>
                    {hasConsented && <AppIcon name="✓" size={18} color="#FFFFFF" />}
                  </View>
                  <Text style={styles.checkboxLabel}>
                    I agree to the Terms of Service and Privacy Policy
                  </Text>
                </TouchableOpacity>

                {isMinor && (
                  <View style={styles.minorNotice}>
                    <Text style={styles.minorNoticeText}>
                      As a minor, parental consent is required. Your parent will receive a verification request.
                    </Text>
                  </View>
                )}

                <View style={styles.buttonRow}>
                  <GradientButton
                    label="Back"
                    onPress={handleBack}
                    variant="outline"
                    icon="←"
                    size="medium"
                    style={styles.buttonSecondary}
                  />
                  <GradientButton
                    label="Create Account"
                    onPress={handleSignup}
                    loading={loading}
                    variant="success"
                    icon="✓"
                    size="medium"
                    style={styles.button}
                  />
                </View>
              </View>
            )}

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <Text
                style={styles.loginLink}
                onPress={() => navigation.navigate('Login')}
              >
                Sign In
              </Text>
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
    paddingVertical: 40,
    paddingTop: 12,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoWrap: {
    marginBottom: 16,
  },
  progressBadge: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  progress: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  card: {
    marginBottom: spacing.xxl,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 8,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 24,
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
  levelRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  levelPill: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: radii.md,
    backgroundColor: colors.glassMedium,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
  },
  levelPillActive: {
    backgroundColor: colors.purple,
    borderColor: colors.purple,
  },
  levelPillText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
  },
  levelPillTextActive: {
    color: '#FFFFFF',
  },
  inputWrapper: {
    backgroundColor: colors.glassMedium,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  inputWrapperFocused: {
    borderColor: colors.purple,
    backgroundColor: colors.glassDark,
  },
  inputIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
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
  helperText: {
    fontSize: 11,
    color: colors.textSubtle,
    marginTop: 6,
    marginLeft: 4,
  },
  passwordStrengthContainer: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  passwordStrengthBar: {
    flex: 1,
    height: 6,
    backgroundColor: colors.glassMedium,
    borderRadius: 3,
    overflow: 'hidden',
  },
  passwordStrengthFill: {
    height: '100%',
    borderRadius: 3,
  },
  passwordStrengthText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  roleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  roleButton: {
    flex: 1,
    minWidth: '47%',
    borderRadius: radii.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.glassMedium,
    minHeight: 100,
  },
  roleButtonActive: {
    borderColor: 'transparent',
  },
  roleButtonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  roleButtonContent: {
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  roleIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  roleIconInactive: {
    fontSize: 28,
    marginBottom: 6,
    opacity: 0.6,
  },
  roleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 4,
  },
  roleButtonTextActive: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  roleDescriptionInactive: {
    fontSize: 11,
    color: colors.textSubtle,
    textAlign: 'center',
  },
  roleDescriptionActive: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  codeContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  codeInputWrapper: {
    flex: 1,
    backgroundColor: colors.glassMedium,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
  },
  codeInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 15,
    color: colors.text,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  verifyButton: {
    borderRadius: radii.md,
    overflow: 'hidden',
    minWidth: 100,
  },
  verifyButtonGradient: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  verifiedBadge: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.successSoft,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.success,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  verifiedText: {
    fontSize: 13,
    color: colors.success,
    fontWeight: '700',
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  checkboxBox: {
    width: 28,
    height: 28,
    borderWidth: 2,
    borderColor: colors.borderLight,
    borderRadius: radii.sm,
    marginRight: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.glassMedium,
  },
  checkboxBoxChecked: {
    backgroundColor: colors.purple,
    borderColor: colors.purple,
  },
  checkboxCheck: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 22,
  },
  minorNotice: {
    backgroundColor: 'rgba(251, 146, 60, 0.15)',
    padding: 16,
    borderRadius: radii.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
    marginBottom: 20,
  },
  minorNoticeText: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 20,
  },
  button: {
    flex: 1,
  },
  buttonSecondary: {
    flex: 1,
    marginRight: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  loginLink: {
    fontSize: 14,
    color: colors.purple,
    fontWeight: '700',
  },
});
