import { Dimensions, PixelRatio } from 'react-native';

const { width, height } = Dimensions.get('window');
const shortest = Math.min(width, height);

// Design baseline: iPhone 11/13 logical width.
const BASE_WIDTH = 375;

export const isTablet = shortest >= 600;

// Cap content width so the UI doesn't stretch awkwardly on tablets / foldables / web.
export const MAX_CONTENT_WIDTH = isTablet ? 640 : width;

/**
 * Responsive size — scales a value by the device width vs the 375pt baseline,
 * clamped so small phones don't get cramped and tablets don't get huge.
 */
export function rs(size: number): number {
  const ratio = shortest / BASE_WIDTH;
  const clamped = Math.max(0.9, Math.min(1.3, ratio));
  return Math.round(PixelRatio.roundToNearestPixel(size * clamped));
}

export const screen = { width, height, shortest };
