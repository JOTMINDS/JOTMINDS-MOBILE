import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenBackground from '../../components/ScreenBackground';
import GlassCard from '../../components/GlassCard';
import { colors, radii, spacing } from '../../theme';

const MOCK_CANDIDATES = [
  { id: '1', name: 'Kwame A.', fit: 91, emotion: 'confident', focus: 4.8 },
  { id: '2', name: 'Ama B.', fit: 76, emotion: 'calm', focus: 3.9 },
  { id: '3', name: 'Kofi C.', fit: 63, emotion: 'anxious', focus: 3.2 },
];

function fitColor(score: number) {
  if (score >= 85) return colors.success;
  if (score >= 70) return colors.cyan;
  if (score >= 55) return colors.warning;
  return colors.error;
}

export default function CandidateComparisonScreen({ navigation }: any) {
  const [roleName, setRoleName] = useState('');
  const candidates = MOCK_CANDIDATES;

  const sorted = [...candidates].sort((a, b) => b.fit - a.fit);

  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Candidate Comparison</Text>
          <Text style={styles.subtitle}>Compare cognitive fit scores across applicants</Text>
        </View>

        <GlassCard style={styles.roleInput}>
          <Text style={styles.roleLabel}>ROLE YOU'RE HIRING FOR</Text>
          <TextInput
            style={styles.roleField}
            placeholder="e.g. Operations Lead"
            placeholderTextColor={colors.textSubtle}
            value={roleName}
            onChangeText={setRoleName}
            autoCapitalize="words"
          />
        </GlassCard>

        {/* Podium */}
        {sorted.length > 0 && (
          <View style={styles.podium}>
            {sorted.slice(0, 3).map((c, i) => (
              <LinearGradient
                key={c.id}
                colors={i === 0 ? ['#F59E0B', '#D97706'] : i === 1 ? ['#6E4D9C', '#5A3E82'] : [colors.bgTertiary, colors.bgSecondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.podiumCard, i === 0 && styles.podiumFirst]}
              >
                <Text style={styles.podiumRank}>#{i + 1}</Text>
                <Text style={styles.podiumName}>{c.name}</Text>
                <Text style={[styles.podiumScore, { color: i === 0 ? '#FFFFFF' : fitColor(c.fit) }]}>
                  {c.fit}
                </Text>
                <Text style={styles.podiumUnit}>/ 100</Text>
              </LinearGradient>
            ))}
          </View>
        )}

        {/* Full table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All Candidates</Text>
          {sorted.map((c, i) => (
            <GlassCard key={c.id} style={styles.candidateCard}>
              <View style={styles.candidateRow}>
                <View style={styles.candidateRankBadge}>
                  <Text style={styles.candidateRankText}>#{i + 1}</Text>
                </View>
                <View style={styles.candidateInfo}>
                  <Text style={styles.candidateName}>{c.name}</Text>
                  <Text style={styles.candidateMeta}>Focus: {c.focus}/5 · Emotion: {c.emotion}</Text>
                </View>
                <View style={styles.candidateFitCol}>
                  <Text style={[styles.candidateFit, { color: fitColor(c.fit) }]}>{c.fit}</Text>
                </View>
              </View>
              <View style={styles.candidateBarTrack}>
                <View style={[styles.candidateBarFill, { width: `${c.fit}%`, backgroundColor: fitColor(c.fit) }]} />
              </View>
            </GlassCard>
          ))}
        </View>

        <Text style={styles.disclaimer}>
          Note: Cognitive fit analysis is not a substitute for skill evaluation or interviews.{'\n'}
          Premium plan required for full candidate export.
        </Text>
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingTop: 56, paddingHorizontal: spacing.xl, paddingBottom: 120 },
  backBtn: { marginBottom: 20 },
  backText: { fontSize: 15, color: colors.cyan, fontWeight: '600' },
  header: { marginBottom: 24 },
  title: { fontSize: 28, fontWeight: '800', color: colors.textPrimary, letterSpacing: -1 },
  subtitle: { fontSize: 14, color: colors.textMuted, marginTop: 4 },
  roleInput: { marginBottom: 24 },
  roleLabel: { fontSize: 11, fontWeight: '700', color: colors.textSubtle, letterSpacing: 1.2, marginBottom: 10 },
  roleField: {
    fontSize: 16, color: colors.text, fontWeight: '600',
    borderBottomWidth: 1, borderBottomColor: colors.borderLight, paddingBottom: 10,
  },
  podium: { flexDirection: 'row', gap: 10, marginBottom: 28, height: 140 },
  podiumCard: { flex: 1, borderRadius: radii.lg, alignItems: 'center', justifyContent: 'center', padding: 10 },
  podiumFirst: { flex: 1.2 },
  podiumRank: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.6)', marginBottom: 4 },
  podiumName: { fontSize: 12, fontWeight: '700', color: '#FFFFFF', textAlign: 'center', marginBottom: 6 },
  podiumScore: { fontSize: 32, fontWeight: '800' },
  podiumUnit: { fontSize: 11, color: 'rgba(255,255,255,0.5)' },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginBottom: 14 },
  candidateCard: { marginBottom: 12 },
  candidateRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  candidateRankBadge: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: colors.bgTertiary, justifyContent: 'center', alignItems: 'center',
  },
  candidateRankText: { fontSize: 12, fontWeight: '800', color: colors.textMuted },
  candidateInfo: { flex: 1 },
  candidateName: { fontSize: 15, fontWeight: '700', color: colors.text },
  candidateMeta: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  candidateFitCol: {},
  candidateFit: { fontSize: 24, fontWeight: '800' },
  candidateBarTrack: { height: 6, backgroundColor: colors.bgTertiary, borderRadius: 3, overflow: 'hidden' },
  candidateBarFill: { height: '100%', borderRadius: 3 },
  disclaimer: { fontSize: 11, color: colors.textSubtle, textAlign: 'center', lineHeight: 18 },
});
