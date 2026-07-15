import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Linking,
} from 'react-native';
import ScreenBackground from '../../components/ScreenBackground';
import AppIcon from '../../components/AppIcon';
import GlassCard from '../../components/GlassCard';
import GradientButton from '../../components/GradientButton';
import { getLinkedChildrenWithAssessments } from '../../utils/parentApi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { radii, spacing, Palette } from '../../theme';
import { useTheme, useThemedStyles } from '../../context/ThemeContext';

const SUPPORT_EMAIL = 'support@jotminds.com';

export default function SupportRequestScreen({ navigation }: any) {
  const colors = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { user } = useAuth();
  const toast = useToast();

  const [children, setChildren] = useState<{ id: string; name: string }[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [topic, setTopic] = useState('');
  const [details, setDetails] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    getLinkedChildrenWithAssessments()
      .then((res) => setChildren((res?.children ?? []).map((c: any) => ({ id: c.child?.id, name: c.child?.name }))))
      .catch(() => {});
  }, []);

  const handleSend = async () => {
    if (!topic.trim() || !details.trim()) {
      toast.error('Please fill in a topic and some details.');
      return;
    }
    setSending(true);
    const childName = children.find((c) => c.id === selectedChildId)?.name;
    const subject = `Parent support request: ${topic.trim()}`;
    const body = [
      `From: ${user?.name ?? ''} (${user?.email ?? ''})`,
      `Regarding: ${childName ?? 'General'}`,
      '',
      details.trim(),
    ].join('\n');
    const url = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    try {
      await Linking.openURL(url);
      toast.success('Opening your email app — send it to reach our team.');
      setTopic('');
      setDetails('');
    } catch {
      toast.error(`Couldn't open your email app. Reach us directly at ${SUPPORT_EMAIL}.`);
    } finally {
      setSending(false);
    }
  };

  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Go back">
          <AppIcon name="arrow-back" size={22} color={colors.textMuted} />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Get Support</Text>
          <Text style={styles.subtitle}>
            Tell us what's on your mind — this opens your email app to send it straight to our team at {SUPPORT_EMAIL}.
          </Text>
        </View>

        {children.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.label}>ABOUT WHICH CHILD? (OPTIONAL)</Text>
            <View style={styles.chipRow}>
              {children.map((c) => {
                const selected = selectedChildId === c.id;
                return (
                  <TouchableOpacity
                    key={c.id}
                    style={[styles.chip, selected && { backgroundColor: colors.purple, borderColor: colors.purple }]}
                    onPress={() => setSelectedChildId(selected ? null : c.id)}
                  >
                    <Text style={[styles.chipText, selected && { color: '#FFFFFF' }]}>{c.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.label}>TOPIC</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Trouble focusing on homework"
            placeholderTextColor={colors.textSubtle}
            value={topic}
            onChangeText={setTopic}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>DETAILS</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            placeholder="Share what's going on and what kind of support you're looking for..."
            placeholderTextColor={colors.textSubtle}
            value={details}
            onChangeText={setDetails}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>

        <GradientButton label="Send to Our Team" icon="✉️" onPress={handleSend} loading={sending} />

        <GlassCard padding={16} style={styles.emailCard}>
          <View style={styles.row}>
            <AppIcon name="✉️" size={18} color={colors.cyan} />
            <Text style={styles.emailText}>Prefer to email directly? {SUPPORT_EMAIL}</Text>
          </View>
        </GlassCard>
      </ScrollView>
    </ScreenBackground>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  scroll: { paddingTop: 8, paddingHorizontal: spacing.xl, paddingBottom: 100 },
  back: { width: 44, height: 44, justifyContent: 'center', marginBottom: 4 },
  header: { marginBottom: spacing.xl },
  title: { fontSize: 28, fontWeight: '800', color: colors.textPrimary, letterSpacing: -0.6 },
  subtitle: { fontSize: 14, color: colors.textMuted, marginTop: 6, lineHeight: 20 },
  section: { marginBottom: spacing.lg },
  label: { fontSize: 12, fontWeight: '700', color: colors.textSubtle, letterSpacing: 1.2, marginBottom: 10 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, borderWidth: 1.5, borderColor: colors.borderLight, backgroundColor: colors.glassMedium },
  chipText: { fontSize: 13, fontWeight: '600', color: colors.text },
  input: {
    borderWidth: 1, borderColor: colors.borderLight, borderRadius: radii.md,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: colors.text,
    backgroundColor: colors.glassMedium,
  },
  textarea: { minHeight: 120, paddingTop: 12 },
  emailCard: { marginTop: spacing.lg },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  emailText: { flex: 1, fontSize: 13, color: colors.textMuted },
});
