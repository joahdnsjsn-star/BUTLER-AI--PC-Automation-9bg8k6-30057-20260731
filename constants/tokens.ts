/**
 * Butler AI — Design Tokens · constants/tokens.ts
 * Aliases for the NEXUS design system colours and helpers.
 * Used by builder.tsx and other pages that predate constants/design.ts.
 */
import { Platform } from 'react-native';

export const COLOR = {
  bg:       '#060810',
  surf:     '#0C1220',
  surface:  '#0C1220',
  surface2: '#101828',
  border:   'rgba(0,220,255,0.12)',
  border2:  'rgba(0,220,255,0.20)',
  text:     '#D2E8F6',
  textMid:  '#6890A8',
  textDim:  '#304050',
  cyan:     '#00DCFF',
  green:    '#00FF88',
  amber:    '#FFB020',
  danger:   '#FF3333',
  red:      '#FF3333',
  purple:   '#CC44FF',
  magenta:  '#CC44FF',
  teal:     '#00D4AA',
  blue:     '#4A9EFF',
  primary:  '#3C83F6',
  net:      '#00E6A1',
} as const;

export const FONT = {
  mono: Platform.OS === 'ios' ? 'Menlo-Bold' : 'monospace',
  sans: Platform.OS === 'ios' ? 'System' : 'sans-serif',
} as const;

export function glow(color: string, intensity = 0.6) {
  return Platform.select({
    ios: {
      shadowColor: color,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: intensity,
      shadowRadius: 10,
    },
    android: { elevation: Math.round(intensity * 10) },
    default: {},
  });
}

export function hex(color: string, alpha: number): string {
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export const SHADOW = glow;
