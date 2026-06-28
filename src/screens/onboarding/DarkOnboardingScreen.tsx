import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import DarkScreenBackground from '../../components/DarkScreenBackground';
import { darkColors, darkRadii, darkShadow, darkTypography } from '../../theme-dark';

const { width: screenWidth } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  title: string;
  highlightWords: string[];
  description: string;
  image?: any;
  gradient: [string, string];
}

const slides: OnboardingSlide[] = [
  {
    id: '1',
    title: 'Discover Your Cognitive Style',
    highlightWords: ['Cognitive', 'Style'],
    description:
      'Take personalized assessments to understand how you think, learn, and make decisions.',
    gradient: darkColors.gradientPurple,
  },
  {
    id: '2',
    title: 'Build Mental Strength',
    highlightWords: ['Mental', 'Strength'],
    description:
      'Interactive exercises and practice modules designed to enhance your cognitive abilities.',
    gradient: darkColors.gradientCyan,
  },
  {
    id: '3',
    title: 'Track Your Growth',
    highlightWords: ['Track', 'Growth'],
    description:
      'Monitor your progress, earn achievements, and watch your cognitive skills improve over time.',
    gradient: darkColors.gradientCoral,
  },
];

export default function DarkOnboardingScreen({ navigation }: any) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      navigation.navigate('EnhancedRoleSelection');
    }
  };

  const handleSkip = () => {
    navigation.navigate('EnhancedRoleSelection');
  };

  const renderSlide = ({ item }: { item: OnboardingSlide }) => {
    const titleParts = item.title.split(' ');
    const highlightedTitle = titleParts.map((word, index) => {
      const isHighlighted = item.highlightWords.includes(word);
      return (
        <Text
          key={index}
          style={isHighlighted ? styles.titleHighlight : styles.titleNormal}
        >
          {word}{' '}
        </Text>
      );
    });

    return (
      <View style={styles.slide}>
        <LinearGradient
          colors={['rgba(2, 6, 24, 0)', 'rgba(2, 6, 24, 0.8)', darkColors.bgPrimary]}
          locations={[0, 0.5, 1]}
          style={styles.slideGradient}
        >
          <View style={styles.slideContent}>
            <View style={styles.textContainer}>
              <Text style={styles.title}>{highlightedTitle}</Text>
              <Text style={styles.description}>{item.description}</Text>
            </View>

            <View style={styles.bottomSection}>
              <View style={styles.pagination}>
                {slides.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.dot,
                      index === currentIndex
                        ? [styles.dotActive, { backgroundColor: item.gradient[0] }]
                        : styles.dotInactive,
                    ]}
                  />
                ))}
              </View>

              <TouchableOpacity
                onPress={handleNext}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={item.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.nextButton}
                >
                  <Text style={styles.nextIcon}>→</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  };

  return (
    <DarkScreenBackground>
      <TouchableOpacity
        onPress={handleSkip}
        style={styles.skipButton}
      >
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(
            event.nativeEvent.contentOffset.x / screenWidth
          );
          setCurrentIndex(index);
        }}
      />
    </DarkScreenBackground>
  );
}

const styles = StyleSheet.create({
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 24,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipText: {
    color: darkColors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  slide: {
    width: screenWidth,
    flex: 1,
  },
  slideGradient: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  slideContent: {
    paddingHorizontal: 32,
    paddingBottom: 60,
  },
  textContainer: {
    marginBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 16,
    lineHeight: 45,
    letterSpacing: 0.4,
  },
  titleNormal: {
    color: darkColors.textPrimary,
  },
  titleHighlight: {
    color: darkColors.primary,
  },
  description: {
    fontSize: 18,
    color: darkColors.textSecondary,
    lineHeight: 28,
    letterSpacing: -0.4,
  },
  bottomSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pagination: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 100,
  },
  dotActive: {
    width: 32,
  },
  dotInactive: {
    width: 8,
    backgroundColor: darkColors.borderLight,
  },
  nextButton: {
    width: 56,
    height: 56,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    ...darkShadow.glow,
  },
  nextIcon: {
    fontSize: 24,
    color: darkColors.textPrimary,
    fontWeight: '700',
  },
});
