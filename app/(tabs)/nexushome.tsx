/**
 * BUTLER AI — NEXUS HOME v2.0 · CLEAN SCRATCH BUILD
 * Matches the NEXUS reference screenshots exactly.
 * Zero legacy code. Zero imported noise.
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
  Platform, Animated, StatusBar, Dimensions,
} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Line, Polygon } from 'react-native-svg';
import { D, FONT, alpha, shadow } from '@/constants/design';
import { TabErrorBoundary } from '@/components/ui/TabErrorBoundary';

const SW = Math.max(320, Dimensions.get('window').width);

// ── tiny helpers ────────────────────────────────────────────────────
function PulseDot({ color, size = 7 }: { color: string; size?: number }) {
  const a = useRef(new Animated.Value(0.35)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(a, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(a, { toValue: 0.25, duration: 900, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);
  return (
    <Animated.View
      style={{
        width: size, height: size, borderRadius: size / 2,
        backgroundColor: color, opacity: a,
      }}
    />
  );
}

function Hairline({ color = D.border }: { color?: string }) {
  return <View style={{ height: 1, backgroundColor: color }} />;
}

// ── HEXAGON LOGO ───────────────────────────────────────────────────
function HexLogo({ size = 44 }: { size?: number }) {
  return (
    <View
      style={[
        {
          width: size, height: size, borderRadius: 12,
          backgroundColor: D.primary,
          alignItems: 'center', justifyContent: 'center',
        },
        shadow(D.primary, 0.55),
      ]}
    >
      <Svg width={22} height={22} viewBox="0 0 32 32">
        <Polygon
          points="16,2 28,9 28,23 16,30 4,23 4,9"
          fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth={2}
        />
        <Circle cx={16} cy={16} r={3.5} fill="rgba(255,255,255,0.9)" />
        <Line x1={16} y1={5.5} x2={16} y2={12} stroke="rgba(255,255,255,0.65)" strokeWidth={1.5} />
        <Line x1={16} y1={20} x2={16} y2={26.5} stroke="rgba(255,255,255,0.65)" strokeWidth={1.5} />
        <Line x1={5.5} y1={10} x2={12} y2={13.5} stroke="rgba(255,255,255,0.65)" strokeWidth={1.5} />
        <Line x1={20} y1={18.5} x2={26.5} y2={22} stroke="rgba(255,255,255,0.65)" strokeWidth={1.5} />
      </Svg>
    </View>
  );
}

// ── STICKY HEADER ──────────────────────────────────────────────────
function NexusHeader({ safeTop, isOnline }: { safeTop: number; isOnline: boolean }) {
  const cc = isOnline ? D.green : D.amber;
  return (
    <View style={[hdr.root, { paddingTop: safeTop + 8 }]}>
      {/* Left: logo + wordmark */}
      <View style={hdr.left}>
        <HexLogo />
        <View>
          <Text style={hdr.wordmark}>NEXUS</Text>
          <Text style={hdr.eyebrow}>COMMAND · V8.0</Text>
        </View>
      </View>

      {/* Right: status + buttons */}
      <View style={hdr.right}>
        <View style={[hdr.pill, { borderColor: alpha(cc, 0.35), backgroundColor: alpha(cc, 0.1) }]}>
          <PulseDot color={cc} />
          <Text style={[hdr.pillTxt, { color: cc }]}>
            {isOnline ? 'ONLINE' : 'OFFLINE'}
          </Text>
        </View>
        <TouchableOpacity style={hdr.iconBtn} activeOpacity={0.7}>
          <MaterialIcons name="notifications-none" size={16} color={D.textMid} />
        </TouchableOpacity>
        <TouchableOpacity style={hdr.iconBtn} activeOpacity={0.7}>
          <MaterialIcons name="search" size={16} color={D.textMid} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const hdr = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: alpha(D.bg, 0.97),
  },
  left:     { flexDirection: 'row', alignItems: 'center', gap: 12 },
  wordmark: { fontSize: 20, fontWeight: '900', color: D.text, letterSpacing: 4, lineHeight: 24 },
  eyebrow:  { fontFamily: FONT.mono, fontSize: 9, color: D.textDim, letterSpacing: 4, marginTop: 2 },
  right:    { flexDirection: 'row', alignItems: 'center', gap: 6 },
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderWidth: 1, borderRadius: 999,
    paddingHorizontal: 10, paddingVertical: 6,
  },
  pillTxt: { fontFamily: FONT.mono, fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  iconBtn: {
    width: 36, height: 36, borderRadius: 9,
    borderWidth: 1, borderColor: D.border,
    backgroundColor: D.surface2,
    alignItems: 'center', justifyContent: 'center',
  },
});

// ── TICKER BAR ────────────────────────────────────────────────────
const TICKER_ITEMS = [
  { label: 'CPU', value: '62%', dir: 'down', color: D.red },
  { label: 'RAM', value: '48%', dir: 'up', color: D.green },
  { label: 'REQ/S', value: '4.2k', dir: 'up', color: D.green },
  { label: 'AI TOK/S', value: '18.4k', dir: 'up', color: D.green },
  { label: 'LATENCY', value: '142ms', dir: 'down', color: D.red },
  { label: 'CACHE', value: '94%', dir: 'up', color: D.green },
  { label: 'ACTIVE', value: '1,284', dir: 'up', color: D.green },
  { label: 'ERRORS', value: '0.04%', dir: 'down', color: D.red },
];

function TickerBar() {
  const translateX = useRef(new Animated.Value(0)).current;
  const itemW = 100;
  const totalW = TICKER_ITEMS.length * itemW * 2;

  useEffect(() => {
    translateX.setValue(0);
    const loop = Animated.loop(
      Animated.timing(translateX, {
        toValue: -(itemW * TICKER_ITEMS.length),
        duration: 28000,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const doubled = [...TICKER_ITEMS, ...TICKER_ITEMS];

  return (
    <View style={tick.root}>
      <Hairline />
      <View style={{ overflow: 'hidden', height: 30 }}>
        <Animated.View
          style={{
            flexDirection: 'row',
            transform: [{ translateX }],
            width: totalW,
          }}
        >
          {doubled.map((item, i) => (
            <View key={i} style={[tick.item, { width: itemW }]}>
              <Text style={tick.label}>{item.label}</Text>
              <Text style={tick.arrow}>{item.dir === 'up' ? '▲' : '▼'}</Text>
              <Text style={[tick.value, { color: item.color }]}>{item.value}</Text>
            </View>
          ))}
        </Animated.View>
      </View>
      <Hairline />
    </View>
  );
}

const tick = StyleSheet.create({
  root: { backgroundColor: D.surface2 },
  item: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    justifyContent: 'center', paddingVertical: 6,
    borderRightWidth: 1, borderRightColor: alpha(D.border, 0.5),
  },
  label: { fontFamily: FONT.mono, fontSize: 9.5, color: D.textDim, letterSpacing: 1 },
  arrow: { fontFamily: FONT.mono, fontSize: 8, color: D.textDim },
  value: { fontFamily: FONT.mono, fontSize: 10, fontWeight: '700' },
});

// ── SECTION HEADER ────────────────────────────────────────────────
function SectionHeader({
  title, badge, badgeColor,
}: {
  title: string;
  badge?: string;
  badgeColor?: string;
}) {
  const bc = badgeColor ?? D.green;
  return (
    <View style={sh.root}>
      <Text style={sh.title}>{title}</Text>
      <View style={sh.line} />
      {badge ? (
        <View style={[sh.badge, { borderColor: alpha(bc, 0.4), backgroundColor: alpha(bc, 0.1) }]}>
          <Text style={[sh.badgeTxt, { color: bc }]}>{badge}</Text>
        </View>
      ) : null}
    </View>
  );
}

const sh = StyleSheet.create({
  root:     { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  title:    { fontFamily: FONT.mono, fontSize: 11, color: D.textDim, letterSpacing: 3 },
  line:     { flex: 1, height: 1, backgroundColor: D.border },
  badge:    { borderWidth: 1, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  badgeTxt: { fontFamily: FONT.mono, fontSize: 9, fontWeight: '700', letterSpacing: 1 },
});

// ── UPTIME BARS ───────────────────────────────────────────────────
const UPTIME_DAYS: ('ok' | 'warn' | 'down' | 'none')[] = [
  'ok','ok','ok','ok','ok','ok','warn','ok','ok','ok',
  'ok','ok','ok','ok','ok','ok','ok','ok','warn','ok',
  'ok','ok','ok','ok','ok','ok','ok','ok','ok','ok',
];

function UptimeBars() {
  const colorMap = { ok: D.green, warn: D.amber, down: D.red, none: D.border };
  return (
    <View style={{ flexDirection: 'row', gap: 3, marginVertical: 10 }}>
      {UPTIME_DAYS.map((d, i) => (
        <View
          key={i}
          style={{
            flex: 1,
            height: d === 'warn' ? 16 : d === 'down' ? 14 : 20,
            borderRadius: 3,
            backgroundColor: colorMap[d],
            alignSelf: 'flex-end',
          }}
        />
      ))}
    </View>
  );
}

// ── HERO PANEL ────────────────────────────────────────────────────
function HeroPanel({ isOnline }: { isOnline: boolean }) {
  const cornerColor = D.primary;
  const BRACKET = 18;

  return (
    <View
      style={[
        hero.card,
        { borderColor: alpha(cornerColor, 0.22) },
        shadow(cornerColor, 0.12),
      ]}
    >
      {/* Corner brackets */}
      {[
        { top: 10, left: 10, rotate: '0deg' },
        { top: 10, right: 10, rotate: '90deg' },
        { bottom: 10, right: 10, rotate: '180deg' },
        { bottom: 10, left: 10, rotate: '270deg' },
      ].map((pos, i) => (
        <View
          key={i}
          style={[
            hero.bracket,
            pos as any,
            {
              borderTopColor: cornerColor,
              borderLeftColor: cornerColor,
              width: BRACKET, height: BRACKET,
              transform: [{ rotate: pos.rotate as any }],
            },
          ]}
        />
      ))}

      {/* Robot avatar */}
      <View style={hero.avatarWrap}>
        <View style={[hero.hexFrame, { borderColor: alpha(D.primaryGlow, 0.7) }]}>
          <MaterialCommunityIcons name="robot-happy" size={52} color={D.primaryGlow} />
        </View>
        {/* Status dot */}
        <View
          style={[
            hero.statusDot,
            {
              backgroundColor: isOnline ? D.green : D.amber,
              ...shadow(isOnline ? D.green : D.amber, 0.9),
            },
          ]}
        />
      </View>

      {/* Identity */}
      <Text style={hero.identity}>BUTLER · AI</Text>
      <View style={hero.pills}>
        <View style={[hero.pill, { borderColor: alpha(D.green, 0.4), backgroundColor: alpha(D.green, 0.1) }]}>
          <PulseDot color={D.green} size={5} />
          <Text style={[hero.pillTxt, { color: D.green }]}>ONLINE</Text>
        </View>
        <View style={[hero.pill, { borderColor: alpha(D.primary, 0.4), backgroundColor: alpha(D.primary, 0.1) }]}>
          <MaterialCommunityIcons name="shield-check" size={10} color={D.primary} />
          <Text style={[hero.pillTxt, { color: D.primary }]}>SECURE</Text>
        </View>
      </View>

      {/* Gradient headline */}
      <Text style={hero.headline}>All Systems Operational</Text>
      <Text style={hero.sub}>10 services · 12 nodes · 4 regions · 0 incidents</Text>

      <UptimeBars />

      <View style={hero.footer}>
        <Text style={hero.footerTxt}>30D UPTIME · 99.98%</Text>
        <Text style={[hero.footerRight, { color: D.green }]}>▲ HEALTHY</Text>
      </View>
    </View>
  );
}

const hero = StyleSheet.create({
  card: {
    borderWidth: 1, borderRadius: 14,
    backgroundColor: D.surface,
    padding: 18, position: 'relative', overflow: 'visible',
    marginBottom: 20,
  },
  bracket: {
    position: 'absolute',
    borderTopWidth: 2, borderLeftWidth: 2,
    borderTopRightRadius: 0, borderBottomLeftRadius: 0,
    borderTopLeftRadius: 4,
  },
  avatarWrap: { alignItems: 'center', marginBottom: 12, position: 'relative' },
  hexFrame: {
    width: 88, height: 88, borderRadius: 44,
    borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: alpha(D.primary, 0.08),
  },
  statusDot: {
    position: 'absolute', bottom: 4, right: '50%',
    marginRight: -48,
    width: 14, height: 14, borderRadius: 7,
    borderWidth: 2.5, borderColor: D.surface,
  },
  identity: {
    fontFamily: FONT.mono, fontSize: 11, color: D.textDim,
    letterSpacing: 4, textAlign: 'center', marginBottom: 8,
  },
  pills:    { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 16 },
  pill:     { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  pillTxt:  { fontFamily: FONT.mono, fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
  headline: {
    fontSize: 22, fontWeight: '800', textAlign: 'center',
    color: D.primaryGlow, letterSpacing: 0.3, marginBottom: 6,
  },
  sub: {
    fontFamily: FONT.mono, fontSize: 11, color: D.textDim,
    textAlign: 'center', letterSpacing: 0.5,
  },
  footer:      { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  footerTxt:   { fontFamily: FONT.mono, fontSize: 10, color: D.textDim },
  footerRight: { fontFamily: FONT.mono, fontSize: 10, fontWeight: '700' },
});

// ── SPARKLINE ─────────────────────────────────────────────────────
function Sparkline({ data, color, height = 36 }: { data: number[]; color: string; height?: number }) {
  if (!data.length) return null;
  const w = ((SW - 28 - 12) / 2) - 32;
  const max = Math.max(...data, 1);
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = height - (v / max) * height;
      return `${x},${y}`;
    })
    .join(' ');
  const d = pts
    .split(' ')
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p}`)
    .join(' ');

  return (
    <Svg width={w} height={height}>
      <Path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ── STAT CARD ─────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string;
  delta?: string;
  color: string;
  data: number[];
  fill?: boolean;
}

function StatCard({ label, value, delta, color, data, fill }: StatCardProps) {
  return (
    <View
      style={[
        sc.card,
        fill && { backgroundColor: alpha(color, 0.07) },
        { borderColor: alpha(color, fill ? 0.25 : 0.15) },
      ]}
    >
      {/* Left accent rail */}
      <View style={[sc.rail, { backgroundColor: color }]} />

      <View style={sc.body}>
        <Text style={sc.label}>{label}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
          <Text style={[sc.value, { color }]}>{value}</Text>
          {delta ? (
            <Text style={[sc.delta, { color: D.textDim }]}>{delta}</Text>
          ) : null}
        </View>
        <View style={{ marginTop: 6 }}>
          <Sparkline data={data} color={color} height={36} />
        </View>
        <Text style={sc.tapHint}>TAP TO EXPAND</Text>
      </View>
    </View>
  );
}

const sc = StyleSheet.create({
  card: {
    flex: 1,
    borderWidth: 1, borderRadius: 12,
    backgroundColor: D.surface,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  rail:    { width: 3, alignSelf: 'stretch', borderRadius: 2 },
  body:    { flex: 1, padding: 12 },
  label:   { fontFamily: FONT.mono, fontSize: 9.5, color: D.textMid, letterSpacing: 1.5, marginBottom: 5 },
  value:   { fontSize: 26, fontWeight: '800', lineHeight: 30 },
  delta:   { fontFamily: FONT.mono, fontSize: 10, color: D.textDim },
  tapHint: { fontFamily: FONT.mono, fontSize: 8.5, color: D.textDim, letterSpacing: 1, marginTop: 6 },
});

// ── FORGE CTA ─────────────────────────────────────────────────────
function ForgeCTA({ onPress }: { onPress: () => void }) {
  const scaleA = useRef(new Animated.Value(1)).current;
  const pressIn  = () => Animated.spring(scaleA, { toValue: 0.96, useNativeDriver: true, tension: 300, friction: 12 }).start();
  const pressOut = () => Animated.spring(scaleA, { toValue: 1,    useNativeDriver: true, tension: 180, friction: 10 }).start();

  return (
    <Animated.View style={{ transform: [{ scale: scaleA }] }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        activeOpacity={1}
        style={[cta.btn, shadow(D.violet, 0.5)]}
      >
        <MaterialCommunityIcons name="auto-fix" size={18} color={D.violet} />
        <Text style={cta.txt}>✦ FORGE NEW SCRIPT</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const cta = StyleSheet.create({
  btn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10,
    borderWidth: 1.5, borderRadius: 10, borderColor: D.violet,
    backgroundColor: alpha(D.violet, 0.1),
    paddingVertical: 15, paddingHorizontal: 20,
    marginBottom: 20,
  },
  txt: {
    fontFamily: FONT.mono, fontSize: 13, fontWeight: '900',
    color: D.violet, letterSpacing: 2,
  },
});

// ── STAT DATA ─────────────────────────────────────────────────────
const MOCK_DATA = {
  uptime:   [98, 99, 100, 99, 100, 98, 100, 99, 100, 100],
  requests: [42, 36, 48, 51, 44, 48, 52, 48, 45, 50],
  latency:  [140, 155, 148, 138, 145, 150, 142, 148, 144, 142],
  errors:   [0.04, 0.03, 0.06, 0.04, 0.03, 0.04, 0.05, 0.04, 0.03, 0.04],
  active:   [1100, 1180, 1220, 1250, 1240, 1260, 1275, 1282, 1280, 1284],
  tokps:    [14, 16, 18, 17, 19, 18, 17, 18, 19, 18],
};

// ══════════════════════════════════════════════════════════════════
// MAIN SCREEN
// ══════════════════════════════════════════════════════════════════
function NexusHomeInner() {
  const insets   = useSafeAreaInsets();
  const [isOnline, setIsOnline] = useState(false);

  const goToTab = useCallback((tab: string) => {
    try { (global as any).__butlerSwitchTab?.(tab); } catch {}
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: D.bg }}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* STICKY HEADER */}
      <NexusHeader safeTop={insets.top} isOnline={isOnline} />

      {/* HAIRLINE */}
      <Hairline />

      {/* TICKER */}
      <TickerBar />

      {/* CONTENT */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 14, gap: 20, paddingBottom: 140 }}
      >

        {/* HERO PANEL */}
        <HeroPanel isOnline={isOnline} />

        {/* FORGE CTA */}
        <ForgeCTA onPress={() => goToTab('scripts')} />

        {/* SYSTEM VITALS */}
        <SectionHeader title="SYSTEM VITALS" badge="LIVE" badgeColor={D.green} />

        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
          <StatCard
            label="UPTIME" value="99.98%" delta="+0.02%"
            color={D.green} data={MOCK_DATA.uptime}
          />
          <StatCard
            label="REQUESTS" value="48.2k" delta="+12%"
            color={D.primary} data={MOCK_DATA.requests}
          />
        </View>
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
          <StatCard
            label="LATENCY" value="142ms" delta="-8ms"
            color={D.cyan} data={MOCK_DATA.latency} fill
          />
          <StatCard
            label="ERRORS" value="0.04%" delta="-0.01%"
            color={D.red} data={MOCK_DATA.errors}
          />
        </View>
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 4 }}>
          <StatCard
            label="ACTIVE" value="1,284" delta="+184"
            color={D.violet} data={MOCK_DATA.active}
          />
          <StatCard
            label="AI TOK/S" value="18.4k" delta="+2.1k"
            color={D.net} data={MOCK_DATA.tokps}
          />
        </View>

        {/* SECURITY PROTOCOLS */}
        <SectionHeader title="SECURITY PROTOCOLS" badge="SECURE" badgeColor={D.green} />
        <SecurityStrip />

        {/* QUICK ACCESS */}
        <SectionHeader title="QUICK ACCESS" />
        <QuickGrid onNavigate={goToTab} />

      </ScrollView>
    </View>
  );
}

// ── SECURITY STRIP ─────────────────────────────────────────────────
const SEC_ITEMS = [
  { label: 'FIREWALL',  sub: 'ACTIVE',     color: D.green  },
  { label: 'INTRUSION', sub: 'ACTIVE',     color: D.cyan   },
  { label: 'ENCRYPT',   sub: 'AES-256',    color: D.violet },
  { label: 'ACCESS',    sub: 'ZERO TRUST', color: D.amber  },
  { label: 'SANDBOX',   sub: 'ISOLATED',   color: D.textMid },
];

function SecurityStrip() {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8, paddingBottom: 4 }}
      style={{ marginBottom: 20 }}
    >
      {SEC_ITEMS.map((item) => (
        <View
          key={item.label}
          style={[
            ss.item,
            { borderColor: alpha(item.color, 0.4), backgroundColor: alpha(item.color, 0.08) },
          ]}
        >
          <Text style={[ss.label, { color: item.color }]}>{item.label}</Text>
          <Text style={[ss.sub, { color: alpha(item.color, 0.7) }]}>{item.sub}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const ss = StyleSheet.create({
  item:  { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, alignItems: 'center', gap: 3, minWidth: 80 },
  label: { fontFamily: FONT.mono, fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  sub:   { fontFamily: FONT.mono, fontSize: 8, letterSpacing: 0.5 },
});

// ── QUICK GRID ─────────────────────────────────────────────────────
const QUICK_ITEMS = [
  { icon: 'chat',          label: 'AI CHAT',  sub: 'Local Ollama',        color: D.primary,  tab: 'butler'    },
  { icon: 'code',          label: 'SCRIPTS',  sub: '250+ Python scripts', color: D.amber,    tab: 'scripts'   },
  { icon: 'folder-open',   label: 'VAULT',    sub: 'Encrypted storage',   color: D.pink,     tab: 'fileshare' },
  { icon: 'psychology',    label: 'KB',        sub: 'Neural knowledge',    color: D.violet,   tab: 'knowledge' },
  { icon: 'share',         label: 'FILES',     sub: 'Direct LAN transfer', color: D.teal,     tab: 'fileshare' },
  { icon: 'bar-chart',     label: 'LOGS',      sub: 'System telemetry',    color: D.orange,   tab: 'logs'      },
];

function QuickGrid({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const colW = Math.floor((SW - 28 - 12) / 2);

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 8 }}>
      {QUICK_ITEMS.map((item) => (
        <TouchableOpacity
          key={item.label}
          onPress={() => onNavigate(item.tab)}
          activeOpacity={0.75}
          style={[
            qg.tile,
            { width: colW, borderColor: alpha(item.color, 0.3) },
          ]}
        >
          {/* Top accent */}
          <View style={[qg.topRail, { backgroundColor: item.color }]} />

          {/* Content */}
          <View style={qg.body}>
            <View style={[qg.iconBox, { backgroundColor: alpha(item.color, 0.12) }]}>
              <MaterialIcons name={item.icon as any} size={24} color={item.color} />
            </View>
            <Text style={[qg.label, { color: item.color }]}>{item.label}</Text>
            <Text style={qg.sub} numberOfLines={1}>{item.sub}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const qg = StyleSheet.create({
  tile: {
    borderWidth: 1, borderRadius: 12,
    backgroundColor: D.surface,
    overflow: 'hidden',
    aspectRatio: 1,
  },
  topRail: { height: 2 },
  body: {
    flex: 1, padding: 12,
    justifyContent: 'center', gap: 8,
  },
  iconBox: { width: 44, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  label:   { fontFamily: FONT.mono, fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },
  sub:     { fontFamily: FONT.mono, fontSize: 9, color: D.textDim, letterSpacing: 0.5 },
});

// ── EXPORT ────────────────────────────────────────────────────────
export default function NexusHomeScreen() {
  return (
    <TabErrorBoundary name="Nexus Home">
      <NexusHomeInner />
    </TabErrorBoundary>
  );
}
