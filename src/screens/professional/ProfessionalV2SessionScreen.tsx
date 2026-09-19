import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, AppState } from 'react-native';
import ScreenBackground from '../../components/ScreenBackground';
import GlassCard from '../../components/GlassCard';
import PromptView from '../../components/pv2/PromptView';
import { useAuth } from '../../context/AuthContext';
import { rs } from '../../utils/responsive';
import { radii, spacing, Palette } from '../../theme';
import { useTheme, useThemedStyles } from '../../context/ThemeContext';
import type { ScreenProps } from '../../navigation/types';
import type { PV2Prompt } from '../../utils/professionalV2Logic';
import {
  PV2EventRecorder, PV2EventType, getSession, resumeSession, pauseSession, getNext, submitResponse,
  getSimulationStage, submitStageResponse, completeSession, savePointer,
} from '../../utils/professionalV2Api';

type Current = {
  sessionItemId: string;
  stageId?: string;
  position: number;
  total: number;
  prompt: PV2Prompt;
  /** simulation scenario headline, shown above each stage */
  scenario?: string;
};

const STALE_ITEM = /not the current (item|stage)/i;

export default function ProfessionalV2SessionScreen({ route, navigation }: ScreenProps<'ProfessionalV2Session'>) {
  const { sessionId } = route.params;
  const colors = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { user } = useAuth();

  const [current, setCurrent] = useState<Current | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recorder = useRef(new PV2EventRecorder(sessionId)).current;
  const mounted = useRef(true);
  const scenarioRef = useRef<{ id: string; text: string } | null>(null);
  const totalRef = useRef(0);

  useEffect(() => {
    mounted.current = true;
    const sub = AppState.addEventListener('change', (s) => { if (s !== 'active') void recorder.flush(); });
    return () => { mounted.current = false; sub.remove(); void recorder.flush(); };
  }, [recorder]);

  const finish = useCallback(async () => {
    setFinishing(true);
    setError(null);
    try {
      await recorder.flush();
      await completeSession(sessionId);
      if (user?.id) await savePointer(user.id, { sessionId, state: 'completed' });
      if (mounted.current) navigation.replace('ProfessionalV2Results', { sessionId });
    } catch (e: any) {
      if (mounted.current) { setFinishing(false); setError(e?.message ?? 'Could not finish the assessment.'); }
    }
  }, [navigation, recorder, sessionId, user?.id]);

  const loadStage = useCallback(async (sessionItemId: string, position: number, total: number) => {
    const res = await getSimulationStage(sessionId, sessionItemId);
    if (res.done || !res.stage || !res.stageId) return advance(); // eslint-disable-line @typescript-eslint/no-use-before-define
    const st = res.stage;
    if (!mounted.current) return;
    setCurrent({
      sessionItemId, stageId: res.stageId, position, total,
      scenario: scenarioRef.current?.id === sessionItemId ? scenarioRef.current.text : undefined,
      prompt: {
        type: st.stageType ?? (st as any).type, promptText: st.promptText,
        config: st.config, options: st.options ?? [],
      },
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const advance = useCallback(async (): Promise<void> => {
    setError(null);
    try {
      const next = await getNext(sessionId);
      if (!mounted.current) return;
      if (next.done || !next.item) { await finish(); return; }
      const total = next.totalItems ?? totalRef.current;
      totalRef.current = total;
      const position = next.position ?? 0;
      if (next.isSimulation && next.sessionItemId) {
        scenarioRef.current = { id: next.sessionItemId, text: next.item.promptText };
        await loadStage(next.sessionItemId, position, total);
        return;
      }
      setCurrent({
        sessionItemId: next.sessionItemId!, position, total,
        prompt: {
          type: next.item.itemType ?? (next.item as any).type, promptText: next.item.promptText,
          timeLimitSeconds: next.item.timeLimitSeconds, config: next.item.config, options: next.item.options ?? [],
        },
      });
    } catch (e: any) {
      if (mounted.current) setError(e?.message ?? 'Could not load the next question.');
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [finish, loadStage, sessionId]);

  // Initial load: resume a paused session, jump to results if already done.
  useEffect(() => {
    (async () => {
      try {
        const s = await getSession(sessionId);
        if (s.status === 'completed') { navigation.replace('ProfessionalV2Results', { sessionId }); return; }
        if (s.status === 'paused') await resumeSession(sessionId);
        totalRef.current = s.totalItems;
        await advance();
      } catch (e: any) {
        if (mounted.current) { setError(e?.message ?? 'Could not open the assessment.'); setLoading(false); }
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  // One 'viewed' event each time a new prompt is put on screen.
  const viewedKey = current ? `${current.sessionItemId}:${current.stageId ?? ''}` : '';
  useEffect(() => {
    if (!current) return;
    recorder.record(current.stageId ? 'simulation_stage' : 'viewed', current.sessionItemId,
      current.stageId ? { stageId: current.stageId, action: 'viewed' } : {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewedKey]);

  const onEvent = (type: PV2EventType, value?: Record<string, any>) => {
    if (!current) return;
    recorder.record(type, current.sessionItemId, { ...(value ?? {}), ...(current.stageId ? { stageId: current.stageId } : {}) });
  };

  const onSubmit = async (response: Record<string, any>) => {
    if (!current || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await recorder.flush(); // keep events ahead of the response they describe
      if (current.stageId) {
        const r = await submitStageResponse(sessionId, current.sessionItemId, current.stageId, response);
        if (r.done) { setCurrent(null); r.sessionDone ? await finish() : await advance(); }
        else { setCurrent(null); await loadStage(current.sessionItemId, current.position, current.total); }
      } else {
        const r = await submitResponse(sessionId, current.sessionItemId, response);
        setCurrent(null);
        r.done ? await finish() : await advance();
      }
    } catch (e: any) {
      if (STALE_ITEM.test(e?.message ?? '')) {
        // The server already moved on (e.g. a retried submit) — resync instead of trapping the user.
        setCurrent(null);
        await advance();
      } else if (mounted.current) {
        setError(e?.message ?? 'Could not save your answer. Check your connection and try again.');
      }
    } finally {
      if (mounted.current) setSubmitting(false);
    }
  };

  const pauseAndExit = () => {
    Alert.alert('Pause assessment?', 'Your progress is saved. You can resume any time.', [
      { text: 'Keep going', style: 'cancel' },
      {
        text: 'Pause & exit',
        onPress: async () => {
          try {
            await recorder.flush();
            await pauseSession(sessionId);
            if (user?.id) await savePointer(user.id, { sessionId, state: 'active' });
          } catch { /* leaving anyway — server treats a still-in-progress session as resumable */ }
          navigation.goBack();
        },
      },
    ]);
  };

  if (loading || finishing) {
    return (
      <ScreenBackground>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.purple} />
          <Text style={styles.centeredText}>
            {finishing ? 'Scoring your responses…' : 'Loading your assessment…'}
          </Text>
        </View>
      </ScreenBackground>
    );
  }

  const progress = current && current.total > 0 ? (current.position + (current.stageId ? 0.5 : 0)) / current.total : 0;

  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.topRow}>
          <Text style={styles.counter}>
            {current ? `Question ${current.position + 1} of ${current.total}` : ''}
          </Text>
          <TouchableOpacity onPress={pauseAndExit} accessibilityRole="button" accessibilityLabel="Pause and exit">
            <Text style={styles.pause}>Pause & exit</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${Math.min(100, Math.round(progress * 100))}%` }]} />
        </View>

        {!!error && (
          <GlassCard variant="dark" padding={14} style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
            {!current && (
              <TouchableOpacity onPress={() => { setLoading(true); void advance(); }} style={styles.retry}>
                <Text style={styles.retryText}>Try again</Text>
              </TouchableOpacity>
            )}
          </GlassCard>
        )}

        {current?.scenario && (
          <GlassCard variant="medium" padding={14} style={styles.scenario}>
            <Text style={styles.scenarioLabel}>SCENARIO</Text>
            <Text style={styles.scenarioText}>{current.scenario}</Text>
          </GlassCard>
        )}

        {current && (
          <PromptView
            key={viewedKey}
            prompt={current.prompt}
            submitting={submitting}
            submitLabel={current.position + 1 >= current.total && !current.stageId ? 'Finish' : 'Continue'}
            onSubmit={onSubmit}
            onEvent={onEvent}
          />
        )}
      </ScrollView>
    </ScreenBackground>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  scroll: { padding: spacing.xl, paddingBottom: 60 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  centeredText: { marginTop: 14, color: colors.textSecondary, fontSize: rs(14) },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  counter: { color: colors.textMuted, fontSize: rs(12), fontWeight: '700' },
  pause: { color: colors.purpleSoft, fontSize: rs(13), fontWeight: '700' },
  track: { height: 6, borderRadius: 3, backgroundColor: colors.bgTertiary, marginBottom: spacing.xl, overflow: 'hidden' },
  fill: { height: 6, borderRadius: 3, backgroundColor: colors.success },
  errorCard: { marginBottom: spacing.lg, borderColor: colors.error, borderWidth: 1, borderRadius: radii.lg },
  errorText: { color: colors.text, fontSize: rs(13), lineHeight: rs(19) },
  retry: { marginTop: 10 },
  retryText: { color: colors.success, fontWeight: '800' },
  scenario: { marginBottom: spacing.lg },
  scenarioLabel: { fontSize: rs(10), fontWeight: '800', letterSpacing: 1.2, color: colors.purpleSoft, marginBottom: 6 },
  scenarioText: { fontSize: rs(13), lineHeight: rs(19), color: colors.textSecondary },
});
