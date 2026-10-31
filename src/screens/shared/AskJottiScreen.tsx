import React, { useEffect, useRef, useState } from 'react';
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
import { loadTeacherStudents } from '../../utils/teacherStudents';
import { jottiActionsFor, buildClassSummary, ClassSummary, JottiAction } from '../../utils/jottiActions';
import { useAuth } from '../../context/AuthContext';
import { rs } from '../../utils/responsive';
import { radii, shadow, spacing, Palette } from '../../theme';
import { useTheme, useThemedStyles } from '../../context/ThemeContext';

interface Bubble {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

const WELCOME_BY_ROLE: Record<string, string> = {
  teacher: 'I can explain your class, differentiate a lesson, draft parent messages, write quizzes and plan lessons. Pick one below or ask me anything.',
  student: 'I can build study plans, explain topics simply and quiz you. Pick one below or ask me anything.',
  parent: 'I can help you support your child at home and talk with their teacher. Pick one below or ask me anything.',
  professional: 'I can help with decisions, growth and working to your strengths. Pick one below or ask me anything.',
};

export default function AskJottiScreen({ route }: any) {
  const colors = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { user } = useAuth();
  const scrollRef = useRef<ScrollView>(null);

  const role = user?.role ?? 'student';
  const actions = jottiActionsFor(role);
  const inputRef = useRef<TextInput>(null);
  const autoSend = !!route?.params?.autoSend && !!route?.params?.prompt;

  // Teachers get answers about their real class: an anonymous summary (counts and
  // style shares, no names) is sent as context. Everyone else is ready at once.
  const [classSummary, setClassSummary] = useState<ClassSummary | undefined>();
  const [contextReady, setContextReady] = useState(role !== 'teacher');
  useEffect(() => {
    if (role !== 'teacher') return;
    let alive = true;
    loadTeacherStudents()
      .then((r) => { if (alive) setClassSummary(buildClassSummary(r.students)); })
      .catch(() => {})
      .finally(() => { if (alive) setContextReady(true); });
    return () => { alive = false; };
  }, [role]);

  const [messages, setMessages] = useState<Bubble[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: `Hi${user?.name ? ` ${user.name.split(' ')[0]}` : ''}! I'm Jotti, your JotMinds coach. ${WELCOME_BY_ROLE[role] ?? WELCOME_BY_ROLE.student}`,
    },
  ]);
  const [input, setInput] = useState(autoSend ? '' : route?.params?.prompt ?? '');
  const [sending, setSending] = useState(false);

  const profileContext = user
    ? { name: user.name, role: user.role, educationLevel: user.educationLevel, school: user.school, ...(classSummary ? { classSummary } : {}) }
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

  // A chip on the Home card opens Jotti with its question already asked.
  const autoSent = useRef(false);
  useEffect(() => {
    if (autoSend && contextReady && !autoSent.current) {
      autoSent.current = true;
      void send(route.params.prompt);
    }
  }, [autoSend, contextReady]);

  const runAction = (a: JottiAction) => {
    if (a.mode === 'send') { void send(a.prompt); return; }
    setInput(a.prompt);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const showStarters = messages.length === 1 && !sending && !autoSend;

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
              {actions.map((a) => (
                <TouchableOpacity
                  key={a.id}
                  style={styles.starterChip}
                  onPress={() => runAction(a)}
                  accessibilityRole="button"
                  accessibilityLabel={a.label}
                >
                  <AppIcon name={a.icon} size={18} color={colors.purpleSoft} />
                  <Text style={styles.starterText}>{a.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>

        <View style={styles.inputWrap}>
          <GlassCard padding={0} style={styles.inputCard}>
            <TextInput
              ref={inputRef}
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

  starters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  starterChip: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderWidth: 1, borderColor: colors.borderLight, borderRadius: radii.md,
    paddingVertical: 10, paddingHorizontal: 12, backgroundColor: colors.glassMedium,
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
