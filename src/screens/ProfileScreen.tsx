import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { useThemedStyles } from '../context/ThemeContext';
import ScreenBackground from '../components/ScreenBackground';
import GlassCard from '../components/GlassCard';
import AppIcon from '../components/AppIcon';
import { colors, radii, shadow, spacing, Palette } from '../theme';

export default function ProfileScreen({ navigation }: any) {
  const { user, signOut } = useAuth();
  const styles = useThemedStyles(makeStyles);

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: async () => { await signOut(); } },
    ]);
  };

  const sections: { title: string; items: { label: string; value: string }[] }[] = [
    {
      title: 'Account Information',
      items: [
        { label: 'Name', value: user?.name || 'Not set' },
        { label: 'Email', value: user?.email || 'Not set' },
        { label: 'Role', value: user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Not set' },
        ...(user?.age ? [{ label: 'Age', value: user.age.toString() }] : []),
        ...(user?.phone ? [{ label: 'Phone', value: user.phone }] : []),
      ],
    },
  ];

  if (user?.role === 'student' || user?.role === 'teacher') {
    sections.push({ title: 'School Information', items: [{ label: 'School', value: user?.school || 'Not set' }] });
  }
  if (user?.role === 'professional') {
    sections.push({
      title: 'Work Information',
      items: [
        { label: 'Organization', value: user?.organizationName || 'Not set' },
        ...(user?.position ? [{ label: 'Position', value: user.position }] : []),
      ],
    });
  }

  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <LinearGradient colors={['#6E4D9C', '#B79BDC']} style={styles.avatar} start={{x:0,y:0}} end={{x:1,y:1}}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase() || '?'}</Text>
          </LinearGradient>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <View style={styles.rolePill}>
            <Text style={styles.rolePillText}>
              {user?.role ? user.role.toUpperCase() : 'MEMBER'}
            </Text>
          </View>
        </View>

        <GlassCard padding={20} style={styles.spacedCard}>
          <Text style={styles.sectionTitle}>Progress</Text>
          <Text style={styles.statValue}>{user?.assessmentsCompleted?.length || 0}</Text>
          <Text style={styles.statLabel}>Assessments Completed</Text>
        </GlassCard>

        {sections.map((section) => (
          <GlassCard padding={20} style={styles.spacedCard} key={section.title}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.items.map((item, i) => (
              <View
                key={i}
                style={[
                  styles.infoRow,
                  i === section.items.length - 1 && { borderBottomWidth: 0 },
                ]}
              >
                <Text style={styles.infoLabel}>{item.label}</Text>
                <Text style={styles.infoValue}>{item.value}</Text>
              </View>
            ))}
          </GlassCard>
        ))}

        <View style={styles.actionsBlock}>
          {[
            { label: 'Cognitive Growth', icon: '🌱', screen: 'Badges' },
            ...(user?.role === 'student' ? [{ label: 'Family Sharing', icon: '🔗', screen: 'FamilySharing' }] : []),
            { label: 'Notifications', icon: '🔥', screen: 'Notifications' },
            { label: 'Accessibility', icon: '👁️', screen: 'Accessibility' },
            { label: 'Edit Profile', icon: '✏️', screen: 'EditProfile' },
            { label: 'Privacy Settings', icon: '🔒', screen: 'PrivacySettings' },
            { label: 'Help & Support', icon: '💬', screen: 'HelpSupport' },
          ].map((a) => (
            <GlassCard
              key={a.label}
              padding={16}
              style={styles.actionCard}
              onPress={a.screen ? () => navigation.navigate(a.screen!) : undefined}
            >
              <View style={styles.actionRow}>
                <AppIcon name={a.icon} size={20} color={colors.purpleSoft} style={styles.actionIcon} />
                <Text style={styles.actionText}>{a.label}</Text>
                <AppIcon name="arrow-forward" size={18} color={colors.purple} />
              </View>
            </GlassCard>
          ))}
        </View>

        <TouchableOpacity style={styles.signOut} onPress={handleSignOut} activeOpacity={0.8}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>JotMinds Mobile v1.0.0</Text>
          <Text style={styles.footerText}>© 2026 JotMinds</Text>
        </View>
      </ScrollView>
    </ScreenBackground>
  );
}

const makeStyles = (c: Palette) => StyleSheet.create({
  scroll: { paddingTop: 8, paddingHorizontal: spacing.xl, paddingBottom: 120 },
  header: { alignItems: 'center', marginBottom: spacing.xxl },
  avatar: {
    width: 88, height: 88, borderRadius: 28, alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.lg, ...shadow.glow,
  },
  avatarText: { fontSize: 38, fontWeight: '800', color: '#FFF' },
  name: { fontSize: 24, fontWeight: '700', color: c.textPrimary, letterSpacing: -0.4 },
  email: { fontSize: 14, color: c.textMuted, marginTop: 4 },
  rolePill: {
    marginTop: spacing.md,
    backgroundColor: c.cyanSoft,
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: radii.pill,
  },
  rolePillText: { color: c.cyan, fontWeight: '700', fontSize: 11, letterSpacing: 1.2 },
  spacedCard: { marginBottom: spacing.lg },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: c.textPrimary, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: spacing.md },
  statValue: { fontSize: 48, fontWeight: '800', color: c.purpleSoft, textAlign: 'center' },
  statLabel: { fontSize: 14, color: c.textMuted, textAlign: 'center', marginTop: 4 },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: c.borderLight,
  },
  infoLabel: { fontSize: 14, color: c.textMuted },
  infoValue: { fontSize: 14, fontWeight: '600', color: c.text },
  actionsBlock: { marginBottom: spacing.lg },
  actionCard: { marginBottom: spacing.sm },
  actionRow: { flexDirection: 'row', alignItems: 'center' },
  actionIcon: { fontSize: 20, marginRight: spacing.md },
  actionText: { flex: 1, fontSize: 16, fontWeight: '600', color: c.text },
  arrow: { fontSize: 20, color: c.purple, fontWeight: '700' },
  signOut: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: radii.lg, paddingVertical: 16, borderWidth: 1.5, borderColor: '#EF4444',
    marginBottom: spacing.lg,
  },
  signOutText: { color: '#EF4444', fontSize: 16, fontWeight: '700', textAlign: 'center' },
  footer: { alignItems: 'center', paddingTop: spacing.sm },
  footerText: { fontSize: 12, color: c.textSubtle, marginBottom: 4 },
});
