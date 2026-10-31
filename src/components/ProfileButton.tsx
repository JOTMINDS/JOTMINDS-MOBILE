import React from 'react';
import { Image, Text, TouchableOpacity, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useAppNavigation } from '../navigation/types';
import { Palette } from '../theme';
import { useThemedStyles } from '../context/ThemeContext';

/** Header shortcut to Profile, for roles whose bottom menu has no Profile tab. */
export default function ProfileButton({ style }: { style?: StyleProp<ViewStyle> }) {
  const { user } = useAuth();
  const navigation = useAppNavigation();
  const styles = useThemedStyles(makeStyles);
  return (
    <TouchableOpacity
      style={[styles.btn, style]}
      onPress={() => navigation.navigate('Main', { screen: 'Profile' } as any)}
      accessibilityRole="button"
      accessibilityLabel="Profile and settings"
    >
      {user?.avatarUrl
        ? <Image source={{ uri: user.avatarUrl }} style={styles.img} />
        : <Text style={styles.initial}>{(user?.name || '?').charAt(0).toUpperCase()}</Text>}
    </TouchableOpacity>
  );
}

const makeStyles = (c: Palette) => StyleSheet.create({
  btn: {
    width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
    backgroundColor: c.purple, borderWidth: 1, borderColor: c.borderLight,
  },
  img: { width: 44, height: 44 },
  initial: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
});
