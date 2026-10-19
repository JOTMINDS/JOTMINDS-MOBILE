import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import ScreenBackground from '../../components/ScreenBackground';
import GlassCard from '../../components/GlassCard';
import GradientButton from '../../components/GradientButton';
import { radii, spacing, Palette } from '../../theme';
import { useTheme, useThemedStyles } from '../../context/ThemeContext';

const MIN_LENGTH = 8;

/** Shown (and nothing else) after a password-recovery code is verified. */
export default function SetNewPasswordScreen() {
  const colors = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { updatePassword, signOut } = useAuth();
  const toast = useToast();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (password.length < MIN_LENGTH) {
      toast.error(`Use at least ${MIN_LENGTH} characters.`);
      return;
    }
    if (password !== confirm) {
      toast.error('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await updatePassword(password);
      toast.success('Password updated.');
    } catch (e: any) {
      toast.error(e?.message || 'Could not update your password. Try again.');
      setLoading(false);
    }
  };

  return (
    <ScreenBackground>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.header}>
          <Text style={styles.title}>Set a new password</Text>
          <Text style={styles.subtitle}>You're verified. Choose a new password to finish.</Text>
        </View>
        <GlassCard variant="dark" padding={24} glowColor="purple">
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="New password"
            placeholderTextColor={colors.textSubtle}
            secureTextEntry
            autoCapitalize="none"
            textContentType="newPassword"
          />
          <TextInput
            style={styles.input}
            value={confirm}
            onChangeText={setConfirm}
            placeholder="Confirm new password"
            placeholderTextColor={colors.textSubtle}
            secureTextEntry
            autoCapitalize="none"
            textContentType="newPassword"
          />
          <GradientButton label="Update password" onPress={submit} loading={loading} />
          <Text style={styles.cancel} onPress={() => signOut()}>Cancel and sign out</Text>
        </GlassCard>
      </KeyboardAvoidingView>
    </ScreenBackground>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  container: { flex: 1, paddingHorizontal: spacing.xl, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 28 },
  title: { fontSize: 26, fontWeight: '800', color: colors.textPrimary, marginBottom: 8 },
  subtitle: { fontSize: 14, color: colors.textMuted, textAlign: 'center' },
  input: {
    height: 52, borderRadius: radii.md, paddingHorizontal: 16, marginBottom: 14,
    backgroundColor: colors.glassMedium, borderWidth: 1.5, borderColor: colors.borderLight,
    color: colors.text, fontSize: 16,
  },
  cancel: { color: colors.cyan, textAlign: 'center', marginTop: 18, fontWeight: '600' },
});
