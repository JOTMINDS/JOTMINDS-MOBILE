import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenBackground from '../../components/ScreenBackground';
import AppIcon from '../../components/AppIcon';
import GlassCard from '../../components/GlassCard';
import GradientButton from '../../components/GradientButton';
import { getAssessmentResults } from '../../utils/api';
import { getConsent, getObservationsForParent } from '../../utils/parentApi';
import { completedDomains, REQUIRED_DOMAINS, domainLabel } from '../../utils/profileCompleteness';
import { AdultResults } from '../../utils/adultScoring';
import { useAuth } from '../../context/AuthContext';
import { colors, radii, shadow, spacing, Palette } from '../../theme';
import { useTheme, useThemedStyles } from '../../context/ThemeContext';

const CORE_THINKING_TYPES = ['kolb', 'sternberg', 'dual-process'];

export default function ParentChildDetailScreen({ route, navigation }: any) {
  const colors = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { user } = useAuth();
  const { child, assessments } = route.params?.child ?? {};

  const [loading, setLoading] = useState(true);
  const [observations, setObservations] = useState<any[]>([]);
  const [parentAdult, setParentAdult] = useState<AdultResults | null>(null);
  const [consentGranted, setConsentGranted] = useState(false);

  const completedTypes: string[] = (assessments ?? []).map((a: any) => a.type);
  const domains = completedDomains(completedTypes);
  const childHasCoreThinking = (assessments ?? []).some((a: any) => CORE_THINKING_TYPES.includes(a.type));

  useEffect(() => {
    if (!user?.id || !child?.id) { setLoading(false); return; }

    Promise.all([
      getObservationsForParent(user.id, child.id).catch(() => ({ observations: [] })),
      getAssessmentResults('adult-thinking').catch(() => null),
      getConsent(child.id, user.id).catch(() => null),
    ]).then(([obsRes, adultRes, consentRes]) => {
      setObservations(obsRes?.observations ?? []);
      setParentAdult((adultRes?.results ?? adultRes?.result) ?? null);
      setConsentGranted(consentRes?.consent?.consentGiven === true);
    }).finally(() => setLoading(false));
  }, [user?.id, child?.id]);

  if (!child) {
    return (
      <ScreenBackground>
        <View style={styles.centered}><Text style={styles.emptyText}>Child not found.</Text></View>
      </ScreenBackground>
    );
  }

  const pairingBlockedReason = !parentAdult
    ? `Complete your own Learning, Thinking, and Decision assessments (then the Thinking Styles bonus) to compare styles with ${child.name}.`
    : !childHasCoreThinking
    ? `${child.name} hasn't completed a Learning, Thinking, or Decision assessment yet.`
    : !consentGranted
    ? `${child.name} hasn't turned on result sharing yet. Ask them to enable it in Profile → Family Sharing.`
    : null;

  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <LinearGradient colors={['#EC4899', '#DB2777']} style={styles.avatar} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Text style={styles.avatarText}>{(child.name || '?')[0].toUpperCase()}</Text>
          </LinearGradient>
          <Text style={styles.name}>{child.name}</Text>
          <Text style={styles.email}>{child.email}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cognitive Profile</Text>
          <GlassCard padding={16}>
            {REQUIRED_DOMAINS.map((d, i) => (
              <View key={d} style={[styles.domainRow, i === REQUIRED_DOMAINS.length - 1 && { marginBottom: 0 }]}>
                <AppIcon name={domains.has(d) ? '✓' : '○'} size={16} color={domains.has(d) ? colors.success : colors.textSubtle} />
                <Text style={[styles.domainText, domains.has(d) && styles.domainTextDone]}>{domainLabel(d)}</Text>
              </View>
            ))}
          </GlassCard>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Behavior Observations</Text>
          </View>
          <GradientButton
            label={`Observe ${child.name}'s Behavior`}
            icon="👁️"
            onPress={() => navigation.navigate('ParentObservation', {
              childId: child.id, childName: child.name, assessments, consentGranted,
            })}
          />

          {loading ? (
            <ActivityIndicator style={{ marginTop: spacing.lg }} color={colors.purple} />
          ) : observations.length > 0 ? (
            observations.map((obs, i) => (
              <GlassCard
                key={obs.id || i}
                padding={16}
                style={styles.spacedCard}
                onPress={() => navigation.navigate('ParentObservationResults', {
                  score: obs.score, childId: child.id, childName: child.name, assessments, consentGranted,
                })}
              >
                <Text style={styles.cardTitle}>Observation — {new Date(obs.createdAt).toLocaleDateString()}</Text>
                <Text style={styles.cardSubtle} numberOfLines={2}>{obs.score?.overallSummary}</Text>
              </GlassCard>
            ))
          ) : (
            <Text style={styles.emptyHint}>No observations yet.</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Coaching Pathways</Text>
          <GlassCard
            padding={16}
            onPress={() => navigation.navigate('CoachingPathways', { childId: child.id, childName: child.name })}
          >
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>Personalized weekly activities</Text>
                <Text style={styles.cardSubtle}>
                  {observations.length > 0
                    ? `Based on your latest observation of ${child.name}`
                    : `Complete an observation first to unlock this`}
                </Text>
              </View>
              <AppIcon name="arrow-forward" size={18} color={colors.purple} />
            </View>
          </GlassCard>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pairing Insights</Text>
          {pairingBlockedReason && !loading ? (
            <GlassCard padding={16} style={styles.lockedCard}>
              <View style={styles.row}>
                <AppIcon name="🔒" size={20} color={colors.textSubtle} />
                <Text style={styles.lockedText}>{pairingBlockedReason}</Text>
              </View>
            </GlassCard>
          ) : (
            <GlassCard
              padding={16}
              onPress={() => navigation.navigate('PairingInsights', {
                child, assessments, parentAdult,
              })}
            >
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>See how your styles compare</Text>
                  <Text style={styles.cardSubtle}>Thinking, learning, and decision-making pairing</Text>
                </View>
                <AppIcon name="arrow-forward" size={18} color={colors.purple} />
              </View>
            </GlassCard>
          )}
        </View>
      </ScrollView>
    </ScreenBackground>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  scroll: { paddingTop: 8, paddingHorizontal: spacing.xl, paddingBottom: 120 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: colors.textMuted, fontSize: 15 },
  header: { alignItems: 'center', marginBottom: spacing.xxl },
  avatar: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  avatarText: { color: '#FFF', fontWeight: '800', fontSize: 24 },
  name: { fontSize: 22, fontWeight: '700', color: colors.textPrimary, letterSpacing: -0.4 },
  email: { fontSize: 14, color: colors.textMuted, marginTop: 2 },
  section: { marginBottom: spacing.xxl },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.md, letterSpacing: -0.4 },
  domainRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: spacing.md },
  domainText: { fontSize: 15, color: colors.textMuted, fontWeight: '600' },
  domainTextDone: { color: colors.text },
  spacedCard: { marginTop: spacing.md },
  cardTitle: { fontSize: 16, fontWeight: '600', color: colors.text },
  cardSubtle: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  emptyHint: { fontSize: 13, color: colors.textSubtle, marginTop: spacing.md, textAlign: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  lockedCard: { opacity: 0.75 },
  lockedText: { flex: 1, fontSize: 13, color: colors.textMuted, lineHeight: 19 },
});
