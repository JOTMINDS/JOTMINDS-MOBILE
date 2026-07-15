import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenBackground from '../../components/ScreenBackground';
import GlassCard from '../../components/GlassCard';
import GradientButton from '../../components/GradientButton';
import AppIcon from '../../components/AppIcon';
import { getObservationsForParent } from '../../utils/parentApi';
import { getRecommendedPathways, CoachingPathway } from '../../utils/coachingPathways';
import { getPathwayProgress } from '../../utils/coachingProgress';
import { useAuth } from '../../context/AuthContext';
import { radii, spacing, shadow, Palette } from '../../theme';
import { useTheme, useThemedStyles } from '../../context/ThemeContext';

const GRADIENTS: Record<string, [string, string]> = {
  A: ['#3D52C9', '#2E3FA8'],
  B: ['#6E4D9C', '#5A3E82'],
  C: ['#EC4899', '#DB2777'],
  D: ['#F59E0B', '#D97706'],
};

export default function CoachingPathwaysScreen({ route, navigation }: any) {
  const colors = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { user } = useAuth();
  const { childId, childName } = route.params ?? {};

  const [loading, setLoading] = useState(true);
  const [pathways, setPathways] = useState<CoachingPathway[] | null>(null);
  const [progress, setProgress] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!user?.id || !childId) { setLoading(false); return; }
    getObservationsForParent(user.id, childId)
      .then(async (res) => {
        const latest = (res?.observations ?? [])[0];
        if (!latest?.score) { setPathways(null); return; }
        const recommended = getRecommendedPathways(latest.score);
        setPathways(recommended);
        const entries = await Promise.all(
          recommended.map(async (p) => [p.id, (await getPathwayProgress(childId, p.id)).length] as const),
        );
        setProgress(Object.fromEntries(entries));
      })
      .catch(() => setPathways(null))
      .finally(() => setLoading(false));
  }, [user?.id, childId]);

  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Go back">
          <AppIcon name="arrow-back" size={22} color={colors.textMuted} />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Coaching Pathways</Text>
          <Text style={styles.subtitle}>
            Personalized for {childName || 'your child'}, based on your most recent observation
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator color={colors.purple} style={{ marginTop: spacing.xl }} />
        ) : !pathways ? (
          <GlassCard padding={32}>
            <View style={styles.empty}>
              <AppIcon name="👁️" size={40} color={colors.textSubtle} style={styles.emptyIcon} />
              <Text style={styles.emptyTitle}>Observe {childName || 'your child'} first</Text>
              <Text style={styles.emptyText}>
                Pathways are personalized from your observation of {childName || 'your child'}'s behavior —
                complete one to unlock them.
              </Text>
              <GradientButton
                label="Start an Observation"
                icon="👁️"
                onPress={() => navigation.navigate('ParentObservation', { childId, childName })}
                style={{ marginTop: spacing.lg, alignSelf: 'stretch' }}
              />
            </View>
          </GlassCard>
        ) : (
          pathways.map((pathway) => {
            const gradient = GRADIENTS[pathway.section];
            const done = progress[pathway.id] ?? 0;
            return (
              <TouchableOpacity
                key={pathway.id}
                activeOpacity={0.85}
                onPress={() => navigation.navigate('PathwayDetail', { pathway, childId, childName })}
              >
                <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={styles.iconWrap}><AppIcon name={pathway.icon} size={22} color="#FFFFFF" /></View>
                    <View style={styles.weekPill}>
                      <Text style={styles.weekPillText}>{done}/4 weeks</Text>
                    </View>
                  </View>
                  <Text style={styles.cardTitle}>{pathway.title}</Text>
                  <Text style={styles.cardDesc}>Based on: {pathway.focusLabel}</Text>
                </LinearGradient>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </ScreenBackground>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  scroll: { paddingTop: 8, paddingHorizontal: spacing.xl, paddingBottom: 120 },
  back: { width: 44, height: 44, justifyContent: 'center', marginBottom: 4 },
  header: { marginBottom: spacing.xl },
  title: { fontSize: 28, fontWeight: '800', color: colors.textPrimary, letterSpacing: -0.6 },
  subtitle: { fontSize: 14, color: colors.textMuted, marginTop: 6, lineHeight: 20 },
  empty: { alignItems: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: spacing.md },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 6 },
  emptyText: { fontSize: 13, color: colors.textMuted, textAlign: 'center', lineHeight: 19 },
  card: { borderRadius: radii.lg, padding: spacing.lg, marginBottom: spacing.md, ...shadow.glow },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  iconWrap: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  weekPill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.2)' },
  weekPillText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  cardTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  cardDesc: { color: 'rgba(255,255,255,0.85)', fontSize: 13, marginTop: 4, fontWeight: '600' },
});
