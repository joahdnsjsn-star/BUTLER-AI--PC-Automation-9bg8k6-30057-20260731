/**
 * Butler AI — Onboarding State Service · v4 CANONICAL
 * ─────────────────────────────────────────────────────
 * Single source of truth for reading and writing the
 * onboarding-completed flag.
 *
 * STARTUP SAFETY: Never import this at module level from
 * a component that is evaluated during metro bundling.
 * Only _layout.tsx and onboarding.tsx import this directly;
 * all others should use lazy require().
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { ALL_ONBOARDING_WRITE_KEYS, ONBOARDING_DONE_KEY, WELCOME_COMPLETE_KEY, STABLE_STATE_KEY } from '@/constants/onboardingKeys';

// ── In-memory cache ────────────────────────────────────────────────
let _cache: boolean | null = null;

/** Truthy values written by any past build of Butler AI */
const TRUTHY = new Set(['1', 'true', 'done', 'onboarded']);

/**
 * Returns true if the user has already completed onboarding.
 * Reads from cache when available — use clearOnboardingCache()
 * to force a fresh AsyncStorage read.
 */
export async function isOnboardingDone(): Promise<boolean> {
  if (_cache !== null) return _cache;

  try {
    // Check both the v2 canonical key and the v1 legacy key
    const results = await AsyncStorage.multiGet([
      ONBOARDING_DONE_KEY,
      WELCOME_COMPLETE_KEY,
      STABLE_STATE_KEY,
    ]);

    for (const [, value] of results) {
      if (value && TRUTHY.has(value.trim())) {
        _cache = true;
        return true;
      }
    }

    _cache = false;
    return false;
  } catch {
    // AsyncStorage failure — safe fallback to new-user path
    _cache = false;
    return false;
  }
}

/**
 * Writes all onboarding keys atomically (multiSet with individual
 * setItem fallback). Never throws.
 */
export async function markOnboardingDone(): Promise<void> {
  try {
    await AsyncStorage.multiSet(ALL_ONBOARDING_WRITE_KEYS);
  } catch {
    // multiSet failed — fall back to individual writes
    for (const [key, value] of ALL_ONBOARDING_WRITE_KEYS) {
      try { await AsyncStorage.setItem(key, value); } catch {}
    }
  }
  _cache = true;
}

/**
 * Clears the in-memory cache so the next call to isOnboardingDone()
 * re-reads from AsyncStorage.
 * Call this after resetting onboarding state (Settings > Replay Tutorial).
 */
export function clearOnboardingCache(): void {
  _cache = null;
}
