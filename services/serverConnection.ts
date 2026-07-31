/**
 * Butler AI — Server Connection Service
 * Manages the persistent WebSocket/HTTP connection to the local PC server.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const SERVER_ADDR_KEY = '@butler_server_addr_v2';

export interface ServerStatus {
  connected:   boolean;
  addr:        string;
  version:     string | null;
  latencyMs:   number | null;
  lastSeen:    number | null;
}

class ServerConnectionService {
  private _addr = '';
  private _connected = false;
  private _listeners: Array<(s: ServerStatus) => void> = [];

  get isConnected()  { return this._connected; }
  get addr()         { return this._addr; }

  async init(): Promise<void> {
    try {
      const addr = await AsyncStorage.getItem(SERVER_ADDR_KEY);
      if (addr) this._addr = addr;
    } catch {}
  }

  async connect(addr: string): Promise<boolean> {
    try {
      const url = addr.startsWith('http') ? addr : `http://${addr}`;
      const ctrl = new AbortController();
      const timeout = setTimeout(() => ctrl.abort(), 7000);
      const res = await fetch(`${url}/api/butler/ping`, { signal: ctrl.signal });
      clearTimeout(timeout);
      this._connected = res.ok;
      this._addr = addr;
      if (res.ok) await AsyncStorage.setItem(SERVER_ADDR_KEY, addr);
      this._notify();
      return res.ok;
    } catch {
      this._connected = false;
      this._notify();
      return false;
    }
  }

  disconnect(): void {
    this._connected = false;
    this._notify();
  }

  subscribe(fn: (s: ServerStatus) => void): () => void {
    this._listeners.push(fn);
    return () => { this._listeners = this._listeners.filter(l => l !== fn); };
  }

  getStatus(): ServerStatus {
    return {
      connected: this._connected,
      addr:      this._addr,
      version:   null,
      latencyMs: null,
      lastSeen:  this._connected ? Date.now() : null,
    };
  }

  async execute(script: string): Promise<{ ok: boolean; output: string }> {
    if (!this._connected) return { ok: false, output: 'Not connected' };
    try {
      const url = this._addr.startsWith('http') ? this._addr : `http://${this._addr}`;
      const ctrl = new AbortController();
      const timeout = setTimeout(() => ctrl.abort(), 30000);
      const res = await fetch(`${url}/api/butler/execute`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ script }),
        signal:  ctrl.signal,
      });
      clearTimeout(timeout);
      const data = await res.json();
      return { ok: res.ok, output: data.output ?? data.error ?? '' };
    } catch (e: any) {
      return { ok: false, output: e?.message ?? 'Request failed' };
    }
  }

  private _notify(): void {
    const s = this.getStatus();
    this._listeners.forEach(fn => { try { fn(s); } catch {} });
  }
}

export const serverConnection = new ServerConnectionService();
