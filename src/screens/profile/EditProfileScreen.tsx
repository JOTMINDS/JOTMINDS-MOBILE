import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity,
  ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { updateUserProfile } from '../../utils/api';
import ScreenBackground from '../../components/ScreenBackground';
import AppIcon from '../../components/AppIcon';
import { radii, spacing, Palette } from '../../theme';
import { useTheme, useThemedStyles } from '../../context/ThemeContext';

interface Field {
  key: string;
  label: string;
  placeholder: string;
  keyboardType?: 'default' | 'phone-pad';
  autoCapitalize?: 'none' | 'words' | 'sentences';
}

export default function EditProfileScreen({ navigation }: any) {
  const colors = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { user, refreshUser } = useAuth();
  const toast = useToast();

  // Build the editable field set from the user's role.
  const fields: Field[] = [
    { key: 'name', label: 'Full Name', placeholder: 'Your name', autoCapitalize: 'words' },
    { key: 'phone', label: 'Phone', placeholder: 'Your phone number', keyboardType: 'phone-pad' },
  ];
  if (user?.role === 'student' || user?.role === 'teacher') {
    fields.push({ key: 'school', label: 'School', placeholder: 'Your school', autoCapitalize: 'words' });
  }
  if (user?.role === 'professional') {
    fields.push({ key: 'organizationName', label: 'Organization', placeholder: 'Your organization', autoCapitalize: 'words' });
    fields.push({ key: 'position', label: 'Position', placeholder: 'Your role / title', autoCapitalize: 'words' });
  }

  const initial = fields.reduce((acc, f) => {
    acc[f.key] = (user as any)?.[f.key]?.toString() ?? '';
    return acc;
  }, {} as Record<string, string>);

  const [values, setValues] = useState<Record<string, string>>(initial);
  const [saving, setSaving] = useState(false);

  const dirty = fields.some((f) => (values[f.key] ?? '') !== (initial[f.key] ?? ''));

  const handleSave = async () => {
    if (!values.name?.trim()) { toast.error('Name cannot be empty.'); return; }
    setSaving(true);
    // Only send fields that actually changed.
    const updates: Record<string, string> = {};
    fields.forEach((f) => {
      const v = (values[f.key] ?? '').trim();
      if (v !== (initial[f.key] ?? '')) updates[f.key] = v;
    });
    try {
      await updateUserProfile(updates);
      await refreshUser();
      toast.success('Profile updated.');
      navigation.goBack();
    } catch {
      toast.error('Could not save changes. Please try again.');
      setSaving(false);
    }
  };

  return (
    <ScreenBackground>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <TouchableOpacity
            style={styles.back}
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <AppIcon name="arrow-back" size={22} color={colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Edit Profile</Text>
            <Text style={styles.subtitle}>Update your account information</Text>
          </View>

          {/* Email is your sign-in identity and can't be changed here. */}
          <Text style={styles.fieldLabel}>EMAIL</Text>
          <View style={[styles.input, styles.inputDisabled]}>
            <Text style={styles.inputDisabledText}>{user?.email || 'Not set'}</Text>
            <AppIcon name="🔒" size={16} color={colors.textSubtle} />
          </View>

          {fields.map((f) => (
            <View key={f.key}>
              <Text style={styles.fieldLabel}>{f.label.toUpperCase()}</Text>
              <TextInput
                style={styles.input}
                value={values[f.key]}
                onChangeText={(t) => setValues((p) => ({ ...p, [f.key]: t }))}
                placeholder={f.placeholder}
                placeholderTextColor={colors.textSubtle}
                keyboardType={f.keyboardType ?? 'default'}
                autoCapitalize={f.autoCapitalize ?? 'sentences'}
                returnKeyType="done"
              />
            </View>
          ))}

          <TouchableOpacity
            style={[styles.saveBtn, (!dirty || saving) && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={!dirty || saving}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Save changes"
          >
            {saving
              ? <ActivityIndicator color="#FFFFFF" />
              : <Text style={styles.saveBtnText}>Save Changes</Text>}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenBackground>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  scroll: { paddingTop: 8, paddingHorizontal: spacing.xl, paddingBottom: 80 },
  back: { width: 44, height: 44, justifyContent: 'center', marginBottom: 4 },
  header: { marginBottom: 24 },
  title: { fontSize: 30, fontWeight: '800', color: colors.textPrimary, letterSpacing: -1 },
  subtitle: { fontSize: 15, color: colors.textMuted, marginTop: 4 },
  fieldLabel: {
    fontSize: 12, fontWeight: '700', color: colors.textSubtle,
    letterSpacing: 1.2, marginBottom: 8, marginTop: 16,
  },
  input: {
    backgroundColor: colors.glassMedium,
    borderWidth: 1, borderColor: colors.borderLight, borderRadius: radii.md,
    paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 16, color: colors.text,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  inputDisabled: { opacity: 0.6 },
  inputDisabledText: { fontSize: 16, color: colors.textMuted },
  saveBtn: {
    backgroundColor: colors.purple, borderRadius: radii.md,
    paddingVertical: 16, alignItems: 'center', marginTop: 32,
  },
  saveBtnDisabled: { opacity: 0.45 },
  saveBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
