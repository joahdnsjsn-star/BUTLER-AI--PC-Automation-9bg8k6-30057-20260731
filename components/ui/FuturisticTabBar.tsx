/**
 * BUTLER AI — NEXUS TAB BAR v2.0 · CLEAN SCRATCH BUILD
 * Floating pill card · per-tab brand colours · QuickButlerBar dock
 */

import React, { useEffect, useRef, useMemo, useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Platform, Animated, Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { haptics } from '@/services/haptics';
import { autoErrorLogger } from '@/services/autoErrorLogger';
import QuickButlerBar from '@/components/ui/QuickButlerBar';
import { D, FONT, alpha } from '@/constants/design';
import {
  NexusCoreIcon, ForgeScriptsIcon, ButlerAIIcon, KnowledgeBaseIcon,
  IntelLogsIcon, BuilderIcon, VaultIcon, ConfigIcon, SkinsIcon,
} from '@/components/ui/NexusTabIcons';
import Svg, { Rect, Circle } from 'react-native-svg';

// ── GLOBAL AI BADGE STATE ─────────────────────────────────────────
let _butlerUnread = false;
const _listeners: Set<() => void> = new Set();

export function notifyButlerNewMessage() {
  _butlerUnread = true;
  _listeners.forEach(fn => { try { fn(); } catch {} });
}
export function clearButlerUnread() {
  _butlerUnread = false;
  _listeners.forEach(fn => { try { fn(); } catch {} });
}
(global as any).__notifyButlerNewMessage = notifyButlerNewMessage;
(global as any).__clearButlerUnread      = clearButlerUnread;

// ── CONSTANTS ─────────────────────────────────────────────────────
const HIDDEN_TABS = new Set(['onboarding', 'index', 'nexushome']);

const TAB_ALIASES: Record<string, string> = {
  home: 'butler', core: 'butler', nexushome: 'butler',
};

const TAB_META: Record<string, { color: string; label: string }> = {
  scripts:   { color: D.violet, label: 'FORGE' },
  butler:    { color: D.primary, label: 'AI'   },
  knowledge: { color: D.violet, label: 'KB'    },
  logs:      { color: D.amber,  label: 'LOG'   },
  builder:   { color: D.orange, label: 'BUILD' },
  fileshare: { color: D.pink,   label: 'VAULT' },
  settings:  { color: D.textMid, label: 'CFG'  },
  cosmetic:  { color: D.pink,   label: 'SKIN'  },
  downloads: { color: '#82CB15', label: 'GET'  },
  connect:   { color: D.teal,   label: 'PAIR'  },
};

const ICON_SIZE = 20;

// ── PAIR ICON ─────────────────────────────────────────────────────
function PairIcon({ size = 20, color = D.teal }: { size?: number; color?: string }) {
  const s = size; const c = s / 2;
  return (
    <Svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
      <Rect x={c - s*0.42} y={c - s*0.42} width={s*0.24} height={s*0.24} rx={s*0.04}
        stroke={color} strokeWidth={s*0.07} fill="none" />
      <Rect x={c + s*0.18} y={c - s*0.42} width={s*0.24} height={s*0.24} rx={s*0.04}
        stroke={color} strokeWidth={s*0.07} fill="none" />
      <Rect x={c - s*0.42} y={c + s*0.18} width={s*0.24} height={s*0.24} rx={s*0.04}
        stroke={color} strokeWidth={s*0.07} fill="none" />
      <Rect x={c - s*0.31} y={c - s*0.31} width={s*0.10} height={s*0.10} rx={s*0.02} fill={color} opacity={0.9} />
      <Rect x={c + s*0.21} y={c - s*0.31} width={s*0.10} height={s*0.10} rx={s*0.02} fill={color} opacity={0.9} />
      <Rect x={c - s*0.31} y={c + s*0.21} width={s*0.10} height={s*0.10} rx={s*0.02} fill={color} opacity={0.9} />
      <Circle cx={c + s*0.30} cy={c + s*0.30} r={s*0.13} stroke={color} strokeWidth={s*0.055} fill="none" />
      <Circle cx={c + s*0.30} cy={c + s*0.30} r={s*0.055} fill={color} />
    </Svg>
  );
}

function getColor(name: string) { return TAB_META[name]?.color ?? D.primary; }
function getLabel(name: string) { return TAB_META[name]?.label ?? name.slice(0, 4).toUpperCase(); }

function renderIcon(name: string, color: string, active: boolean) {
  const p = { size: ICON_SIZE, color, active, dimOpacity: 0.9 };
  switch (name) {
    case 'scripts':    return <ForgeScriptsIcon   {...p} />;
    case 'butler':     return <ButlerAIIcon        {...p} />;
    case 'knowledge':  return <KnowledgeBaseIcon   {...p} />;
    case 'logs':       return <IntelLogsIcon       {...p} />;
    case 'builder':    return <BuilderIcon         {...p} />;
    case 'fileshare':  return <VaultIcon           {...p} />;
    case 'settings':   return <ConfigIcon          {...p} />;
    case 'cosmetic':   return <SkinsIcon           {...p} />;
    case 'connect':    return <PairIcon size={ICON_SIZE} color={color} />;
    case 'downloads':  return <NexusCoreIcon       {...p} />;
    default:           return <ButlerAIIcon        {...p} />;
  }
}

// ── TAB ITEM ──────────────────────────────────────────────────────
const TabItem = React.memo(function TabItem({
  name, focused, onPress,
}: {
  name: string; focused: boolean; onPress: () => void;
}) {
  const color = getColor(name);
  const label = getLabel(name);
  const scaleA = useRef(new Animated.Value(1)).current;
  const bgA    = useRef(new Animated.Value(focused ? 1 : 0)).current;

  const [unread, setUnread] = useState(_butlerUnread && name === 'butler');

  useEffect(() => {
    if (name !== 'butler') return;
    const fn = () => setUnread(_butlerUnread);
    _listeners.add(fn);
    return () => { _listeners.delete(fn); };
  }, [name]);

  useEffect(() => {
    if (focused && name === 'butler') clearButlerUnread();
  }, [focused, name]);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleA, { toValue: focused ? 1.06 : 1, tension: 280, friction: 14, useNativeDriver: true }),
      Animated.timing(bgA, { toValue: focused ? 1 : 0, duration: 180, useNativeDriver: false }),
    ]).start();
  }, [focused]);

  const bgColor   = bgA.interpolate({ inputRange: [0, 1], outputRange: ['rgba(0,0,0,0)', alpha(color, 0.22)] });
  const iconColor = focused ? color : alpha(D.textMid, 0.6);
  const txtColor  = focused ? color : alpha(D.textMid, 0.7);

  return (
    <TouchableOpacity
      onPress={() => { haptics.light(); onPress(); }}
      activeOpacity={0.75}
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 6 }}
      accessibilityRole="button"
      accessibilityState={{ selected: focused }}
    >
      <Animated.View
        style={{
          transform: [{ scale: scaleA }],
          alignItems: 'center', gap: 3,
        }}
      >
        {/* Icon pill */}
        <Animated.View
          style={[
            ti.pill,
            { backgroundColor: bgColor },
            focused && { borderColor: alpha(color, 0.4) },
          ]}
        >
          {focused && (
            <View style={[ti.activeLine, { backgroundColor: color }]} />
          )}
          {renderIcon(name, iconColor, focused)}
          {unread && !focused && (
            <View style={ti.badge} />
          )}
        </Animated.View>

        {/* Label */}
        <Text style={[ti.label, { color: txtColor }]} numberOfLines={1}>
          {label}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
});

const ti = StyleSheet.create({
  pill: {
    width: 44, height: 34, borderRadius: 10,
    borderWidth: 1, borderColor: 'transparent',
    alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  activeLine: {
    position: 'absolute', top: -1, left: '50%', marginLeft: -12,
    width: 24, height: 2.5, borderRadius: 2,
  },
  badge: {
    position: 'absolute', top: 2, right: 2,
    width: 7, height: 7, borderRadius: 3.5,
    backgroundColor: D.red,
    borderWidth: 1.5, borderColor: '#0A0E18',
  },
  label: {
    fontFamily: FONT.mono, fontSize: 8, fontWeight: '700',
    letterSpacing: 0.5, textAlign: 'center',
  },
});

// ── MAIN COMPONENT ────────────────────────────────────────────────
export default function FuturisticTabBar(props: BottomTabBarProps & {
  iconMap?: Record<string, (c: string, s: number) => React.ReactNode>;
}) {
  const { state, descriptors, navigation } = props;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    (global as any).__butlerSwitchTab = (tab: string) => {
      const route = TAB_ALIASES[tab.toLowerCase()] ?? tab;
      try { navigation.navigate(route as never); } catch {}
    };
    return () => { delete (global as any).__butlerSwitchTab; };
  }, [navigation]);

  const visibleRoutes = useMemo(() =>
    state.routes
      .map((r, i) => ({ route: r, idx: i }))
      .filter(({ route }) => {
        if (HIDDEN_TABS.has(route.name)) return false;
        const opts = descriptors[route.key].options as any;
        if (opts?.href === null) return false;
        return true;
      }),
    [state.routes, descriptors],
  );

  const activeRoute = visibleRoutes.find(r => r.idx === state.index)?.route?.name ?? '';
  const activeColor = getColor(activeRoute);
  const isOnAI      = activeRoute === 'butler';
  const bottomPad   = Math.max(insets.bottom, Platform.OS === 'android' ? 4 : 0);

  return (
    <View pointerEvents="box-none" style={[dock.root, { paddingBottom: bottomPad }]}>
      {/* QuickButlerBar above dock (hidden on AI tab) */}
      {!isOnAI && (
        <View style={dock.barWrap} pointerEvents="box-none">
          <QuickButlerBar />
        </View>
      )}

      {/* Floating dock card */}
      <View style={dock.card}>
        {/* Active-tab accent stripe */}
        <View style={[dock.stripe, { backgroundColor: activeColor }]} />

        {/* Tabs */}
        <View style={dock.row}>
          {visibleRoutes.map(({ route, idx }) => (
            <TabItem
              key={route.key}
              name={route.name}
              focused={state.index === idx}
              onPress={() => {
                const ev = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                if (state.index !== idx && !ev.defaultPrevented) navigation.navigate(route.name as never);
              }}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const dock = StyleSheet.create({
  root: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    backgroundColor: 'transparent',
  },
  barWrap: { width: '100%', marginBottom: 4 },
  card: {
    marginHorizontal: 8, marginBottom: 6,
    borderRadius: 20,
    backgroundColor: '#0A0E18',
    borderWidth: 1.5,
    borderColor: alpha(D.primary, 0.15),
    overflow: 'hidden',
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.8, shadowRadius: 14 },
      android: { elevation: 22 },
      default: {},
    }),
  },
  stripe: { height: 2.5, opacity: 0.8 },
  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around',
    paddingHorizontal: 2, paddingTop: 4, paddingBottom: 6,
  },
});
