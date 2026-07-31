/**
 * Butler AI — Haptic Feedback Service · v2 SDK-53-SAFE
 * ──────────────────────────────────────────────────────
 * Lazy wrapper around expo-haptics so the native module is
 * NEVER evaluated at module-load / metro-bundle time.
 * All methods are fire-and-forget and never throw.
 */

function runHaptic(fn: () => Promise<void>): void {
  try { fn().catch(() => {}); } catch {}
}

function getHaptics() {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require('expo-haptics') as typeof import('expo-haptics');
}

export const haptics = {
  /** Light impact — tap feedback */
  light(): void {
    runHaptic(() => getHaptics().impactAsync(getHaptics().ImpactFeedbackStyle.Light));
  },
  /** Medium impact — button press */
  medium(): void {
    runHaptic(() => getHaptics().impactAsync(getHaptics().ImpactFeedbackStyle.Medium));
  },
  /** Heavy impact — destructive action */
  heavy(): void {
    runHaptic(() => getHaptics().impactAsync(getHaptics().ImpactFeedbackStyle.Heavy));
  },
  /** Notification success */
  success(): void {
    runHaptic(() => getHaptics().notificationAsync(getHaptics().NotificationFeedbackType.Success));
  },
  /** Notification warning */
  warning(): void {
    runHaptic(() => getHaptics().notificationAsync(getHaptics().NotificationFeedbackType.Warning));
  },
  /** Notification error */
  error(): void {
    runHaptic(() => getHaptics().notificationAsync(getHaptics().NotificationFeedbackType.Error));
  },
  /** Selection changed */
  selection(): void {
    runHaptic(() => getHaptics().selectionAsync());
  },
};
