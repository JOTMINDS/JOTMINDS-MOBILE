import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Switch, ActivityIndicator } from 'react-native';
import { useToast } from '../../context/ToastContext';
import { getMyAccessRequestsAsChild, getChildConsents, setConsent } from '../../utils/parentApi';
import { useAuth } from '../../context/AuthContext';
import ScreenBackground from '../../components/ScreenBackground';
import GlassCard from '../../components/GlassCard';
import AppIcon from '../../components/AppIcon';
import { colors, radii, spacing, Palette } from '../../theme';
import { useTheme, useThemedStyles } from '../../context/ThemeContext';

export default function FamilySharingScreen({ navigation }: any) {
  const colors = useTheme();
  const styles = useThemedStyles(makeStyles);
  const toast = useToast();
  const { user } = useAuth();
  const [parents, setParents] = useState<any[]>([]);
  const [consents, setConsents] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  const load = async () => {
    if (!user?.id) { setLoading(false); return; }
    try {
      const [reqRes, consentRes] = await Promise.all([
        getMyAccessRequestsAsChild(),
        getChildConsents(user.id),
      ]);
      const approved = (reqRes?.requests || []).filter((r: any) => r.status === 'approved');
      setParents(approved);
      const map: Record<string, boolean> = {};
      (consentRes?.consents || []).forEach((c: any) => { map[c.parentId] = c.consentGiven; });
      setConsents(map);
    } catch {
      // leave empty on failure
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [user?.id]);

  const toggle = async (parentId: string, next: boolean) => {
    setSaving(parentId);
    try {
      await setConsent(user!.id, parentId, next);
      setConsents((c) => ({ ...c, [parentId]: next }));
      toast.success(next ? 'Sharing turned on' : 'Sharing turned off');
    } catch (e: any) {
      toast.error(e.message || 'Failed to update sharing');
    } finally {
      setSaving(null);
    }
  };

  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <TouchableOpacity
          style={styles.back}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <AppIcon name="arrow-back" size={22} color={colors.textMuted} />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Family Sharing</Text>
          <Text style={styles.subtitle}>
            Your linked parents can already see that you've completed assessments. Turn sharing
            on for a parent to also let them see your detailed thinking, learning, and decision
            styles, plus pairing insights.
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator color={colors.purple} style={{ marginTop: spacing.xl }} />
        ) : parents.length === 0 ? (
          <GlassCard padding={32}>
            <View style={styles.empty}>
              <AppIcon name="🔗" size={40} color={colors.textSubtle} style={styles.emptyIcon} />
              <Text style={styles.cardTitle}>No linked parents yet</Text>
              <Text style={styles.cardSubtle}>Once a parent links to your account, they'll show up here.</Text>
            </View>
          </GlassCard>
        ) : (
          parents.map((p) => (
            <GlassCard key={p.parentId} padding={16} style={styles.spacedCard}>
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{p.parentName}</Text>
                  <Text style={styles.cardSubtle}>{p.parentEmail}</Text>
                </View>
                <Switch
                  value={!!consents[p.parentId]}
                  disabled={saving === p.parentId}
                  onValueChange={(v) => toggle(p.parentId, v)}
                  trackColor={{ false: colors.bgTertiary, true: colors.purple }}
                  thumbColor="#FFFFFF"
                  ios_backgroundColor={colors.bgTertiary}
                />
              </View>
            </GlassCard>
          ))
        )}
      </ScrollView>
    </ScreenBackground>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  scroll: { paddingTop: 8, paddingHorizontal: spacing.xl, paddingBottom: 120 },
  back: { width: 44, height: 44, justifyContent: 'center', marginBottom: 4 },
  header: { marginBottom: spacing.xl },
  title: { fontSize: 30, fontWeight: '800', color: colors.textPrimary, letterSpacing: -1 },
  subtitle: { fontSize: 14, color: colors.textMuted, marginTop: 8, lineHeight: 20 },
  spacedCard: { marginBottom: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '600', color: colors.text },
  cardSubtle: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  empty: { alignItems: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: spacing.md },
});
