/**
 * Butler AI — Server Connection Service
 * Manages the persistent WebSocket/HTTP connection to the local PC server.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { validatePairingTarget } from './pairingGuard';
import { logger } from '@/utils/logger';

const SERVER_ADDR_KEY  = '@butler_server_addr_v2';
const TOKEN_KEY         = '@butler_server_token_v1';
const DEVICE_ID_KEY      = '@butler_device_id_v1';

export interface ServerStatus {
  connected:   boolean;
  addr:        string;
  version:     string | null;
  latencyMs:   number | null;
  lastSeen:    number | null;
}

function genDeviceId(): string {
  return 'dev-' + Array.from({ length: 24 }, () => Math.floor(Math.random() * 36).toString(36)).join('');
}

class ServerConnectionService {
  private _addr = '';
  private _connected = false;
  private _token = '';
  private _deviceId = '';
  private _listeners: Array<(s: ServerStatus) => void> = [];

  addr_get()          { return this._addr; }
  get addr()           { return this._addr; }

  /** Called as a function everywhere in the app: `serverConnection.isConnected()`. */
  isConnected(): boolean { return this._connected; }

  getIP(): string {
    return this._addr.replace(/^https?:\/\//, '').split(':')[0] || '';
  }

  getPort(): string {
    const parts = this._addr.replace(/^https?:\/\//, '').split(':');
    return parts[1] || '';
  }

  getToken(): string { return this._token; }

  getDeviceId(): string { return this._deviceId; }

  async init(): Promise<void> {
    try {
      const [addr, token, deviceId] = await Promise.all([
        AsyncStorage.getItem(SERVER_ADDR_KEY),
        AsyncStorage.getItem(TOKEN_KEY),
        AsyncStorage.getItem(DEVICE_ID_KEY),
      ]);
      if (addr) this._addr = addr;
      if (token) this._token = token;
      if (deviceId) {
        this._deviceId = deviceId;
      } else {
        this._deviceId = genDeviceId();
        await AsyncStorage.setItem(DEVICE_ID_KEY, this._deviceId).catch(() => {});
      }
    } catch (e) {
      logger.error('[serverConnection] init() failed to load saved connection state:', e);
    }
  }

  /**
   * Full pairing flow used by the QR/manual-entry screens. Enforced LAN-only
   * at this layer (not just in the UI) so no caller can bypass the guard by
   * skipping a validation step — this is the fix for the RemoteAccessCard
   * bypass: even if a UI component accepts a public URL, this refuses it.
   */
  async pair(
    ip: string,
    port: string,
    pairingCode: string,
    save: boolean = true,
    appSig: string = '',
  ): Promise<{ ok: boolean; reason?: string; warn?: string }> {
    const verdict = validatePairingTarget(ip, port);
    if (!verdict.ok) {
      return { ok: false, reason: verdict.reason };
    }

    try {
      const url = `http://${ip}:${port}`;
      const ctrl = new AbortController();
      const timeout = setTimeout(() => ctrl.abort(), 10000);
      const res = await fetch(`${url}/api/butler/pair`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ pairingCode, deviceId: this._deviceId, appSig }),
        signal:  ctrl.signal,
      });
      clearTimeout(timeout);
      if (!res.ok) return { ok: false, reason: `Server rejected pairing (${res.status}).` };

      const data = await res.json().catch(() => ({} as any));
      const token = data?.token ?? '';
      const addr  = `${ip}:${port}`;

      this._addr = addr;
      this._token = token;
      this._connected = true;

      if (save) {
        await AsyncStorage.setItem(SERVER_ADDR_KEY, addr).catch(() => {});
        if (token) await AsyncStorage.setItem(TOKEN_KEY, token).catch(() => {});
      }

      this._notify();
      return { ok: true, warn: (verdict as any).warn };
    } catch (e: any) {
      return { ok: false, reason: e?.message ?? 'Pairing request failed.' };
    }
  }

  async connect(addr: string): Promise<boolean> {
    // Same LAN-only enforcement for the simpler reconnect path.
    const [ip, port] = addr.replace(/^https?:\/\//, '').split(':');
    if (ip && port) {
      const verdict = validatePairingTarget(ip, port);
      if (!verdict.ok) {
        this._connected = false;
        this._notify();
        return false;
      }
    }
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
        headers: {
          'Content-Type': 'application/json',
          ...(this._token ? { Authorization: `Bearer ${this._token}` } : {}),
        },
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
    this._listeners.forEach(fn => { try { fn(s); } catch (e) { logger.warn('[serverConnection] a status listener threw:', e); } });
  }
}

export const serverConnection = new ServerConnectionService();
