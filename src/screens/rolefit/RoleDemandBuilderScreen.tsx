import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getAllAssessmentResults } from '../../utils/api';
import { calculateRoleFitScore, mapMobileProfileToDimensions, RoleCognitiveDemand } from '../../utils/roleFitEngine';
import { missingCognitiveDomains } from '../../utils/profileCompleteness';
import { recordExploration } from '../../utils/gamificationApi';
import { askJotti } from '../../utils/aiService';
import { useAuth } from '../../context/AuthContext';
import ScreenBackground from '../../components/ScreenBackground';
import GlassCard from '../../components/GlassCard';
import AppIcon from '../../components/AppIcon';
import { colors, radii, spacing, Palette } from '../../theme';
import { useTheme, useThemedStyles } from '../../context/ThemeContext';

// UI keys (1-5 slider scale) mapped to RoleCognitiveDemand's camelCase
// keys (1-10 scale, doubled on submit — see handleGenerate).
const DIMENSIONS: { key: keyof RoleCognitiveDemand; label: string; icon: string; desc: string }[] = [
  { key: 'analyticalDepth', label: 'Analytical Depth', icon: '🧮', desc: 'How much data analysis the role requires' },
  { key: 'ambiguityTolerance', label: 'Ambiguity Tolerance', icon: '🌫️', desc: 'How comfortable with unclear situations' },
  { key: 'emotionalLaborLoad', label: 'Emotional Labor', icon: '❤️', desc: 'Emotional demands of the role' },
  { key: 'decisionSpeed', label: 'Decision Speed', icon: '⚡', desc: 'How quickly decisions must be made' },
  { key: 'stakeholderComplexity', label: 'Stakeholder Complexity', icon: '👥', desc: 'Number and variety of people involved' },
  { key: 'repetitionVsInnovation', label: 'Innovation Index', icon: '💡', desc: 'How much creative thinking is needed' },
  { key: 'socialExposure', label: 'Social Exposure', icon: '🗣️', desc: 'Amount of people interaction required' },
  { key: 'detailSensitivity', label: 'Detail Sensitivity', icon: '🔍', desc: 'How precise and detail-oriented the work is' },
  { key: 'autonomyRequired', label: 'Autonomy Level', icon: '🧭', desc: 'Independence and self-direction required' },
  { key: 'cognitiveLoadVolatility', label: 'Cognitive Load', icon: '🌊', desc: 'How mentally demanding and unpredictable the role is' },
];

export default function RoleDemandBuilderScreen({ navigation }: any) {
  const colors = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { user } = useAuth();
  const [roleName, setRoleName] = useState('');
  const [scores, setScores] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [aiFilling, setAiFilling] = useState(false);
  const [aiFilled, setAiFilled] = useState(false);

  const setScore = (key: string, val: number) => {
    setScores((prev) => ({ ...prev, [key]: val }));
    setAiFilled(false);
  };

  // Infer the role's demands via AI so the user doesn't have to rate a role
  // they may not know well. They can still adjust any slider afterwards.
  const handleAiFill = async () => {
    if (!roleName.trim()) {
      Alert.alert('Name the role first', 'Type the role you want to match against, then tap Auto-fill.');
      return;
    }
    setAiFilling(true);
    try {
      const dims = DIMENSIONS.map((d) => `${d.key}: ${d.label} — ${d.desc}`).join('\n');
      const reply = await askJotti(
        `Rate how demanding a "${roleName.trim()}" role is on each dimension below, from 1 (low) to 5 (high). ` +
          `Return ONLY JSON like {"analyticalDepth":4,...} with a key for each.\n\n${dims}`,
        { role: user?.role },
      );
      const json = reply ? JSON.parse(reply.slice(reply.indexOf('{'), reply.lastIndexOf('}') + 1)) : null;
      if (!json) throw new Error('no data');
      const next: Record<string, number> = {};
      DIMENSIONS.forEach((d) => {
        const v = Math.round(Number(json[d.key]));
        next[d.key] = Number.isFinite(v) ? Math.min(5, Math.max(1, v)) : 3;
      });
      setScores(next);
      setAiFilled(true);
    } catch {
      Alert.alert('Could not auto-fill', 'The AI is unavailable right now — rate the dimensions yourself, or try again.');
    } finally {
      setAiFilling(false);
    }
  };

  const allSet = roleName.trim() && DIMENSIONS.every((d) => scores[d.key]);

  const handleGenerate = async () => {
    if (!allSet) {
      Alert.alert('Incomplete', 'Please name the role and rate all 10 dimensions.');
      return;
    }
    setLoading(true);
    try {
      const data = await getAllAssessmentResults();
      const results = data?.results ?? [];
      const completedTypes = results.map((r: any) => r.assessmentType);
      if (missingCognitiveDomains(completedTypes).length > 0) {
        Alert.alert('Profile Incomplete', 'Complete your full cognitive profile (Learning, Thinking, Decision) before generating a role match.');
        setLoading(false);
        return;
      }
      const candidate = mapMobileProfileToDimensions(results);
      // UI collects 1-5 slider ratings; the engine's RoleCognitiveDemand scale is 1-10.
      const roleDemands = DIMENSIONS.reduce((acc, dim) => {
        acc[dim.key] = scores[dim.key] * 2;
        return acc;
      }, {} as RoleCognitiveDemand);
      const result = calculateRoleFitScore(candidate, roleDemands);
      if (user?.id) recordExploration(user.id, 'role-fit').catch(() => {});
      navigation.navigate('RoleFitResult', { result, roleName });
    } catch {
      Alert.alert('Error', 'Could not calculate role fit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Role Demand Builder</Text>
          <Text style={styles.subtitle}>
            Name a role and let AI estimate its demands — or rate them yourself.
          </Text>
        </View>

        <GlassCard style={styles.nameCard}>
          <Text style={styles.nameLabel}>ROLE NAME</Text>
          <TextInput
            style={styles.nameInput}
            placeholder="e.g. Senior Product Manager"
            placeholderTextColor={colors.textSubtle}
            value={roleName}
            onChangeText={(t) => { setRoleName(t); setAiFilled(false); }}
            autoCapitalize="words"
          />
          <TouchableOpacity
            style={[styles.aiFillBtn, aiFilling && { opacity: 0.6 }]}
            onPress={handleAiFill}
            disabled={aiFilling}
            accessibilityRole="button"
          >
            {aiFilling
              ? <ActivityIndicator size="small" color={colors.purple} />
              : <Text style={styles.aiFillText}>{aiFilled ? '✓ Filled by AI — adjust below' : '✦ Auto-fill demands with AI'}</Text>}
          </TouchableOpacity>
        </GlassCard>

        {DIMENSIONS.map((dim) => (
          <GlassCard key={dim.key} style={styles.dimCard}>
            <View style={styles.dimHeader}>
              <AppIcon name={dim.icon} size={22} color={colors.cyan} style={styles.dimIcon} />
              <View style={styles.dimInfo}>
                <Text style={styles.dimLabel}>{dim.label}</Text>
                <Text style={styles.dimDesc}>{dim.desc}</Text>
              </View>
            </View>
            <View style={styles.ratingRow}>
              {[1, 2, 3, 4, 5].map((n) => (
                <TouchableOpacity
                  key={n}
                  style={[styles.ratingBtn, scores[dim.key] === n && styles.ratingBtnActive]}
                  onPress={() => setScore(dim.key, n)}
                >
                  {scores[dim.key] === n ? (
                    <LinearGradient
                      colors={['#6E4D9C', '#3D52C9']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.ratingBtnGradient}
                    >
                      <Text style={styles.ratingTextActive}>{n}</Text>
                    </LinearGradient>
                  ) : (
                    <Text style={styles.ratingText}>{n}</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.ratingScale}>
              <Text style={styles.ratingScaleMin}>Low</Text>
              <Text style={styles.ratingScaleMax}>High</Text>
            </View>
          </GlassCard>
        ))}

        <TouchableOpacity
          style={[styles.generateBtn, !allSet && styles.generateBtnDisabled]}
          disabled={!allSet || loading}
          onPress={handleGenerate}
        >
          <LinearGradient
            colors={['#6E4D9C', '#3D52C9']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.generateBtnGradient}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.generateBtnText}>Generate Match →</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </ScreenBackground>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  scroll: { paddingTop: 8, paddingHorizontal: spacing.xl, paddingBottom: 120 },
  header: { marginBottom: 24 },
  title: { fontSize: 28, fontWeight: '800', color: colors.textPrimary, letterSpacing: -1 },
  subtitle: { fontSize: 14, color: colors.textMuted, marginTop: 4, lineHeight: 20 },
  nameCard: { marginBottom: 16 },
  nameLabel: { fontSize: 11, fontWeight: '700', color: colors.textSubtle, letterSpacing: 1.2, marginBottom: 10 },
  nameInput: {
    fontSize: 16, color: colors.text, fontWeight: '600',
    borderBottomWidth: 1, borderBottomColor: colors.borderLight,
    paddingBottom: 10,
  },
  aiFillBtn: {
    marginTop: 14, paddingVertical: 12, borderRadius: radii.md, alignItems: 'center',
    borderWidth: 1.5, borderColor: colors.purple, backgroundColor: `${colors.purple}14`,
  },
  aiFillText: { fontSize: 14, fontWeight: '800', color: colors.purple },
  dimCard: { marginBottom: 14 },
  dimHeader: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  dimIcon: { fontSize: 22 },
  dimInfo: { flex: 1 },
  dimLabel: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 3 },
  dimDesc: { fontSize: 12, color: colors.textMuted, lineHeight: 18 },
  ratingRow: { flexDirection: 'row', gap: 8, justifyContent: 'center', marginBottom: 8 },
  ratingBtn: {
    width: 52, height: 52, borderRadius: 14,
    backgroundColor: colors.bgTertiary, borderWidth: 1, borderColor: colors.borderLight,
    justifyContent: 'center', alignItems: 'center', overflow: 'hidden',
  },
  ratingBtnActive: { borderColor: 'transparent' },
  ratingBtnGradient: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  ratingText: { fontSize: 16, fontWeight: '700', color: colors.textMuted },
  ratingTextActive: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
  ratingScale: { flexDirection: 'row', justifyContent: 'space-between' },
  ratingScaleMin: { fontSize: 10, color: colors.textSubtle },
  ratingScaleMax: { fontSize: 10, color: colors.textSubtle },
  generateBtn: { borderRadius: radii.md, overflow: 'hidden', marginTop: 8 },
  generateBtnDisabled: { opacity: 0.4 },
  generateBtnGradient: { paddingVertical: 18, alignItems: 'center' },
  generateBtnText: { fontSize: 17, fontWeight: '700', color: '#FFFFFF' },
});
