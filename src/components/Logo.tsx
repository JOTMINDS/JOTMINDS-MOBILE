import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

/**
 * JotMinds logo — blue "Jot" + white "Minds" on a slanted purple block.
 *
 * Two render modes:
 *  - Vector wordmark (default): scales crisply, no asset needed.
 *  - Real PNG: drop your exact logo at `assets/logo.png` and set USE_IMAGE = true.
 *    (The require stays valid because a placeholder file already exists there.)
 */
const USE_IMAGE = true;

type Size = 'sm' | 'md' | 'lg';
const SCALE: Record<Size, number> = { sm: 0.62, md: 1, lg: 1.45 };

export default function Logo({ size = 'md' }: { size?: Size }) {
  const scale = SCALE[size];
  const fs = Math.round(40 * scale);

  if (USE_IMAGE) {
    return (
      <Image
        source={require('../../assets/logo.png')}
        // native aspect ratio is 1028 x 469 (≈2.19:1)
        style={{ width: 240 * scale, height: 110 * scale }}
        resizeMode="contain"
      />
    );
  }

  return (
    <View style={styles.row}>
      <Text style={[styles.jot, { fontSize: fs }]}>Jot</Text>
      <View
        style={[
          styles.block,
          {
            paddingHorizontal: fs * 0.22,
            paddingVertical: fs * 0.08,
            borderRadius: fs * 0.16,
            marginLeft: -fs * 0.04,
          },
        ]}
      >
        <Text style={[styles.minds, { fontSize: fs }]}>Minds</Text>
      </View>
    </View>
  );
}

const BRAND_BLUE = '#3D52C9';
const BRAND_PURPLE = '#6E4D9C';

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  jot: {
    color: BRAND_BLUE,
    fontWeight: '800',
    fontStyle: 'italic',
    letterSpacing: -1.5,
  },
  block: {
    backgroundColor: BRAND_PURPLE,
    transform: [{ skewX: '-9deg' }],
  },
  minds: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontStyle: 'italic',
    letterSpacing: -1.5,
    transform: [{ skewX: '9deg' }],
  },
});
