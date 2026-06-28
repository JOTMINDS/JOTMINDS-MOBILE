import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenBackground from '../../components/ScreenBackground';
import AppIcon from '../../components/AppIcon';
import GlassCard from '../../components/GlassCard';
import { colors, radii, shadow, spacing } from '../../theme';

interface Message {
  id: string;
  sender: 'user' | 'expert';
  text: string;
  timestamp: Date;
}

export default function ExpertChatScreen({ route }: any) {
  const { expertName, expertRole } = route.params || {
    expertName: 'Dr. Sarah Mitchell',
    expertRole: 'Child Cognitive Development Specialist',
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'expert',
      text: `Hi! I'm ${expertName}. How can I help you today?`,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');

  const handleSend = () => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputText,
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    setInputText('');

    // Simulate expert response
    setTimeout(() => {
      const expertResponse: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'expert',
        text: 'Thank you for sharing that. Let me help you with a personalized strategy...',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, expertResponse]);
    }, 1500);
  };

  return (
    <ScreenBackground>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
        keyboardVerticalOffset={100}
      >
        <View style={styles.header}>
          <LinearGradient
            colors={['#6E4D9C', '#5A3E82']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.expertAvatar}
          >
            <Text style={styles.expertAvatarText}>
              {expertName[0]}
            </Text>
          </LinearGradient>
          <View style={styles.expertInfo}>
            <Text style={styles.expertName}>{expertName}</Text>
            <View style={styles.statusRow}>
              <View style={styles.statusDot} />
              <Text style={styles.expertRole}>{expertRole}</Text>
            </View>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageRow,
                message.sender === 'user' && styles.messageRowUser,
              ]}
            >
              {message.sender === 'expert' && (
                <View style={styles.messageAvatar}>
                  <AppIcon name="👨‍⚕️" size={18} style={styles.messageAvatarText} />
                </View>
              )}
              <View
                style={[
                  styles.messageBubble,
                  message.sender === 'user' && styles.messageBubbleUser,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    message.sender === 'user' && styles.messageTextUser,
                  ]}
                >
                  {message.text}
                </Text>
                <Text
                  style={[
                    styles.messageTime,
                    message.sender === 'user' && styles.messageTimeUser,
                  ]}
                >
                  {message.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={styles.inputContainer}>
          <GlassCard padding={0} style={styles.inputCard}>
            <TextInput
              style={styles.input}
              placeholder="Type your message..."
              placeholderTextColor={colors.textSubtle}
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
            <TouchableOpacity onPress={handleSend}>
              <LinearGradient
                colors={['#6E4D9C', '#5A3E82']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.sendButton}
              >
                <AppIcon name="→" size={18} style={styles.sendButtonText} />
              </LinearGradient>
            </TouchableOpacity>
          </GlassCard>
        </View>
      </KeyboardAvoidingView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: 56,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(124, 58, 237, 0.1)',
  },
  expertAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  expertAvatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  expertInfo: {
    flex: 1,
  },
  expertName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
    marginRight: 6,
  },
  expertRole: {
    fontSize: 12,
    color: colors.textMuted,
  },
  messagesContainer: {
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
    alignItems: 'flex-end',
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  messageAvatar: {
    width: 32,
    height: 32,
    marginRight: spacing.sm,
  },
  messageAvatarText: {
    fontSize: 24,
  },
  messageBubble: {
    maxWidth: '75%',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: radii.lg,
    padding: spacing.md,
  },
  messageBubbleUser: {
    backgroundColor: colors.purple,
  },
  messageText: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 21,
    marginBottom: 4,
  },
  messageTextUser: {
    color: '#FFFFFF',
  },
  messageTime: {
    fontSize: 11,
    color: colors.textMuted,
  },
  messageTimeUser: {
    color: 'rgba(255,255,255,0.7)',
  },
  inputContainer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  inputCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: spacing.md,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    paddingVertical: 12,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
    ...shadow.glow,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
  },
});
