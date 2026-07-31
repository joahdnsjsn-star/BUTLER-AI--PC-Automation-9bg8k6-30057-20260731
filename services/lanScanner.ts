/**
 * Butler AI — LAN Scanner Service
 * Fast probing of known server addresses on the local network.
 */

export interface FoundServer {
  addr:    string;
  version: string | null;
  latency: number;
}

export async function fastProbeLastKnown(addr: string): Promise<FoundServer | null> {
  if (!addr) return null;
  const url = addr.startsWith('http') ? addr : `http://${addr}`;
  const start = Date.now();
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 3000);
    const res = await fetch(`${url}/api/butler/ping`, { signal: ctrl.signal });
    clearTimeout(t);
    if (!res.ok) return null;
    const latency = Date.now() - start;
    let version: string | null = null;
    try { const d = await res.json(); version = d.version ?? null; } catch {}
    return { addr, version, latency };
  } catch { return null; }
}

export async function scanLocalNetwork(
  baseIP: string,
  port = 8765,
  onFound?: (server: FoundServer) => void
): Promise<FoundServer[]> {
  const found: FoundServer[] = [];
  const parts = baseIP.split('.');
  if (parts.length !== 4) return found;
  const prefix = parts.slice(0, 3).join('.');
  const probes = Array.from({ length: 20 }, (_, i) => {
    const ip = `${prefix}.${i + 1}`;
    return fastProbeLastKnown(`${ip}:${port}`).then(s => { if (s) { found.push(s); onFound?.(s); } });
  });
  await Promise.allSettled(probes);
  return found;
}
