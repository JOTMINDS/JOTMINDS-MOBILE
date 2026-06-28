import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenBackground from '../../components/ScreenBackground';
import AppIcon from '../../components/AppIcon';
import GlassCard from '../../components/GlassCard';
import { colors, radii, shadow, spacing, Palette } from '../../theme';
import { useTheme, useThemedStyles } from '../../context/ThemeContext';

interface Question {
  id: string;
  question: string;
  emoji: string;
  options: Array<{ text: string; emoji: string }>;
}

export default function KidsAssessmentScreen({ navigation }: any) {
  const colors = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);

  const questions: Question[] = [
    {
      id: 'q1',
      question: 'When you learn something new, how do you like to do it?',
      emoji: '🎓',
      options: [
        { text: 'Read about it in a book', emoji: '📚' },
        { text: 'Watch someone show me', emoji: '👀' },
        { text: 'Try it myself and practice', emoji: '✋' },
        { text: 'Talk about it with friends', emoji: '💬' },
      ],
    },
    {
      id: 'q2',
      question: 'What helps you remember things best?',
      emoji: '🧠',
      options: [
        { text: 'Writing it down', emoji: '✍️' },
        { text: 'Drawing pictures', emoji: '🎨' },
        { text: 'Saying it out loud', emoji: '🗣️' },
        { text: 'Moving or acting it out', emoji: '🤸' },
      ],
    },
    {
      id: 'q3',
      question: 'When solving a puzzle, what do you do?',
      emoji: '🧩',
      options: [
        { text: 'Plan it out step by step', emoji: '📋' },
        { text: 'Jump in and try things', emoji: '🚀' },
        { text: 'Ask for hints', emoji: '💡' },
        { text: 'Work with someone else', emoji: '👥' },
      ],
    },
  ];

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const handleAnswer = (index: number) => {
    setSelectedAnswer(index);
    const newAnswers = [...answers, index];
    setAnswers(newAnswers);

    setTimeout(() => {
      if (isLastQuestion) {
        navigation.navigate('KidsAssessmentResults', { answers: newAnswers });
      } else {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
      }
    }, 800);
  };

  return (
    <ScreenBackground>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <AppIcon name={currentQuestion.emoji} size={22} style={styles.headerEmoji} />
          <View style={styles.progressDots}>
            {questions.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === currentQuestionIndex && styles.dotActive,
                  index < currentQuestionIndex && styles.dotComplete,
                ]}
              />
            ))}
          </View>
        </View>

        <GlassCard padding={28} style={styles.questionCard}>
          <Text style={styles.questionText}>{currentQuestion.question}</Text>
        </GlassCard>

        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            return (
              <TouchableOpacity
                key={index}
                onPress={() => handleAnswer(index)}
                disabled={selectedAnswer !== null}
              >
                <LinearGradient
                  colors={
                    isSelected
                      ? ['#10B981', '#059669']
                      : ['rgba(255,255,255,0.8)', 'rgba(255,255,255,0.6)']
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.optionCard}
                >
                  <AppIcon name={option.emoji} size={22} style={styles.optionEmoji} />
                  <Text
                    style={[
                      styles.optionText,
                      isSelected && styles.optionTextSelected,
                    ]}
                  >
                    {option.text}
                  </Text>
                  {isSelected && (
                    <View style={styles.checkBadge}>
                      <AppIcon name="✓" size={18} style={styles.checkText} />
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.encouragement}>
          <Text style={styles.encouragementText}>
            You're doing great! 🌟
          </Text>
        </View>
      </ScrollView>
    </ScreenBackground>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  scroll: {
    paddingTop: 8,
    paddingHorizontal: spacing.xl,
    paddingBottom: 120,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  headerEmoji: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  progressDots: {
    flexDirection: 'row',
    gap: 12,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
  },
  dotActive: {
    backgroundColor: colors.purple,
    width: 32,
  },
  dotComplete: {
    backgroundColor: colors.success,
  },
  questionCard: {
    marginBottom: spacing.xxl,
    alignItems: 'center',
  },
  questionText: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 32,
    textAlign: 'center',
  },
  optionsContainer: {
    gap: spacing.md,
  },
  optionCard: {
    borderRadius: radii.xl,
    padding: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadow.glow,
  },
  optionEmoji: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  optionText: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 24,
  },
  optionTextSelected: {
    color: '#FFFFFF',
  },
  checkBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  encouragement: {
    marginTop: spacing.xxl,
    alignItems: 'center',
  },
  encouragementText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.purple,
  },
});
