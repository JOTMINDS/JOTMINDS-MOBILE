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

interface PracticeQuestion {
  id: string;
  type: 'multiple-choice' | 'scenario' | 'reflection';
  question: string;
  options?: string[];
  correctAnswer?: number;
  explanation?: string;
}

export default function PracticeModuleScreen({ route, navigation }: any) {
  const colors = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { moduleId } = route.params;
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);

  const practiceQuestions: PracticeQuestion[] = [
    {
      id: 'q1',
      type: 'multiple-choice',
      question:
        'When analyzing an argument, what is the first step you should take?',
      options: [
        'Identify the conclusion',
        'Look for emotional language',
        "Check the author's credentials",
        'Count the number of premises',
      ],
      correctAnswer: 0,
      explanation:
        'Identifying the conclusion helps you understand what the argument is trying to prove, which is essential before evaluating the supporting evidence.',
    },
    {
      id: 'q2',
      type: 'scenario',
      question:
        'A friend claims: "This diet works because I lost 5 pounds in a week!" What critical thinking skill should you apply?',
      options: [
        'Accept their personal experience as evidence',
        'Question whether correlation implies causation',
        'Immediately try the diet yourself',
        'Ignore their claim entirely',
      ],
      correctAnswer: 1,
      explanation:
        'Personal anecdotes are not reliable evidence. Weight loss could be due to many factors, not just the diet. Critical thinkers question whether two related events are causally connected.',
    },
    {
      id: 'q3',
      type: 'multiple-choice',
      question: 'Which of these is an example of confirmation bias?',
      options: [
        'Reading multiple perspectives on a topic',
        'Only seeking information that supports your existing beliefs',
        'Changing your mind based on new evidence',
        'Asking questions to clarify understanding',
      ],
      correctAnswer: 1,
      explanation:
        'Confirmation bias occurs when we selectively seek or interpret information that confirms our pre-existing beliefs while ignoring contradictory evidence.',
    },
  ];

  const currentQuestion = practiceQuestions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === practiceQuestions.length - 1;

  const handleAnswer = (index: number) => {
    setSelectedAnswer(index);
    setShowExplanation(true);
    if (index === currentQuestion.correctAnswer) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (isLastQuestion) {
      navigation.navigate('PracticeResults', {
        score,
        total: practiceQuestions.length,
        moduleId,
      });
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    }
  };

  return (
    <ScreenBackground>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressText}>
              Question {currentQuestionIndex + 1} of {practiceQuestions.length}
            </Text>
            <Text style={styles.scoreText}>Score: {score}</Text>
          </View>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${((currentQuestionIndex + 1) / practiceQuestions.length) * 100}%`,
                },
              ]}
            />
          </View>
        </View>

        <GlassCard padding={24} style={styles.questionCard}>
          <View style={styles.questionTypeRow}>
            <View style={styles.typeBadge}>
              <Text style={styles.typeText}>
                {currentQuestion.type.replace('-', ' ').toUpperCase()}
              </Text>
            </View>
          </View>
          <Text style={styles.questionText}>{currentQuestion.question}</Text>
        </GlassCard>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose Your Answer</Text>
          {currentQuestion.options?.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isCorrect = index === currentQuestion.correctAnswer;
            const showFeedback = showExplanation;

            let cardStyle = styles.optionCard;
            let borderColor = 'transparent';
            if (showFeedback) {
              if (isSelected && isCorrect) {
                borderColor = colors.success;
              } else if (isSelected && !isCorrect) {
                borderColor = colors.error;
              } else if (isCorrect) {
                borderColor = colors.success;
              }
            } else if (isSelected) {
              borderColor = colors.purple;
            }

            return (
              <TouchableOpacity
                key={index}
                disabled={showExplanation}
                onPress={() => handleAnswer(index)}
              >
                <GlassCard
                  padding={16}
                  style={[styles.optionCard, { borderColor, borderWidth: 2 }]}
                >
                  <View style={styles.optionRow}>
                    <View
                      style={[
                        styles.optionCircle,
                        isSelected && styles.optionCircleSelected,
                        showFeedback &&
                          isCorrect &&
                          styles.optionCircleCorrect,
                        showFeedback &&
                          isSelected &&
                          !isCorrect &&
                          styles.optionCircleWrong,
                      ]}
                    >
                      {showFeedback && isCorrect && (
                        <AppIcon name="✓" size={18} style={styles.checkmark} />
                      )}
                      {showFeedback && isSelected && !isCorrect && (
                        <AppIcon name="✕" size={18} style={styles.xmark} />
                      )}
                    </View>
                    <Text style={styles.optionText}>{option}</Text>
                  </View>
                </GlassCard>
              </TouchableOpacity>
            );
          })}
        </View>

        {showExplanation && currentQuestion.explanation && (
          <GlassCard padding={20} style={styles.explanationCard}>
            <View style={styles.explanationHeader}>
              <AppIcon name="💡" size={22} style={styles.explanationIcon} />
              <Text style={styles.explanationTitle}>Explanation</Text>
            </View>
            <Text style={styles.explanationText}>
              {currentQuestion.explanation}
            </Text>
          </GlassCard>
        )}

        {showExplanation && (
          <TouchableOpacity onPress={handleNext}>
            <LinearGradient
              colors={['#6E4D9C', '#5A3E82']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.nextButton}
            >
              <Text style={styles.nextButtonText}>
                {isLastQuestion ? 'View Results' : 'Next Question'} →
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </ScrollView>
    </ScreenBackground>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  scroll: {
    paddingTop: 20,
    paddingHorizontal: spacing.xl,
    paddingBottom: 120,
  },
  header: {
    marginBottom: spacing.xl,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  scoreText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.purple,
  },
  progressTrack: {
    height: 8,
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.purple,
    borderRadius: 4,
  },
  questionCard: {
    marginBottom: spacing.xl,
  },
  questionTypeRow: {
    marginBottom: spacing.md,
  },
  typeBadge: {
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  typeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.purple,
    letterSpacing: 0.8,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 26,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  optionCard: {
    marginBottom: spacing.md,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.textMuted,
    marginRight: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionCircleSelected: {
    borderColor: colors.purple,
    backgroundColor: colors.purple,
  },
  optionCircleCorrect: {
    borderColor: colors.success,
    backgroundColor: colors.success,
  },
  optionCircleWrong: {
    borderColor: colors.error,
    backgroundColor: colors.error,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  xmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    lineHeight: 21,
  },
  explanationCard: {
    marginBottom: spacing.xl,
    backgroundColor: 'rgba(31, 200, 225, 0.1)',
  },
  explanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  explanationIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.cyan,
  },
  explanationText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 21,
  },
  nextButton: {
    borderRadius: radii.lg,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: spacing.xxl,
    ...shadow.glow,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
