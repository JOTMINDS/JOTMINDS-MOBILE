import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenBackground from '../../components/ScreenBackground';
import AppIcon from '../../components/AppIcon';
import GlassCard from '../../components/GlassCard';
import { askJotti, ChatMessage } from '../../utils/aiService';
import { useAuth } from '../../context/AuthContext';
import { rs } from '../../utils/responsive';
import { radii, shadow, spacing, Palette } from '../../theme';
import { useTheme, useThemedStyles } from '../../context/ThemeContext';

interface Bubble {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

const STARTERS_BY_ROLE: Record<string, string[]> = {
  student: [
    'How can I study more effectively for my exams?',
    'What learning strategies fit my thinking style?',
  ],
  teacher: [
    'How do I adapt a lesson for different learner types?',
    'Give me a classroom routine to boost engagement.',
  ],
  parent: [
    'How can I support my child’s learning at home?',
    'What does my child’s cognitive profile mean for homework?',
  ],
  professional: [
    'How do I play to my cognitive strengths at work?',
    'Help me prepare for a high-stakes decision.',
  ],
};

export default function AskJottiScreen({ route }: any) {
  const colors = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { user } = useAuth();
  const scrollRef = useRef<ScrollView>(null);

  const role = user?.role ?? 'student';
  const starters = STARTERS_BY_ROLE[role] ?? STARTERS_BY_ROLE.student;

  const [messages, setMessages] = useState<Bubble[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: `Hi${user?.name ? ` ${user.name.split(' ')[0]}` : ''}! I'm Jotti, your JotMinds coach. Ask me anything about how you think, learn, or work.`,
    },
  ]);
  const [input, setInput] = useState(route?.params?.prompt ?? '');
  const [sending, setSending] = useState(false);

  const profileContext = user
    ? { name: user.name, role: user.role, educationLevel: user.educationLevel, school: user.school }
    : undefined;

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    const userBubble: Bubble = { id: `u${Date.now()}`, role: 'user', text: trimmed };
    const history: ChatMessage[] = messages
      .filter((m) => m.id !== 'welcome')
      .map((m) => ({ role: m.role, content: m.text }));

    setMessages((prev) => [...prev, userBubble]);
    setInput('');
    setSending(true);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);

    const reply = await askJotti(trimmed, { profile: profileContext, role, history });

    setMessages((prev) => [
      ...prev,
      {
        id: `a${Date.now()}`,
        role: 'assistant',
        text:
          reply ??
          "I couldn't reach the coaching service just now. Check your connection and try again in a moment.",
      },
    ]);
    setSending(false);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
  };

  const showStarters = messages.length === 1 && !sending;

  return (
    <ScreenBackground>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
        keyboardVerticalOffset={90}
      >
        <View style={styles.header}>
          <LinearGradient
            colors={['#7B61FF', '#3D52C9']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatar}
          >
            <Text style={styles.avatarText}>✦</Text>
          </LinearGradient>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>Ask Jotti</Text>
            <View style={styles.statusRow}>
              <View style={styles.statusDot} />
              <Text style={styles.role}>JotMinds AI coach</Text>
            </View>
          </View>
        </View>

        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.messages}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((m) => (
            <View
              key={m.id}
              style={[styles.row, m.role === 'user' && styles.rowUser]}
            >
              <View style={[styles.bubble, m.role === 'user' && styles.bubbleUser]}>
                <Text style={[styles.text, m.role === 'user' && styles.textUser]}>{m.text}</Text>
              </View>
            </View>
          ))}

          {sending && (
            <View style={styles.row}>
              <View style={styles.bubble}>
                <ActivityIndicator size="small" color={colors.textMuted} />
              </View>
            </View>
          )}

          {showStarters && (
            <View style={styles.starters}>
              {starters.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={styles.starterChip}
                  onPress={() => send(s)}
                  accessibilityRole="button"
                  accessibilityLabel={s}
                >
                  <Text style={styles.starterText}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>

        <View style={styles.inputWrap}>
          <GlassCard padding={0} style={styles.inputCard}>
            <TextInput
              style={styles.input}
              placeholder="Ask Jotti anything…"
              placeholderTextColor={colors.textSubtle}
              value={input}
              onChangeText={setInput}
              multiline
              editable={!sending}
            />
            <TouchableOpacity onPress={() => send(input)} disabled={sending || !input.trim()}>
              <LinearGradient
                colors={['#7B61FF', '#3D52C9']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.sendBtn, (sending || !input.trim()) && { opacity: 0.5 }]}
              >
                <AppIcon name="→" size={18} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </GlassCard>
          <Text style={styles.disclaimer}>Jotti is AI — double-check anything important.</Text>
        </View>
      </KeyboardAvoidingView>
    </ScreenBackground>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    paddingHorizontal: spacing.xl, paddingTop: 8, paddingBottom: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.borderLight,
  },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 20, fontWeight: '800' },
  name: { fontSize: rs(16), fontWeight: '800', color: colors.text },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  statusDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.success },
  role: { fontSize: rs(12), color: colors.textMuted },

  messages: { padding: spacing.xl, paddingBottom: spacing.xxl, gap: 12 },
  row: { flexDirection: 'row' },
  rowUser: { justifyContent: 'flex-end' },
  bubble: {
    maxWidth: '82%', backgroundColor: colors.glassMedium,
    borderRadius: radii.lg, paddingVertical: 12, paddingHorizontal: 14,
    borderWidth: 1, borderColor: colors.borderLight,
  },
  bubbleUser: { backgroundColor: colors.purple, borderColor: colors.purple },
  text: { fontSize: rs(14), color: colors.textSecondary, lineHeight: rs(21) },
  textUser: { color: '#fff' },

  starters: { gap: 8, marginTop: 4 },
  starterChip: {
    borderWidth: 1, borderColor: colors.borderLight, borderRadius: radii.md,
    paddingVertical: 12, paddingHorizontal: 14, backgroundColor: colors.glassMedium,
  },
  starterText: { fontSize: rs(13), color: colors.textSecondary, fontWeight: '600' },

  inputWrap: { paddingHorizontal: spacing.xl, paddingBottom: spacing.lg },
  inputCard: { flexDirection: 'row', alignItems: 'center', paddingLeft: spacing.md },
  input: { flex: 1, fontSize: rs(14), color: colors.text, paddingVertical: 12, maxHeight: 100 },
  sendBtn: {
    width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center',
    marginLeft: spacing.sm, ...shadow.glow,
  },
  disclaimer: { fontSize: rs(10), color: colors.textSubtle, textAlign: 'center', marginTop: 6 },
});
