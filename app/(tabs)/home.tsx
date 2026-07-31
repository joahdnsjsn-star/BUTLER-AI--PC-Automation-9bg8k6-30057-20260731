/**
 * BUTLER AI — HOME v3.0
 * Centered single-line header, reference-image 2×2 grid, download CTA,
 * file transfer quick zone, metrics strip, alerts panel.
 * © 2026 Andrej Sladkovic — ALL RIGHTS RESERVED
 */
import React, {
  useState, useEffect, useRef, useCallback, useMemo, memo,
} from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated, Platform, Dimensions, Linking, RefreshControl,
} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Line, Circle } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { TabErrorBoundary } from '@/components/ui/TabErrorBoundary';
import { serverConnection } from '@/services/serverConnection';
import { knowledgeAccumulator } from '@/services/knowledgeAccumulator';
import { haptics } from '@/services/haptics';

// ── Palette ──────────────────────────────────────────────────────
const BG    = '#060D18';
const SURF  = '#0A1520';
const SURF2 = '#0D1C2C';
const CYAN  = '#00E5FF';
const GREEN = '#00FF9D';
const AMBER = '#FFB020';
const RED   = '#FF3D5A';
const PURP  = '#CC44FF';
const BLUE  = '#4A8DFF';
const TEAL  = '#00CCBB';
const DIM   = '#1A2E44';
const MID   = '#4A6880';
const TEXT  = '#D0E8F4';
const MONO: any = Platform.OS === 'ios' ? 'Menlo-Bold' : 'monospace';
const SW    = Math.max(320, Dimensions.get('window').width);
const HALF  = (SW - 32 - 10) / 2;

// ── PulseDot ─────────────────────────────────────────────────────
const PulseDot = memo(({ color, size = 7, delay = 0 }: { color: string; size?: number; delay?: number }) => {
  const a = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.delay(delay),
      Animated.timing(a, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(a, { toValue: 0.2, duration: 700, useNativeDriver: true }),
    ]));
    loop.start(); return () => loop.stop();
  }, []);
  return <Animated.View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color, opacity: a }} />;
});

// ══════════════════════════════════════════════════════════════════
// HEADER — compact, single-line, centered "BUTLER AI"
// ══════════════════════════════════════════════════════════════════
const HomeHeader = memo(({ safeTop, isConn, onPair }: {
  safeTop: number; isConn: boolean; onPair: () => void;
}) => {
  const [time, setTime] = useState('--:--:--');
  const scanX = useRef(new Animated.Value(-SW)).current;
  const glowA = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const tick = () => {
      const n = new Date();
      setTime(`${String(n.getHours()).padStart(2, '0')}:${String(n.getMinutes()).padStart(2, '0')}:${String(n.getSeconds()).padStart(2, '0')}`);
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(scanX, { toValue: SW + 100, duration: 2800, useNativeDriver: true }),
      Animated.timing(scanX, { toValue: -SW, duration: 0, useNativeDriver: true }),
      Animated.delay(5000),
    ]));
    loop.start(); return () => loop.stop();
  }, []);

  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(glowA, { toValue: 1, duration: 1800, useNativeDriver: false }),
      Animated.timing(glowA, { toValue: 0.2, duration: 1800, useNativeDriver: false }),
    ]));
    loop.start(); return () => loop.stop();
  }, []);

  const cc = isConn ? GREEN : AMBER;

  return (
    <View style={[H.root, { paddingTop: safeTop + 2 }]}>
      {/* 5-color accent stripe */}
      <View style={H.stripe}>
        {[CYAN, PURP, AMBER, GREEN, BLUE].map((c, i) => (
          <View key={i} style={{ flex: 1, backgroundColor: c }} />
        ))}
      </View>
      {/* Scan shimmer */}
      <Animated.View pointerEvents="none" style={[H.scan, { transform: [{ translateX: scanX }] }]} />

      {/* CENTERED brand row */}
      <View style={H.centerRow}>
        <MaterialCommunityIcons name="robot-happy" size={19} color={CYAN} />
        <Text style={H.brand}> BUTLER</Text>
        <Text style={[H.brand, { color: CYAN }]}> AI</Text>
        <TouchableOpacity onPress={() => { haptics.medium(); onPair(); }} activeOpacity={0.8}
          style={[H.statusPill, { borderColor: cc + '70', backgroundColor: cc + '10', marginLeft: 10 }]}>
          <PulseDot color={cc} size={5} />
          <Text style={[H.statusTxt, { color: cc }]}>{isConn ? 'LIVE' : 'PAIR PC'}</Text>
        </TouchableOpacity>
      </View>

      {/* Centered sub-row */}
      <View style={H.subLine}>
        <Text style={H.subTxt}>{time}</Text>
        <View style={H.dot} />
        <Text style={H.subTxt}>v7.3</Text>
        <View style={H.dot} />
        <Text style={H.subTxt}>LOCAL · ZERO CLOUD</Text>
      </View>

      {/* Glow divider */}
      <Animated.View style={[H.glowDiv, { opacity: glowA }]} />
    </View>
  );
});

const H = StyleSheet.create({
  root:       { backgroundColor: '#060D18', overflow: 'hidden', alignItems: 'center',
    ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.55, shadowRadius: 12 }, android: { elevation: 9 } }) },
  stripe:     { height: 3.5, flexDirection: 'row', width: '100%' },
  scan:       { position: 'absolute', top: 0, bottom: 0, width: 90, backgroundColor: CYAN + '09' },
  centerRow:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingTop: 10, paddingBottom: 5, paddingHorizontal: 16 },
  brand:      { fontSize: 22, fontWeight: '900', color: '#FFF', letterSpacing: 0.5 },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1.5, borderRadius: 20, paddingHorizontal: 9, paddingVertical: 4 },
  statusTxt:  { fontFamily: MONO, fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },
  subLine:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingBottom: 9 },
  subTxt:     { fontFamily: MONO, fontSize: 8.5, color: MID, letterSpacing: 0.5 },
  dot:        { width: 3, height: 3, borderRadius: 1.5, backgroundColor: DIM },
  glowDiv:    { height: 1.5, width: '100%', backgroundColor: CYAN },
});

// ══════════════════════════════════════════════════════════════════
// 2×2 TELEMETRY GRID — Reference image style, large bold status text
// ══════════════════════════════════════════════════════════════════
const MiniBarChart = memo(({ bars, color, h = 30 }: { bars: number[]; color: string; h?: number }) => (
  <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 2, height: h, flex: 1 }}>
    {bars.map((v, i) => (
      <View key={i} style={{ flex: 1, height: Math.max(2, (v / 100) * h), borderRadius: 2,
        backgroundColor: i === bars.length - 1 ? color + 'EE' : color + '30' }} />
    ))}
  </View>
));

// Reusable big-text telemetry card (matches reference image)
const TCard = memo(({ label, icon, color, bigText, sub, onPress, children, h = 160 }: {
  label: string; icon: string; color: string;
  bigText: string; sub: string; onPress?: () => void;
  children?: React.ReactNode; h?: number;
}) => {
  const scaleA = useRef(new Animated.Value(1)).current;
  const handlePressIn = () => {
    if (!onPress) return;
    Animated.timing(scaleA, { toValue: 0.96, duration: 70, useNativeDriver: true }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scaleA, { toValue: 1, tension: 300, friction: 10, useNativeDriver: true }).start();
  };
  return (
    <TouchableOpacity activeOpacity={onPress ? 0.85 : 1} onPressIn={handlePressIn}
      onPressOut={handlePressOut} onPress={() => { onPress?.(); haptics.medium(); }}
      style={{ width: HALF }}>
      <Animated.View style={[TC.card, { borderTopColor: color, borderColor: color + '28', height: h, transform: [{ scale: scaleA }] }]}>
        <View style={TC.hdr}>
          <MaterialCommunityIcons name={icon as any} size={11} color={color} />
          <Text style={[TC.hdrTxt, { color }]}>{label}</Text>
          <View style={{ flex: 1 }} />
          <PulseDot color={color} size={6} />
        </View>
        <Text style={[TC.bigTxt, { color }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.5}>
          {bigText}
        </Text>
        <Text style={TC.subTxt} numberOfLines={1}>{sub}</Text>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
});
const TC = StyleSheet.create({
  card:   { backgroundColor: SURF, borderRadius: 16, borderWidth: 1.5, borderTopWidth: 3,
    padding: 12, gap: 3,
    ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 10 }, android: { elevation: 4 } }) },
  hdr:    { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 2 },
  hdrTxt: { fontFamily: MONO, fontSize: 8.5, fontWeight: '900', letterSpacing: 0.8 },
  bigTxt: { fontFamily: MONO, fontSize: 36, fontWeight: '900', letterSpacing: -1, lineHeight: 42 },
  subTxt: { fontFamily: MONO, fontSize: 9.5, color: MID, lineHeight: 13 },
});

const PCCard = memo(({ isConn, cpu, ram, onPair }: {
  isConn: boolean; cpu: number; ram: number; onPair: () => void;
}) => (
  <TCard label="CONNECTED PC" icon="desktop-classic" color={isConn ? GREEN : AMBER}
    bigText={isConn ? 'ONLINE' : 'OFFLINE'}
    sub={isConn ? 'Butler Server Active' : 'Tap PAIR to connect'}
    onPress={onPair}
  >
    <View style={{ flexDirection: 'row', gap: 14, marginTop: 6 }}>
      <View>
        <Text style={{ fontFamily: MONO, fontSize: 8, color: MID }}>CPU</Text>
        <Text style={{ fontFamily: MONO, fontSize: 15, color: isConn ? GREEN : DIM, fontWeight: '900' }}>
          {isConn ? `${Math.round(cpu)}%` : '—'}
        </Text>
      </View>
      <View>
        <Text style={{ fontFamily: MONO, fontSize: 8, color: MID }}>RAM</Text>
        <Text style={{ fontFamily: MONO, fontSize: 15, color: isConn ? CYAN : DIM, fontWeight: '900' }}>
          {isConn ? `${Math.round(ram)}%` : '—'}
        </Text>
      </View>
    </View>
  </TCard>
));

const LiveFeedCard = memo(({ isConn }: { isConn: boolean }) => {
  const bars = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => 15 + i * 5.5 + Math.random() * 18), []);
  return (
    <TCard label="LIVE FEED" icon="pulse" color={PURP}
      bigText={isConn ? 'ACTIVE' : 'STANDBY'}
      sub={isConn ? 'Data streaming live' : 'Awaiting connection'}
    >
      <MiniBarChart bars={bars} color={isConn ? PURP : DIM} />
    </TCard>
  );
});

const CrawlerCard = memo(({ isConn, kbCount }: { isConn: boolean; kbCount: number }) => {
  const bars = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => 8 + i * 6.5 + Math.random() * 14), []);
  const entities = isConn && kbCount > 0 ? kbCount * 1000 : 0;
  const fmt = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(0)}K` : (n === 0 ? '—' : String(n));
  return (
    <TCard label="CRAWLER GRAPH" icon="chart-timeline-variant" color={TEAL}
      bigText={fmt(entities)}
      sub="ENTITIES INDEXED"
    >
      <MiniBarChart bars={bars} color={isConn ? TEAL : DIM} />
    </TCard>
  );
});

const KBCard = memo(({ isConn, kbCount }: { isConn: boolean; kbCount: number }) => {
  const fmt = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(0)}K` : (n === 0 ? '—' : String(n));
  const CATS = [
    { l: 'Py', c: CYAN }, { l: 'Sys', c: GREEN }, { l: 'Net', c: AMBER }, { l: 'AI', c: PURP }
  ];
  return (
    <TCard label="KNOWLEDGE" icon="brain" color={GREEN}
      bigText={fmt(isConn && kbCount > 0 ? kbCount : 0)}
      sub="FACTS INDEXED"
    >
      <View style={{ flexDirection: 'row', gap: 4, marginTop: 5 }}>
        {CATS.map(c => (
          <View key={c.l} style={{ borderWidth: 1.5, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2,
            borderColor: c.c + (isConn ? '55' : '18'), backgroundColor: c.c + (isConn ? '10' : '04') }}>
            <Text style={{ fontFamily: MONO, fontSize: 9, fontWeight: '900', color: isConn ? c.c : MID }}>{c.l}</Text>
          </View>
        ))}
      </View>
    </TCard>
  );
});

// ══════════════════════════════════════════════════════════════════
// QUICK ACTIONS — 6 icon buttons
// ══════════════════════════════════════════════════════════════════
const QUICK_ACTIONS = [
  { icon: 'qr-code-scanner',  label: 'PAIR',    tab: 'connect',   color: TEAL  },
  { icon: 'robot-happy',      label: 'AI CHAT', tab: 'butler',    color: PURP  },
  { icon: 'code-braces',      label: 'SCRIPTS', tab: 'scripts',   color: CYAN  },
  { icon: 'folder-network',   label: 'FILES',   tab: 'fileshare', color: AMBER },
  { icon: 'chart-bar',        label: 'LOGS',    tab: 'logs',      color: BLUE  },
  { icon: 'brain',            label: 'KB',      tab: 'knowledge', color: GREEN },
] as const;

const QuickActions = memo(({ goToTab }: { goToTab: (t: string) => void }) => (
  <View style={{ flexDirection: 'row', gap: 6 }}>
    {QUICK_ACTIONS.map((a, i) => (
      <TouchableOpacity key={i}
        onPress={() => { haptics.light(); goToTab(a.tab); }}
        activeOpacity={0.82}
        style={{ flex: 1, alignItems: 'center', gap: 5, paddingVertical: 10,
          borderWidth: 1.5, borderRadius: 12, borderColor: a.color + '38', backgroundColor: a.color + '08' }}>
        <MaterialCommunityIcons name={a.icon as any} size={19} color={a.color} />
        <Text style={{ fontFamily: MONO, fontSize: 6.5, fontWeight: '900', color: a.color + 'AA' }}>
          {a.label}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
));

// ══════════════════════════════════════════════════════════════════
// DOWNLOAD SERVER CTA
// ══════════════════════════════════════════════════════════════════
const DownloadCTA = memo(({ goToTab }: { goToTab: (t: string) => void }) => {
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1.02, duration: 1500, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 1, duration: 1500, useNativeDriver: true }),
    ]));
    loop.start(); return () => loop.stop();
  }, []);
  return (
    <Animated.View style={{ transform: [{ scale: pulse }] }}>
      <TouchableOpacity
        onPress={() => {
          haptics.heavy();
          Linking.openURL('https://github.com/shawnjan-cmd/butler-server/releases/latest').catch(() => goToTab('connect'));
        }}
        activeOpacity={0.87}
        style={[DL.card, { borderColor: CYAN + '55', backgroundColor: CYAN + '09' }]}>
        <View style={[DL.iconBox, { borderColor: CYAN + '55', backgroundColor: CYAN + '16' }]}>
          <MaterialCommunityIcons name="download-circle-outline" size={30} color={CYAN} />
        </View>
        <View style={{ flex: 1, gap: 3 }}>
          <Text style={DL.title}>DOWNLOAD SERVER</Text>
          <Text style={DL.sub}>butler_server.py · Free · Open Source · Auto-Setup</Text>
          <View style={{ flexDirection: 'row', gap: 5, marginTop: 3 }}>
            {['LAN ONLY', 'AES-256', 'ZERO CLOUD', 'FREE'].map((b, i) => (
              <View key={i} style={{ borderWidth: 1, borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2, borderColor: CYAN + '30' }}>
                <Text style={{ fontFamily: MONO, fontSize: 6.5, color: CYAN + '70', fontWeight: '900' }}>{b}</Text>
              </View>
            ))}
          </View>
        </View>
        <MaterialIcons name="open-in-new" size={18} color={CYAN + '70'} />
      </TouchableOpacity>
    </Animated.View>
  );
});
const DL = StyleSheet.create({
  card:    { borderWidth: 1.5, borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12,
    ...Platform.select({ ios: { shadowColor: CYAN, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 8 }, android: { elevation: 3 } }) },
  iconBox: { width: 54, height: 54, borderRadius: 15, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  title:   { fontFamily: MONO, fontSize: 14, fontWeight: '900', color: TEXT },
  sub:     { fontFamily: MONO, fontSize: 9, color: MID },
});

// ══════════════════════════════════════════════════════════════════
// SYSTEM METRICS STRIP
// ══════════════════════════════════════════════════════════════════
const MetricsStrip = memo(({ isConn, cpu, ram, disk }: {
  isConn: boolean; cpu: number; ram: number; disk: number;
}) => {
  const items = [
    { l: 'CPU',  v: cpu,  c: CYAN  },
    { l: 'RAM',  v: ram,  c: GREEN },
    { l: 'DISK', v: disk, c: AMBER },
  ];
  return (
    <View style={MS.root}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
        <MaterialCommunityIcons name="chip" size={11} color={CYAN} />
        <Text style={{ fontFamily: MONO, fontSize: 9, color: CYAN + '90', fontWeight: '900', letterSpacing: 1.5, marginLeft: 6, flex: 1 }}>
          SYSTEM METRICS
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
          <PulseDot color={isConn ? GREEN : AMBER} size={5} />
          <Text style={{ fontFamily: MONO, fontSize: 8, color: isConn ? GREEN : AMBER, fontWeight: '900' }}>
            {isConn ? 'LIVE' : 'STANDBY'}
          </Text>
        </View>
      </View>
      {items.map(m => (
        <View key={m.l} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 7 }}>
          <Text style={{ fontFamily: MONO, fontSize: 8.5, color: m.c, fontWeight: '900', width: 32 }}>{m.l}</Text>
          <View style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: DIM, overflow: 'hidden' }}>
            <View style={{
              width: isConn ? `${Math.max(3, Math.round(m.v))}%` as any : '3%',
              height: '100%', borderRadius: 3,
              backgroundColor: m.c + (isConn ? 'DD' : '28'),
            }} />
          </View>
          <Text style={{ fontFamily: MONO, fontSize: 11, fontWeight: '900', color: isConn ? m.c : DIM, width: 38, textAlign: 'right' }}>
            {isConn ? `${Math.round(m.v)}%` : '—'}
          </Text>
        </View>
      ))}
    </View>
  );
});
const MS = StyleSheet.create({
  root: { backgroundColor: SURF, borderRadius: 14, borderWidth: 1.5, borderColor: DIM + '60', padding: 14 },
});

// ══════════════════════════════════════════════════════════════════
// FILE TRANSFER QUICK ZONE
// ══════════════════════════════════════════════════════════════════
const FileTransferQuick = memo(({ isConn, goToTab }: { isConn: boolean; goToTab: (t: string) => void }) => (
  <TouchableOpacity onPress={() => { haptics.medium(); goToTab('fileshare'); }} activeOpacity={0.87}>
    <View style={[FT.root, { borderColor: PURP + '38' }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: isConn ? 10 : 0 }}>
        <View style={[FT.icon, { borderColor: PURP + '45', backgroundColor: PURP + '12' }]}>
          <MaterialCommunityIcons name="folder-network" size={24} color={PURP} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: MONO, fontSize: 13, fontWeight: '900', color: TEXT }}>FILE VAULT</Text>
          <Text style={{ fontFamily: MONO, fontSize: 9.5, color: MID, marginTop: 2 }}>
            {isConn ? 'Send files directly to PC Desktop' : 'Pair PC to transfer files instantly'}
          </Text>
        </View>
        <View style={[FT.status, { borderColor: (isConn ? GREEN : AMBER) + '55', backgroundColor: (isConn ? GREEN : AMBER) + '0A' }]}>
          <PulseDot color={isConn ? GREEN : AMBER} size={5} />
          <Text style={{ fontFamily: MONO, fontSize: 8.5, color: isConn ? GREEN : AMBER, fontWeight: '900' }}>
            {isConn ? 'READY' : 'OFFLINE'}
          </Text>
        </View>
      </View>
      {isConn && (
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity onPress={() => { haptics.light(); goToTab('fileshare'); }} activeOpacity={0.82}
            style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
              borderWidth: 1.5, borderRadius: 10, paddingVertical: 9,
              borderColor: PURP + '55', backgroundColor: PURP + '12' }}>
            <MaterialCommunityIcons name="upload" size={14} color={PURP} />
            <Text style={{ fontFamily: MONO, fontSize: 11, fontWeight: '900', color: PURP }}>SEND FILE</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { haptics.light(); goToTab('fileshare'); }} activeOpacity={0.82}
            style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
              borderWidth: 1.5, borderRadius: 10, paddingVertical: 9,
              borderColor: CYAN + '55', backgroundColor: CYAN + '12' }}>
            <MaterialCommunityIcons name="clipboard-arrow-down" size={14} color={CYAN} />
            <Text style={{ fontFamily: MONO, fontSize: 11, fontWeight: '900', color: CYAN }}>CLIPBOARD</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  </TouchableOpacity>
));
const FT = StyleSheet.create({
  root:   { backgroundColor: SURF, borderRadius: 16, borderWidth: 1.5, padding: 14 },
  icon:   { width: 48, height: 48, borderRadius: 14, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  status: { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1.5, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 5 },
});

// ══════════════════════════════════════════════════════════════════
// ALERTS & INTEL PANEL
// ══════════════════════════════════════════════════════════════════
const AlertsPanel = memo(({ isConn, goToTab }: { isConn: boolean; goToTab: (t: string) => void }) => {
  const alerts = isConn
    ? [{ dot: GREEN, text: 'PC paired + active', badge: 'OK',  bc: GREEN },
       { dot: CYAN,  text: 'AES-256 active',      badge: 'SEC', bc: CYAN  }]
    : [{ dot: AMBER, text: 'PC not connected',     badge: 'OFF', bc: AMBER },
       { dot: CYAN,  text: 'Scan QR to pair',      badge: 'TIP', bc: CYAN  }];
  const intel = [
    { dot: CYAN,  text: 'AI core ready',     badge: 'SYS', bc: CYAN  },
    { dot: GREEN, text: 'LAN scanner armed', badge: 'NET', bc: GREEN },
    { dot: PURP,  text: 'Encryption active', badge: 'SEC', bc: PURP  },
  ];
  return (
    <View style={AP.root}>
      <View style={{ height: 3, flexDirection: 'row' }}>
        <View style={{ flex: 1, backgroundColor: AMBER }} />
        <View style={{ flex: 1, backgroundColor: PURP }} />
      </View>
      <View style={{ flexDirection: 'row' }}>
        {/* Alerts */}
        <View style={{ flex: 1, padding: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 9 }}>
            <MaterialIcons name="notifications" size={11} color={AMBER} />
            <Text style={{ fontFamily: MONO, fontSize: 9, color: AMBER, fontWeight: '900', letterSpacing: 0.5 }}>ALERTS</Text>
          </View>
          {alerts.map((a, i) => (
            <View key={i} style={AP.row}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: a.dot, flexShrink: 0 }} />
              <Text style={AP.txt} numberOfLines={1}>{a.text}</Text>
              <View style={[AP.badge, { borderColor: a.bc + '60' }]}>
                <Text style={[AP.badgeTxt, { color: a.bc }]}>{a.badge}</Text>
              </View>
            </View>
          ))}
          <TouchableOpacity onPress={() => { haptics.light(); goToTab('logs'); }} activeOpacity={0.8} style={{ marginTop: 9 }}>
            <Text style={{ fontFamily: MONO, fontSize: 9.5, color: AMBER, fontWeight: '900' }}>ALL LOGS {'>'}</Text>
          </TouchableOpacity>
        </View>
        <View style={{ width: 1, backgroundColor: DIM }} />
        {/* Intel */}
        <View style={{ flex: 1, padding: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 9 }}>
            <MaterialCommunityIcons name="clipboard-list" size={11} color={PURP} />
            <Text style={{ fontFamily: MONO, fontSize: 9, color: PURP, fontWeight: '900', letterSpacing: 0.5 }}>INTEL</Text>
          </View>
          {intel.map((it, i) => (
            <View key={i} style={AP.row}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: it.dot, flexShrink: 0 }} />
              <Text style={AP.txt} numberOfLines={1}>{it.text}</Text>
              <View style={[AP.badge, { borderColor: it.bc + '60', backgroundColor: it.bc + '08' }]}>
                <Text style={[AP.badgeTxt, { color: it.bc }]}>{it.badge}</Text>
              </View>
            </View>
          ))}
          <TouchableOpacity onPress={() => { haptics.light(); goToTab('butler'); }} activeOpacity={0.8} style={{ marginTop: 9 }}>
            <Text style={{ fontFamily: MONO, fontSize: 9.5, color: PURP, fontWeight: '900' }}>ASK AI {'>'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
});
const AP = StyleSheet.create({
  root:     { backgroundColor: SURF, borderRadius: 14, borderWidth: 1.5, borderColor: DIM + '60', overflow: 'hidden' },
  row:      { flexDirection: 'row', alignItems: 'center', gap: 7, paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: DIM + '40' },
  txt:      { fontFamily: MONO, fontSize: 9.5, color: TEXT, flex: 1, lineHeight: 14 },
  badge:    { borderWidth: 1, borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2, flexShrink: 0 },
  badgeTxt: { fontFamily: MONO, fontSize: 7.5, fontWeight: '900' },
});

// ══════════════════════════════════════════════════════════════════
// SECTION LABEL
// ══════════════════════════════════════════════════════════════════
const SectionLabel = memo(({ icon, label, color }: { icon: string; label: string; color: string }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
    <View style={{ width: 3, height: 13, borderRadius: 1.5, backgroundColor: color }} />
    <MaterialCommunityIcons name={icon as any} size={11} color={color} />
    <Text style={{ fontFamily: MONO, fontSize: 9, fontWeight: '900', color: color + 'CC', letterSpacing: 1.8, flex: 1 }}>
      {label}
    </Text>
    <View style={{ height: 1, width: 18, backgroundColor: color + '20' }} />
  </View>
));

// ══════════════════════════════════════════════════════════════════
// MAIN SCREEN
// ══════════════════════════════════════════════════════════════════
function HomeInner() {
  const insets    = useSafeAreaInsets();
  const [isConn,  setIsConn]  = useState(false);
  const [cpu,     setCpu]     = useState(0);
  const [ram,     setRam]     = useState(0);
  const [disk,    setDisk]    = useState(0);
  const [kbCount, setKbCount] = useState(0);
  const [refresh, setRefresh] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const conn = serverConnection.isConnected?.() ?? false;
      setIsConn(conn);
      if (conn) {
        const ip  = serverConnection.getIP?.()   || '';
        const prt = serverConnection.getPort?.() || '';
        const tok = serverConnection.getToken?.() || '';
        const hd: Record<string, string> = {};
        if (tok) hd['Authorization'] = 'Bearer ' + tok;
        const ctrl = new AbortController(); setTimeout(() => ctrl.abort(), 5000);
        try {
          const res = await fetch(`http://${ip}:${prt}/api/metrics`, { headers: hd, signal: ctrl.signal });
          if (res.ok) {
            const d = await res.json();
            setCpu(d.cpu_percent ?? d.cpu?.percent ?? 0);
            setRam(d.ram_percent ?? d.memory?.percent ?? 0);
            setDisk(d.disk_percent ?? d.disk?.percent ?? 0);
          }
        } catch {}
      }
      try {
        const s = await knowledgeAccumulator.getStats?.().catch(() => null);
        if (s?.totalFindings) setKbCount(s.totalFindings);
      } catch {}
    } catch {}
  }, []);

  useFocusEffect(useCallback(() => {
    loadData();
    const t = setInterval(loadData, 25000);
    return () => clearInterval(t);
  }, [loadData]));

  const goToTab = useCallback((tab: string) => {
    haptics.light();
    try { (global as any).__butlerSwitchTab?.(tab); } catch {}
  }, []);

  const onRefresh = useCallback(async () => {
    setRefresh(true); haptics.medium();
    await loadData(); haptics.success(); setRefresh(false);
  }, [loadData]);

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <HomeHeader safeTop={insets.top} isConn={isConn} onPair={() => goToTab('connect')} />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 14, gap: 12, paddingBottom: insets.bottom + 110 }}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={Platform.OS === 'android'}
        refreshControl={
          <RefreshControl refreshing={refresh} onRefresh={onRefresh}
            tintColor={CYAN} colors={[CYAN, GREEN]} progressBackgroundColor={SURF} />
        }
      >
        {/* Quick nav row */}
        <QuickActions goToTab={goToTab} />

        {/* 2×2 Telemetry Grid */}
        <View>
          <SectionLabel icon="satellite-variant" label="SYSTEM TELEMETRY" color={CYAN} />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            <PCCard isConn={isConn} cpu={cpu} ram={ram} onPair={() => goToTab('connect')} />
            <LiveFeedCard isConn={isConn} />
            <CrawlerCard isConn={isConn} kbCount={kbCount} />
            <KBCard isConn={isConn} kbCount={kbCount} />
          </View>
        </View>

        {/* System Metrics */}
        <MetricsStrip isConn={isConn} cpu={cpu} ram={ram} disk={disk} />

        {/* Download Server CTA */}
        <DownloadCTA goToTab={goToTab} />

        {/* File Transfer Quick Zone */}
        <FileTransferQuick isConn={isConn} goToTab={goToTab} />

        {/* Alerts & Intel */}
        <View>
          <SectionLabel icon="alert-circle-outline" label="ALERTS & INTEL" color={AMBER} />
          <AlertsPanel isConn={isConn} goToTab={goToTab} />
        </View>

        {/* Security footer badges */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, paddingTop: 4 }}>
          {['AES-256', 'LAN ONLY', 'ZERO CLOUD', 'HMAC-SHA256'].map((b, i) => (
            <View key={i} style={{ borderWidth: 1, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3,
              borderColor: [CYAN, GREEN, AMBER, PURP][i] + '28', backgroundColor: [CYAN, GREEN, AMBER, PURP][i] + '05' }}>
              <Text style={{ fontFamily: MONO, fontSize: 7, color: [CYAN, GREEN, AMBER, PURP][i] + '65', fontWeight: '900' }}>
                {b}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

export default function HomeScreen() {
  return <TabErrorBoundary name="Home"><HomeInner /></TabErrorBoundary>;
}
