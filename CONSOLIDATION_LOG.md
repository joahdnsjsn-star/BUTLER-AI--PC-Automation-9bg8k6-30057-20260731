# Consolidation & Cleanup Log

This file exists so nothing removed or merged in a cleanup pass gets
silently forgotten. Add to it, don't replace it, next time.

## Duplicate pages/files found and consolidated

- **Two full logger implementations existed**: `logger.ts` (repo root) and
  `utils/logger.ts`. Only `utils/logger.ts` was actually imported anywhere
  (root one had zero references). The root version was actually the more
  complete one (better `safeNav` fallback chain, fires onboarding-complete
  globals, tries `router.navigate` as a fallback). **Kept the content,
  moved it into `utils/logger.ts`** (the path everything already imports),
  **deleted the root duplicate**. If you see `import { logger } from
  '@/logger'` anywhere in old branches, it should be `@/utils/logger`.

## Full duplicate sweep (hash-based, whole repo)

Ran an exact byte-content scan across every `.ts`/`.tsx`/`.md`/`.png`/`.jpg`
file in the repo. Found and removed:

- `assets/DATA_SAFETY.md` and `assets/PRIVACY_POLICY.md` — byte-identical
  copies of the root-level files. Removed the `assets/` copies.
- `assets/images/kb-robot-bg.jpg` (dupe of `butler-robot-bg.jpg`, 0 code
  references), `butler_tutorial_hero.jpg` (dupe of `butler_tutorial_guide.jpg`,
  0 references), `butler-ai-shield-main.jpg` (dupe of `butler-ai-shield-logo.jpg`,
  0 references) — all confirmed unused before deleting, siblings kept.
- **Deliberately NOT touched**: `nexus-robot-v2.png`, `nexus-robot-mascot.png`,
  `mascot_shield.png` are also byte-identical to each other, but `main.yml`'s
  own "Verify required assets" step requires all three to exist as separate
  named files. Consolidating them means also rewriting that check and every
  place that imports each name separately — left alone this round, flagged
  as a known exception in the new guard below.

**Guard added**: `main.yml` now runs a "Check for duplicate files" step on
every push to `main` — hashes every code/doc/image file and fails the build
if any two are byte-identical (with an explicit, commented exception for the
three mascot images above). This is the actual answer to "make sure that
doesn't happen again" — it's no longer something a human has to remember to
check.

## Hidden/unreachable pages found and wired in

These all existed as real, fully-built screens with zero way to reach them
from the actual app UI:

- **`app/crash-report.tsx`** — a complete crash/boot-error diagnostics
  screen (its own comment even says "Accessible from Settings > LEGAL &
  HELP" — it wasn't). Added to Settings under a new DIAGNOSTICS section,
  registered in the root Stack as a modal.
- **`app/privacy-policy.tsx`** — existed and worked, but was only reachable
  from onboarding, not from Settings where someone would actually look for
  it later. Added to Settings' LEGAL section, registered in the root Stack.
- (From the previous pass) `app/terms.tsx`, `app/data-safety.tsx`,
  `LegalAboutScreen` — same pattern, already fixed.

## Silent errors — found and fixed (not exhaustive)

`grep -rn "catch {}"` across the app: **275 empty catch blocks total.**
Fixing all of them wasn't feasible in this pass without reviewing each
one's context individually. Fixed the ~15 highest-value ones — the core
connection/execution path, where a silent failure means "PC won't connect"
with zero diagnostic trail:

- `services/serverConnection.ts` — `init()`'s storage-read failure, and a
  broken status-listener callback, both now go through `logger`.
- `services/connectionHub.ts`, `services/connectionPersistence.ts`,
  `services/scriptExecutor.ts` — every empty catch now logs via
  `logger.warn('[filename] error:', e)`.

**Remaining ~260** are mostly UI-layer (haptics fallbacks, animation
cleanup, "don't crash if AsyncStorage.setItem for a cosmetic pref fails")
where silent failure is arguably correct behavior, not a bug. Worth a
second pass if any specific screen is behaving strangely with no visible
error.

## Known issues from the last audit, NOT touched this pass (still open)

- `encryptedStorage.ts` weak crypto (XOR-stream, not real encryption)
- `components/ui/WidgetLayer.tsx`'s `new Function()` eval — currently
  unreachable/unwired, so not exploitable right now, but bad pattern
- ~15 of the ~24 originally-reported missing service-file imports
  (`networkMonitor`, `pcClipboard`, `taskMemory`, etc.) — real files never
  written, not something safe to fabricate blind
- Server-side token enforcement in `butler_server.py` — inside the
  protected/encoded file, deliberately not touched without direct review
