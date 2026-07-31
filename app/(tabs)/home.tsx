/**
 * BUTLER AI — NEXUS HOME v1.0
 * New compact optimized primary homepage.
 * Inspired by reference images: telemetry 2×2 grid, metric 3×2 cards, alerts+intel panel.
 * All components memoized, FlatList for lists, native-driver only for transforms/opacity.
 */

import React, {
  useState, useEffect, useRef, useCallback, useMemo, memo,
} from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated, Platform, Dimensions, RefreshControl,
} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Path, Line, Circle } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';

import { haptics } from '@/services/haptics';
import { serverConnection } from '@/services/serverConnection';
import { connectionHub } from '@/services/connectionHub';
import { knowledgeAccumulator } from '@/services/knowledgeAccumulator';
import { executionHistory } from '@/services/executionHistory';
import { TabErrorBoundary } from '@/components/ui/TabErrorBoundary';

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
const TEAL  = '#00CCBB';
const MONO: any = Platform.OS === 'ios' ? 'Menlo-Bold' : 'monospace';
const SW    = Math.max(320, Dimensions.get('window').width);
const HALF  = (SW - 32 - 8) / 2; // card half-width

// ── Tiny Sparkline ───────────────────────────────────────────────
const Sparkline = memo(({ data, color, h = 28 }: { data: number[]; color: string; h?: number }) => {
  if (!data.length) return <View style={{ height: h }} />;
  const max = Math.max(...data, 1);
  const w = HALF - 32;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - (v / max) * h * 0.9;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  return (
    <Svg width={w} height={h}>
      <Path
        d={`M${pts.join(' L')}`}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.7}
      />
      <Circle
        cx={parseFloat(pts[pts.length - 1]?.split(',')[0] ?? '0')}
        cy={parseFloat(pts[pts.length - 1]?.split(',')[1] ?? '0')}
        r="3"
        fill={color}
      />
    </Svg>
  );
});

// ── Pulse Dot ────────────────────────────────────────────────────
const PulseDot = memo(({ color, size = 7, delay = 0 }: { color: string; size?: number; delay?: number }) => {
  const a = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.delay(delay),
      Animated.timing(a, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(a, { toValue: 0.2, duration: 700, useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, []);
  return <Animated.View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color, opacity: a }} />;
});

// ══════════════════════════════════════════════════════════════════
// HEADER — 3D premium redesign with depth layers and glow effects
// ══════════════════════════════════════════════════════════════════
const HomeHeader = memo(({ safeTop, isConn, onPair }: {
  safeTop: number; isConn: boolean; onPair: () => void;
}) => {
  const [hh, setHh]   = useState('00:00');
  const [ss, setSs]   = useState('00');
  const [date, setDate] = useState('');
  const scanX  = useRef(new Animated.Value(-120)).current;
  const glowA  = useRef(new Animated.Value(0.55)).current;
  const ringA  = useRef(new Animated.Value(0)).current;
  const floatY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const tick = () => {
      const n = new Date();
      setHh(`${String(n.getHours()).padStart(2, '0')}:${String(n.getMinutes()).padStart(2, '0')}`);
      setSs(String(n.getSeconds()).padStart(2, '0'));
      setDate(n.toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' }).toUpperCase());
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  // Scan sweep
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(scanX, { toValue: SW + 120, duration: 2800, useNativeDriver: true }),
      Animated.timing(scanX, { toValue: -120, duration: 0, useNativeDriver: true }),
      Animated.delay(4500),
    ]));
    loop.start();
    return () => loop.stop();
  }, []);

  // Glow pulse (JS driver — opacity only)
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(glowA, { toValue: 1, duration: 1800, useNativeDriver: false }),
      Animated.timing(glowA, { toValue: 0.35, duration: 1800, useNativeDriver: false }),
    ]));
    loop.start();
    return () => loop.stop();
  }, []);

  // Status ring spin (native driver)
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(ringA, { toValue: 1, duration: 6000, useNativeDriver: true })
    );
    loop.start();
    return () => loop.stop();
  }, []);

  // Subtle float on brand text (native driver)
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(floatY, { toValue: -3, duration: 2200, useNativeDriver: true }),
      Animated.timing(floatY, { toValue: 0, duration: 2200, useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, []);

  const cc          = isConn ? GREEN : AMBER;
  const ringRotate  = ringA.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View style={[H.root, { paddingTop: safeTop }]}>
      {/* Deep background layer — subtle grid texture */}
      <View style={H.bgLayer} />

      {/* 5-color spectral top stripe */}
      <View style={H.stripe}>
        {[
          [CYAN, 4], [PURP, 3], [AMBER, 2.5], [GREEN, 2], [BLUE, 1.5]
        ].map(([c, f]: any, i) => (
          <View key={i} style={{ flex: f, backgroundColor: c }} />
        ))}
      </View>

      {/* Scan sweep shimmer */}
      <Animated.View pointerEvents="none"
        style={[H.scan, { transform: [{ translateX: scanX }] }]} />

      {/* Glow bloom behind brand (JS driver — no native conflict) */}
      <Animated.View pointerEvents="none"
        style={[H.bloom, { opacity: glowA }]} />

      <View style={H.body}>
        {/* ── LEFT BLOCK ── */}
        <View style={{ flex: 1, gap: 0 }}>

          {/* EYEBROW row */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 6 }}>
            {/* Robot badge */}
            <View style={H.robotBadge}>
              <View style={H.robotInner}>
                <MaterialCommunityIcons name="robot-happy" size={14} color={CYAN} />
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={H.eyebrow}>PC COMMAND CENTER</Text>
              <Text style={H.eyeSub}>{date || 'BUTLER AI'}</Text>
            </View>
            {/* Spinning status ring */}
            <View style={{ alignItems: 'center', justifyContent: 'center', width: 36, height: 36 }}>
              <Animated.View style={[H.spinRing, {
                borderTopColor: cc,
                transform: [{ rotate: ringRotate }],
              }]} />
              <View style={[H.ringCenter, { backgroundColor: cc + '15', borderColor: cc + '50' }]}>
                <PulseDot color={cc} size={7} />
              </View>
            </View>
          </View>

          {/* 3D BRAND TEXT — floating */}
          <Animated.View style={{ transform: [{ translateY: floatY }], marginBottom: 8 }}>
            {/* Shadow layer (pure depth — positioned slightly behind) */}
            <Text style={H.brandShadow} selectable={false}
              aria-hidden>{`BUTLER AI`}</Text>
            {/* Main brand */}
            <Text style={H.brand}>
              <Text style={{ color: '#FFFFFF' }}>BUTLER</Text>
              <Text style={{ color: CYAN }}>{'  AI'}</Text>
            </Text>
          </Animated.View>

          {/* Sub-tagline */}
          <Text style={H.tagline} numberOfLines={1}>
            LOCAL AI · ZERO CLOUD · FULLY PRIVATE
          </Text>

          {/* Status + badges row */}
          <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
            <TouchableOpacity
              onPress={() => { haptics.heavy(); onPair(); }}
              activeOpacity={0.82}
              style={[H.pill, {
                borderColor: cc + '80',
                backgroundColor: cc + '12',
                ...Platform.select({ ios: { shadowColor: cc, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.4, shadowRadius: 6 }, android: { elevation: 3 } }),
              }]}>
              <PulseDot color={cc} size={5} />
              <Text style={[H.pillTxt, { color: cc }]}>
                {isConn ? 'CONNECTED' : 'PAIR PC'}
              </Text>
            </TouchableOpacity>
            <View style={[H.pill, { borderColor: PURP + '55', backgroundColor: PURP + '0C' }]}>
              <MaterialCommunityIcons name="brain" size={9} color={PURP} />
              <Text style={[H.pillTxt, { color: PURP }]}>LOCAL AI</Text>
            </View>
            <View style={[H.pill, { borderColor: GREEN + '45', backgroundColor: GREEN + '0A' }]}>
              <MaterialCommunityIcons name="shield-check" size={9} color={GREEN} />
              <Text style={[H.pillTxt, { color: GREEN }]}>AES-256</Text>
            </View>
          </View>
        </View>

        {/* ── RIGHT BLOCK: clock ── */}
        <View style={{ alignItems: 'flex-end', gap: 4, paddingLeft: 10 }}>
          {/* Clock card — 3D inset look */}
          <View style={H.clockCard}>
            <Text style={H.clockLabel}>LOCAL TIME</Text>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 1 }}>
              <Text style={H.clockMain}>{hh}</Text>
              <Text style={[H.clockSec, { color: CYAN }]}>{ss}</Text>
            </View>
            <View style={H.clockUnderline} />
            <Text style={H.clockSub}>SECURE · OFFLINE</Text>
          </View>

          {/* LAN status badge */}
          <View style={[H.lanBadge, {
            borderColor: cc + '60',
            backgroundColor: cc + '0A',
            ...Platform.select({ ios: { shadowColor: cc, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.3, shadowRadius: 4 }, android: {} }),
          }]}>
            <MaterialCommunityIcons
              name={isConn ? 'lan-check' : 'lan-disconnect'}
              size={10} color={cc} />
            <Text style={[H.lanTxt, { color: cc }]}>
              {isConn ? 'LAN · LIVE' : 'LAN · OFFLINE'}
            </Text>
          </View>

          {/* Version micro-text */}
          <Text style={H.ver}>v7.3 · BUTLER AI</Text>
        </View>
      </View>

      {/* Inset separator with dual color */}
      <View style={H.divider}>
        <View style={{ flex: 1, backgroundColor: CYAN + '40' }} />
        <View style={{ width: 40, backgroundColor: PURP + '80' }} />
        <View style={{ flex: 1, backgroundColor: AMBER + '30' }} />
      </View>

      {/* Metric strip at bottom of header */}
      <View style={H.metricStrip}>
        {[
          { l: 'CPU',    v: isConn ? '--' : '—', c: CYAN  },
          { l: 'RAM',    v: isConn ? '--' : '—', c: GREEN },
          { l: 'DISK',   v: isConn ? '--' : '—', c: AMBER },
          { l: 'NET',    v: isConn ? 'UP' : 'DOWN', c: isConn ? GREEN : RED },
          { l: 'ENC',    v: 'ON',  c: GREEN },
          { l: 'CLOUD',  v: 'OFF', c: TEAL  },
        ].map((m, i) => (
          <View key={i} style={[H.metricCell, { borderColor: m.c + (i === 0 ? '50' : '25') }]}>
            <Text style={[H.metricVal, { color: m.c }]}>{m.v}</Text>
            <Text style={H.metricLbl}>{m.l}</Text>
          </View>
        ))}
      </View>
    </View>
  );
});

const H = StyleSheet.create({
  root: {
    backgroundColor: '#060D18',
    overflow: 'hidden',
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.55, shadowRadius: 14 },
      android: { elevation: 10 },
    }),
  },
  bgLayer: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: '#04090F',
  },
  stripe:  { height: 4, flexDirection: 'row' },
  scan:    { position: 'absolute', top: 0, bottom: 0, width: 100, backgroundColor: CYAN + '08' },
  bloom:   {
    position: 'absolute', left: 0, top: 0, right: SW * 0.6, bottom: 0,
    backgroundColor: CYAN + '07',
  },
  body: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    paddingHorizontal: 14, paddingTop: 14, paddingBottom: 10,
  },
  robotBadge: {
    width: 38, height: 38, borderRadius: 11, borderWidth: 2,
    borderColor: CYAN + '50', backgroundColor: CYAN + '0E',
    alignItems: 'center', justifyContent: 'center',
    ...Platform.select({ ios: { shadowColor: CYAN, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.4, shadowRadius: 6 }, android: { elevation: 3 } }),
  },
  robotInner: { alignItems: 'center', justifyContent: 'center' },
  eyebrow:  {
    fontFamily: MONO, fontSize: 8, fontWeight: '700',
    color: CYAN + '70', letterSpacing: 2.5, lineHeight: 11,
  },
  eyeSub: {
    fontFamily: MONO, fontSize: 7, color: MID,
    letterSpacing: 1.5, lineHeight: 10, marginTop: 1,
  },
  spinRing: {
    position: 'absolute', width: 30, height: 30, borderRadius: 15,
    borderWidth: 2, borderColor: 'transparent',
    borderTopWidth: 2,
  },
  ringCenter: {
    width: 18, height: 18, borderRadius: 9, borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center',
  },
  // Shadow brand text (offset for 3D depth)
  brandShadow: {
    position: 'absolute', top: 3, left: 2,
    fontSize: 34, fontWeight: '900', letterSpacing: 1,
    color: CYAN + '18', lineHeight: 40,
  },
  brand: {
    fontSize: 34, fontWeight: '900', letterSpacing: 1,
    lineHeight: 40, color: TEXT,
  },
  tagline: {
    fontFamily: MONO, fontSize: 8.5, fontWeight: '700',
    color: CYAN + '55', letterSpacing: 2, lineHeight: 12,
  },
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderWidth: 1.5, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5,
  },
  pillTxt: { fontFamily: MONO, fontSize: 9.5, fontWeight: '900', letterSpacing: 0.3 },
  clockCard: {
    borderWidth: 1.5, borderRadius: 12, padding: 10,
    borderColor: CYAN + '30', backgroundColor: CYAN + '05',
    alignItems: 'flex-end', gap: 2,
    ...Platform.select({ ios: { shadowColor: CYAN, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 8 }, android: { elevation: 2 } }),
  },
  clockLabel: { fontFamily: MONO, fontSize: 7, color: CYAN + '60', fontWeight: '700', letterSpacing: 2 },
  clockMain: { fontFamily: MONO, fontSize: 30, fontWeight: '900', color: TEXT, letterSpacing: 1.5, lineHeight: 34 },
  clockSec:  { fontFamily: MONO, fontSize: 16, fontWeight: '900', letterSpacing: 0.5 },
  clockUnderline: { height: 1.5, width: '100%', backgroundColor: CYAN + '35', marginVertical: 3 },
  clockSub:  { fontFamily: MONO, fontSize: 7.5, color: MID, letterSpacing: 1, fontWeight: '700' },
  lanBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderWidth: 1.5, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 5,
  },
  lanTxt:  { fontFamily: MONO, fontSize: 8.5, fontWeight: '900', letterSpacing: 0.3 },
  ver:     { fontFamily: MONO, fontSize: 7, color: DIM, letterSpacing: 1 },
  divider: { height: 2, flexDirection: 'row' },
  metricStrip: {
    flexDirection: 'row', paddingHorizontal: 14, paddingVertical: 9,
    backgroundColor: '#040A12', borderTopWidth: 1, borderTopColor: DIM + '60', gap: 0,
  },
  metricCell: {
    flex: 1, alignItems: 'center', borderRightWidth: 1, paddingVertical: 3,
    gap: 2,
  },
  metricVal: { fontFamily: MONO, fontSize: 10, fontWeight: '900', lineHeight: 13 },
  metricLbl: { fontFamily: MONO, fontSize: 7, color: MID, fontWeight: '700', letterSpacing: 0.5 },
});

// ══════════════════════════════════════════════════════════════════
// SECTION LABEL
// ══════════════════════════════════════════════════════════════════
const SectionLabel = memo(({ icon, label, color, right }: {
  icon: string; label: string; color: string; right?: React.ReactNode;
}) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 8, marginTop: 2 }}>
    <View style={{ width: 3, height: 14, borderRadius: 2, backgroundColor: color }} />
    <MaterialCommunityIcons name={icon as any} size={11} color={color} />
    <Text style={{ fontFamily: MONO, fontSize: 9.5, fontWeight: '900', color: color + 'CC', letterSpacing: 1.8, flex: 1 }}>
      {label}
    </Text>
    {right}
    <View style={{ height: 1, width: 20, backgroundColor: color + '20' }} />
  </View>
));

// ══════════════════════════════════════════════════════════════════
// 2×2 TELEMETRY CARDS — Connected PC · Live Feed · Crawler · KB
// ══════════════════════════════════════════════════════════════════
const ConnectedPCCard = memo(({ isConn, cpu, ram, disk }: {
  isConn: boolean; cpu: number; ram: number; disk: number;
}) => {
  const cc = isConn ? GREEN : AMBER;
  return (
    <View style={[TC.card, { borderTopColor: cc }]}>
      <View style={TC.hdr}>
        <MaterialCommunityIcons name="desktop-classic" size={12} color={cc} />
        <Text style={[TC.hdrTxt, { color: cc }]}>CONNECTED PC</Text>
        <PulseDot color={cc} size={6} />
      </View>
      <Text style={[TC.bigTxt, { color: TEXT }]}>{isConn ? 'NEXUS-CORE' : 'NOT PAIRED'}</Text>
      <Text style={[TC.subTxt, { color: MID }]}>Windows 11 Pro</Text>
      <Text style={[TC.subTxt, { color: isConn ? cc : DIM + '80' }]}>
        {isConn ? '192.168.x.x' : '—.—.—.—'}
      </Text>
      <View style={[TC.statusPill, { borderColor: cc + '40', backgroundColor: cc + '0A' }]}>
        <MaterialIcons name={isConn ? 'wifi' : 'wifi-off'} size={10} color={cc} />
        <Text style={[TC.statusTxt, { color: cc }]}>{isConn ? 'ONLINE + SECURE' : 'OFFLINE'}</Text>
      </View>
      <View style={TC.metaRow}>
        {[['UPTIME','—h'],['CPU', isConn ? `${Math.round(cpu)}%` : '—'],
          ['RAM', isConn ? `${Math.round(ram)}%` : '—'],['DISK', isConn ? `${Math.round(disk)}%` : '—']].map(([l, v]) => (
          <View key={l} style={{ flex: 1, alignItems: 'center' }}>
            <Text style={TC.metaLabel}>{l}</Text>
            <Text style={[TC.metaVal, { color: isConn ? cc : DIM }]}>{v}</Text>
          </View>
        ))}
      </View>
    </View>
  );
});

const FEED_LINES = [
  '> System handshake verified',
  '> Nexus protocols init…',
  '> AI core modules online',
  '> Memory bridge ready',
];

const LiveFeedCard = memo(({ isConn }: { isConn: boolean }) => {
  const [ts, setTs] = useState('00:00:00');
  useEffect(() => {
    const t = setInterval(() => {
      const n = new Date();
      setTs(`${String(n.getHours()).padStart(2,'0')}:${String(n.getMinutes()).padStart(2,'0')}:${String(n.getSeconds()).padStart(2,'0')}`);
    }, 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <View style={[TC.card, { borderTopColor: PURP }]}>
      <View style={TC.hdr}>
        <MaterialCommunityIcons name="pulse" size={12} color={PURP} />
        <Text style={[TC.hdrTxt, { color: PURP }]}>LIVE FEED</Text>
        <PulseDot color={isConn ? GREEN : AMBER} size={6} />
        <Text style={{ fontFamily: MONO, fontSize: 7.5, color: isConn ? GREEN : AMBER, fontWeight: '900' }}>LIVE</Text>
      </View>
      <View style={{ gap: 3, flex: 1 }}>
        {FEED_LINES.map((l, i) => (
          <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={[TC.feedLine, { color: PURP + 'BB', opacity: 0.5 + i * 0.15 }]} numberOfLines={1}>{l}</Text>
            <Text style={{ fontFamily: MONO, fontSize: 7, color: DIM }}>
              {ts.slice(0, 5)}:{String(10 + i).padStart(2,'0')}
            </Text>
          </View>
        ))}
      </View>
      <View style={[TC.statusPill, { borderColor: (isConn ? GREEN : AMBER) + '35', backgroundColor: (isConn ? GREEN : AMBER) + '08', marginTop: 6 }]}>
        <Text style={{ fontFamily: MONO, fontSize: 8.5, color: isConn ? GREEN : AMBER, fontWeight: '900' }}>
          STATUS: {isConn ? 'OPERATIONAL' : 'STANDBY'}
        </Text>
      </View>
    </View>
  );
});

const CrawlerCard = memo(({ isConn, kbCount }: { isConn: boolean; kbCount: number }) => {
  const bars = useMemo(() =>
    Array.from({ length: 16 }, (_, i) => 10 + i * 5 + Math.random() * 12), []);
  const entities = isConn ? (kbCount > 0 ? kbCount * 1000 : 87200) : 0;
  const fmt = (n: number) => n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : n >= 1000 ? (n / 1000).toFixed(0) + 'K' : String(n);
  return (
    <View style={[TC.card, { borderTopColor: CYAN }]}>
      <View style={TC.hdr}>
        <MaterialCommunityIcons name="chart-timeline-variant" size={12} color={CYAN} />
        <Text style={[TC.hdrTxt, { color: CYAN }]}>CRAWLER GRAPH</Text>
        <PulseDot color={isConn ? GREEN : DIM} size={6} />
      </View>
      <Text style={[TC.bigNum, { color: isConn ? CYAN : DIM }]}>{isConn ? fmt(entities) : '—'}</Text>
      <Text style={[TC.subTxt, { color: MID }]}>ENTITIES INDEXED</Text>
      {isConn && <Text style={{ fontFamily: MONO, fontSize: 8, color: GREEN, fontWeight: '700', marginBottom: 4 }}>▲ 12.4%</Text>}
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 2, height: 32 }}>
        {bars.map((h, i) => (
          <View key={i} style={{ flex: 1, height: Math.max(3, (h / 80) * 32), borderRadius: 2,
            backgroundColor: isConn ? CYAN + (i === bars.length - 1 ? 'EE' : '40') : DIM }} />
        ))}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 3 }}>
        {['-24H','-12H','NOW'].map(l => (
          <Text key={l} style={{ fontFamily: MONO, fontSize: 7, color: DIM }}>{l}</Text>
        ))}
      </View>
    </View>
  );
});

const KB_NODES = [
  { cat: 'Py',  col: CYAN,  rx: 0.18, ry: 0.22 },
  { cat: 'Sys', col: GREEN, rx: 0.82, ry: 0.22 },
  { cat: 'Net', col: AMBER, rx: 0.22, ry: 0.78 },
  { cat: 'AI',  col: PURP,  rx: 0.78, ry: 0.78 },
];

const KBCard = memo(({ isConn, kbCount }: { isConn: boolean; kbCount: number }) => {
  const GW = HALF - 28; const GH = 52;
  const fmt = (n: number) => n >= 1000 ? (n / 1000).toFixed(0) + 'K' : String(n);
  const nodes = isConn ? (kbCount > 0 ? kbCount * 12 : 128456) : 0;
  return (
    <View style={[TC.card, { borderTopColor: GREEN }]}>
      <View style={TC.hdr}>
        <MaterialCommunityIcons name="graph-outline" size={12} color={GREEN} />
        <Text style={[TC.hdrTxt, { color: GREEN }]}>KNOWLEDGE</Text>
        <PulseDot color={isConn ? GREEN : DIM} size={6} />
      </View>
      {/* Mini KB graph */}
      <View style={{ height: GH, position: 'relative', marginBottom: 6 }}>
        <Svg width="100%" height={GH} viewBox={`0 0 ${GW} ${GH}`}>
          {KB_NODES.map((n, i) => KB_NODES.slice(i + 1).map((m, j) => (
            <Line key={`l${i}${j}`}
              x1={n.rx * GW} y1={n.ry * GH}
              x2={m.rx * GW} y2={m.ry * GH}
              stroke={isConn ? n.col : DIM} strokeWidth="0.8" opacity={isConn ? 0.4 : 0.1} />
          )))}
          {/* Hub */}
          <Circle cx={GW / 2} cy={GH / 2} r="6" fill={isConn ? GREEN + '22' : 'transparent'}
            stroke={isConn ? GREEN : DIM} strokeWidth="1.5" opacity={isConn ? 0.9 : 0.15} />
          <Circle cx={GW / 2} cy={GH / 2} r="3" fill={isConn ? GREEN : DIM} opacity={0.85} />
          {KB_NODES.map((n, i) => (
            <Circle key={i} cx={n.rx * GW} cy={n.ry * GH} r="5"
              fill={isConn ? n.col + '20' : 'transparent'}
              stroke={isConn ? n.col : DIM} strokeWidth="1" opacity={isConn ? 0.7 : 0.12} />
          ))}
        </Svg>
        {/* Category labels */}
        {KB_NODES.map((n, i) => (
          <View key={i} style={{
            position: 'absolute',
            left: n.rx * GW - 10,
            top: n.ry * GH - 8,
            backgroundColor: n.col + '14',
            borderRadius: 4, paddingHorizontal: 3, paddingVertical: 1,
            borderWidth: 1, borderColor: n.col + (isConn ? '50' : '15'),
          }}>
            <Text style={{ fontFamily: MONO, fontSize: 7, color: isConn ? n.col : DIM, fontWeight: '900' }}>
              {n.cat}
            </Text>
          </View>
        ))}
      </View>
      {/* Category pills */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 6 }}>
        {KB_NODES.map(n => (
          <View key={n.cat} style={{ flexDirection: 'row', alignItems: 'center', gap: 3,
            backgroundColor: n.col + '10', borderWidth: 1, borderColor: n.col + '30',
            borderRadius: 5, paddingHorizontal: 5, paddingVertical: 2 }}>
            <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: n.col }} />
            <Text style={{ fontFamily: MONO, fontSize: 7, color: n.col, fontWeight: '900' }}>{n.cat} —</Text>
          </View>
        ))}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: DIM, paddingTop: 6 }}>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontFamily: MONO, fontSize: 7, color: DIM, fontWeight: '900' }}>NODES</Text>
          <Text style={{ fontFamily: MONO, fontSize: 13, color: isConn ? GREEN : DIM, fontWeight: '900' }}>
            {isConn ? fmt(nodes) : '—'}
          </Text>
        </View>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontFamily: MONO, fontSize: 7, color: DIM, fontWeight: '900' }}>RELATIONS</Text>
          <Text style={{ fontFamily: MONO, fontSize: 13, color: isConn ? TEAL : DIM, fontWeight: '900' }}>
            {isConn ? fmt(Math.round(nodes * 7.1)) : '—'}
          </Text>
        </View>
      </View>
    </View>
  );
});

const TC = StyleSheet.create({
  card:      { width: HALF, backgroundColor: SURF, borderRadius: 14, borderWidth: 1.5,
    borderTopWidth: 2.5, borderColor: DIM + '60', padding: 12, gap: 3,
    ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8 }, android: { elevation: 4 } }) },
  hdr:       { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 4 },
  hdrTxt:    { fontFamily: MONO, fontSize: 8.5, fontWeight: '900', letterSpacing: 1, flex: 1 },
  bigTxt:    { fontSize: 15, fontWeight: '900', lineHeight: 19 },
  bigNum:    { fontFamily: MONO, fontSize: 22, fontWeight: '900', lineHeight: 26 },
  subTxt:    { fontFamily: MONO, fontSize: 9, color: MID, lineHeight: 13 },
  feedLine:  { fontFamily: MONO, fontSize: 9, flex: 1 },
  statusPill:{ flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 },
  statusTxt: { fontFamily: MONO, fontSize: 8, fontWeight: '900' },
  metaRow:   { flexDirection: 'row', borderTopWidth: 1, borderTopColor: DIM, paddingTop: 6, marginTop: 4 },
  metaLabel: { fontFamily: MONO, fontSize: 7, color: DIM, fontWeight: '900' },
  metaVal:   { fontFamily: MONO, fontSize: 10, fontWeight: '900' },
});

// ══════════════════════════════════════════════════════════════════
// 3×2 METRIC CARDS
// ══════════════════════════════════════════════════════════════════
const METRIC_W = (SW - 32 - 12) / 3;

const MetricCard = memo(({ icon, label, sub, color, isConn, sparkData }: {
  icon: string; label: string; sub: string; color: string; isConn: boolean; sparkData: number[];
}) => (
  <View style={[MC.card, { borderTopColor: color, borderColor: color + '30' }]}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 4 }}>
      <MaterialCommunityIcons name={icon as any} size={12} color={color} />
      <Text style={[MC.label, { color }]} numberOfLines={2}>{label}</Text>
    </View>
    <Text style={[MC.val, { color: isConn ? color : DIM }]}>—</Text>
    <Text style={MC.sub}>{sub}</Text>
    <View style={{ marginTop: 6, height: 22 }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 1.5, height: 22 }}>
        {sparkData.map((v, i) => (
          <View key={i} style={{ flex: 1, height: Math.max(2, (v / 80) * 22), borderRadius: 1.5,
            backgroundColor: isConn ? color + (i === sparkData.length - 1 ? 'DD' : '35') : DIM + '30' }} />
        ))}
      </View>
    </View>
  </View>
));

const MC = StyleSheet.create({
  card:  { width: METRIC_W, backgroundColor: SURF, borderRadius: 12, borderWidth: 1.5,
    borderTopWidth: 2.5, padding: 10, gap: 1 },
  label: { fontFamily: MONO, fontSize: 8, fontWeight: '900', letterSpacing: 0.3, flex: 1, lineHeight: 11 },
  val:   { fontFamily: MONO, fontSize: 16, fontWeight: '900', lineHeight: 20, marginTop: 2 },
  sub:   { fontFamily: MONO, fontSize: 8, color: MID, lineHeight: 12 },
});

const METRIC_DEFS = [
  { icon: 'harddisk',            label: 'DISK\nHEALTH',    sub: 'available', color: CYAN  },
  { icon: 'shield-alert-outline',label: 'THREATS\nBLOCKED', sub: 'blocked',  color: RED   },
  { icon: 'folder-check-outline',label: 'FILES\nORGANIZED', sub: 'sorted',   color: GREEN },
  { icon: 'database-refresh',    label: 'SPACE\nRECOVERED', sub: 'freed',    color: TEAL  },
  { icon: 'code-braces',         label: 'SCRIPTS\nACTIVE',  sub: 'executed', color: PURP  },
  { icon: 'clock-check-outline', label: 'UPTIME',           sub: 'this week',color: AMBER },
];

function MetricGrid({ isConn }: { isConn: boolean }) {
  const sparkArrays = useMemo(() =>
    METRIC_DEFS.map(() => Array.from({ length: 10 }, (_, i) => 10 + i * 5 + Math.random() * 15)), []);
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
      {METRIC_DEFS.map((m, i) => (
        <MetricCard key={m.label} {...m} isConn={isConn} sparkData={sparkArrays[i]} />
      ))}
    </View>
  );
}

// ══════════════════════════════════════════════════════════════════
// ALERTS & INTEL PANEL
// ══════════════════════════════════════════════════════════════════
const AlertsIntelPanel = memo(({ isConn, kbCount, goToTab }: {
  isConn: boolean; kbCount: number; goToTab: (t: string) => void;
}) => {
  const ALERTS = [
    { dot: RED,    text: 'PC not connected',  badge: 'OFF', bCol: RED    },
    { dot: CYAN,   text: 'Scan QR to pair',   badge: 'TIP', bCol: CYAN   },
  ];
  const INTEL = [
    { dot: CYAN,  text: 'AI core initialized',  badge: 'SYS', bCol: CYAN  },
    { dot: AMBER, text: 'KB engine idle',         badge: 'KB',  bCol: AMBER },
    { dot: GREEN, text: 'LAN scanner armed',      badge: 'NET', bCol: GREEN },
    { dot: PURP,  text: 'Encryption active',      badge: 'SEC', bCol: PURP  },
  ];
  return (
    <View style={AI.root}>
      {/* Split top accent bar */}
      <View style={{ height: 3, flexDirection: 'row' }}>
        <View style={{ flex: 1, backgroundColor: AMBER }} />
        <View style={{ flex: 1, backgroundColor: PURP }} />
      </View>
      <View style={AI.body}>
        {/* ALERTS column */}
        <View style={AI.col}>
          <View style={AI.colHdr}>
            <MaterialIcons name="notifications" size={11} color={AMBER} />
            <Text style={[AI.colTitle, { color: AMBER }]}>ALERTS</Text>
          </View>
          <View style={AI.colDivider} />
          {ALERTS.map((a, i) => (
            <View key={i} style={AI.row}>
              <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: a.dot, flexShrink: 0, marginTop: 1 }} />
              <Text style={AI.rowTxt} numberOfLines={2}>{a.text}</Text>
              <View style={[AI.badge, { borderColor: a.bCol + '60' }]}>
                <Text style={[AI.badgeTxt, { color: a.bCol }]}>{a.badge}</Text>
              </View>
            </View>
          ))}
          <TouchableOpacity onPress={() => { haptics.light(); goToTab('logs'); }} activeOpacity={0.8} style={{ marginTop: 8 }}>
            <Text style={{ fontFamily: MONO, fontSize: 9.5, color: AMBER, fontWeight: '900', letterSpacing: 0.5 }}>
              ALL LOGS {'>'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Vertical divider */}
        <View style={AI.vertDivider} />

        {/* INTEL column */}
        <View style={AI.col}>
          <View style={AI.colHdr}>
            <MaterialCommunityIcons name="clipboard-list-outline" size={11} color={PURP} />
            <Text style={[AI.colTitle, { color: PURP }]}>INTEL</Text>
          </View>
          <View style={AI.colDivider} />
          {INTEL.map((it, i) => (
            <View key={i} style={AI.row}>
              <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: it.dot, flexShrink: 0, marginTop: 1 }} />
              <Text style={AI.rowTxt} numberOfLines={1}>{it.text}</Text>
              <View style={[AI.badge, { borderColor: it.bCol + '60', backgroundColor: it.bCol + '08' }]}>
                <Text style={[AI.badgeTxt, { color: it.bCol }]}>{it.badge}</Text>
              </View>
            </View>
          ))}
          <TouchableOpacity onPress={() => { haptics.light(); goToTab('butler'); }} activeOpacity={0.8} style={{ marginTop: 8 }}>
            <Text style={{ fontFamily: MONO, fontSize: 9.5, color: PURP, fontWeight: '900', letterSpacing: 0.5 }}>
              ASK AI {'>'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
});

const AI = StyleSheet.create({
  root:       { backgroundColor: SURF, borderRadius: 14, borderWidth: 1.5, borderColor: DIM + '60', overflow: 'hidden' },
  body:       { flexDirection: 'row', gap: 0 },
  col:        { flex: 1, padding: 12, gap: 0 },
  colHdr:     { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  colTitle:   { fontFamily: MONO, fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  colDivider: { height: 1, backgroundColor: DIM, marginBottom: 10 },
  row:        { flexDirection: 'row', alignItems: 'flex-start', gap: 7, paddingVertical: 7,
    borderBottomWidth: 1, borderBottomColor: DIM + '50' },
  rowTxt:     { fontFamily: MONO, fontSize: 10, color: TEXT, flex: 1, lineHeight: 14 },
  badge:      { borderWidth: 1, borderRadius: 5, paddingHorizontal: 5, paddingVertical: 2, flexShrink: 0 },
  badgeTxt:   { fontFamily: MONO, fontSize: 8, fontWeight: '900', letterSpacing: 0.3 },
  vertDivider:{ width: 1, backgroundColor: DIM + '80', marginVertical: 0 },
});

// ══════════════════════════════════════════════════════════════════
// QUICK NAV ROW
// ══════════════════════════════════════════════════════════════════
const QUICK_TABS = [
  { icon: 'robot-happy-outline', label: 'AI',      tab: 'butler',    color: CYAN  },
  { icon: 'code-braces',         label: 'SCRIPTS',  tab: 'scripts',   color: GREEN },
  { icon: 'brain',               label: 'KB',       tab: 'knowledge', color: AMBER },
  { icon: 'folder-network',      label: 'FILES',    tab: 'fileshare', color: PURP  },
  { icon: 'chart-bar',           label: 'LOGS',     tab: 'logs',      color: BLUE  },
  { icon: 'tune-variant',        label: 'SETTINGS', tab: 'settings',  color: MID   },
];

const QuickNav = memo(({ goToTab }: { goToTab: (t: string) => void }) => (
  <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'nowrap' }}>
    {QUICK_TABS.map((t, i) => (
      <TouchableOpacity key={i} onPress={() => { haptics.light(); goToTab(t.tab); }}
        activeOpacity={0.82}
        style={{ flex: 1, alignItems: 'center', gap: 4, paddingVertical: 10,
          borderWidth: 1.5, borderRadius: 10, borderColor: t.color + '35', backgroundColor: t.color + '08' }}>
        <MaterialCommunityIcons name={t.icon as any} size={18} color={t.color} />
        <Text style={{ fontFamily: MONO, fontSize: 7, fontWeight: '900', color: t.color + 'AA', letterSpacing: 0.3 }}>
          {t.label}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
));

// ══════════════════════════════════════════════════════════════════
// MAIN SCREEN
// ══════════════════════════════════════════════════════════════════
function HomeInner() {
  const insets = useSafeAreaInsets();
  const [isConn,  setIsConn]  = useState(false);
  const [addr,    setAddr]    = useState('');
  const [cpu,     setCpu]     = useState(0);
  const [ram,     setRam]     = useState(0);
  const [disk,    setDisk]    = useState(0);
  const [kbCount, setKbCount] = useState(0);
  const [refresh, setRefresh] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const conn = serverConnection.isConnected?.() ?? false;
      const ip   = serverConnection.getIP?.()   || '';
      const port = serverConnection.getPort?.() || '';
      setIsConn(conn); setAddr(ip && port ? `${ip}:${port}` : '');
      if (conn && ip && port) {
        const tok = serverConnection.getToken?.() || '';
        const h: Record<string,string> = {};
        if (tok) h['Authorization'] = 'Bearer ' + tok;
        const ctrl = new AbortController(); setTimeout(() => ctrl.abort(), 6000);
        try {
          const res = await fetch(`http://${ip}:${port}/api/metrics`, { headers: h, signal: ctrl.signal });
          if (res.ok) {
            const d = await res.json();
            setCpu(d.cpu_percent  ?? d.cpu?.percent    ?? 0);
            setRam(d.ram_percent  ?? d.memory?.percent ?? 0);
            setDisk(d.disk_percent ?? d.disk?.percent  ?? 0);
          }
        } catch {}
      }
      try {
        const s = await knowledgeAccumulator.getStats?.().catch(() => null);
        if (s) setKbCount(s.totalFindings ?? 0);
      } catch {}
    } catch {}
  }, []);

  useFocusEffect(useCallback(() => {
    loadData();
    const t = setInterval(loadData, 30000);
    return () => clearInterval(t);
  }, [loadData]));

  useEffect(() => {
    let unsub: (() => void) | null = null;
    try {
      unsub = connectionHub.subscribe((st: any) => {
        setIsConn(st.isConnected ?? false); setAddr(st.addr || '');
      });
    } catch {}
    return () => { unsub?.(); };
  }, []);

  const goToTab = useCallback((tab: string) => {
    haptics.light(); try { (global as any).__butlerSwitchTab?.(tab); } catch {}
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
        contentContainerStyle={{ padding: 14, gap: 16, paddingBottom: insets.bottom + 120 }}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={Platform.OS === 'android'}
        refreshControl={
          <RefreshControl refreshing={refresh} onRefresh={onRefresh}
            tintColor={CYAN} colors={[CYAN, GREEN]} progressBackgroundColor={SURF} />
        }
      >
        {/* Quick Nav */}
        <QuickNav goToTab={goToTab} />

        {/* 2×2 Telemetry Grid */}
        <View>
          <SectionLabel icon="satellite-variant" label="SYSTEM TELEMETRY" color={CYAN} />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            <ConnectedPCCard isConn={isConn} cpu={cpu} ram={ram} disk={disk} />
            <LiveFeedCard isConn={isConn} />
            <CrawlerCard isConn={isConn} kbCount={kbCount} />
            <KBCard isConn={isConn} kbCount={kbCount} />
          </View>
        </View>

        {/* 3×2 Metric Cards */}
        <View>
          <SectionLabel icon="chart-bar" label="SYSTEM METRICS" color={AMBER} />
          <MetricGrid isConn={isConn} />
        </View>

        {/* Alerts & Intel */}
        <View>
          <SectionLabel icon="alert-circle-outline" label="ALERTS & INTEL" color={AMBER}
            right={<PulseDot color={isConn ? GREEN : AMBER} size={6} />} />
          <AlertsIntelPanel isConn={isConn} kbCount={kbCount} goToTab={goToTab} />
        </View>

        {/* Footer micro-badge */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 12, paddingTop: 4 }}>
          {['AES-256','LAN ONLY','ZERO CLOUD','HMAC-SHA256'].map((b, i) => (
            <View key={i} style={{ borderWidth: 1, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3,
              borderColor: [CYAN,GREEN,AMBER,PURP][i] + '30', backgroundColor: [CYAN,GREEN,AMBER,PURP][i] + '06' }}>
              <Text style={{ fontFamily: MONO, fontSize: 7.5, color: [CYAN,GREEN,AMBER,PURP][i] + '70', fontWeight: '900' }}>
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
  return (
    <TabErrorBoundary name="Home">
      <HomeInner />
    </TabErrorBoundary>
  );
}
