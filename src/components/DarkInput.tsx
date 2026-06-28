import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { darkColors, darkRadii, darkTypography } from '../theme-dark';

interface DarkInputProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  icon?: React.ReactNode;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  error?: string;
}

export default function DarkInput({
  placeholder,
  value,
  onChangeText,
  icon,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  error,
}: DarkInputProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.inputWrapperFocused,
          error && styles.inputWrapperError,
        ]}
      >
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={darkColors.textSubtle}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            style={styles.eyeButton}
          >
            <Text style={styles.eyeIcon}>
              {isPasswordVisible ? '👁️' : '👁️‍🗨️'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: darkColors.glassMedium,
    borderRadius: darkRadii.md,
    borderWidth: 1,
    borderColor: darkColors.border,
    paddingHorizontal: 16,
    height: 48,
  },
  inputWrapperFocused: {
    borderColor: darkColors.primary,
    borderWidth: 1.5,
  },
  inputWrapperError: {
    borderColor: darkColors.error,
  },
  iconContainer: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: darkColors.textPrimary,
    fontSize: darkTypography.fontSize.base,
    fontWeight: '400',
  },
  eyeButton: {
    padding: 4,
  },
  eyeIcon: {
    fontSize: 18,
  },
  errorText: {
    color: darkColors.error,
    fontSize: darkTypography.fontSize.sm,
    marginTop: 6,
    marginLeft: 4,
  },
});
