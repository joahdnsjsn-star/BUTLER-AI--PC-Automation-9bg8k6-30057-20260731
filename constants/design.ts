/**
 * BUTLER AI — NEXUS DESIGN SYSTEM v1.0
 * Single source of truth for all visual tokens.
 * Every screen imports ONLY from this file.
 */
import { Platform } from 'react-native';

export const D = {
  // ── Backgrounds ─────────────────────────────────────────
  bg:       '#080B11',
  surface:  '#0F121A',
  surface2: '#151923',
  surface3: '#1A1F2E',

  // ── Borders ─────────────────────────────────────────────
  border:   '#1D2334',
  border2:  '#252C41',

  // ── Text ────────────────────────────────────────────────
  text:     '#DEE2ED',
  textMid:  '#8792AB',
  textDim:  '#4F5972',

  // ── Brand ───────────────────────────────────────────────
  primary:  '#3C83F6',
  primaryGlow: '#61A6FA',

  // ── Signals ─────────────────────────────────────────────
  green:  '#10B77A',
  red:    '#EF4343',
  amber:  '#F59F0A',
  violet: '#A855F7',
  cyan:   '#07B6D5',
  pink:   '#EC4699',
  teal:   '#14B8A5',
  orange: '#F3671B',
  net:    '#00E6A1',
} as const;

export const FONT = {
  mono: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  sans: Platform.OS === 'ios' ? 'System' : 'sans-serif',
} as const;

export function alpha(hex: string, a: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
}

export const shadow = (color: string, intensity = 0.6) =>
  Platform.select({
    ios: {
      shadowColor: color,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: intensity,
      shadowRadius: 10,
    },
    android: { elevation: Math.round(intensity * 10) },
    default: {},
  });
