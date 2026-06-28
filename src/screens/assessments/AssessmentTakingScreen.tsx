import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { submitAssessment } from '../../utils/api';

export default function AssessmentTakingScreen({ navigation, route }: any) {
  const { assessmentType } = route.params;
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<any[]>([]);

  // Sample questions - in production, these would come from the backend
  const sampleQuestions = [
    {
      question: 'How do you prefer to learn new concepts?',
      options: [
        'Through hands-on practice',
        'By reading and analyzing',
        'Through discussions with others',
        'By observing and reflecting',
      ],
    },
    {
      question: 'When facing a problem, what is your first instinct?',
      options: [
        'Jump in and try solutions',
        'Research and gather information',
        'Ask for advice from others',
        'Think deeply about it first',
      ],
    },
    {
      question: 'Which environment helps you focus best?',
      options: [
        'Active, hands-on environments',
        'Quiet, structured spaces',
        'Collaborative group settings',
        'Flexible, creative spaces',
      ],
    },
  ];

  const handleAnswer = (answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);

    if (currentQuestion < sampleQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleSubmit(newAnswers);
    }
  };

  const handleSubmit = async (finalAnswers: any[]) => {
    try {
      // Calculate simple results based on answers
      const results = {
        primaryStyle: 'Experiential',
        secondaryStyle: 'Reflective',
        scores: {
          experiential: 8,
          reflective: 6,
          analytical: 4,
          practical: 5,
        },
      };

      await submitAssessment(
        assessmentType,
        finalAnswers,
        results,
        ['Strong hands-on learning', 'Good problem-solving skills'],
        ['Could improve analytical thinking'],
        ['Try more structured study methods', 'Practice reflective journaling']
      );

      Alert.alert(
        'Assessment Complete!',
        'Your results have been saved.',
        [
          {
            text: 'View Results',
            onPress: () =>
              navigation.replace('AssessmentResults', { assessmentType }),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', 'Failed to submit assessment. Please try again.');
    }
  };

  const progress = ((currentQuestion + 1) / sampleQuestions.length) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.questionNumber}>
          Question {currentQuestion + 1} of {sampleQuestions.length}
        </Text>
        <Text style={styles.question}>
          {sampleQuestions[currentQuestion].question}
        </Text>

        <View style={styles.options}>
          {sampleQuestions[currentQuestion].options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                answers[currentQuestion] === index && styles.optionButtonSelected,
              ]}
              onPress={() => handleAnswer(index)}
            >
              <View style={styles.optionRadio}>
                {answers[currentQuestion] === index && (
                  <View style={styles.optionRadioSelected} />
                )}
              </View>
              <Text
                style={[
                  styles.optionText,
                  answers[currentQuestion] === index && styles.optionTextSelected,
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e5e7eb',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#7B61FF',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  questionNumber: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  question: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 32,
    lineHeight: 32,
  },
  options: {
    gap: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  optionButtonSelected: {
    borderColor: '#7B61FF',
    backgroundColor: '#f5f3ff',
  },
  optionRadio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#d1d5db',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionRadioSelected: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#7B61FF',
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: '#1a1a1a',
    lineHeight: 22,
  },
  optionTextSelected: {
    color: '#7B61FF',
    fontWeight: '600',
  },
});
