/**
 * Butler AI — Logger utility
 * Thin wrapper around console with level filtering.
 */

type Level = 'debug' | 'info' | 'warn' | 'error';

const LEVELS: Record<Level, number> = { debug: 0, info: 1, warn: 2, error: 3 };
const MIN_LEVEL: Level = __DEV__ ? 'debug' : 'warn';

function shouldLog(level: Level): boolean {
  return LEVELS[level] >= LEVELS[MIN_LEVEL];
}

export const logger = {
  debug: (tag: string, ...args: unknown[]) => {
    if (shouldLog('debug')) console.debug(`[${tag}]`, ...args);
  },
  info: (tag: string, ...args: unknown[]) => {
    if (shouldLog('info')) console.info(`[${tag}]`, ...args);
  },
  warn: (tag: string, ...args: unknown[]) => {
    if (shouldLog('warn')) console.warn(`[${tag}]`, ...args);
  },
  error: (tag: string, ...args: unknown[]) => {
    if (shouldLog('error')) console.error(`[${tag}]`, ...args);
  },
};
