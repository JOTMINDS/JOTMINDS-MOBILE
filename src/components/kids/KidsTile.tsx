import React from 'react';
import { Text, TouchableOpacity, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { radii, spacing } from '../../theme';

/**
 * The big square button used on elementary screens (the webapp's KidsButton): one picture,
 * one or two words, and a target far bigger than the 44pt minimum so small hands hit it.
 */
export default function KidsTile({
  emoji, label, colors, onPress, style,
}: {
  emoji: string;
  label: string;
  colors: [string, string];
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.wrap, style]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.tile}>
        <Text style={styles.emoji}>{emoji}</Text>
        <Text style={styles.label}>{label}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrap: { flexBasis: '47%', flexGrow: 1, aspectRatio: 1 },
  tile: { flex: 1, borderRadius: radii.xl, alignItems: 'center', justifyContent: 'center', padding: spacing.md },
  emoji: { fontSize: 56 },
  label: { fontSize: 20, fontWeight: '900', color: '#FFFFFF', marginTop: spacing.sm, textAlign: 'center' },
});
