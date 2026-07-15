import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenBackground from '../../components/ScreenBackground';
import GlassCard from '../../components/GlassCard';
import AppIcon from '../../components/AppIcon';
import { getOrganizationMembers } from '../../utils/api';
import { radii, spacing, Palette } from '../../theme';
import { useTheme, useThemedStyles } from '../../context/ThemeContext';

export default function TeamScreen({ navigation }: any) {
  const colors = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrganizationMembers()
      .then((res) => setMembers(res?.members ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Go back">
          <AppIcon name="arrow-back" size={22} color={colors.textMuted} />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Your Team</Text>
          <Text style={styles.subtitle}>{members.length} team member{members.length === 1 ? '' : 's'}</Text>
        </View>

        {loading ? (
          <ActivityIndicator color={colors.purple} style={{ marginTop: spacing.xl }} />
        ) : members.length === 0 ? (
          <GlassCard padding={32}>
            <View style={styles.empty}>
              <AppIcon name="👥" size={40} color={colors.textSubtle} style={styles.emptyIcon} />
              <Text style={styles.emptyTitle}>No team members yet</Text>
              <Text style={styles.emptyText}>
                Team members with the same organization show up here automatically.
              </Text>
            </View>
          </GlassCard>
        ) : (
          members.map((m, i) => (
            <GlassCard key={m.id ?? i} padding={16} style={styles.spacedCard}>
              <View style={styles.row}>
                <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.avatar} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                  <Text style={styles.avatarText}>{(m.name || '?')[0].toUpperCase()}</Text>
                </LinearGradient>
                <View style={{ flex: 1, marginLeft: spacing.md }}>
                  <Text style={styles.cardTitle}>{m.name}</Text>
                  <Text style={styles.cardSubtle}>{m.email}</Text>
                </View>
                {m.role && (
                  <View style={styles.rolePill}>
                    <Text style={styles.rolePillText}>{m.role}</Text>
                  </View>
                )}
              </View>
            </GlassCard>
          ))
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
  subtitle: { fontSize: 14, color: colors.textMuted, marginTop: 6 },
  spacedCard: { marginBottom: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#FFF', fontWeight: '800', fontSize: 18 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: colors.text },
  cardSubtle: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  rolePill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, backgroundColor: colors.glassMedium },
  rolePillText: { fontSize: 11, fontWeight: '700', color: colors.textMuted, textTransform: 'capitalize' },
  empty: { alignItems: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: spacing.md },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 6 },
  emptyText: { fontSize: 13, color: colors.textMuted, textAlign: 'center', lineHeight: 19 },
});
