import React from 'react';
import { View, StyleSheet, ViewStyle, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme';
import { useTheme } from '../context/ThemeContext';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  showImage?: boolean;
  imageSource?: any;
}

export default function ScreenBackground({ children, style, showImage, imageSource }: Props) {
  const t = useTheme();
  const bg = t.bgPrimary;
  const highContrast = bg === '#000000';

  if (showImage && imageSource && !highContrast) {
    return (
      <View style={[styles.container, style]}>
        <ImageBackground
          source={imageSource}
          style={styles.imageBackground}
          resizeMode="cover"
        >
          <LinearGradient
            colors={colors.bgGradient}
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
    <View style={[styles.container, { backgroundColor: bg }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  imageBackground: {
    flex: 1,
    opacity: 0.6,
  },
  gradient: {
    flex: 1,
  },
});
