import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenBackground from '../../components/ScreenBackground';
import AppIcon from '../../components/AppIcon';
import GlassCard from '../../components/GlassCard';
import { SkeletonCard, Skeleton } from '../../components/Skeleton';
import { getGamificationProfile } from '../../utils/gamificationApi';
import { GamificationProfile, ALL_BADGES, BadgeRarity, getXPProgress } from '../../utils/gamification';
import { useAuth } from '../../context/AuthContext';
import { colors, radii, shadow, spacing, Palette } from '../../theme';
import { useTheme, useThemedStyles } from '../../context/ThemeContext';

const RARITY_COLOR: Record<BadgeRarity, string> = {
  common: '#8A97B2', rare: '#3D52C9', epic: '#8b5cf6', legendary: '#F59E0B',
};

export default function BadgesScreen() {
  const colors = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { user } = useAuth();
  const [profile, setProfile] = useState<GamificationProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    getGamificationProfile(user.id).then(setProfile).finally(() => setLoading(false));
  }, [user?.id]);

  if (loading) {
    return (
      <ScreenBackground>
        <View style={{ paddingTop: 8, paddingHorizontal: spacing.xl }}>
          <Skeleton height={120} radius={20} style={{ marginBottom: 20 }} />
          <SkeletonCard lines={4} />
        </View>
      </ScreenBackground>
    );
  }

  const earnedIds = new Set((profile?.badges ?? []).map((b) => b.id));
  const { level, percentage } = getXPProgress(profile?.xp ?? 0);

  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={['#14136E', '#2C2E83']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.levelCard}>
          <Text style={styles.levelIcon}>{level.icon}</Text>
          <Text style={styles.levelTitle}>{level.title}</Text>
          <Text style={styles.levelSubtitle}>{level.subtitle}</Text>
          <View style={styles.levelBarTrack}>
            <View style={[styles.levelBarFill, { width: `${percentage}%` }]} />
          </View>
          <Text style={styles.levelXP}>{profile?.xp ?? 0} XP · Level {level.level} of 10</Text>
        </LinearGradient>

        <Text style={styles.sectionTitle}>Badges ({earnedIds.size}/{ALL_BADGES.length})</Text>
        <View style={styles.grid}>
          {ALL_BADGES.map((badge) => {
            const earned = earnedIds.has(badge.id);
            const color = RARITY_COLOR[badge.rarity];
            return (
              <GlassCard key={badge.id} padding={16} style={earned ? styles.badgeCard : [styles.badgeCard, styles.badgeCardLocked]}>
                <View style={[styles.badgeIconWrap, { backgroundColor: earned ? `${color}22` : colors.bgTertiary }]}>
                  <AppIcon name={earned ? badge.icon : '🔒'} size={26} color={earned ? color : colors.textSubtle} />
                </View>
                <Text style={[styles.badgeName, !earned && styles.badgeNameLocked]} numberOfLines={1}>{badge.name}</Text>
                <Text style={styles.badgeDesc} numberOfLines={2}>{badge.description}</Text>
                {earned && (
                  <Text style={[styles.badgeRarity, { color }]}>{badge.rarity.toUpperCase()}</Text>
                )}
              </GlassCard>
            );
          })}
        </View>
      </ScrollView>
    </ScreenBackground>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  scroll: { paddingTop: 8, paddingHorizontal: spacing.xl, paddingBottom: 120 },
  levelCard: { borderRadius: radii.xl, padding: 24, alignItems: 'center', marginBottom: spacing.xxl, ...shadow.glow },
  levelIcon: { fontSize: 40, marginBottom: 8 },
  levelTitle: { fontSize: 22, fontWeight: '800', color: '#FFF', letterSpacing: -0.4 },
  levelSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 2, marginBottom: 16 },
  levelBarTrack: { width: '100%', height: 8, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 4, overflow: 'hidden', marginBottom: 10 },
  levelBarFill: { height: '100%', borderRadius: 4, backgroundColor: '#FFF' },
  levelXP: { fontSize: 12, color: 'rgba(255,255,255,0.75)', fontWeight: '600' },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.md, letterSpacing: -0.4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  badgeCard: { width: '48%', marginBottom: spacing.md, alignItems: 'center' },
  badgeCardLocked: { opacity: 0.55 },
  badgeIconWrap: { width: 52, height: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  badgeName: { fontSize: 13, fontWeight: '700', color: colors.text, textAlign: 'center' },
  badgeNameLocked: { color: colors.textMuted },
  badgeDesc: { fontSize: 11, color: colors.textMuted, textAlign: 'center', marginTop: 4, lineHeight: 15 },
  badgeRarity: { fontSize: 9, fontWeight: '800', letterSpacing: 0.8, marginTop: 6 },
});
