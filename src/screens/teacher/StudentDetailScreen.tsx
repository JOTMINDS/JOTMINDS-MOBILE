import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import ScreenBackground from '../../components/ScreenBackground';
import GlassCard from '../../components/GlassCard';
import { TeachingStrategiesCard, EducationalResourcesCard } from '../../components/ai/InsightCards';
import { studentStyles, studentScores, DOMAINS, Domain } from '../../utils/classInsights';
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
                {Object.entries((scores[d] ?? {}) as Record<string, number>).map(([k, v]) => {
                  const n = Number(v);
                  return Number.isFinite(n) ? (
                    <View key={k} style={styles.dimRow}>
                      <Text style={styles.dimLabel}>{k}</Text>
                      <View style={styles.track}><View style={[styles.fill, { width: `${Math.max(2, Math.min(100, n))}%` }]} /></View>
                      <Text style={styles.dimVal}>{Math.round(n)}</Text>
                    </View>
                  ) : null;
                })}
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

        <TouchableOpacity
          style={styles.btn}
          onPress={() => navigation.navigate('ObservationLog')}
          accessibilityRole="button"
        >
          <Text style={styles.btnText}>📋 Record an observation</Text>
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
  btn: { backgroundColor: colors.success, borderRadius: radii.xl, paddingVertical: 15, alignItems: 'center', marginTop: spacing.sm },
  btnText: { color: '#FFFFFF', fontSize: rs(14), fontWeight: '800' },
});
