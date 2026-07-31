/**
 * BUTLER AI™ — XUSLINK™ FRAME PROTOCOL v1
 * © 2024–2026 Shawn P. ALL RIGHTS RESERVED.
 *
 * THE XUSLINK™ FRAME is a PROPRIETARY QR pairing specification.
 * It is documented ONLY in this private codebase. Its presence in any
 * third-party parser is evidence of copying this specification.
 *
 * XUSLINK FRAME v1 — field order (fixed, versioned):
 *   ip          string  — primary LAN IP of the server
 *   allIPs      string[] — all server IP candidates
 *   port        number  — server port
 *   pairingCode string  — one-time HMAC-signed token
 *   version     number  — XUSLINK_FRAME_VERSION (must = 1)
 *   buildId     string  — server BUILD_ID (provenance)
 *   sig         string  — OWNER_SIGNATURE slot (hex, 64 chars)
 *
 * The HMAC scheme, session-key derivation, and House Phrase word list
 * are TRADE SECRETS stored in the server binary only (never in the app).
 *
 * XUSLINK™ is a trademark of Shawn P. No licence is granted by this file.
 */

export const XUSLINK_FRAME_VERSION = 1 as const;
export const XUSLINK_QR_PREFIX     = 'butler://pair?' as const;

/** Parsed XUSLINK™ Frame v1 */
export interface XuslinkFrame {
  ip:          string;
  allIPs:      string[];
  port:        number;
  pairingCode: string;
  version:     typeof XUSLINK_FRAME_VERSION;
  buildId:     string;
  sig:         string;
}

/**
 * Parse and validate a raw QR payload as an XUSLINK™ Frame v1.
 * Returns null if the payload is not a valid XUSLINK frame.
 * Called BEFORE any network request is made (§22.2 pairingGuard).
 */
export function parseXuslinkFrame(raw: string): XuslinkFrame | null {
  if (!raw || typeof raw !== 'string') return null;
  if (!raw.startsWith(XUSLINK_QR_PREFIX)) return null;

  try {
    const params = new URLSearchParams(raw.slice(XUSLINK_QR_PREFIX.length));

    const ip          = params.get('ip');
    const port        = Number(params.get('port'));
    const pairingCode = params.get('code');
    const version     = Number(params.get('v'));
    const buildId     = params.get('bid') ?? '';
    const sig         = params.get('sig') ?? '';
    const allIPsRaw   = params.get('ips');

    if (!ip || !pairingCode) return null;
    if (version !== XUSLINK_FRAME_VERSION) return null;
    if (isNaN(port) || port < 1 || port > 65535) return null;
    if (sig.length !== 64 && sig.length !== 0) return null; // 0 = legacy/dev

    const allIPs = allIPsRaw ? allIPsRaw.split(',').filter(Boolean) : [ip];

    return { ip, allIPs, port, pairingCode, version, buildId, sig };
  } catch { return null; }
}

/**
 * Format a parsed XUSLINK frame for the Key Ceremony™ confirmation screen.
 */
export function formatXuslinkDisplay(frame: XuslinkFrame): {
  serverLabel:  string;
  serverDetail: string;
  buildLabel:   string;
} {
  return {
    serverLabel:  `${frame.ip}:${frame.port}`,
    serverDetail: frame.allIPs.length > 1
      ? `${frame.allIPs.length} network interfaces found`
      : 'Single interface',
    buildLabel:   frame.buildId ? `Build: ${frame.buildId}` : 'Build: unknown',
  };
}
