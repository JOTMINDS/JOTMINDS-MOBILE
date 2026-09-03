import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking, Alert, ActivityIndicator, Switch } from 'react-native';
import ScreenBackground from '../../components/ScreenBackground';
import GlassCard from '../../components/GlassCard';
import AppIcon from '../../components/AppIcon';
import { deleteAccount } from '../../utils/api';
import {
  getBiometricSupport, isBiometricLoginEnabled, disableBiometricLogin, biometricLabel,
} from '../../utils/biometricAuth';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { radii, spacing, Palette } from '../../theme';
import { useTheme, useThemedStyles } from '../../context/ThemeContext';

const POINTS = [
  { icon: '🔒', title: 'Your data is private', desc: 'Your assessment results and check-ins are tied to your account and are never shared without your consent.' },
  { icon: '👤', title: 'You control your account', desc: 'Edit your profile any time, and sign out from any device. Email is used only to sign in and send important notices.' },
  { icon: '📊', title: 'How we use your results', desc: 'Cognitive results power your personal insights and role-fit matches. They are not sold to third parties.' },
];

export default function PrivacySettingsScreen({ navigation }: any) {
  const colors = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { signOut } = useAuth();
  const toast = useToast();
  const [deleting, setDeleting] = useState(false);

  const [bioSupported, setBioSupported] = useState(false);
  const [bioEnabled, setBioEnabled] = useState(false);
  const [bioLabel, setBioLabel] = useState('Face ID');
  useEffect(() => {
    (async () => {
      const s = await getBiometricSupport();
      setBioSupported(s.available);
      setBioLabel(biometricLabel(s.kind));
      setBioEnabled(await isBiometricLoginEnabled());
    })();
  }, []);

  const toggleBiometric = async (next: boolean) => {
    if (next) {
      // Enabling happens on the login screen (needs the password). Point there.
      toast.info(`Turn on "${bioLabel}" the next time you sign in with your password.`);
      return;
    }
    await disableBiometricLogin();
    setBioEnabled(false);
    toast.success(`${bioLabel} sign-in turned off`);
  };

  const runDelete = async () => {
    setDeleting(true);
    try {
      const res = await deleteAccount();
      if (res?.error) throw new Error(res.error);
      toast.success('Your account has been deleted.');
      await signOut();
    } catch (e: any) {
      setDeleting(false);
      Alert.alert('Could not delete account', e?.message || 'Please try again, or contact support@jotminds.com.');
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      'Delete account?',
      'This permanently removes your profile, assessment results, check-ins and all other data. It cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () =>
            Alert.alert('Are you sure?', 'This is your last chance to keep your data.', [
              { text: 'Keep my account', style: 'cancel' },
              { text: 'Delete permanently', style: 'destructive', onPress: runDelete },
            ]),
        },
      ],
    );
  };

  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Go back">
          <AppIcon name="arrow-back" size={22} color={colors.textMuted} />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Privacy Settings</Text>
          <Text style={styles.subtitle}>How JotMinds handles your information</Text>
        </View>

        {POINTS.map((p) => (
          <GlassCard key={p.title} style={styles.card}>
            <View style={styles.row}>
              <View style={styles.iconWrap}>
                <AppIcon name={p.icon} size={20} color={colors.purpleSoft} />
              </View>
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>{p.title}</Text>
                <Text style={styles.rowDesc}>{p.desc}</Text>
              </View>
            </View>
          </GlassCard>
        ))}

        {bioSupported && (
          <GlassCard style={styles.card}>
            <View style={styles.row}>
              <View style={styles.iconWrap}>
                <AppIcon name="🔐" size={20} color={colors.purpleSoft} />
              </View>
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>Unlock with {bioLabel}</Text>
                <Text style={styles.rowDesc}>Sign in with {bioLabel} instead of your password.</Text>
              </View>
              <Switch
                value={bioEnabled}
                onValueChange={toggleBiometric}
                trackColor={{ false: colors.bgTertiary, true: colors.purple }}
                thumbColor="#FFFFFF"
              />
            </View>
          </GlassCard>
        )}

        <TouchableOpacity
          style={styles.linkBtn}
          onPress={() => Linking.openURL('https://jotminds.com/privacy').catch(() => {})}
          accessibilityRole="button"
        >
          <Text style={styles.linkBtnText}>Read the full Privacy Policy</Text>
          <AppIcon name="arrow-forward" size={16} color={colors.cyan} />
        </TouchableOpacity>

        <View style={styles.dangerZone}>
          <Text style={styles.dangerTitle}>Delete account</Text>
          <Text style={styles.dangerDesc}>
            Permanently delete your account and all associated data. This cannot be undone.
          </Text>
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={confirmDelete}
            disabled={deleting}
            accessibilityRole="button"
            accessibilityLabel="Delete my account"
          >
            {deleting
              ? <ActivityIndicator color="#EF4444" />
              : <Text style={styles.deleteBtnText}>Delete my account</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenBackground>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  scroll: { paddingTop: 8, paddingHorizontal: spacing.xl, paddingBottom: 80 },
  back: { width: 44, height: 44, justifyContent: 'center', marginBottom: 4 },
  header: { marginBottom: 24 },
  title: { fontSize: 30, fontWeight: '800', color: colors.textPrimary, letterSpacing: -1 },
  subtitle: { fontSize: 15, color: colors.textMuted, marginTop: 4 },
  card: { marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  iconWrap: { width: 44, height: 44, borderRadius: 13, backgroundColor: `${colors.purple}22`, justifyContent: 'center', alignItems: 'center' },
  rowText: { flex: 1 },
  rowTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 4 },
  rowDesc: { fontSize: 13, color: colors.textMuted, lineHeight: 19 },
  linkBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start',
    marginTop: 12, paddingVertical: 12,
  },
  linkBtnText: { fontSize: 14, fontWeight: '700', color: colors.cyan },
  dangerZone: {
    marginTop: 28, padding: 16, borderRadius: radii.md,
    borderWidth: 1, borderColor: 'rgba(239,68,68,0.35)', backgroundColor: 'rgba(239,68,68,0.06)',
  },
  dangerTitle: { fontSize: 15, fontWeight: '800', color: '#EF4444', marginBottom: 4 },
  dangerDesc: { fontSize: 12, color: colors.textMuted, lineHeight: 18, marginBottom: 14 },
  deleteBtn: {
    paddingVertical: 13, borderRadius: radii.md, alignItems: 'center',
    borderWidth: 1.5, borderColor: '#EF4444',
  },
  deleteBtnText: { fontSize: 15, fontWeight: '700', color: '#EF4444' },
});
