import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import ScreenBackground from '../../components/ScreenBackground';
import GlassCard from '../../components/GlassCard';
import AppIcon from '../../components/AppIcon';
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

        <TouchableOpacity
          style={styles.linkBtn}
          onPress={() => Linking.openURL('https://jotminds.com/privacy').catch(() => {})}
          accessibilityRole="button"
        >
          <Text style={styles.linkBtnText}>Read the full Privacy Policy</Text>
          <AppIcon name="arrow-forward" size={16} color={colors.cyan} />
        </TouchableOpacity>

        <Text style={styles.note}>
          To request deletion of your account and data, contact support@jotminds.com.
        </Text>
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
  note: { fontSize: 12, color: colors.textSubtle, lineHeight: 18, marginTop: 12 },
});
