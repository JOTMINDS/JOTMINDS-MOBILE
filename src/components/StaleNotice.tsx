import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { savedAgo } from '../utils/teacherStudents';
import { Palette, radii } from '../theme';
import { useThemedStyles } from '../context/ThemeContext';

/** Shown above data that is the last saved copy because the live refresh failed. */
export default function StaleNotice({ savedAt, onRetry }: { savedAt?: string; onRetry: () => void }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <TouchableOpacity style={styles.box} onPress={onRetry} accessibilityRole="button" accessibilityLabel="Showing saved data. Tap to refresh.">
      <Text style={styles.text}>Offline: showing data saved {savedAgo(savedAt)}. Tap to refresh.</Text>
    </TouchableOpacity>
  );
}

const makeStyles = (c: Palette) => StyleSheet.create({
  box: { backgroundColor: `${c.warning}22`, borderColor: c.warning, borderWidth: 1, borderRadius: radii.md, paddingVertical: 10, paddingHorizontal: 12, marginBottom: 12 },
  text: { fontSize: 12, fontWeight: '700', color: c.warning },
});
