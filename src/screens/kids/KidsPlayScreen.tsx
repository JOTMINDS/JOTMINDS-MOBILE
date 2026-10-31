import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import ScreenBackground from '../../components/ScreenBackground';
import KidsTile from '../../components/kids/KidsTile';
import { spacing, Palette } from '../../theme';
import { useThemedStyles } from '../../context/ThemeContext';

/**
 * Games hub for elementary learners (the webapp's mini-games hub): a few big square buttons, one
 * game each. N-Back is left out because it needs more working memory than this age has fun with.
 */
export default function KidsPlayScreen({ navigation }: any) {
  const styles = useThemedStyles(makeStyles);
  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title} accessibilityRole="header">Let's Play!</Text>
        <View style={styles.grid}>
          <KidsTile emoji="🃏" label="Match Cards" colors={['#6E4D9C', '#3D52C9']} onPress={() => navigation.navigate('MemoryMatch')} />
          <KidsTile emoji="🎨" label="Color Words" colors={['#EC4899', '#DB2777']} onPress={() => navigation.navigate('Stroop')} />
          <KidsTile emoji="⭐" label="Daily Star" colors={['#F59E0B', '#D97706']} onPress={() => navigation.navigate('DailyChallenge')} />
          <KidsTile emoji="🏅" label="My Stickers" colors={['#10B981', '#059669']} onPress={() => navigation.navigate('KidsStickers')} />
        </View>
      </ScrollView>
    </ScreenBackground>
  );
}

const makeStyles = (c: Palette) => StyleSheet.create({
  scroll: { padding: spacing.xl, paddingBottom: 120 },
  title: { fontSize: 32, fontWeight: '900', color: c.textPrimary, textAlign: 'center', marginBottom: spacing.xl },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
});
