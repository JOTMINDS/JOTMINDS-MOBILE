import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Platform } from 'react-native';
import ScreenBackground from '../../components/ScreenBackground';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { sendFeedback, FEEDBACK_CATEGORIES } from '../../utils/reflectionsApi';
import { rs } from '../../utils/responsive';
import { radii, spacing, Palette } from '../../theme';
import { useTheme, useThemedStyles } from '../../context/ThemeContext';
import type { ScreenProps } from '../../navigation/types';

/** Feedback & support: rating + category + message, delivered to the JotMinds support team as a ticket. */
export default function FeedbackScreen({ navigation }: ScreenProps<'Feedback'>) {
  const colors = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { user } = useAuth();
  const toast = useToast();
  const [rating, setRating] = useState(5);
  const [category, setCategory] = useState(FEEDBACK_CATEGORIES[0]);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const submit = async () => {
    if (!message.trim()) { toast.error('Please tell us a little about your experience.'); return; }
    setSending(true);
    try {
      const r = await sendFeedback({ rating, category, message, role: user?.role }, Platform.OS);
      toast.success(r.queued ? 'Saved — we’ll send it when you’re back online.' : 'Thank you! Your feedback was sent.');
      navigation.goBack();
    } catch (e: any) {
      toast.error(e?.message ?? 'Could not send your feedback. Please try again.');
      setSending(false);
    }
  };

  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Help us improve JotMinds</Text>
        <Text style={styles.sub}>Your feedback goes straight to our support team.</Text>

        <Text style={styles.label}>OVERALL EXPERIENCE</Text>
        <View style={styles.stars}>
          {[1, 2, 3, 4, 5].map((n) => (
            <TouchableOpacity key={n} onPress={() => setRating(n)} accessibilityRole="button" accessibilityLabel={`${n} star${n > 1 ? 's' : ''}`} accessibilityState={{ selected: n === rating }}>
              <Text style={[styles.star, n <= rating && styles.starOn]}>★</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>ABOUT</Text>
        <View style={styles.chips}>
          {FEEDBACK_CATEGORIES.map((c) => (
            <TouchableOpacity key={c} onPress={() => setCategory(c)} style={[styles.chip, c === category && styles.chipOn]} accessibilityRole="button" accessibilityState={{ selected: c === category }}>
              <Text style={[styles.chipText, c === category && { color: '#fff' }]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>YOUR FEEDBACK</Text>
        <TextInput
          style={styles.input}
          multiline
          value={message}
          onChangeText={setMessage}
          placeholder="What’s working well? What could be better?"
          placeholderTextColor={colors.textSubtle}
          accessibilityLabel="Your feedback"
        />

        <TouchableOpacity style={[styles.btn, sending && { opacity: 0.6 }]} disabled={sending} onPress={submit} accessibilityRole="button">
          {sending ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Send feedback</Text>}
        </TouchableOpacity>
      </ScrollView>
    </ScreenBackground>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  scroll: { padding: spacing.xl, paddingBottom: 60 },
  title: { fontSize: rs(22), fontWeight: '800', color: colors.text },
  sub: { fontSize: rs(13), color: colors.textMuted, marginTop: 4, marginBottom: spacing.lg },
  label: { fontSize: rs(11), fontWeight: '800', letterSpacing: 1, color: colors.textMuted, marginTop: 16, marginBottom: 8 },
  stars: { flexDirection: 'row', gap: 6 },
  star: { fontSize: rs(34), color: colors.bgTertiary },
  starOn: { color: '#F59E0B' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: radii.pill, backgroundColor: colors.bgTertiary },
  chipOn: { backgroundColor: colors.purple },
  chipText: { fontSize: rs(12), color: colors.textSecondary, fontWeight: '700' },
  input: {
    minHeight: 130, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.borderSoft, backgroundColor: colors.glassLight,
    color: colors.text, padding: 14, fontSize: rs(14), textAlignVertical: 'top',
  },
  btn: { backgroundColor: colors.success, borderRadius: radii.xl, paddingVertical: 15, alignItems: 'center', marginTop: 20 },
  btnText: { color: '#fff', fontWeight: '800', fontSize: rs(14) },
});
