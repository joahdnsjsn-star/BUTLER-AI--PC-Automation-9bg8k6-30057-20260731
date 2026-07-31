/**
 * Butler AI — JSON Guard Service
 * Validates and diffs imported JSON data before applying changes.
 */

export interface GuardSnapshot {
  timestamp: number;
  data:      Record<string, unknown>;
}

export interface ImportDiff {
  added:   string[];
  removed: string[];
  changed: string[];
}

export interface ImportLogEntry {
  timestamp: number;
  keys:      number;
  diff:      ImportDiff;
  success:   boolean;
}

export interface UndoEntry {
  snapshot: GuardSnapshot;
  label:    string;
}

export interface GuardResult {
  valid:   boolean;
  errors:  string[];
  diff:    ImportDiff;
  preview: Record<string, unknown>;
}

export const jsonGuard = {
  validate(raw: string): GuardResult {
    try {
      const data = JSON.parse(raw);
      if (typeof data !== 'object' || data === null || Array.isArray(data)) {
        return { valid: false, errors: ['JSON must be an object'], diff: { added: [], removed: [], changed: [] }, preview: {} };
      }
      return { valid: true, errors: [], diff: { added: Object.keys(data), removed: [], changed: [] }, preview: data };
    } catch (e: any) {
      return { valid: false, errors: [e?.message ?? 'Invalid JSON'], diff: { added: [], removed: [], changed: [] }, preview: {} };
    }
  },

  diff(before: Record<string, unknown>, after: Record<string, unknown>): ImportDiff {
    const beforeKeys = new Set(Object.keys(before));
    const afterKeys  = new Set(Object.keys(after));
    return {
      added:   [...afterKeys].filter(k => !beforeKeys.has(k)),
      removed: [...beforeKeys].filter(k => !afterKeys.has(k)),
      changed: [...afterKeys].filter(k => beforeKeys.has(k) && JSON.stringify(before[k]) !== JSON.stringify(after[k])),
    };
  },
};
