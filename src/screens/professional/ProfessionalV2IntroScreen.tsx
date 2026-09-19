import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import ScreenBackground from '../../components/ScreenBackground';
import GlassCard from '../../components/GlassCard';
import { useAuth } from '../../context/AuthContext';
import { rs } from '../../utils/responsive';
import { radii, spacing, Palette } from '../../theme';
import { useThemedStyles } from '../../context/ThemeContext';
import type { ScreenProps } from '../../navigation/types';
import { PV2_CONSENT_COPY, PV2Pointer, loadPointer, savePointer, startSession } from '../../utils/professionalV2Api';

/**
 * Entry point for the Professional V2 assessment: what it measures, explicit
 * consent (the server refuses to start a session without it), and
 * start / resume / view-latest-results.
 */
export default function ProfessionalV2IntroScreen({ navigation }: ScreenProps<'ProfessionalV2Intro'>) {
  const styles = useThemedStyles(makeStyles);
  const { user } = useAuth();
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pointer, setPointer] = useState<PV2Pointer | null>(null);

  useEffect(() => {
    const unsub = navigation.addListener('focus', () => {
      if (user?.id) loadPointer(user.id).then(setPointer);
    });
    if (user?.id) loadPointer(user.id).then(setPointer);
    return unsub;
  }, [navigation, user?.id]);

  const begin = async () => {
    if (!consent || busy) return;
    setBusy(true);
    setError(null);
    try {
      const { sessionId } = await startSession();
      if (user?.id) await savePointer(user.id, { sessionId, state: 'active' });
      navigation.navigate('ProfessionalV2Session', { sessionId });
    } catch (e: any) {
      const msg: string = e?.message ?? '';
      setError(
        /no pilot or active assessment/i.test(msg)
          ? 'The Professional Intelligence assessment is not open yet. Please check back soon.'
          : /no active items/i.test(msg)
            ? 'This assessment is still being prepared. Please check back soon.'
            : msg || 'Could not start the assessment. Check your connection and try again.',
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.eyebrow}>PROFESSIONAL INTELLIGENCE · PILOT</Text>
        <Text style={styles.title}>How you think and decide at work</Text>
        <Text style={styles.sub}>
          Scenario-based questions, a short simulation and a few judgement tasks. There are no trick
          questions — answer the way you would really act. Takes about 20–30 minutes and you can pause any time.
        </Text>

        {pointer?.state === 'active' && (
          <GlassCard variant="dark" padding={16} style={styles.card}
            onPress={() => navigation.navigate('ProfessionalV2Session', { sessionId: pointer.sessionId })}>
            <Text style={styles.cardTitle}>Continue where you left off →</Text>
            <Text style={styles.cardText}>Your progress is saved.</Text>
          </GlassCard>
        )}
        {pointer?.state === 'completed' && (
          <GlassCard variant="dark" padding={16} style={styles.card}
            onPress={() => navigation.navigate('ProfessionalV2Results', { sessionId: pointer.sessionId })}>
            <Text style={styles.cardTitle}>View your latest profile →</Text>
            <Text style={styles.cardText}>Retaking starts a fresh attempt.</Text>
          </GlassCard>
        )}

        <GlassCard variant="dark" padding={16} style={styles.card}>
          <Text style={styles.cardTitle}>Before you begin</Text>
          {PV2_CONSENT_COPY.map((line) => (
            <View key={line} style={styles.row}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.cardText}>{line}</Text>
            </View>
          ))}
          <TouchableOpacity
            style={styles.consentRow}
            onPress={() => setConsent((c) => !c)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: consent }}
          >
            <View style={[styles.box, consent && styles.boxOn]}>{consent && <Text style={styles.tick}>✓</Text>}</View>
            <Text style={styles.consentText}>I understand and agree to take part in this pilot assessment.</Text>
          </TouchableOpacity>
        </GlassCard>

        {!!error && <Text style={styles.error}>{error}</Text>}

        <TouchableOpacity
          style={[styles.btn, (!consent || busy) && styles.btnOff]}
          disabled={!consent || busy}
          onPress={begin}
          accessibilityRole="button"
        >
          {busy ? <ActivityIndicator color="#FFFFFF" /> : (
            <Text style={styles.btnText}>{pointer?.state === 'active' ? 'Resume assessment' : 'Begin assessment'}</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </ScreenBackground>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  scroll: { padding: spacing.xl, paddingBottom: 60 },
  eyebrow: { fontSize: rs(11), fontWeight: '800', letterSpacing: 1.4, color: colors.purpleSoft, marginBottom: 8 },
  title: { fontSize: rs(24), fontWeight: '800', color: colors.text, marginBottom: 10 },
  sub: { fontSize: rs(14), lineHeight: rs(21), color: colors.textSecondary, marginBottom: spacing.xl },
  card: { marginBottom: spacing.lg },
  cardTitle: { fontSize: rs(15), fontWeight: '800', color: colors.text, marginBottom: 8 },
  cardText: { flex: 1, fontSize: rs(13), lineHeight: rs(19), color: colors.textSecondary },
  row: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  bullet: { color: colors.textMuted },
  consentRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 14 },
  box: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: colors.textMuted, alignItems: 'center', justifyContent: 'center' },
  boxOn: { backgroundColor: colors.success, borderColor: colors.success },
  tick: { color: '#FFFFFF', fontWeight: '900' },
  consentText: { flex: 1, fontSize: rs(13), color: colors.text, lineHeight: rs(19) },
  error: { color: colors.error, fontSize: rs(13), marginBottom: 12, lineHeight: rs(19) },
  btn: { backgroundColor: colors.success, borderRadius: radii.xl, paddingVertical: 16, alignItems: 'center' },
  btnOff: { opacity: 0.4 },
  btnText: { color: '#FFFFFF', fontSize: rs(15), fontWeight: '800' },
});
