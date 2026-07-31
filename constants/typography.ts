/**
 * Butler AI — Typography constants
 */
import { Platform } from 'react-native';

export const FontFamily = {
  mono:      Platform.OS === 'ios' ? 'Menlo-Bold'   : 'monospace',
  monoLight: Platform.OS === 'ios' ? 'Menlo'        : 'monospace',
  sans:      Platform.OS === 'ios' ? 'System'       : 'sans-serif',
  sansBold:  Platform.OS === 'ios' ? 'System'       : 'sans-serif-condensed',
} as const;
