import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { sendSignupOtp, verifySignupOtp } from '../../utils/supabase';
import ScreenBackground from '../../components/ScreenBackground';
import GlassCard from '../../components/GlassCard';
import AppIcon from '../../components/AppIcon';
import type { ScreenProps } from '../../navigation/types';
import { colors, radii, spacing } from '../../theme';

const CODE_LENGTH = 6;
const RESEND_SECONDS = 30;

export default function OtpVerificationScreen({ route, navigation }: ScreenProps<'OtpVerification'>) {
  // mode: 'signup' (custom Resend OTP) | 'login' (Supabase native OTP)
  const { mode, email, signupData } = route.params;
  const { signIn, signUp, verifyLoginOtp, requestLoginOtp } = useAuth();
  const toast = useToast();

  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const inputs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft]);

  const code = digits.join('');

  const handleChange = (text: string, index: number) => {
    setError('');
    // allow pasting the full code into the first box
    if (text.length > 1) {
      const chars = text.replace(/\D/g, '').slice(0, CODE_LENGTH).split('');
      const next = Array(CODE_LENGTH).fill('');
      chars.forEach((ch, i) => (next[i] = ch));
      setDigits(next);
      inputs.current[Math.min(chars.length, CODE_LENGTH - 1)]?.focus();
      return;
    }
    const next = [...digits];
    next[index] = text.replace(/\D/g, '');
    setDigits(next);
    if (text && index < CODE_LENGTH - 1) inputs.current[index + 1]?.focus();
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    if (code.length !== CODE_LENGTH) {
      setError('Enter the 6-digit code');
      return;
    }
    setLoading(true);
    setError('');
    try {
      if (mode === 'signup') {
        const ok = await verifySignupOtp(email, code);
        if (!ok) {
          setError('Incorrect or expired code');
          setLoading(false);
          return;
        }
        // Verified → now create the account, then sign in.
        await signUp(signupData);
        await signIn(signupData.email, signupData.password);
        // AuthProvider's listener swaps the navigator to the main app.
      } else {
        // Supabase native OTP → establishes a session on success.
        await verifyLoginOtp(email, code);
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed');
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (secondsLeft > 0) return;
    try {
      if (mode === 'signup') {
        await sendSignupOtp(email);
      } else {
        await requestLoginOtp(email);
      }
      setSecondsLeft(RESEND_SECONDS);
      toast.success(`A new code was sent to ${email}`);
    } catch (err: any) {
      toast.error(err.message || 'Could not resend code');
    }
  };

  return (
    <ScreenBackground>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableOpacity
          style={styles.back}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <AppIcon name="arrow-back" size={22} color={colors.textMuted} />
        </TouchableOpacity>

        <View style={styles.header}>
          <LinearGradient
            colors={['#3D52C9', '#6E4D9C']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconWrap}
          >
            <AppIcon name="✉️" size={32} color="#FFFFFF" />
          </LinearGradient>
          <Text style={styles.title}>Verify your email</Text>
          <Text style={styles.subtitle}>
            We sent a 6-digit code to{'\n'}
            <Text style={styles.email}>{email}</Text>
          </Text>
        </View>

        <GlassCard variant="dark" padding={24} glowColor="purple" style={styles.card}>
          <View style={styles.codeRow}>
            {digits.map((d, i) => (
              <TextInput
                key={i}
                ref={(r) => (inputs.current[i] = r)}
                style={[styles.codeBox, d ? styles.codeBoxFilled : null, error ? styles.codeBoxError : null]}
                value={d}
                onChangeText={(t) => handleChange(t, i)}
                onKeyPress={(e) => handleKeyPress(e, i)}
                keyboardType="number-pad"
                maxLength={i === 0 ? CODE_LENGTH : 1}
                autoFocus={i === 0}
                selectTextOnFocus
              />
            ))}
          </View>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.verifyBtn, code.length !== CODE_LENGTH && styles.verifyBtnDisabled]}
            onPress={handleVerify}
            disabled={loading || code.length !== CODE_LENGTH}
          >
            <LinearGradient
              colors={['#3D52C9', '#6E4D9C']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.verifyBtnGradient}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.verifyBtnText}>Verify & Continue</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.resendRow}>
            <Text style={styles.resendText}>Didn't get it? </Text>
            <TouchableOpacity onPress={handleResend} disabled={secondsLeft > 0}>
              <Text style={[styles.resendLink, secondsLeft > 0 && styles.resendLinkDisabled]}>
                {secondsLeft > 0 ? `Resend in ${secondsLeft}s` : 'Resend code'}
              </Text>
            </TouchableOpacity>
          </View>
        </GlassCard>
      </KeyboardAvoidingView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: spacing.xl, paddingTop: 60 },
  back: { width: 44, height: 44, justifyContent: 'center' },
  header: { alignItems: 'center', marginTop: 12, marginBottom: 32 },
  iconWrap: {
    width: 72, height: 72, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center', marginBottom: 20,
  },
  title: { fontSize: 26, fontWeight: '800', color: colors.textPrimary, letterSpacing: -0.8, marginBottom: 10 },
  subtitle: { fontSize: 14, color: colors.textMuted, textAlign: 'center', lineHeight: 21 },
  email: { color: colors.cyan, fontWeight: '700' },
  card: {},
  codeRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, marginBottom: 8 },
  codeBox: {
    flex: 1, height: 58, borderRadius: radii.md,
    backgroundColor: colors.glassMedium, borderWidth: 1.5, borderColor: colors.borderLight,
    textAlign: 'center', fontSize: 24, fontWeight: '800', color: colors.text,
  },
  codeBoxFilled: { borderColor: colors.purple, backgroundColor: colors.glassDark },
  codeBoxError: { borderColor: colors.error },
  errorText: { fontSize: 12, color: colors.error, fontWeight: '600', marginTop: 8, textAlign: 'center' },
  verifyBtn: { borderRadius: radii.md, overflow: 'hidden', marginTop: 24 },
  verifyBtnDisabled: { opacity: 0.5 },
  verifyBtnGradient: { paddingVertical: 17, alignItems: 'center' },
  verifyBtnText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  resendRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 22 },
  resendText: { fontSize: 14, color: colors.textMuted },
  resendLink: { fontSize: 14, color: colors.cyan, fontWeight: '700' },
  resendLinkDisabled: { color: colors.textSubtle },
});
