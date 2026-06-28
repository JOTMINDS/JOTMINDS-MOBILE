import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';

interface State { error: Error | null }

/**
 * Root error boundary — turns a render crash into a readable message instead of
 * a blank screen, and logs the error. Uses hardcoded styles (no theme/context)
 * so it works even if a provider is the thing that failed.
 */
export default class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: any) {
    console.error('[ErrorBoundary]', error?.message, info?.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.emoji}>⚠️</Text>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>{error?.message || 'Unknown error'}</Text>
          {!!error?.stack && (
            <Text style={styles.stack} numberOfLines={12}>{error.stack}</Text>
          )}
          <TouchableOpacity style={styles.button} onPress={() => this.setState({ error: null })}>
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172B' },
  content: { flexGrow: 1, justifyContent: 'center', padding: 28 },
  emoji: { fontSize: 40, textAlign: 'center', marginBottom: 12 },
  title: { fontSize: 22, fontWeight: '800', color: '#FFFFFF', textAlign: 'center', marginBottom: 12 },
  message: { fontSize: 14, color: '#FCA5A5', textAlign: 'center', marginBottom: 16, lineHeight: 20 },
  stack: { fontSize: 11, color: '#94A3B8', fontFamily: 'monospace', marginBottom: 20 },
  button: { backgroundColor: '#3D52C9', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
});
