import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import GlassCard from './GlassCard';
import { useAppNavigation } from '../navigation/types';
import { spacing, Palette } from '../theme';
import { useTheme, useThemedStyles } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useFeatureFlag } from '../utils/featureFlags';
import { jottiActionsFor, JOTTI_BLURB } from '../utils/jottiActions';

/**
 * "Ask Jotti" entry-point card. Dropped into each role dashboard so the AI
 * coach is reachable from anywhere, mirroring the webapp's floating button.
 * Says what Jotti can do for the user's role, and (for teachers) offers a few
 * one-tap asks beyond lesson planning.
 */
export default function AskJottiCard({ style }: { style?: any }) {
  const navigation = useAppNavigation();
  const styles = useThemedStyles(makeStyles);
  const { user } = useAuth();
  const enabled = useFeatureFlag('ai-coach', user?.id);
  if (!enabled) return null;

  const role = user?.role ?? 'student';
  const chips = role === 'teacher' ? jottiActionsFor(role).filter((a) => ['class', 'parent', 'quiz'].includes(a.id)) : [];
  const ask = (a: { prompt: string; mode: 'send' | 'prefill' }) =>
    navigation.navigate('AskJotti', { prompt: a.prompt, autoSend: a.mode === 'send' });

  return (
    <GlassCard padding={16} style={style} onPress={() => navigation.navigate('AskJotti')}>
      <View style={styles.row}>
        <LinearGradient
          colors={['#7B61FF', '#3D52C9']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.icon}
        >
          <Text style={styles.iconText}>✦</Text>
        </LinearGradient>
        <View style={{ flex: 1, marginLeft: spacing.md }}>
          <Text style={styles.title}>Ask Jotti</Text>
          <Text style={styles.sub}>{JOTTI_BLURB[role] ?? JOTTI_BLURB.student}</Text>
        </View>
        <Text style={styles.arrow}>→</Text>
      </View>
      {chips.length > 0 && (
        <View style={styles.chips}>
          {chips.map((a) => (
            <TouchableOpacity key={a.id} style={styles.chip} onPress={() => ask(a)} accessibilityRole="button" accessibilityLabel={a.label}>
              <Text style={styles.chipText}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </GlassCard>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  icon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  iconText: { color: '#fff', fontSize: 20, fontWeight: '800' },
  title: { fontSize: 16, fontWeight: '800', color: colors.textPrimary },
  sub: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  arrow: { fontSize: 18, color: colors.textMuted, fontWeight: '700' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: spacing.md },
  chip: { paddingVertical: 7, paddingHorizontal: 12, borderRadius: 999, backgroundColor: colors.glassMedium, borderWidth: 1, borderColor: colors.borderLight },
  chipText: { fontSize: 12, fontWeight: '700', color: colors.cyan },
});
