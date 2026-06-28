import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { getOrganizationMembers, getAllAssessmentResults } from '../../utils/api';
import ScreenBackground from '../../components/ScreenBackground';
import GlassCard from '../../components/GlassCard';
import AppIcon from '../../components/AppIcon';
import { colors, radii, shadow, spacing, Palette } from '../../theme';
import { useTheme, useThemedStyles } from '../../context/ThemeContext';

export default function ProfessionalDashboard({ navigation }: any) {
  const colors = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { user } = useAuth();
  const [members, setMembers] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [m, a] = await Promise.all([getOrganizationMembers(), getAllAssessmentResults()]);
      setMembers(m.members || []);
      setAssessments(a.results || []);
    } catch (e) {
      console.error('[ProfessionalDashboard]', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <ScreenBackground>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.purple} />
        </View>
      </ScreenBackground>
    );
  }

  const actions: { icon: string; title: string; desc: string; g: [string, string]; onPress?: () => void }[] = [
    { icon: '🎯', title: 'Take Assessment', desc: 'Discover your cognitive profile', g: ['#F59E0B', '#D97706'], onPress: () => navigation.navigate('AssessmentList') },
    { icon: '👥', title: 'View Team', desc: 'See organization members', g: ['#3B82F6', '#2563EB'] },
    { icon: '📊', title: 'Team Analytics', desc: 'View team performance insights', g: ['#6E4D9C', '#5A3E82'] },
  ];

  return (
    <ScreenBackground>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor={colors.purple} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>WELCOME</Text>
          <Text style={styles.name}>{user?.name || 'Professional'}</Text>
          {user?.organizationName ? <Text style={styles.tagline}>{user.organizationName}</Text> : null}
          {user?.position ? <Text style={styles.position}>{user.position}</Text> : null}
        </View>

        <LinearGradient
          colors={['#F59E0B', '#D97706', '#14136E']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.snapshotCard}
        >
          <Text style={styles.snapshotLabel}>WORK SNAPSHOT</Text>
          <View style={styles.snapshotStatsRow}>
            <View style={styles.snapshotStat}>
              <Text style={styles.snapshotStatValue}>{assessments.length}</Text>
              <Text style={styles.snapshotStatLabel}>Assessments</Text>
            </View>
            <View style={styles.snapshotDivider} />
            <View style={styles.snapshotStat}>
              <Text style={styles.snapshotStatValue}>{members.length}</Text>
              <Text style={styles.snapshotStatLabel}>Team</Text>
            </View>
            <View style={styles.snapshotDivider} />
            <View style={styles.snapshotStat}>
              <Text style={styles.snapshotStatValue}>{Math.min(100, assessments.length * 33)}%</Text>
              <Text style={styles.snapshotStatLabel}>Profile</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          {actions.map((a) => (
            <GlassCard key={a.title} padding={16} style={styles.spacedCard} onPress={a.onPress}>
              <View style={styles.row}>
                <LinearGradient colors={a.g} style={styles.iconWrap} start={{x:0,y:0}} end={{x:1,y:1}}>
                  <AppIcon name={a.icon} size={22} color="#FFFFFF" />
                </LinearGradient>
                <View style={{ flex: 1, marginLeft: spacing.md }}>
                  <Text style={styles.cardTitle}>{a.title}</Text>
                  <Text style={styles.cardSubtle}>{a.desc}</Text>
                </View>
                <Text style={styles.arrow}>→</Text>
              </View>
            </GlassCard>
          ))}
        </View>

        {assessments.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Results</Text>
            {assessments.slice(0, 3).map((result, i) => (
              <GlassCard
                key={i}
                padding={16}
                style={styles.spacedCard}
                onPress={() =>
                  navigation.navigate('AssessmentResults', { assessmentType: result.assessmentType })
                }
              >
                <View style={styles.row}>
                  <View style={styles.dot} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>
                      {result.assessmentType.charAt(0).toUpperCase() + result.assessmentType.slice(1)} Assessment
                    </Text>
                    <Text style={styles.cardSubtle}>{new Date(result.completedAt ?? result.createdAt ?? Date.now()).toLocaleDateString()}</Text>
                  </View>
                  <Text style={styles.viewResults}>View →</Text>
                </View>
              </GlassCard>
            ))}
          </View>
        )}
      </ScrollView>
    </ScreenBackground>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  scroll: { paddingTop: 8, paddingHorizontal: spacing.xl, paddingBottom: 120 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { marginBottom: spacing.xxl },
  greeting: { fontSize: 12, color: colors.textSubtle, letterSpacing: 1.4, fontWeight: '700' },
  name: { fontSize: 30, fontWeight: '700', color: colors.textPrimary, marginTop: 4, letterSpacing: -0.6 },
  tagline: { fontSize: 15, color: colors.textMuted, marginTop: 6 },
  position: { fontSize: 13, color: colors.purple, marginTop: 4, fontWeight: '600' },
  snapshotCard: { borderRadius: radii.xl, padding: spacing.xxl, marginBottom: spacing.xxl, ...shadow.glow },
  snapshotLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11, letterSpacing: 1.6, fontWeight: '700', marginBottom: spacing.lg },
  snapshotStatsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  snapshotStat: { flex: 1, alignItems: 'center' },
  snapshotStatValue: { color: '#FFF', fontSize: 26, fontWeight: '800' },
  snapshotStatLabel: { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 2 },
  snapshotDivider: { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.25)' },
  section: { marginBottom: spacing.xxl },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.lg, letterSpacing: -0.4 },
  spacedCard: { marginBottom: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '600', color: colors.text },
  cardSubtle: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  iconWrap: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 22 },
  arrow: { fontSize: 22, color: colors.purple, fontWeight: '700' },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.cyan, marginRight: spacing.md },
  viewResults: { color: colors.purple, fontSize: 14, fontWeight: '600' },
});
