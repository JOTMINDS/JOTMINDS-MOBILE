import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import GlassCard from './GlassCard';
import { useAppNavigation } from '../navigation/types';
import { spacing, Palette } from '../theme';
import { useTheme, useThemedStyles } from '../context/ThemeContext';

/**
 * "Ask Jotti" entry-point card. Dropped into each role dashboard so the AI
 * coach is reachable from anywhere, mirroring the webapp's floating button.
 */
export default function AskJottiCard({ style }: { style?: any }) {
  const navigation = useAppNavigation();
  const styles = useThemedStyles(makeStyles);

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
          <Text style={styles.sub}>Your AI coach for how you think, learn & work</Text>
        </View>
        <Text style={styles.arrow}>→</Text>
      </View>
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
});
