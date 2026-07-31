/**
 * BUTLER AI™ — BUTLER VOICE SERVICE v1.0
 * © 2024–2026 Shawn P. ALL RIGHTS RESERVED.
 *
 * THE BUTLER VOICE is a copyrighted personality expression defined in
 * The Household Protocol™ (Section 25.5 of the master instructions).
 * The persona/prompt files that GENERATE AI replies live server-side only.
 * This file holds only the client-side canonical lexicon — the display
 * strings the user sees. The method of generation is a trade secret.
 *
 * SIX VOICE RULES (enforced by this module):
 *  1. Never exclamation marks.
 *  2. Never emoji in butler dialogue.
 *  3. Never "I can't" — always "I'm afraid I can't" + reason.
 *  4. Never apologise twice for the same thing.
 *  5. Under 20 words unless asked to explain.
 *  6. Never enthusiastic — only satisfied. Highest praise: "That's in order now."
 */

// ── Canonical lexicon (ONLY sanctioned phrasings) ─────────────────────────
// DO NOT substitute generic equivalents. One wrong word on one screen
// collapses the trade-dress argument.

export const BUTLER_VOICE = {
  // ── Connection states ───────────────────────────────────────────────────
  connected:          'XUSLINK™ ESTABLISHED',
  standby:            'XUSLINK™ STANDBY',
  scanning:           'SCANNING YOUR NETWORK',
  identityChanged:    'XUSLINK™ IDENTITY CHANGED',
  staleLink:          'PAIRED 34 DAYS AGO · RE-PAIR RECOMMENDED',

  // ── Memory / KB ─────────────────────────────────────────────────────────
  factRetained:       'RETAINED',
  factsRestored:      'RESTORED',
  piiRedacted:        'SAVED · PII REDACTED',
  noFacts:            'NO FACTS YET — CHAT TO TEACH ME',
  forgotten:          "Forgotten. It won't come up again.",
  wipeAllFacts:       'WIPE ALL FACTS',

  // ── Script execution ─────────────────────────────────────────────────────
  holdToConfirm:      'HOLD TO CONFIRM',
  executionBlocked:   'EXECUTION BLOCKED',
  silviceService:     (description: string): string =>
    `You'd like me to ${description}. Shall I?`,

  // ── Privacy ──────────────────────────────────────────────────────────────
  zeroBytesLeft:      '0 BYTES LEFT THIS DEVICE',
  outboundSession:    (bytes: number): string => `OUTBOUND THIS SESSION: ${bytes}`,
  outbound30Days:     (bytes: number): string => `30 DAYS: ${bytes}`,
  vaultproofEmpty:    "NOTHING TO SHOW — THAT'S THE POINT",

  // ── Offline / errors ─────────────────────────────────────────────────────
  serverUnreachable:  'SERVER UNREACHABLE — RETRYING',
  systemFault:        'SYSTEM FAULT',
  safeMode:           'SAFE MODE (no animations)',

  // ── Notice (dismissal) ───────────────────────────────────────────────────
  noticePending:      "Very good. I'll burn the day book and leave the keys.",
  noticeComplete:     'Dismissed.',

  // ── Empty states (never generic) ─────────────────────────────────────────
  noDataStreams:      'NO DATA STREAMS',
  noActiveTransfers:  'NO ACTIVE TRANSFERS',
  noThreats:          'NO THREATS DETECTED',

  // ── Success / completion ─────────────────────────────────────────────────
  done:               'Done.',
  inOrder:            "That's in order now.",
  savedToMemory:      'SAVED TO MEMORY',

  // ── Day Book ─────────────────────────────────────────────────────────────
  refusedAction:      (reason: string): string =>
    `I'm afraid I can't — ${reason}`,
  whileYouWereOut:    (rounds: number, report: string): string =>
    rounds === 0
      ? `While you were out: ${rounds} rounds completed. Nothing to report.`
      : `While you were out: ${rounds} rounds completed. One thing, if I may — ${report}.`,

  // ── FITCORE™ reveal ──────────────────────────────────────────────────────
  fitcoreMatch:       (model: string, tier: string): string =>
    `FITCORE MATCH: ${model} — BUILT FOR THIS MACHINE · TIER ${tier}`,
  fitcoreNewMatch:    'FITCORE: NEW MATCH AVAILABLE',
} as const;

// ── Vocabulary enforcement (never say → always say) ──────────────────────
export const BANNED_PHRASES: ReadonlyArray<{ banned: string; use: string }> = [
  { banned: 'Onboarding',         use: 'The Interview'       },
  { banned: 'Accept terms',       use: 'The Hiring'          },
  { banned: 'Pair',               use: 'The Key Ceremony'    },
  { banned: 'Connect',            use: 'XUSLINK'             },
  { banned: 'Verification code',  use: 'The House Phrase'    },
  { banned: 'API call',           use: 'a ring'              },
  { banned: 'Health check',       use: 'The Rounds'          },
  { banned: 'Run command',        use: 'Silver Service'      },
  { banned: 'Execute',            use: 'Silver Service'      },
  { banned: 'Knowledge base',     use: 'The Pantry'          },
  { banned: 'AI Memory',          use: 'BUTLER MIND'         },
  { banned: 'Logs',               use: 'The Day Book'        },
  { banned: 'History',            use: 'The Day Book'        },
  { banned: 'Factory reset',      use: 'Notice'              },
  { banned: 'Wipe',               use: 'Notice'              },
  { banned: 'Server',             use: 'The House'           },
  { banned: 'Phone app',          use: 'The Bell'            },
  { banned: 'Error',              use: "I'm afraid…"         },
  { banned: 'Success!',           use: 'Done.'               },
  { banned: 'Connected',          use: 'XUSLINK ESTABLISHED' },
  { banned: 'Offline',            use: 'XUSLINK STANDBY'     },
  { banned: 'Saved',              use: 'Retained'            },
  { banned: 'Loaded',             use: 'Restored'            },
] as const;
