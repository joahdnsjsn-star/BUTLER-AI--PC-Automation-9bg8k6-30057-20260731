/**
 * BUTLER AI — AI CHAT v17.0 · NEXUS DESIGN SYSTEM
 * Clean scratch build matching the navy/blue reference screenshots.
 * Zero gold/violet cyberpunk. Pure NEXUS navy palette.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, FlatList,
  StyleSheet, Platform, ActivityIndicator, KeyboardAvoidingView,
  Animated, Dimensions, StatusBar,
} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { haptics } from '@/services/haptics';
import { TabErrorBoundary } from '@/components/ui/TabErrorBoundary';
import { useConnectionStatus } from '@/hooks/useConnection';
import { D, FONT, alpha, shadow } from '@/constants/design';

const SW = Dimensions.get('window').width;

// ── quick atoms ─────────────────────────────────────────────────────
function PulseDot({ color, size = 6 }: { color: string; size?: number }) {
  const a = useRef(new Animated.Value(0.35)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(a, { toValue: 1,    duration: 900, useNativeDriver: true }),
        Animated.timing(a, { toValue: 0.25, duration: 900, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);
  return (
    <Animated.View
      style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color, opacity: a }}
    />
  );
}

function Hairline({ color = D.border }: { color?: string }) {
  return <View style={{ height: 1, backgroundColor: color }} />;
}

// ── STREAMING CURSOR ─────────────────────────────────────────────────
function StreamCursor() {
  const a = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(a, { toValue: 0, duration: 480, useNativeDriver: true }),
        Animated.timing(a, { toValue: 1, duration: 480, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);
  return (
    <Animated.View
      style={{
        width: 8, height: 15, borderRadius: 2,
        backgroundColor: D.primaryGlow, opacity: a,
        marginLeft: 3, marginBottom: -2,
      }}
    />
  );
}

// ── TYPING DOTS ───────────────────────────────────────────────────────
function TypingDots() {
  const dots = useRef([
    new Animated.Value(0.3),
    new Animated.Value(0.3),
    new Animated.Value(0.3),
  ]).current;
  useEffect(() => {
    const loops = dots.map((d, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 160),
          Animated.timing(d, { toValue: 1,   duration: 340, useNativeDriver: true }),
          Animated.timing(d, { toValue: 0.2, duration: 340, useNativeDriver: true }),
        ]),
      ),
    );
    loops.forEach(l => l.start());
    return () => loops.forEach(l => l.stop());
  }, []);
  return (
    <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center', paddingVertical: 8 }}>
      {dots.map((d, i) => (
        <Animated.View
          key={i}
          style={{
            width: 7, height: 7, borderRadius: 3.5,
            backgroundColor: D.primary, opacity: d,
          }}
        />
      ))}
    </View>
  );
}

// ── TYPES ─────────────────────────────────────────────────────────────
type Role = 'user' | 'butler';
interface Msg {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
  streaming?: boolean;
  failed?: boolean;
}

// ── QUICK STARTERS ─────────────────────────────────────────────────────
const STARTERS = [
  { icon: 'monitor',   label: 'System Stats',  prompt: 'Show my CPU, RAM and disk usage',         color: D.cyan    },
  { icon: 'cleaning-services', label: 'Clean Temp', prompt: 'Write Python to clean temp files',  color: D.green   },
  { icon: 'speed',     label: 'Top Processes', prompt: 'List top CPU-using processes',            color: D.amber   },
  { icon: 'wifi',      label: 'Network Info',  prompt: 'Scan LAN and show connected devices',    color: D.violet  },
];

// ══════════════════════════════════════════════════════════════════════
// HEADER
// ══════════════════════════════════════════════════════════════════════
function ChatHeader({
  safeTop,
  isOnline,
  model,
  msgCount,
  onClear,
}: {
  safeTop: number;
  isOnline: boolean;
  model: string;
  msgCount: number;
  onClear: () => void;
}) {
  const cc = isOnline ? D.green : D.amber;
  const modelLabel = model
    ? model.split(':')[0].slice(0, 14).toUpperCase()
    : isOnline ? 'DETECTING…' : 'OFFLINE';

  return (
    <View style={[hdr.root, { paddingTop: safeTop + 8 }]}>
      {/* Rainbow top stripe */}
      <View style={{ height: 3, flexDirection: 'row' }}>
        {[D.primary, D.violet, D.cyan, D.green, D.amber].map((c, i) => (
          <View key={i} style={{ flex: 1, backgroundColor: c }} />
        ))}
      </View>

      <View style={hdr.body}>
        {/* Left: mascot tile */}
        <View style={[hdr.mascot, shadow(D.primary, 0.45)]}>
          <MaterialCommunityIcons name="robot-happy" size={26} color={D.primary} />
          <View style={[hdr.statusOrb, { backgroundColor: cc }]} />
        </View>

        {/* Center: title block */}
        <View style={{ flex: 1, alignItems: 'center', gap: 4 }}>
          <Text style={hdr.title}>
            <Text style={{ color: D.primary }}>AI </Text>
            <Text style={{ color: D.text }}>BUTLER</Text>
          </Text>
          <Text style={hdr.eyebrow}>NEXUS CONSOLE · LOCAL AI · ZERO CLOUD</Text>
          {/* Pills */}
          <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
            <View style={[hdr.pill, { borderColor: alpha(cc, 0.4), backgroundColor: alpha(cc, 0.1) }]}>
              <PulseDot color={cc} size={5} />
              <Text style={[hdr.pillTxt, { color: cc }]}>
                {isOnline ? 'CONNECTED' : 'OFFLINE'}
              </Text>
            </View>
            {isOnline && (
              <View style={[hdr.pill, { borderColor: alpha(D.violet, 0.4), backgroundColor: alpha(D.violet, 0.1) }]}>
                <MaterialCommunityIcons name="chip" size={10} color={D.violet} />
                <Text style={[hdr.pillTxt, { color: D.violet }]}>{modelLabel}</Text>
              </View>
            )}
            <View style={[hdr.pill, { borderColor: alpha(D.cyan, 0.4), backgroundColor: alpha(D.cyan, 0.1) }]}>
              <MaterialCommunityIcons name="shield-lock" size={10} color={D.cyan} />
              <Text style={[hdr.pillTxt, { color: D.cyan }]}>AES-256</Text>
            </View>
          </View>
        </View>

        {/* Right: actions */}
        <View style={{ gap: 6, alignItems: 'flex-end' }}>
          {msgCount > 0 && (
            <TouchableOpacity
              onPress={onClear}
              style={[hdr.iconBtn, { borderColor: alpha(D.red, 0.5), backgroundColor: alpha(D.red, 0.08) }]}
              activeOpacity={0.7}
            >
              <MaterialIcons name="delete-sweep" size={15} color={D.red} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => (global as any).__butlerSwitchTab?.('connect')}
            style={[hdr.iconBtn, { borderColor: alpha(D.teal, 0.4), backgroundColor: alpha(D.teal, 0.08) }]}
            activeOpacity={0.7}
          >
            <MaterialIcons name="qr-code-scanner" size={15} color={D.teal} />
          </TouchableOpacity>
        </View>
      </View>

      <Hairline />
    </View>
  );
}

const hdr = StyleSheet.create({
  root:      { backgroundColor: D.surface },
  body:      { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 13, paddingVertical: 10 },
  mascot:    {
    width: 46, height: 46, borderRadius: 13,
    borderWidth: 2, borderColor: alpha(D.primary, 0.5),
    backgroundColor: alpha(D.primary, 0.08),
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, position: 'relative',
  },
  statusOrb: {
    position: 'absolute', bottom: 3, right: 3,
    width: 10, height: 10, borderRadius: 5,
    borderWidth: 2, borderColor: D.surface,
  },
  title:     { fontFamily: FONT.mono, fontSize: 20, fontWeight: '900', letterSpacing: 1, lineHeight: 24, textAlign: 'center' },
  eyebrow:   { fontFamily: FONT.mono, fontSize: 8, color: D.textDim, letterSpacing: 2, textAlign: 'center' },
  pill:      { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4 },
  pillTxt:   { fontFamily: FONT.mono, fontSize: 8.5, fontWeight: '700', letterSpacing: 0.5 },
  iconBtn:   { width: 34, height: 34, borderRadius: 9, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
});

// ══════════════════════════════════════════════════════════════════════
// MODEL STRIP
// ══════════════════════════════════════════════════════════════════════
function ModelStrip({ model, isOnline }: { model: string; isOnline: boolean }) {
  if (!isOnline) {
    return (
      <View style={ms.root}>
        <MaterialIcons name="link-off" size={11} color={D.amber} />
        <Text style={[ms.txt, { color: D.amber }]}>
          OFFLINE · Go to HOME → PAIR PC to connect
        </Text>
      </View>
    );
  }
  if (!model) {
    return (
      <View style={ms.root}>
        <ActivityIndicator size="small" color={D.amber} style={{ transform: [{ scale: 0.65 }] }} />
        <Text style={[ms.txt, { color: D.amber }]}>Scanning Ollama for models…</Text>
      </View>
    );
  }
  const modelLabel = model.split(':')[0].slice(0, 18).toUpperCase();
  const spec = model.includes('coder') ? '128k ctx · code specialist'
    : model.includes('qwen')   ? '128k ctx · reasoning + code'
    : model.includes('llama3') ? '8k ctx · instruction following'
    : model.includes('mistral')? '32k ctx · fast + reliable'
    : '—';

  return (
    <View style={ms.root}>
      <MaterialCommunityIcons name="chip" size={11} color={D.green} />
      <Text style={[ms.txt, { color: D.green }]}>{modelLabel}</Text>
      <Text style={ms.dot}>·</Text>
      <Text style={[ms.txt, { color: D.textDim }]}>{spec}</Text>
      <View style={{ flex: 1 }} />
      <Text style={[ms.txt, { color: D.textDim }]}>LOCAL LLM · LAN ONLY</Text>
    </View>
  );
}

const ms = StyleSheet.create({
  root: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 7,
    backgroundColor: D.surface2,
    borderBottomWidth: 1, borderBottomColor: D.border,
  },
  txt:  { fontFamily: FONT.mono, fontSize: 9.5, letterSpacing: 0.5 },
  dot:  { fontFamily: FONT.mono, fontSize: 9, color: D.textDim },
});

// ══════════════════════════════════════════════════════════════════════
// EMPTY STATE
// ══════════════════════════════════════════════════════════════════════
function EmptyState({ isOnline, onSend }: { isOnline: boolean; onSend: (p: string) => void }) {
  const floatA = useRef(new Animated.Value(0)).current;
  const fadeA  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeA, { toValue: 1, duration: 420, useNativeDriver: true }).start();
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatA, { toValue: 1, duration: 2800, useNativeDriver: true }),
        Animated.timing(floatA, { toValue: 0, duration: 2800, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const floatY = floatA.interpolate({ inputRange: [0, 1], outputRange: [0, -8] });

  return (
    <Animated.View style={[emp.root, { opacity: fadeA }]}>
      {/* Hero */}
      <View style={[emp.card, shadow(D.primary, 0.2)]}>
        <View style={{ height: 3, backgroundColor: D.primary }} />
        <View style={{ alignItems: 'center', padding: 24, gap: 12 }}>
          <Animated.View style={{ transform: [{ translateY: floatY }] }}>
            <View style={[emp.iconBox, shadow(D.primary, 0.5)]}>
              <MaterialCommunityIcons name="robot-happy" size={58} color={D.primary} />
            </View>
          </Animated.View>

          <Text style={emp.title}>
            <Text style={{ color: D.primary }}>AI </Text>
            <Text style={{ color: D.text }}>BUTLER</Text>
          </Text>
          <Text style={emp.sub}>Local AI · Zero cloud · Runs on your PC</Text>

          {/* Badges */}
          <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
            {[
              { l: 'ZERO CLOUD',  c: D.green  },
              { l: 'LAN ONLY',    c: D.primary },
              { l: 'AES-256',     c: D.violet  },
              { l: 'LOCAL LLM',   c: D.cyan    },
            ].map(b => (
              <View
                key={b.l}
                style={[emp.badge, { borderColor: alpha(b.c, 0.45), backgroundColor: alpha(b.c, 0.08) }]}
              >
                <Text style={[emp.badgeTxt, { color: b.c }]}>{b.l}</Text>
              </View>
            ))}
          </View>

          {/* Offline guide */}
          {!isOnline && (
            <View style={[emp.guide, { borderColor: alpha(D.amber, 0.35), backgroundColor: alpha(D.amber, 0.07) }]}>
              <MaterialIcons name="info-outline" size={14} color={D.amber} />
              <Text style={[emp.guideTxt, { color: D.amber }]}>
                {'Run butler_server.py on your PC\nHOME tab → PAIR PC → scan QR'}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Quick starters */}
      {isOnline && (
        <View style={emp.starters}>
          <Text style={emp.starterLabel}>QUICK START</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
            {STARTERS.map((s, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => { haptics.medium(); onSend(s.prompt); }}
                activeOpacity={0.75}
                style={[
                  emp.starterBtn,
                  { borderColor: alpha(s.color, 0.4), backgroundColor: alpha(s.color, 0.07) },
                ]}
              >
                <MaterialIcons name={s.icon as any} size={14} color={s.color} />
                <Text style={[emp.starterTxt, { color: s.color }]}>{s.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </Animated.View>
  );
}

const emp = StyleSheet.create({
  root:        { flex: 1, paddingHorizontal: 14, paddingTop: 16, gap: 18, paddingBottom: 24 },
  card:        { backgroundColor: D.surface, borderRadius: 16, borderWidth: 1, borderColor: alpha(D.primary, 0.2), overflow: 'hidden' },
  iconBox:     { width: 96, height: 96, borderRadius: 48, backgroundColor: alpha(D.primary, 0.1), borderWidth: 2, borderColor: alpha(D.primary, 0.45), alignItems: 'center', justifyContent: 'center' },
  title:       { fontFamily: FONT.mono, fontSize: 26, fontWeight: '900', letterSpacing: 1, textAlign: 'center' },
  sub:         { fontFamily: FONT.mono, fontSize: 11, color: D.textMid, textAlign: 'center', letterSpacing: 0.5 },
  badge:       { borderWidth: 1, borderRadius: 8, paddingHorizontal: 9, paddingVertical: 4 },
  badgeTxt:    { fontFamily: FONT.mono, fontSize: 8.5, fontWeight: '700', letterSpacing: 0.3 },
  guide:       { flexDirection: 'row', alignItems: 'flex-start', gap: 8, borderWidth: 1, borderRadius: 10, padding: 12, marginTop: 4 },
  guideTxt:    { fontFamily: FONT.mono, fontSize: 10, lineHeight: 16, flex: 1 },
  starters:    { gap: 10, alignItems: 'center' },
  starterLabel:{ fontFamily: FONT.mono, fontSize: 9, color: D.textDim, letterSpacing: 3 },
  starterBtn:  { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 9 },
  starterTxt:  { fontFamily: FONT.mono, fontSize: 10.5, fontWeight: '700' },
});

// ══════════════════════════════════════════════════════════════════════
// MESSAGE BUBBLE
// ══════════════════════════════════════════════════════════════════════
function Bubble({
  msg,
  isStreaming,
}: {
  msg: Msg;
  isStreaming: boolean;
}) {
  const isButler = msg.role === 'butler';
  const slideA = useRef(new Animated.Value(isButler ? -16 : 16)).current;
  const fadeA  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideA, { toValue: 0, tension: 100, friction: 12, useNativeDriver: true }),
      Animated.timing(fadeA,  { toValue: 1, duration: 220, useNativeDriver: true }),
    ]).start();
  }, []);

  const accentColor = isButler ? D.primary : D.violet;
  const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <Animated.View
      style={[
        bub.row,
        isButler ? { alignItems: 'flex-start' } : { alignItems: 'flex-end' },
        { transform: [{ translateX: slideA }], opacity: fadeA },
      ]}
    >
      <View
        style={[
          bub.bubble,
          isButler
            ? { borderColor: alpha(accentColor, 0.25), borderLeftWidth: 3, borderLeftColor: accentColor, backgroundColor: D.surface }
            : { borderColor: alpha(accentColor, 0.3), backgroundColor: alpha(accentColor, 0.1) },
          msg.failed && { borderColor: alpha(D.red, 0.5), backgroundColor: alpha(D.red, 0.06) },
          shadow(accentColor, 0.15),
        ]}
      >
        {/* Header */}
        <View style={bub.hdr}>
          <View
            style={[
              bub.avatar,
              { borderColor: alpha(accentColor, 0.5), backgroundColor: alpha(accentColor, 0.1) },
            ]}
          >
            <MaterialIcons
              name={msg.failed ? 'error-outline' : isButler ? 'smart-toy' : 'person'}
              size={12}
              color={msg.failed ? D.red : accentColor}
            />
          </View>
          <Text style={[bub.sender, { color: accentColor }]}>{isButler ? 'Butler AI' : 'You'}</Text>
          <Text style={bub.time}>{time}</Text>
        </View>

        {/* Content */}
        <View style={bub.contentWrap}>
          {isStreaming && !msg.content ? (
            <TypingDots />
          ) : (
            <Text style={[bub.content, { color: msg.failed ? D.red : D.text }]}>
              {msg.content}
            </Text>
          )}
          {isStreaming && msg.content ? (
            <View style={{ flexDirection: 'row', marginTop: 4 }}>
              <StreamCursor />
            </View>
          ) : null}
        </View>

        {msg.failed && (
          <Text style={bub.failHint}>Tap PAIR PC on HOME to reconnect</Text>
        )}
      </View>
    </Animated.View>
  );
}

const bub = StyleSheet.create({
  row:         { paddingHorizontal: 12, marginBottom: 12 },
  bubble:      { maxWidth: Math.min(SW * 0.86, 520), borderWidth: 1, borderRadius: 14, overflow: 'hidden' },
  hdr:         { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 12, paddingTop: 10, marginBottom: 6 },
  avatar:      { width: 22, height: 22, borderRadius: 6, borderWidth: 1, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  sender:      { fontFamily: FONT.mono, fontSize: 10.5, fontWeight: '800', letterSpacing: 0.3 },
  time:        { fontFamily: FONT.mono, fontSize: 9, color: D.textDim },
  contentWrap: { paddingHorizontal: 12, paddingBottom: 12 },
  content:     { fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif', fontSize: 15, lineHeight: 23, color: D.text },
  failHint:    { fontFamily: FONT.mono, fontSize: 9.5, color: D.amber, paddingHorizontal: 12, paddingBottom: 10 },
});

// ══════════════════════════════════════════════════════════════════════
// INPUT BAR
// ══════════════════════════════════════════════════════════════════════
function InputBar({
  onSend,
  disabled,
  isOnline,
}: {
  onSend: (t: string) => void;
  disabled: boolean;
  isOnline: boolean;
}) {
  const [text, setText] = useState('');
  const [focused, setFocused] = useState(false);
  const borderA = useRef(new Animated.Value(0)).current;
  const sendScA = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(borderA, {
      toValue: focused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [focused]);

  const handleSend = () => {
    const t = text.trim();
    if (!t || disabled) return;
    haptics.heavy();
    Animated.sequence([
      Animated.spring(sendScA, { toValue: 0.75, useNativeDriver: true, speed: 60 }),
      Animated.spring(sendScA, { toValue: 1.1,  useNativeDriver: true, speed: 35, bounciness: 20 }),
      Animated.spring(sendScA, { toValue: 1,    useNativeDriver: true, speed: 30 }),
    ]).start();
    onSend(t);
    setText('');
  };

  const borderColor = borderA.interpolate({
    inputRange:  [0, 1],
    outputRange: [D.border2, D.primary],
  });
  const hasText = text.trim().length > 0;
  const cc = isOnline ? D.green : D.amber;

  return (
    <View style={ib.root}>
      <Hairline />
      <View style={ib.row}>
        {/* Status pip */}
        <View style={[ib.pip, { borderColor: alpha(cc, 0.4), backgroundColor: alpha(cc, 0.1) }]}>
          <PulseDot color={cc} size={5} />
          <Text style={[ib.pipTxt, { color: cc }]}>{isOnline ? 'ON' : 'OFF'}</Text>
        </View>

        {/* Input */}
        <Animated.View style={[ib.inputWrap, { borderColor }]}>
          <TextInput
            style={ib.input}
            value={text}
            onChangeText={setText}
            placeholder={isOnline ? 'Ask Butler AI anything…' : 'Pair your PC to enable AI…'}
            placeholderTextColor={D.textDim}
            returnKeyType="send"
            onSubmitEditing={handleSend}
            blurOnSubmit={false}
            multiline
            maxLength={4000}
            editable={!disabled}
            keyboardAppearance="dark"
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
        </Animated.View>

        {/* Send button */}
        <Animated.View style={{ transform: [{ scale: sendScA }] }}>
          <TouchableOpacity
            onPress={handleSend}
            disabled={disabled || !hasText}
            activeOpacity={0.85}
            style={[
              ib.sendBtn,
              {
                backgroundColor: hasText && !disabled ? D.primary : D.surface3,
                borderColor: hasText && !disabled ? D.primary : D.border,
                ...(hasText && !disabled ? shadow(D.primary, 0.6) : {}),
              },
            ]}
          >
            {disabled ? (
              <ActivityIndicator size="small" color={D.primaryGlow} />
            ) : (
              <MaterialIcons
                name="send"
                size={19}
                color={hasText ? '#000' : D.textDim}
              />
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Status line */}
      <View style={ib.statusLine}>
        <Text style={[ib.statusTxt, { color: isOnline ? D.green : D.amber }]}>
          {isOnline
            ? 'BUTLER AI · LOCAL LLM · AES-256 · ZERO CLOUD · LAN ONLY'
            : 'OFFLINE · HOME TAB → PAIR PC → SCAN QR CODE'}
        </Text>
      </View>
    </View>
  );
}

const ib = StyleSheet.create({
  root:      { backgroundColor: D.surface, paddingBottom: Platform.OS === 'ios' ? 4 : 0 },
  row:       { flexDirection: 'row', alignItems: 'flex-end', gap: 8, paddingHorizontal: 10, paddingVertical: 8 },
  pip:       { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderRadius: 10, paddingHorizontal: 7, paddingVertical: 7, flexShrink: 0, alignSelf: 'flex-end', marginBottom: 1 },
  pipTxt:    { fontFamily: FONT.mono, fontSize: 8.5, fontWeight: '700' },
  inputWrap: { flex: 1, borderWidth: 1.5, borderRadius: 13, paddingHorizontal: 13, paddingTop: 10, paddingBottom: 10, minHeight: 48, maxHeight: 130, backgroundColor: D.bg },
  input:     { fontSize: 15.5, color: D.text, lineHeight: 22, minHeight: 22, padding: 0 },
  sendBtn:   { width: 48, height: 48, borderRadius: 13, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  statusLine:{ alignItems: 'center', paddingHorizontal: 14, paddingBottom: 5 },
  statusTxt: { fontFamily: FONT.mono, fontSize: 8.5, letterSpacing: 0.8 },
});

// ══════════════════════════════════════════════════════════════════════
// AI LOGIC — simple offline fallback + server bridge when paired
// ══════════════════════════════════════════════════════════════════════
function getOfflineReply(text: string): string {
  const lc = text.toLowerCase();
  if (/^(hi|hello|hey)/.test(lc)) {
    return "Hello. I'm Butler AI — your local PC automation assistant.\n\nPair your PC to unlock full AI capabilities: Ollama LLM, Python scripts, system monitoring, and more.\n\nGo to HOME → PAIR PC to connect.";
  }
  if (/what can you|capabilities|help/.test(lc)) {
    return "Butler AI capabilities when paired:\n\n• Run Python scripts on your PC remotely\n• Monitor CPU, RAM, disk live\n• Clean temp files, manage processes\n• LAN diagnostics and network tools\n• Chat with local Ollama AI (zero cloud)\n\nAll 100% local — no accounts, no telemetry.";
  }
  return "Your PC is not connected.\n\nTo connect:\n1. Run butler_server.py on your PC\n2. HOME tab → PAIR PC\n3. Scan the QR code shown";
}

async function sendToServer(text: string, model: string): Promise<string> {
  const { serverConnection } = require('@/services/serverConnection');
  if (!serverConnection.isConnected()) throw new Error('NOT_CONNECTED');

  const sc = serverConnection as any;
  const ip = sc.getIP?.() || '';
  const port = sc.getPort?.() || '';
  const token = sc.getToken?.() || '';

  if (!ip || !port) throw new Error('NOT_CONNECTED');

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 30000);

  try {
    const res = await fetch(`http://${ip}:${port}/api/butler/chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ message: text }),
      signal: ctrl.signal,
    });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`HTTP_${res.status}`);
    const data = await res.json();
    return data.reply || data.response || data.message || 'No response received.';
  } catch (e) {
    clearTimeout(timer);
    throw e;
  }
}

// ══════════════════════════════════════════════════════════════════════
// MAIN SCREEN
// ══════════════════════════════════════════════════════════════════════
function ButlerInner() {
  const insets = useSafeAreaInsets();
  const { isConnected } = useConnectionStatus();

  const [messages, setMessages] = useState<Msg[]>([]);
  const [loading, setLoading]   = useState(false);
  const [model, setModel]       = useState('');
  const [streamId, setStreamId] = useState<string | null>(null);

  const listRef  = useRef<FlatList<Msg>>(null);
  const mountRef = useRef(true);

  // Detect model when connected
  useEffect(() => {
    if (!isConnected) { setModel(''); return; }
    let cancelled = false;
    (async () => {
      try {
        const { serverConnection } = require('@/services/serverConnection');
        const sc = serverConnection as any;
        const ip = sc.getIP?.() || '';
        const port = sc.getPort?.() || '';
        const token = sc.getToken?.() || '';
        if (!ip || !port) return;
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const res = await fetch(`http://${ip}:${port}/api/ollama/models`, { headers });
        if (!res.ok || cancelled) return;
        const data = await res.json();
        const models: string[] = Array.isArray(data)
          ? data.map((m: any) => typeof m === 'string' ? m : m?.name || '')
          : Array.isArray(data?.models)
            ? data.models.map((m: any) => typeof m === 'string' ? m : m?.name || '')
            : [];
        if (!cancelled && models.length) setModel(models[0]);
      } catch {}
    })();
    return () => { cancelled = true; };
  }, [isConnected]);

  // Register globals
  useEffect(() => {
    mountRef.current = true;
    (global as any).__butlerInjectMessage = (t: string) => {
      if (t?.trim()) sendMessage(t.trim());
    };
    return () => {
      mountRef.current = false;
      delete (global as any).__butlerInjectMessage;
    };
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Msg = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    const placeholderId = `b-${Date.now()}`;
    setStreamId(placeholderId);
    setMessages(prev => [
      ...prev,
      { id: placeholderId, role: 'butler', content: '', timestamp: Date.now(), streaming: true },
    ]);

    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      let reply: string;

      if (isConnected) {
        reply = await sendToServer(text, model);
      } else {
        // Simulate a short delay for offline reply
        await new Promise(r => setTimeout(r, 600));
        reply = getOfflineReply(text);
      }

      if (!mountRef.current) return;

      // Simulate token streaming for visual effect
      const CHUNK = Math.max(3, Math.floor(reply.length / 24));
      for (let i = CHUNK; i <= reply.length; i += CHUNK) {
        if (!mountRef.current) return;
        setMessages(prev =>
          prev.map(m => m.id === placeholderId ? { ...m, content: reply.slice(0, i) } : m),
        );
        if (i < reply.length) await new Promise(r => setTimeout(r, 20));
      }

      setMessages(prev =>
        prev.map(m =>
          m.id === placeholderId
            ? { ...m, content: reply, streaming: false }
            : m,
        ),
      );
    } catch (err: any) {
      if (!mountRef.current) return;
      const offline = getOfflineReply(text);
      setMessages(prev =>
        prev.map(m =>
          m.id === placeholderId
            ? { ...m, content: offline, streaming: false, failed: true }
            : m,
        ),
      );
    } finally {
      if (mountRef.current) {
        setLoading(false);
        setStreamId(null);
        setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 220);
      }
    }
  }, [loading, isConnected, model]);

  const clearChat = useCallback(() => {
    haptics.medium();
    setMessages([]);
    setStreamId(null);
  }, []);

  const visibleCount = messages.filter(m => m.role !== 'system').length;

  return (
    <View style={{ flex: 1, backgroundColor: D.bg }}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <ChatHeader
        safeTop={insets.top}
        isOnline={isConnected}
        model={model}
        msgCount={visibleCount}
        onClear={clearChat}
      />

      <ModelStrip model={model} isOnline={isConnected} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={listRef as any}
          data={messages}
          keyExtractor={m => m.id}
          renderItem={({ item }) => (
            <Bubble msg={item} isStreaming={item.id === streamId} />
          )}
          ListEmptyComponent={
            <EmptyState isOnline={isConnected} onSend={sendMessage} />
          }
          ListFooterComponent={<View style={{ height: 8 }} />}
          contentContainerStyle={{ paddingTop: 10, flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="on-drag"
          initialNumToRender={12}
          maxToRenderPerBatch={8}
          windowSize={7}
          removeClippedSubviews={Platform.OS === 'android'}
        />

        <InputBar
          onSend={sendMessage}
          disabled={loading}
          isOnline={isConnected}
        />
      </KeyboardAvoidingView>
    </View>
  );
}

export default function ButlerScreen() {
  return (
    <TabErrorBoundary name="Butler AI">
      <ButlerInner />
    </TabErrorBoundary>
  );
}
