import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import AppIcon from '../../components/AppIcon';
import { LinearGradient } from 'expo-linear-gradient';

interface Answer {
  id: number;
  label: string;
  value: number;
}

interface AssessmentQuestion {
  id: number;
  category: string;
  icon: string;
  question: string;
  context: string;
  answers: Answer[];
}

interface AssessmentQuestionScreenProps {
  navigation: any;
  currentQuestion: number;
  totalQuestions: number;
  question: AssessmentQuestion;
  onAnswer: (answerId: number) => void;
  onBack: () => void;
  onNext: () => void;
}

export default function AssessmentQuestionScreen({
  navigation,
  currentQuestion = 4,
  totalQuestions = 12,
  question,
  onAnswer,
  onBack,
  onNext,
}: AssessmentQuestionScreenProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  const handleAnswerSelect = (answerId: number) => {
    setSelectedAnswer(answerId);
    if (onAnswer) {
      onAnswer(answerId);
    }
  };

  const handleNext = () => {
    if (selectedAnswer !== null && onNext) {
      onNext();
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    }
  };

  const progress = (currentQuestion / totalQuestions) * 100;

  // Default question data for display
  const defaultQuestion: AssessmentQuestion = {
    id: 1,
    category: 'LEARNING AGILITY',
    icon: '💡',
    question: 'When learning something new, do you prefer to dive in and try it out yourself immediately?',
    context: 'Think about how you typically approach unfamiliar tools or concepts.',
    answers: [
      { id: 1, label: 'Strongly Disagree', value: 1 },
      { id: 2, label: 'Disagree', value: 2 },
      { id: 3, label: 'Neutral', value: 3 },
      { id: 4, label: 'Agree', value: 4 },
      { id: 5, label: 'Strongly Agree', value: 5 },
    ],
  };

  const displayQuestion = question || defaultQuestion;

  return (
    <LinearGradient
      colors={['#F8F9FF', '#F8F9FF']}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.exitButton}>
            <AppIcon name="✕" size={18} style={styles.exitIcon} />
          </TouchableOpacity>
          <Text style={styles.category}>{displayQuestion.category}</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Progress Bar */}
        <View style={styles.progressSection}>
          <View style={styles.progressInfo}>
            <Text style={styles.progressText}>Question {currentQuestion} of {totalQuestions}</Text>
            <Text style={styles.progressPercentage}>{Math.round(progress)}%</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Question Section */}
          <View style={styles.questionSection}>
            <View style={styles.iconContainer}>
              <AppIcon name={displayQuestion.icon} size={22} style={styles.questionIcon} />
            </View>
            <Text style={styles.question}>{displayQuestion.question}</Text>
            <Text style={styles.context}>{displayQuestion.context}</Text>
          </View>

          {/* Answer Options */}
          <View style={styles.answersContainer}>
            {displayQuestion.answers.map((answer) => (
              <TouchableOpacity
                key={answer.id}
                style={[
                  styles.answerCard,
                  selectedAnswer === answer.id && styles.answerCardSelected,
                ]}
                onPress={() => handleAnswerSelect(answer.id)}
                activeOpacity={0.7}
              >
                <View style={styles.answerContent}>
                  <View style={styles.answerRadio}>
                    {selectedAnswer === answer.id ? (
                      <View style={styles.answerRadioSelected}>
                        <View style={styles.answerRadioDot} />
                      </View>
                    ) : (
                      <View style={styles.answerRadioEmpty} />
                    )}
                  </View>
                  <Text
                    style={[
                      styles.answerLabel,
                      selectedAnswer === answer.id && styles.answerLabelSelected,
                    ]}
                  >
                    {answer.label}
                  </Text>
                </View>
                {selectedAnswer === answer.id && (
                  <LinearGradient
                    colors={['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.4)', 'rgba(255, 255, 255, 0)']}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={styles.answerGradient}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Bottom Action Bar */}
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <AppIcon name="←" size={18} style={styles.backIcon} />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.nextButton, selectedAnswer === null && styles.nextButtonDisabled]}
            onPress={handleNext}
            disabled={selectedAnswer === null}
          >
            <LinearGradient
              colors={selectedAnswer !== null ? ['#14136E', '#14136E'] : ['#D1D5DB', '#9CA3AF']}
              style={styles.nextButtonGradient}
            >
              <Text style={styles.nextText}>Next</Text>
              <AppIcon name="→" size={18} style={styles.nextIcon} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 44,
    paddingBottom: 16,
    backgroundColor: '#F8F9FF',
  },
  exitButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exitIcon: {
    fontSize: 20,
    color: '#14136E',
  },
  category: {
    fontSize: 14,
    fontWeight: '600',
    color: '#464651',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  placeholder: {
    width: 44,
    height: 44,
  },
  progressSection: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#F8F9FF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 2,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#777683',
    letterSpacing: 0.36,
  },
  progressPercentage: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3D52C9',
    letterSpacing: 0.36,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E5EEFF',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#3D52C9',
    borderRadius: 4,
    shadowColor: '#3D52C9',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 120,
  },
  questionSection: {
    alignItems: 'center',
    marginBottom: 48,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EFF4FF',
    borderWidth: 1,
    borderColor: '#C7C5D3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  questionIcon: {
    fontSize: 24,
  },
  question: {
    fontSize: 28,
    fontWeight: '700',
    color: '#14136E',
    textAlign: 'center',
    lineHeight: 35,
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  context: {
    fontSize: 16,
    fontWeight: '400',
    color: '#464651',
    textAlign: 'center',
    lineHeight: 24,
  },
  answersContainer: {
    gap: 16,
  },
  answerCard: {
    backgroundColor: colors.glassMedium,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C7C5D3',
    minHeight: 64,
    shadowColor: '#14136E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    overflow: 'hidden',
  },
  answerCardSelected: {
    backgroundColor: '#E0F7FA',
    borderColor: '#3D52C9',
    borderWidth: 2,
    shadowColor: '#14136E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
  answerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  answerRadio: {
    marginRight: 16,
  },
  answerRadioEmpty: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#C7C5D3',
  },
  answerRadioSelected: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#3D52C9',
    backgroundColor: colors.glassMedium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  answerRadioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#3D52C9',
  },
  answerLabel: {
    fontSize: 16,
    fontWeight: '400',
    color: '#0B1C30',
    flex: 1,
  },
  answerLabelSelected: {
    fontWeight: '600',
    color: '#004E59',
  },
  answerGradient: {
    position: 'absolute',
    left: 2,
    right: 348,
    top: 2,
    bottom: 2,
    width: '100%',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(248, 249, 255, 0.95)',
    backdropFilter: 'blur(6px)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(199, 197, 211, 0.3)',
    paddingHorizontal: 20,
    paddingTop: 17,
    paddingBottom: 34,
    flexDirection: 'row',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3D52C9',
    gap: 8,
  },
  backIcon: {
    fontSize: 16,
    color: '#3D52C9',
  },
  backText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3D52C9',
    letterSpacing: 0.14,
  },
  nextButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#14136E',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 2,
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 32,
    gap: 8,
  },
  nextText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.14,
  },
  nextIcon: {
    fontSize: 16,
    color: '#FFFFFF',
  },
});
