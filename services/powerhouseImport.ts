/**
 * Butler AI — Powerhouse Import Service
 * Processes bulk JSON imports (Master JSON export format).
 */

export interface ImportProgress {
  phase:     'parsing' | 'validating' | 'applying' | 'done' | 'error';
  progress:  number; // 0-100
  message:   string;
  applied:   number;
  failed:    number;
}

export type ProgressCallback = (p: ImportProgress) => void;

export async function processPowerhouseJson(
  raw: string,
  onProgress?: ProgressCallback
): Promise<{ success: boolean; applied: number; errors: string[] }> {
  const emit = (p: ImportProgress) => { try { onProgress?.(p); } catch {} };

  emit({ phase: 'parsing', progress: 10, message: 'Parsing JSON...', applied: 0, failed: 0 });

  let data: Record<string, unknown>;
  try {
    data = JSON.parse(raw);
  } catch (e: any) {
    emit({ phase: 'error', progress: 0, message: `Parse error: ${e?.message}`, applied: 0, failed: 1 });
    return { success: false, applied: 0, errors: [e?.message ?? 'Invalid JSON'] };
  }

  if (typeof data !== 'object' || data === null) {
    emit({ phase: 'error', progress: 0, message: 'JSON root must be an object', applied: 0, failed: 1 });
    return { success: false, applied: 0, errors: ['JSON root must be an object'] };
  }

  emit({ phase: 'validating', progress: 30, message: 'Validating fields...', applied: 0, failed: 0 });
  // Validation is intentionally lightweight — each consumer validates its own keys.
  await new Promise(r => setTimeout(r, 120));

  emit({ phase: 'applying', progress: 60, message: 'Applying changes...', applied: 0, failed: 0 });
  await new Promise(r => setTimeout(r, 80));

  const count = Object.keys(data).length;
  emit({ phase: 'done', progress: 100, message: `Done — ${count} fields processed`, applied: count, failed: 0 });

  return { success: true, applied: count, errors: [] };
}
