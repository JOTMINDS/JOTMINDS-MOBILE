import React from 'react';
import Svg, { Circle, G, Line, Path, Rect } from 'react-native-svg';

/**
 * The Jot robot mascot, ported from the webapp's kids Mascot (same 200×200 drawing and
 * colours). Each mode has its own colour, eyes, mouth and chest symbol.
 */
export type JotRobotMode = 'detective' | 'spark' | 'heart' | 'builder';

const MODES: Record<JotRobotMode, { primary: string; eyes: 'squint' | 'round' | 'star'; mouth: 'line' | 'smile' | 'open' | 'grin' }> = {
  detective: { primary: '#3B82F6', eyes: 'squint', mouth: 'line' },
  spark: { primary: '#EAB308', eyes: 'star', mouth: 'smile' },
  heart: { primary: '#EC4899', eyes: 'round', mouth: 'open' },
  builder: { primary: '#22C55E', eyes: 'round', mouth: 'grin' },
};

export default function JotRobot({ mode = 'spark', size = 120 }: { mode?: JotRobotMode; size?: number }) {
  const { primary, eyes, mouth } = MODES[mode];
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200" accessible={false}>
      {/* Antenna */}
      <Line x1="100" y1="40" x2="100" y2="10" stroke={primary} strokeWidth="4" />
      <Circle cx="100" cy="10" r="6" fill={primary} />

      {/* Head */}
      <Rect x="40" y="40" width="120" height="100" rx="25" fill="white" stroke={primary} strokeWidth="4" />

      {/* Screen */}
      <Rect x="55" y="55" width="90" height="50" rx="10" fill={primary} opacity={0.2} />
      <Rect x="55" y="55" width="90" height="50" rx="10" fill="none" stroke={primary} strokeWidth="2" />

      {/* Eyes */}
      {eyes === 'squint' && (
        <G fill={primary}>
          <Rect x="70" y="75" width="20" height="6" rx="2" />
          <Rect x="110" y="75" width="20" height="6" rx="2" />
        </G>
      )}
      {eyes === 'round' && (
        <G fill={primary}>
          <Circle cx="80" cy="78" r="8" />
          <Circle cx="120" cy="78" r="8" />
          <Circle cx="82" cy="76" r="3" fill="white" />
          <Circle cx="122" cy="76" r="3" fill="white" />
        </G>
      )}
      {eyes === 'star' && (
        <G fill={primary} stroke={primary} strokeWidth="2">
          <Path d="M80 68 L83 75 L90 75 L85 80 L87 88 L80 83 L73 88 L75 80 L70 75 L77 75 Z" />
          <Path d="M120 68 L123 75 L130 75 L125 80 L127 88 L120 83 L113 88 L115 80 L110 75 L117 75 Z" />
        </G>
      )}

      {/* Mouth */}
      {mouth === 'line' && <Path d="M85 95 Q100 95 115 95" stroke={primary} strokeWidth="3" fill="none" strokeLinecap="round" />}
      {mouth === 'smile' && <Path d="M75 90 Q100 105 125 90" stroke={primary} strokeWidth="3" fill="none" strokeLinecap="round" />}
      {mouth === 'open' && <Circle cx="100" cy="95" r="6" fill={primary} />}
      {mouth === 'grin' && <Path d="M75 92 Q100 102 125 92 Z" fill={primary} />}

      {/* Chest badge */}
      <Circle cx="100" cy="120" r="14" fill={primary} />
      {mode === 'spark' && <Path d="M100 110 L103 118 L108 118 L104 122 L106 128 L100 124 L94 128 L96 122 L92 118 L97 118 Z" fill="white" />}
      {mode === 'detective' && <Circle cx="100" cy="120" r="6" stroke="white" strokeWidth="2" fill="none" />}
      {mode === 'heart' && <Path d="M100 125 L95 120 A 3 3 0 0 1 100 116 A 3 3 0 0 1 105 120 Z" fill="white" />}
      {mode === 'builder' && <Rect x="94" y="114" width="12" height="12" fill="white" rx="2" />}

      {/* Arms */}
      <Path d="M40 90 Q20 100 25 120" stroke="#94A3B8" strokeWidth="6" fill="none" strokeLinecap="round" />
      <Circle cx="25" cy="120" r="8" fill="#94A3B8" />
      <Path d="M160 90 Q180 100 175 120" stroke="#94A3B8" strokeWidth="6" fill="none" strokeLinecap="round" />
      <Circle cx="175" cy="120" r="8" fill="#94A3B8" />
    </Svg>
  );
}
