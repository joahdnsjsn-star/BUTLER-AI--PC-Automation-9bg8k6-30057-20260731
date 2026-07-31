/**
 * Butler AI — Safe Clipboard Service
 * Wraps Clipboard API with error handling for all platforms.
 */
import { Platform } from 'react-native';

export async function safeSetClipboard(text: string): Promise<boolean> {
  try {
    if (Platform.OS === 'web') {
      await navigator.clipboard.writeText(text);
      return true;
    }
    const { default: Clipboard } = await import('expo-clipboard');
    await Clipboard.setStringAsync(text);
    return true;
  } catch {
    try {
      // Fallback: react-native Clipboard (deprecated but widely supported)
      const { Clipboard } = require('react-native');
      Clipboard.setString(text);
      return true;
    } catch { return false; }
  }
}

export async function safeGetClipboard(): Promise<string> {
  try {
    if (Platform.OS === 'web') {
      return await navigator.clipboard.readText();
    }
    const { default: Clipboard } = await import('expo-clipboard');
    return await Clipboard.getStringAsync();
  } catch {
    try {
      const { Clipboard } = require('react-native');
      return Clipboard.getString() ?? '';
    } catch { return ''; }
  }
}
