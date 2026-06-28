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
import { colors, radii, shadow, spacing } from '../../theme';

interface AssessmentQuestion {
  id: string;
  question: string;
  options: string[];
}

export default function TeachingStyleAssessmentScreen({ navigation }: any) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);

  const questions: AssessmentQuestion[] = [
    {
      id: 'q1',
      question:
        'When planning a lesson, what do you prioritize most?',
      options: [
        'Clear structure and step-by-step progression',
        'Opportunities for student exploration and discovery',
        'Collaborative activities and group work',
        'Individual student needs and differentiation',
      ],
    },
    {
      id: 'q2',
      question:
        'How do you typically respond when a student struggles with a concept?',
      options: [
        'Re-teach using a different method or example',
        'Guide them with questions to discover the answer themselves',
        'Pair them with a peer for collaborative problem-solving',
        'Provide personalized support based on their learning style',
      ],
    },
    {
      id: 'q3',
      question: 'Which classroom environment do you prefer?',
      options: [
        'Organized with clear routines and procedures',
        'Flexible with space for exploration and hands-on learning',
        'Interactive with frequent group discussions',
        'Adaptive with different stations for different needs',
      ],
    },
    {
      id: 'q4',
      question: 'How do you assess student understanding?',
      options: [
        'Regular quizzes and structured assessments',
        'Projects and demonstrations of learning',
        'Group presentations and peer evaluations',
        'Individual conferences and personalized check-ins',
      ],
    },
    {
      id: 'q5',
      question:
        'What role do you see yourself playing in the classroom?',
      options: [
        'Expert and knowledge provider',
        'Facilitator and guide',
        'Collaborator and learning partner',
        'Coach and mentor',
      ],
    },
  ];

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const handleAnswer = (index: number) => {
    setSelectedAnswer(index);
  };

  const handleNext = () => {
    if (selectedAnswer !== null) {
      const newAnswers = [...answers, selectedAnswer];
      setAnswers(newAnswers);

      if (isLastQuestion) {
        navigation.navigate('TeachingStyleResults', { answers: newAnswers });
      } else {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
      }
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
              Question {currentQuestionIndex + 1} of {questions.length}
            </Text>
          </View>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
                },
              ]}
            />
          </View>
        </View>

        <GlassCard padding={24} style={styles.questionCard}>
          <View style={styles.questionHeader}>
            <LinearGradient
              colors={['#10B981', '#059669']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.questionIconWrap}
            >
              <AppIcon name="🎯" size={22} style={styles.questionIcon} />
            </LinearGradient>
          </View>
          <Text style={styles.questionText}>{currentQuestion.question}</Text>
        </GlassCard>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Your Response</Text>
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswer === index;

            return (
              <TouchableOpacity key={index} onPress={() => handleAnswer(index)}>
                <GlassCard
                  padding={16}
                  style={[
                    styles.optionCard,
                    isSelected && { borderColor: colors.success, borderWidth: 2 },
                  ]}
                >
                  <View style={styles.optionRow}>
                    <View
                      style={[
                        styles.optionCircle,
                        isSelected && styles.optionCircleSelected,
                      ]}
                    >
                      {isSelected && <AppIcon name="✓" size={18} style={styles.checkmark} />}
                    </View>
                    <Text style={styles.optionText}>{option}</Text>
                  </View>
                </GlassCard>
              </TouchableOpacity>
            );
          })}
        </View>

        {selectedAnswer !== null && (
          <TouchableOpacity onPress={handleNext}>
            <LinearGradient
              colors={['#10B981', '#059669']}
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

const styles = StyleSheet.create({
  scroll: {
    paddingTop: 20,
    paddingHorizontal: spacing.xl,
    paddingBottom: 120,
  },
  header: {
    marginBottom: spacing.xl,
  },
  progressHeader: {
    marginBottom: spacing.sm,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  progressTrack: {
    height: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.success,
    borderRadius: 4,
  },
  questionCard: {
    marginBottom: spacing.xl,
  },
  questionHeader: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  questionIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  questionIcon: {
    fontSize: 32,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 26,
    textAlign: 'center',
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
    borderColor: colors.success,
    backgroundColor: colors.success,
  },
  checkmark: {
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
