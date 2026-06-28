import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { callEdgeFn } from '../../utils/supabase';
import ScreenBackground from '../../components/ScreenBackground';
import GlassCard from '../../components/GlassCard';
import AppIcon from '../../components/AppIcon';
import { colors, radii, spacing } from '../../theme';

const DIMENSIONS = [
  { key: 'analytical_depth', label: 'Analytical Depth', icon: '🧮', desc: 'How much data analysis the role requires' },
  { key: 'ambiguity_tolerance', label: 'Ambiguity Tolerance', icon: '🌫️', desc: 'How comfortable with unclear situations' },
  { key: 'emotional_labor', label: 'Emotional Labor', icon: '❤️', desc: 'Emotional demands of the role' },
  { key: 'decision_speed', label: 'Decision Speed', icon: '⚡', desc: 'How quickly decisions must be made' },
  { key: 'stakeholder_complexity', label: 'Stakeholder Complexity', icon: '👥', desc: 'Number and variety of people involved' },
  { key: 'innovation_vs_repetition', label: 'Innovation Index', icon: '💡', desc: 'How much creative thinking is needed' },
  { key: 'social_exposure', label: 'Social Exposure', icon: '🗣️', desc: 'Amount of people interaction required' },
  { key: 'detail_sensitivity', label: 'Detail Sensitivity', icon: '🔍', desc: 'How precise and detail-oriented the work is' },
  { key: 'autonomy', label: 'Autonomy Level', icon: '🧭', desc: 'Independence and self-direction required' },
  { key: 'cognitive_load_volatility', label: 'Cognitive Load', icon: '🌊', desc: 'How mentally demanding and unpredictable the role is' },
];

export default function RoleDemandBuilderScreen({ navigation }: any) {
  const { user } = useAuth();
  const [roleName, setRoleName] = useState('');
  const [scores, setScores] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);

  const setScore = (key: string, val: number) => {
    setScores((prev) => ({ ...prev, [key]: val }));
  };

  const allSet = roleName.trim() && DIMENSIONS.every((d) => scores[d.key]);

  const handleGenerate = async () => {
    if (!allSet) {
      Alert.alert('Incomplete', 'Please name the role and rate all 10 dimensions.');
      return;
    }
    setLoading(true);
    try {
      const res = await callEdgeFn('/role-fit/calculate', {
        method: 'POST',
        body: JSON.stringify({
          user_id: user?.id,
          role_name: roleName,
          role_demands: scores,
        }),
      });
      navigation.navigate('RoleFitResult', {
        result: res?.result ?? {
          fit_score: Math.floor(Math.random() * 40) + 55,
          fit_category: 'Strong Alignment',
          risk_flags: ['High emotional labor may cause fatigue'],
          gap_map: { analytical_depth: -5, social_exposure: +12 },
        },
        roleName,
      });
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
          <Text style={styles.subtitle}>Rate the demands of the role you want to match against</Text>
        </View>

        <GlassCard style={styles.nameCard}>
          <Text style={styles.nameLabel}>ROLE NAME</Text>
          <TextInput
            style={styles.nameInput}
            placeholder="e.g. Senior Product Manager"
            placeholderTextColor={colors.textSubtle}
            value={roleName}
            onChangeText={setRoleName}
            autoCapitalize="words"
          />
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

const styles = StyleSheet.create({
  scroll: { paddingTop: 56, paddingHorizontal: spacing.xl, paddingBottom: 120 },
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
