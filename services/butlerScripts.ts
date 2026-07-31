/**
 * Butler AI — Butler Scripts Service
 * Persists user-created automation scripts to AsyncStorage.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const SCRIPTS_KEY = '@butler_scripts_v1';

export interface ButlerScript {
  id:          string;
  name:        string;
  description: string;
  code:        string;
  trigger:     string;
  createdAt:   number;
  updatedAt:   number;
}

async function loadScripts(): Promise<ButlerScript[]> {
  try {
    const raw = await AsyncStorage.getItem(SCRIPTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

async function saveScripts(scripts: ButlerScript[]): Promise<void> {
  try { await AsyncStorage.setItem(SCRIPTS_KEY, JSON.stringify(scripts)); } catch {}
}

export async function saveButlerScript(script: Omit<ButlerScript, 'id' | 'createdAt' | 'updatedAt'>): Promise<ButlerScript> {
  const scripts = await loadScripts();
  const now = Date.now();
  const newScript: ButlerScript = {
    ...script,
    id:        `script_${now}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: now,
    updatedAt: now,
  };
  scripts.push(newScript);
  await saveScripts(scripts);
  return newScript;
}

export async function updateButlerScript(id: string, updates: Partial<ButlerScript>): Promise<void> {
  const scripts = await loadScripts();
  const idx = scripts.findIndex(s => s.id === id);
  if (idx >= 0) {
    scripts[idx] = { ...scripts[idx], ...updates, updatedAt: Date.now() };
    await saveScripts(scripts);
  }
}

export async function deleteButlerScript(id: string): Promise<void> {
  const scripts = await loadScripts();
  await saveScripts(scripts.filter(s => s.id !== id));
}

export async function getAllButlerScripts(): Promise<ButlerScript[]> {
  return loadScripts();
}
