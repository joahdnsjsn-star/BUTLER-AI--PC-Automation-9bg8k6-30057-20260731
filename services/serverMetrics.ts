/**
 * Butler AI — Server Metrics Service
 * Fetches and caches live performance metrics from the PC server.
 */
import { serverConnection } from './serverConnection';

export interface ServerMetrics {
  cpu:    number | null;  // 0-100 %
  ram:    number | null;  // 0-100 %
  disk:   number | null;  // 0-100 %
  uptime: number | null;  // seconds
  temp:   number | null;  // °C
}

const EMPTY: ServerMetrics = { cpu: null, ram: null, disk: null, uptime: null, temp: null };

class ServerMetricsService {
  private _cache: ServerMetrics = EMPTY;
  private _lastFetch = 0;
  private _ttlMs = 5000;

  async fetch(force = false): Promise<ServerMetrics> {
    if (!serverConnection.isConnected()) return EMPTY;
    if (!force && Date.now() - this._lastFetch < this._ttlMs) return this._cache;

    try {
      const addr = serverConnection.addr;
      const url = addr.startsWith('http') ? addr : `http://${addr}`;
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 4000);
      const res = await fetch(`${url}/api/butler/metrics`, { signal: ctrl.signal });
      clearTimeout(t);
      if (!res.ok) return EMPTY;
      const data = await res.json();
      this._cache = {
        cpu:    data.cpu ?? null,
        ram:    data.ram ?? null,
        disk:   data.disk ?? null,
        uptime: data.uptime ?? null,
        temp:   data.temp ?? null,
      };
      this._lastFetch = Date.now();
      return this._cache;
    } catch { return EMPTY; }
  }

  getCached(): ServerMetrics { return this._cache; }
}

export const serverMetrics = new ServerMetricsService();
