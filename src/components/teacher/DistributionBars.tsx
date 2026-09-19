import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { rs } from '../../utils/responsive';
import { Palette } from '../../theme';
import { useThemedStyles } from '../../context/ThemeContext';
import type { DistributionRow } from '../../utils/classInsights';

/** Labelled horizontal bars; `highlight` marks a style (e.g. the teacher's own). */
export default function DistributionBars({
  rows, highlight, emptyText = 'No results yet',
}: { rows: DistributionRow[]; highlight?: string; emptyText?: string }) {
  const styles = useThemedStyles(makeStyles);
  if (rows.length === 0) return <Text style={styles.empty}>{emptyText}</Text>;
  return (
    <View>
      {rows.map((r) => (
        <View key={r.style} style={styles.row} accessible accessibilityLabel={`${r.style}, ${r.percent} percent, ${r.count} students`}>
          <Text style={[styles.label, r.style === highlight && styles.you]}>
            {r.style}{r.style === highlight ? ' (you)' : ''}
          </Text>
          <View style={styles.track}>
            <View style={[styles.fill, r.style === highlight && styles.fillYou, { width: `${Math.max(3, r.percent)}%` }]} />
          </View>
          <Text style={styles.value}>{r.percent}%</Text>
        </View>
      ))}
    </View>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  label: { width: 104, fontSize: rs(12), color: colors.textSecondary, fontWeight: '600' },
  you: { color: colors.purpleSoft, fontWeight: '800' },
  track: { flex: 1, height: 10, borderRadius: 5, backgroundColor: colors.bgTertiary, overflow: 'hidden' },
  fill: { height: 10, borderRadius: 5, backgroundColor: colors.cyan },
  fillYou: { backgroundColor: colors.purple },
  value: { width: 40, textAlign: 'right', fontSize: rs(12), fontWeight: '700', color: colors.text },
  empty: { fontSize: rs(12), color: colors.textMuted },
});
