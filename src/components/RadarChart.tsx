import React from 'react';
import { View } from 'react-native';
import Svg, { Polygon, Line, Circle, Text as SvgText, G } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';

export interface RadarDatum { label: string; value: number } // value 0-100

interface Props {
  data: RadarDatum[];
  size?: number;
  fill?: string;
  stroke?: string;
}

/**
 * Lightweight radar/spider chart (no chart lib needed — pure react-native-svg).
 * Best for 3+ axes. Values are 0-100.
 */
export default function RadarChart({ data, size = 260, fill = 'rgba(61,82,201,0.35)', stroke }: Props) {
  const colors = useTheme();
  const strokeColor = stroke ?? colors.cyan;
  const n = data.length;
  if (n < 3) return null;

  const cx = size / 2;
  const cy = size / 2;
  const R = size / 2 - 52; // leave room for labels + their value underneath
  const rings = [0.25, 0.5, 0.75, 1];

  // angle for axis i (start at top, clockwise)
  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const point = (i: number, r: number) => ({
    x: cx + Math.cos(angle(i)) * r,
    y: cy + Math.sin(angle(i)) * r,
  });

  const ringPolygon = (frac: number) =>
    data.map((_, i) => { const p = point(i, R * frac); return `${p.x},${p.y}`; }).join(' ');

  const valuePolygon = data
    .map((d, i) => { const p = point(i, R * (Math.max(0, Math.min(100, d.value)) / 100)); return `${p.x},${p.y}`; })
    .join(' ');

  return (
    <View style={{ alignItems: 'center' }}>
      <Svg width={size} height={size}>
        {/* grid rings */}
        {rings.map((frac) => (
          <Polygon
            key={frac}
            points={ringPolygon(frac)}
            fill="none"
            stroke={colors.borderLight}
            strokeWidth={1}
          />
        ))}
        {/* spokes */}
        {data.map((_, i) => {
          const p = point(i, R);
          return <Line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke={colors.borderLight} strokeWidth={1} />;
        })}
        {/* value area */}
        <Polygon points={valuePolygon} fill={fill} stroke={strokeColor} strokeWidth={2} />
        {/* value vertices */}
        {data.map((d, i) => {
          const p = point(i, R * (Math.max(0, Math.min(100, d.value)) / 100));
          return <Circle key={i} cx={p.x} cy={p.y} r={3.5} fill={strokeColor} />;
        })}
        {/* axis labels — always center-anchored so they extend symmetrically
            and stay within the SVG bounds (outward anchoring clipped long names) */}
        {data.map((d, i) => {
          const a = angle(i);
          const lx = cx + Math.cos(a) * (R + 16);
          const ly = cy + Math.sin(a) * (R + 16);
          const sin = Math.sin(a);
          const vy = sin > 0.3 ? 10 : sin < -0.3 ? -3 : 4; // nudge above/below the vertex
          const label = d.label.length > 12 ? `${d.label.slice(0, 11)}…` : d.label;
          return (
            <G key={`l${i}`}>
              <SvgText x={lx} y={ly + vy} fill={colors.textSecondary} fontSize={10} fontWeight="600" textAnchor="middle">
                {label}
              </SvgText>
              <SvgText x={lx} y={ly + vy + 12} fill={colors.textSubtle} fontSize={9} textAnchor="middle">
                {Math.round(d.value)}
              </SvgText>
            </G>
          );
        })}
      </Svg>
    </View>
  );
}
