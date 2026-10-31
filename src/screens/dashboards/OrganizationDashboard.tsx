import React, { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Share } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import ScreenBackground from '../../components/ScreenBackground';
import GlassCard from '../../components/GlassCard';
import AppIcon from '../../components/AppIcon';
import ProfileButton from '../../components/ProfileButton';
import { accountKind, accountLabel } from '../../utils/accountKind';
import { getReminderPref, setDailyReminder } from '../../utils/notifications';
import { radii, shadow, spacing, Palette } from '../../theme';
import { useTheme, useThemedStyles } from '../../context/ThemeContext';

/**
 * Home for school and organization accounts. They run their school or team from the web app, so
 * this stays short: who is signed in, the code people join with, and where the rest lives. No
 * mood check, assessments or coaching, which are for the people they manage.
 */
export default function OrganizationDashboard({ navigation }: any) {
  const colors = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { user } = useAuth();
  const isSchool = accountKind(user) === 'school';
  const place = user?.organizationName || user?.school || (isSchool ? 'Your school' : 'Your organization');
  const code = user?.organizationCode;

  // The daily mood-check reminder is device-wide, so one left by a personal account must not fire here.
  useEffect(() => {
    getReminderPref()
      .then((p) => (p.enabled ? setDailyReminder({ ...p, enabled: false }) : undefined))
      .catch(() => {});
  }, []);

  const shareCode = () => {
    if (!code) return;
    void Share.share({
      message: `Join ${place} on JotMinds with this code: ${code}`,
    }).catch(() => {});
  };

  const links: { icon: string; title: string; onPress: () => void }[] = [
    { icon: '✏️', title: 'Edit profile', onPress: () => navigation.navigate('EditProfile') },
    { icon: '💬', title: 'Help & Feedback', onPress: () => navigation.navigate('HelpSupport') },
  ];

  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <ProfileButton style={styles.profile} />
          <Text style={styles.greeting}>WELCOME</Text>
          <Text style={styles.name}>{user?.name || place}</Text>
        </View>

        <GlassCard padding={0} style={styles.heroWrap}>
          <LinearGradient
            colors={isSchool ? ['#10B981', '#059669', '#14136E'] : ['#6E4D9C', '#4F46E5', '#14136E']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <Text style={styles.heroLabel}>{accountLabel(user).toUpperCase()}</Text>
            <Text style={styles.heroTitle}>{place}</Text>
            {user?.position ? <Text style={styles.heroSub}>{user.position}</Text> : null}
          </LinearGradient>
        </GlassCard>

        {code ? (
          <GlassCard padding={16} style={styles.card}>
            <Text style={styles.cardTitle}>{isSchool ? 'School code' : 'Organization code'}</Text>
            <Text style={styles.code} selectable>{code}</Text>
            <Text style={styles.cardSubtle}>Teachers and members use this to join.</Text>
            <Text style={styles.link} onPress={shareCode} accessibilityRole="button">Share code</Text>
          </GlassCard>
        ) : null}

        <GlassCard padding={16} style={styles.card}>
          <Text style={styles.cardTitle}>{isSchool ? 'Run your school on the web' : 'Manage your team on the web'}</Text>
          <Text style={styles.cardSubtle}>
            {isSchool
              ? 'Classes, teachers, students and school analytics are on the JotMinds web app.'
              : 'Members, reports and settings are on the JotMinds web app.'}
          </Text>
        </GlassCard>

        {links.map((l) => (
          <GlassCard key={l.title} padding={14} style={styles.row} onPress={l.onPress}>
            <AppIcon name={l.icon} size={20} color={colors.purple} />
            <Text style={styles.rowTitle}>{l.title}</Text>
          </GlassCard>
        ))}
      </ScrollView>
    </ScreenBackground>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  scroll: { paddingTop: 8, paddingHorizontal: spacing.xl, paddingBottom: 120 },
  header: { marginBottom: spacing.xxl, paddingRight: 56 },
  profile: { position: 'absolute', top: 0, right: 0 },
  greeting: { fontSize: 12, color: colors.textSubtle, letterSpacing: 1.4, fontWeight: '700' },
  name: { fontSize: 30, fontWeight: '700', color: colors.textPrimary, marginTop: 4, letterSpacing: -0.6 },
  heroWrap: { marginBottom: spacing.xl, overflow: 'hidden', borderRadius: radii.xl, ...shadow.glow },
  hero: { borderRadius: radii.xl, padding: spacing.xxl },
  heroLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11, letterSpacing: 1.6, fontWeight: '700' },
  heroTitle: { color: '#FFFFFF', fontSize: 24, fontWeight: '800', marginTop: spacing.sm },
  heroSub: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 4 },
  card: { marginBottom: spacing.lg },
  cardTitle: { fontSize: 16, fontWeight: '600', color: colors.text },
  cardSubtle: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  code: { fontSize: 26, fontWeight: '800', color: colors.purple, letterSpacing: 2, marginTop: spacing.sm },
  link: { fontSize: 14, fontWeight: '700', color: colors.cyan, marginTop: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md },
  rowTitle: { fontSize: 15, fontWeight: '600', color: colors.text },
});
