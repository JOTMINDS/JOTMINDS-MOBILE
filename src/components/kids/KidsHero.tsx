import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import JotRobot, { JotRobotMode } from './JotRobot';
import { radii, spacing } from '../../theme';

/**
 * Elementary-level home header, following the webapp's kids dashboard: the Jot robot,
 * a big greeting, one line about what's next, and a row of stars for progress.
 */
export default function KidsHero({ name, done, total }: { name?: string; done: number; total: number }) {
  const first = (name || '').trim().split(/\s+/)[0] || 'friend';
  const all = total > 0 && done >= total;
  const mode: JotRobotMode = all ? 'heart' : done > 0 ? 'builder' : 'spark';
  const line = all ? 'Amazing! You finished every quiz!' : done > 0 ? 'Great job! Ready for the next one?' : 'Ready to play and learn?';

  return (
    <LinearGradient colors={['#6E4D9C', '#3D52C9', '#14136E']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
      <JotRobot mode={mode} size={132} />
      <Text style={styles.hi} accessibilityRole="header">Hi, {first}! 👋</Text>
      <Text style={styles.line}>{line}</Text>
      <View style={styles.stars} accessible accessibilityLabel={`${done} of ${total} stars`}>
        {Array.from({ length: total }).map((_, i) => (
          <Text key={i} style={styles.star}>{i < done ? '⭐' : '☆'}</Text>
        ))}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radii.xl, padding: spacing.xl, alignItems: 'center', marginBottom: spacing.xl },
  hi: { fontSize: 32, fontWeight: '900', color: '#FFFFFF', marginTop: spacing.sm, textAlign: 'center' },
  line: { fontSize: 18, fontWeight: '700', color: 'rgba(255,255,255,0.92)', marginTop: 6, textAlign: 'center' },
  stars: { flexDirection: 'row', gap: 8, marginTop: spacing.md },
  star: { fontSize: 38, color: '#FDE68A' },
});
