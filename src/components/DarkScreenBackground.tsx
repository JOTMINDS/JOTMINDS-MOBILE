import React from 'react';
import { View, StyleSheet, ImageBackground, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { darkColors } from '../theme-dark';

interface DarkScreenBackgroundProps {
  children: React.ReactNode;
  showImage?: boolean;
  imageSource?: any;
  style?: ViewStyle;
}

export default function DarkScreenBackground({
  children,
  showImage = false,
  imageSource,
  style,
}: DarkScreenBackgroundProps) {
  if (showImage && imageSource) {
    return (
      <View style={[styles.container, style]}>
        <ImageBackground
          source={imageSource}
          style={styles.imageBackground}
          resizeMode="cover"
        >
          <LinearGradient
            colors={darkColors.gradientOverlay}
            locations={[0, 0.5, 1]}
            style={styles.gradient}
          >
            {children}
          </LinearGradient>
        </ImageBackground>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: darkColors.bgPrimary,
  },
  imageBackground: {
    flex: 1,
    opacity: 0.6,
  },
  gradient: {
    flex: 1,
  },
});
