import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import GlassCard from '../GlassCard';
import { rs } from '../../utils/responsive';
import { spacing, Palette } from '../../theme';
import { useTheme, useThemedStyles } from '../../context/ThemeContext';

/**
 * Loads AI-generated content once per `deps` change. `load(force)` should
 * return the data, or null when nothing could be produced (card then hides).
 * Late results from a superseded request are ignored.
 */
export function useAIData<T>(load: (force: boolean) => Promise<T | null>, deps: React.DependencyList, enabled = true) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(enabled);
  const seq = useRef(0);

  const run = useCallback(async (force: boolean) => {
    const id = ++seq.current;
    setLoading(true);
    try {
      const res = await load(force);
      if (id === seq.current) setData(res);
    } catch {
      if (id === seq.current) setData(null);
    } finally {
      if (id === seq.current) setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    if (enabled) void run(false);
    else setLoading(false);
  }, [run, enabled]);

  return { data, loading, refresh: () => run(true) };
}

interface Props {
  title: string;
  icon?: string;
  loading: boolean;
  /** hide the card entirely when there is nothing to show */
  empty?: boolean;
  /** false = on-device fallback text (still shown, but not labelled AI) */
  ai?: boolean;
  onRefresh?: () => void;
  style?: any;
  children: React.ReactNode;
}

export default function AICard({ title, icon = '✦', loading, empty, ai = true, onRefresh, style, children }: Props) {
  const colors = useTheme();
  const styles = useThemedStyles(makeStyles);
  if (!loading && empty) return null;
  return (
    <GlassCard variant="dark" padding={16} style={[styles.card, style]}>
      <View style={styles.head}>
        <Text style={styles.title}>{icon}  {title}</Text>
        {!loading && onRefresh && ai && (
          <TouchableOpacity onPress={onRefresh} accessibilityRole="button" accessibilityLabel={`Regenerate ${title}`} hitSlop={10}>
            <Text style={styles.refresh}>↻</Text>
          </TouchableOpacity>
        )}
      </View>
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="small" color={colors.purple} />
          <Text style={styles.loadingText}>Personalising with AI…</Text>
        </View>
      ) : (
        <>
          {children}
          {ai && <Text style={styles.tag}>✦ AI-generated · review before acting on it</Text>}
        </>
      )}
    </GlassCard>
  );
}

export function Bullets({ items, styles: s }: { items: string[]; styles: ReturnType<typeof makeStyles> }) {
  return (
    <>
      {items.map((t, i) => (
        <View key={i} style={s.row}>
          <Text style={s.bullet}>•</Text>
          <Text style={s.text}>{t}</Text>
        </View>
      ))}
    </>
  );
}

export const useAICardStyles = () => useThemedStyles(makeStyles);

export const makeStyles = (colors: Palette) => StyleSheet.create({
  card: { marginBottom: spacing.lg },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  title: { fontSize: rs(15), fontWeight: '800', color: colors.text, flex: 1 },
  refresh: { fontSize: rs(18), color: colors.purpleSoft, fontWeight: '800' },
  loading: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  loadingText: { fontSize: rs(12), color: colors.textMuted },
  tag: { fontSize: rs(10), color: colors.textMuted, marginTop: 10 },
  row: { flexDirection: 'row', gap: 8, marginBottom: 7 },
  bullet: { color: colors.purpleSoft, fontSize: rs(13) },
  text: { flex: 1, fontSize: rs(13), lineHeight: rs(19), color: colors.textSecondary },
  strong: { fontSize: rs(13), fontWeight: '800', color: colors.text, marginBottom: 3 },
  sub: { fontSize: rs(11), fontWeight: '800', color: colors.purpleSoft, letterSpacing: 0.8, marginTop: 8, marginBottom: 4 },
  quote: { fontSize: rs(13), fontStyle: 'italic', color: colors.purpleSoft, marginTop: 8 },
  chip: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, backgroundColor: colors.bgTertiary, marginBottom: 4 },
  chipText: { fontSize: rs(10), fontWeight: '700', color: colors.textSecondary },
  block: { marginBottom: 12 },
  option: { padding: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.borderSoft, marginTop: 8, backgroundColor: colors.glassLight },
  optionRight: { borderColor: colors.success, backgroundColor: colors.successSoft },
  optionWrong: { borderColor: colors.error },
});
