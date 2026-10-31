import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import ScreenBackground from '../../components/ScreenBackground';
import GlassCard from '../../components/GlassCard';
import { TeachingStrategiesCard, EducationalResourcesCard } from '../../components/ai/InsightCards';
import { studentStyles, studentScores, scoreShares, DOMAINS, Domain } from '../../utils/classInsights';
import { getTeacherObservations, TeacherObservation } from '../../utils/observationApi';
import { useAuth } from '../../context/AuthContext';
import { rs } from '../../utils/responsive';
import { radii, spacing, Palette } from '../../theme';
import { useThemedStyles } from '../../context/ThemeContext';
import type { ScreenProps } from '../../navigation/types';

const LABEL: Record<Domain, string> = { learning: 'Learning style', thinking: 'Thinking style', decision: 'Decision style' };

/** One student's cognitive profile for their teacher: styles, dimension scores, AI teaching strategies, observation shortcut. */
export default function StudentDetailScreen({ route, navigation }: ScreenProps<'StudentDetail'>) {
  const styles = useThemedStyles(makeStyles);
  const { student } = route.params;
  const st = studentStyles(student);
  const scores = studentScores(student);
  const has = DOMAINS.some((d) => st[d]);

  // This student's observation notes live on their profile (as in the webapp).
  const { user } = useAuth();
  const [obs, setObs] = useState<TeacherObservation[] | null>(null);
  const [obsError, setObsError] = useState(false);
  const loadObs = useCallback(() => {
    if (!user?.id) return;
    getTeacherObservations(user.id)
      .then((all) => { setObs(all.filter((o) => o.studentId === student.id)); setObsError(false); })
      .catch(() => setObsError(true));
  }, [user?.id, student.id]);
  useEffect(() => {
    loadObs();
    // Reload on return so a note just added appears.
    return navigation.addListener('focus', loadObs);
  }, [loadObs, navigation]);
  const openObservations = (startNew: boolean) =>
    navigation.navigate('ObservationLog', { studentId: student.id, studentName: student.name, startNew });

  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.head}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{(student.name || '?')[0].toUpperCase()}</Text></View>
          <Text style={styles.name}>{student.name}</Text>
          {!!student.email && <Text style={styles.meta}>{student.email}</Text>}
          <Text style={styles.meta}>
            {[student.className, student.studentCode && `Code ${student.studentCode}`].filter(Boolean).join(' · ')}
          </Text>
        </View>

        <GlassCard variant="dark" padding={16} style={styles.card}>
          <Text style={styles.cardTitle}>Cognitive profile</Text>
          {!has ? (
            <Text style={styles.text}>No assessment data yet. Once this student completes an assessment, their profile appears here.</Text>
          ) : (
            DOMAINS.map((d) => (
              <View key={d} style={styles.domain}>
                <Text style={styles.domainLabel}>{LABEL[d]}</Text>
                <Text style={styles.domainValue}>{st[d] ?? 'Not taken yet'}</Text>
                {scoreShares(scores[d]).map(({ key, value, percent }) => (
                  <View key={key} style={styles.dimRow}>
                    <Text style={styles.dimLabel}>{key}</Text>
                    <View style={styles.track}><View style={[styles.fill, { width: `${Math.max(2, percent)}%` }]} /></View>
                    <Text style={styles.dimVal}>{Math.round(value)}</Text>
                  </View>
                ))}
              </View>
            ))
          )}
        </GlassCard>

        {has && (
          <TeachingStrategiesCard
            studentName={student.name}
            studentData={{ name: student.name, styles: st, scores }}
          />
        )}

        {has && <EducationalResourcesCard userType="teacher" styles={st} />}

        <GlassCard variant="dark" padding={16} style={styles.card}>
          <View style={styles.obsHead}>
            <Text style={styles.cardTitle}>Observations{obs && obs.length > 0 ? ` (${obs.length})` : ''}</Text>
            {obs !== null && obs.length > 3 && (
              <TouchableOpacity onPress={() => openObservations(false)} hitSlop={8} accessibilityRole="button">
                <Text style={styles.link}>View all</Text>
              </TouchableOpacity>
            )}
          </View>
          {obsError && obs === null ? (
            <TouchableOpacity onPress={loadObs} accessibilityRole="button">
              <Text style={styles.text}>Couldn't load observations. Tap to retry.</Text>
            </TouchableOpacity>
          ) : obs === null ? (
            <Text style={styles.text}>Loading…</Text>
          ) : obs.length === 0 ? (
            <Text style={styles.text}>No observations yet.</Text>
          ) : (
            obs.slice(0, 3).map((o) => (
              <View key={o.id} style={styles.obsRow}>
                <Text style={styles.obsMeta}>
                  {o.concernType} · {o.sharedWithParent ? 'shared' : 'private'} · {new Date(o.createdAt).toLocaleDateString()}
                </Text>
                <Text style={styles.text} numberOfLines={2}>{o.observationText}</Text>
              </View>
            ))
          )}
        </GlassCard>

        <TouchableOpacity style={styles.btn} onPress={() => openObservations(true)} accessibilityRole="button">
          <Text style={styles.btnText}>+ Add observation</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenBackground>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  scroll: { padding: spacing.xl, paddingBottom: 60 },
  head: { alignItems: 'center', marginBottom: spacing.xl },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.success, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  avatarText: { color: '#FFFFFF', fontSize: rs(26), fontWeight: '800' },
  name: { fontSize: rs(22), fontWeight: '800', color: colors.text },
  meta: { fontSize: rs(12), color: colors.textMuted, marginTop: 3 },
  card: { marginBottom: spacing.lg },
  cardTitle: { fontSize: rs(15), fontWeight: '800', color: colors.text, marginBottom: 10 },
  text: { fontSize: rs(13), lineHeight: rs(19), color: colors.textSecondary },
  domain: { marginBottom: 14 },
  domainLabel: { fontSize: rs(11), fontWeight: '800', letterSpacing: 0.8, color: colors.purpleSoft },
  domainValue: { fontSize: rs(16), fontWeight: '800', color: colors.text, marginBottom: 6 },
  dimRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  dimLabel: { width: 96, fontSize: rs(11), color: colors.textSecondary },
  dimVal: { width: 30, textAlign: 'right', fontSize: rs(11), fontWeight: '700', color: colors.text },
  track: { flex: 1, height: 8, borderRadius: 4, backgroundColor: colors.bgTertiary, overflow: 'hidden' },
  fill: { height: 8, borderRadius: 4, backgroundColor: colors.cyan },
  obsHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  obsRow: { paddingTop: 10, marginTop: 6, borderTopWidth: 1, borderTopColor: colors.borderLight },
  obsMeta: { fontSize: rs(11), fontWeight: '700', color: colors.textMuted, marginBottom: 3 },
  link: { fontSize: rs(12), fontWeight: '800', color: colors.cyan },
  btn: { backgroundColor: colors.success, borderRadius: radii.xl, paddingVertical: 15, alignItems: 'center', marginTop: spacing.sm },
  btnText: { color: '#FFFFFF', fontSize: rs(14), fontWeight: '800' },
});
