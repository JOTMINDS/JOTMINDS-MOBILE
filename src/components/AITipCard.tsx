import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GlassCard from './GlassCard';
import { askJotti } from '../utils/aiService';
import { useAuth } from '../context/AuthContext';
import { rs } from '../utils/responsive';
import { spacing, Palette } from '../theme';
import { useThemedStyles } from '../context/ThemeContext';

interface Props {
  /** What the tip should be about, e.g. "study strategies for exams". */
  context: string;
  /** Shown immediately and used whenever AI is unavailable. */
  fallbacks: string[];
  title?: string;
  icon?: string;
  /** Stable key for the daily cache — one AI tip per key per day. */
  cacheKey: string;
}

const dayStamp = () => new Date().toISOString().slice(0, 10);

/**
 * A single actionable tip. Renders a static fallback instantly, then quietly
 * swaps in an AI-personalised one (cached per day). If AI is unreachable the
 * fallback simply stays — no error, no spinner left hanging.
 */
export default function AITipCard({ context, fallbacks, title = "Today's tip", icon = '💡', cacheKey }: Props) {
  const styles = useThemedStyles(makeStyles);
  const { user } = useAuth();

  const fallback = fallbacks[
    Math.floor(Date.now() / 86400000) % Math.max(1, fallbacks.length)
  ] ?? fallbacks[0];

  const [tip, setTip] = useState(fallback);
  const [aiLoading, setAiLoading] = useState(false);
  const [isAI, setIsAI] = useState(false);

  useEffect(() => {
    let alive = true;
    const storageKey = `jotminds.aitip.${cacheKey}`;

    (async () => {
      try {
        const raw = await AsyncStorage.getItem(storageKey);
        if (raw) {
          const cached = JSON.parse(raw) as { date: string; tip: string };
          if (cached.date === dayStamp() && cached.tip) {
            if (alive) { setTip(cached.tip); setIsAI(true); }
            return;
          }
        }
      } catch {
        // ignore cache errors
      }

      if (!alive) return;
      setAiLoading(true);
      const reply = await askJotti(
        `Give me ONE short, specific, practical tip about ${context}. ` +
          `One or two sentences, no preamble, no markdown, no list.`,
        { role: user?.role, profile: user ? { role: user.role, educationLevel: user.educationLevel } : undefined },
      );
      if (!alive) return;
      setAiLoading(false);

      const clean = reply?.trim().replace(/^["']|["']$/g, '');
      if (clean && clean.length > 12) {
        setTip(clean);
        setIsAI(true);
        AsyncStorage.setItem(storageKey, JSON.stringify({ date: dayStamp(), tip: clean })).catch(() => {});
      }
    })();

    return () => { alive = false; };
  }, [context, cacheKey, user?.role, user?.educationLevel]);

  return (
    <GlassCard padding={16} style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={styles.title}>{title}</Text>
        {aiLoading && <ActivityIndicator size="small" style={{ marginLeft: 'auto' }} />}
        {isAI && !aiLoading && <Text style={styles.aiTag}>✦ AI</Text>}
      </View>
      <Text style={styles.tip}>{tip}</Text>
    </GlassCard>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  card: { marginBottom: spacing.lg },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  icon: { fontSize: rs(15) },
  title: { fontSize: rs(12), fontWeight: '800', color: colors.textSubtle, letterSpacing: 1, textTransform: 'uppercase' },
  aiTag: { marginLeft: 'auto', fontSize: rs(10), fontWeight: '800', color: colors.cyan, letterSpacing: 0.5 },
  tip: { fontSize: rs(14), color: colors.textSecondary, lineHeight: rs(21) },
});
