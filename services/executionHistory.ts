/**
 * Butler AI — Execution History Service
 * Records script execution results for the INTEL tab.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@butler_execution_history_v1';
const MAX_ENTRIES = 200;

export interface ExecutionEntry {
  id:        string;
  scriptId:  string;
  scriptName:string;
  output:    string;
  success:   boolean;
  durationMs:number;
  timestamp: number;
}

class ExecutionHistoryService {
  async add(entry: Omit<ExecutionEntry, 'id'>): Promise<void> {
    try {
      const all = await this.getAll();
      const newEntry: ExecutionEntry = {
        ...entry,
        id: `exec_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      };
      const trimmed = [newEntry, ...all].slice(0, MAX_ENTRIES);
      await AsyncStorage.setItem(KEY, JSON.stringify(trimmed));
    } catch {}
  }

  async getAll(): Promise<ExecutionEntry[]> {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  }

  async clear(): Promise<void> {
    try { await AsyncStorage.removeItem(KEY); } catch {}
  }
}

export const executionHistory = new ExecutionHistoryService();
