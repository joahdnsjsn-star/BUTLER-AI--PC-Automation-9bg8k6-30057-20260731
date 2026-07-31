/**
 * Butler AI — Safe Schedule Engine
 * Manages scheduled automation tasks (time-based triggers).
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@butler_safe_schedule_v1';

export type SafeTask =
  | 'DAILY_BACKUP'
  | 'DISK_CLEANUP'
  | 'SYSTEM_REPORT'
  | 'NETWORK_SCAN'
  | 'CUSTOM';

export interface PendingTask {
  id:         string;
  task:       SafeTask;
  label:      string;
  scheduledAt:number;
  interval:   number; // ms
  enabled:    boolean;
  lastRunAt:  number | null;
}

export interface AuditEntry {
  taskId:    string;
  runAt:     number;
  success:   boolean;
  output:    string;
}

export const SAFE_TASKS: SafeTask[] = [
  'DAILY_BACKUP',
  'DISK_CLEANUP',
  'SYSTEM_REPORT',
  'NETWORK_SCAN',
  'CUSTOM',
];

class SafeScheduleEngine {
  async getTasks(): Promise<PendingTask[]> {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  }

  async addTask(task: Omit<PendingTask, 'id' | 'lastRunAt'>): Promise<PendingTask> {
    const tasks = await this.getTasks();
    const newTask: PendingTask = {
      ...task,
      id:        `task_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      lastRunAt: null,
    };
    tasks.push(newTask);
    await AsyncStorage.setItem(KEY, JSON.stringify(tasks));
    return newTask;
  }

  async removeTask(id: string): Promise<void> {
    const tasks = await this.getTasks();
    await AsyncStorage.setItem(KEY, JSON.stringify(tasks.filter(t => t.id !== id)));
  }

  async updateTask(id: string, updates: Partial<PendingTask>): Promise<void> {
    const tasks = await this.getTasks();
    const idx = tasks.findIndex(t => t.id === id);
    if (idx >= 0) {
      tasks[idx] = { ...tasks[idx], ...updates };
      await AsyncStorage.setItem(KEY, JSON.stringify(tasks));
    }
  }
}

export const safeScheduleEngine = new SafeScheduleEngine();
