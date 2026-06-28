import React from 'react';
import { View, StyleSheet, ViewStyle, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { MAX_CONTENT_WIDTH } from '../utils/responsive';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  showImage?: boolean;
  imageSource?: any;
  /** Apply the top safe-area inset (status bar / notch / Dynamic Island). */
  topInset?: boolean;
}

export default function ScreenBackground({
  children, style, showImage, imageSource, topInset = true,
}: Props) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const bg = t.bgPrimary;
  const highContrast = bg === '#000000';

  // Safe-area aware top spacing (correct on every device), and on tablets/large
  // screens the content is capped + centered so it doesn't stretch awkwardly.
  const padTop = { paddingTop: topInset ? insets.top : 0 };
  const content = <View style={styles.content}>{children}</View>;

  if (showImage && imageSource && !highContrast) {
    return (
      <View style={[styles.container, padTop, style]}>
        <ImageBackground source={imageSource} style={styles.imageBackground} resizeMode="cover">
          <LinearGradient colors={colors.bgGradient} locations={[0, 0.5, 1]} style={styles.gradient}>
            {content}
          </LinearGradient>
        </ImageBackground>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: bg }, padTop, style]}>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
  },
  imageBackground: { flex: 1, opacity: 0.6 },
  gradient: { flex: 1 },
});
