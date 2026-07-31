'use strict';
/**
 * metro-babel-transformer.js — Butler AI · Flow Compat Wrapper v1.0
 *
 * WHY THIS EXISTS
 * ───────────────
 * @expo/metro-config@0.20.15 bundles hermes-parser@0.25.1 and calls its
 * parse() function DIRECTLY in transformSync.js (outside of Babel).
 * React Native 0.79.4 ships Library files (e.g. AppRegistry.js) with Flow
 * type syntax such as multi-line function-type return annotations:
 *
 *   ) => React.ComponentType<any>;
 *
 * hermes-parser@0.25.1 fails to parse these in its default 'detect' mode
 * because the @flow strict-local pragma detection has an edge-case bug with
 * that specific multi-line pattern.  Forcing flow:'all' resolves it.
 *
 * TECHNIQUE
 * ─────────
 * 1. Require the real babel-transformer — this eagerly loads hermes-parser
 *    into Node's require.cache.
 * 2. Walk require.cache to find the hermes-parser dist/index.js export and
 *    monkey-patch its parse() to inject flow:'all' for @flow files.
 * 3. Re-export the real transformer unchanged.
 *
 * Because Node.js caches modules by resolved path, the patched parse()
 * function is seen by all future calls inside transformSync.js's internal
 * hermesParser reference (same object in memory).
 */

// ① Load the real transformer — eagerly caches hermes-parser in require.cache
const realTransformer = require('@expo/metro-config/build/babel-transformer');

// ② Walk require.cache, find hermes-parser's export object and patch parse()
;(function patchHermesParser() {
  try {
    const cacheKeys = Object.keys(require.cache);
    for (let i = 0; i < cacheKeys.length; i++) {
      const key = cacheKeys[i];

      // Only the hermes-parser dist bundle, not the Babel syntax plugin
      if (!key.includes('hermes-parser')) continue;
      if (key.includes('babel-plugin-syntax')) continue;

      const mod = require.cache[key];
      if (!mod) continue;

      const exp = mod.exports;
      if (!exp || typeof exp.parse !== 'function') continue;
      if (exp.__butlerPatched) break; // already done

      const _orig = exp.parse;

      exp.parse = function butlerFlowCompatParse(code, opts) {
        // Force flow:'all' when the file has a @flow pragma (check first 1 KB)
        if (typeof code === 'string' && code.slice(0, 1000).includes('@flow')) {
          return _orig.call(this, code, Object.assign({}, opts, { flow: 'all' }));
        }
        return _orig.call(this, code, opts);
      };

      exp.__butlerPatched = true;
      break; // only one export instance is needed
    }
  } catch (_) {
    // Non-fatal: worst case the parser runs unpatched and we see the original error
  }
})();

// ③ Re-export all transformer APIs unchanged so Metro sees the normal interface
module.exports = realTransformer;
