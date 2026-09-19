import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl } from 'react-native';
import ScreenBackground from '../../components/ScreenBackground';
import GlassCard from '../../components/GlassCard';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getReflections, saveReflection, Reflection } from '../../utils/reflectionsApi';
import { generateReflectionFeedback, ReflectionFeedback } from '../../utils/aiGenerators';
import { rs } from '../../utils/responsive';
import { radii, spacing, Palette } from '../../theme';
import { useTheme, useThemedStyles } from '../../context/ThemeContext';

/** Reflections & notes: a private journal synced to the account, with optional AI coaching on each entry. */
export default function ReflectionsScreen() {
  const colors = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { user } = useAuth();
  const toast = useToast();
  const [items, setItems] = useState<Reflection[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<ReflectionFeedback | null>(null);

  const load = useCallback(async () => {
    try { setItems(await getReflections()); } catch { /* offline: keep what we have */ }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const save = async () => {
    const content = text.trim();
    if (!content || saving) return;
    setSaving(true);
    setFeedback(null);
    try {
      const r = await saveReflection(content);
      if (r.queued) toast.info('Saved on this device — it will sync when you’re back online.');
      else toast.success('Reflection saved');
      if (r.reflection) setItems((cur) => [r.reflection!, ...cur]);
      else if (r.queued) setItems((cur) => [{ id: `local_${Date.now()}`, content, createdAt: new Date().toISOString() }, ...cur]);
      setText('');
      generateReflectionFeedback(content, { audience: user?.role === 'teacher' ? 'teacher' : 'student' }).then(setFeedback);
    } catch (e: any) {
      toast.error(e?.message ?? 'Could not save your reflection.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenBackground>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); void load(); }} tintColor={colors.purple} />}
      >
        <Text style={styles.title}>Reflections & Notes</Text>
        <Text style={styles.sub}>A private space to think about what you’ve learned. Only you can see it.</Text>

        <TextInput
          style={styles.input}
          multiline
          value={text}
          onChangeText={setText}
          placeholder="What stood out to you today? What would you do differently?"
          placeholderTextColor={colors.textSubtle}
          accessibilityLabel="New reflection"
        />
        <TouchableOpacity style={[styles.btn, (!text.trim() || saving) && { opacity: 0.5 }]} disabled={!text.trim() || saving} onPress={save} accessibilityRole="button">
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Save reflection</Text>}
        </TouchableOpacity>

        {feedback && (
          <GlassCard variant="dark" padding={16} style={styles.card}>
            <Text style={styles.cardTitle}>✦ Coaching feedback</Text>
            <Text style={styles.body}>💬 {feedback.encouragement}</Text>
            <Text style={styles.body}>🔍 {feedback.insight}</Text>
            <Text style={styles.body}>➡️ {feedback.actionableStep}</Text>
            <Text style={styles.tag}>✦ AI-generated</Text>
          </GlassCard>
        )}

        {loading ? (
          <ActivityIndicator style={{ marginTop: 24 }} color={colors.purple} />
        ) : items.length === 0 ? (
          <Text style={styles.empty}>No reflections yet. Your first one is a good place to start.</Text>
        ) : (
          items.map((r) => (
            <GlassCard key={r.id} variant="dark" padding={16} style={styles.card}>
              <Text style={styles.date}>{new Date(r.createdAt).toLocaleString()}</Text>
              <Text style={styles.body}>{r.content}</Text>
            </GlassCard>
          ))
        )}
      </ScrollView>
    </ScreenBackground>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  scroll: { padding: spacing.xl, paddingBottom: 60 },
  title: { fontSize: rs(24), fontWeight: '800', color: colors.text },
  sub: { fontSize: rs(13), color: colors.textMuted, marginTop: 4, marginBottom: spacing.lg },
  input: {
    minHeight: 110, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.borderSoft, backgroundColor: colors.glassLight,
    color: colors.text, padding: 14, fontSize: rs(14), textAlignVertical: 'top', marginBottom: 12,
  },
  btn: { backgroundColor: colors.success, borderRadius: radii.xl, paddingVertical: 14, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '800', fontSize: rs(14) },
  card: { marginTop: spacing.lg },
  cardTitle: { fontSize: rs(14), fontWeight: '800', color: colors.text, marginBottom: 8 },
  body: { fontSize: rs(13), lineHeight: rs(19), color: colors.textSecondary, marginBottom: 4 },
  date: { fontSize: rs(11), color: colors.textMuted, marginBottom: 6, fontWeight: '700' },
  tag: { fontSize: rs(10), color: colors.textMuted, marginTop: 6 },
  empty: { fontSize: rs(13), color: colors.textMuted, marginTop: 24, textAlign: 'center' },
});
