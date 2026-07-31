/**
 * BUTLER AI — AI Chat v14 · Terminal Redesign
 * Non-scrollable chrome · FlatList messages · Ollama wired
 * © 2026 Andrej Sladkovic — ALL RIGHTS RESERVED
 */
import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
  Animated, Platform, Dimensions, KeyboardAvoidingView, ActivityIndicator, Pressable,
} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { TabErrorBoundary } from '@/components/ui/TabErrorBoundary';
import { serverConnection } from '@/services/serverConnection';
import { haptics } from '@/services/haptics';

const BG   = '#060D18';
const SURF = '#0A1520';
const SURF2= '#0D1C2C';
const PURP = '#CC44FF';
const CYAN = '#00E5FF';
const GREEN= '#00FF9D';
const AMBER= '#FFB020';
const RED  = '#FF3D5A';
const DIM  = '#1A2E44';
const MID  = '#4A6880';
const TEXT = '#D0E8F4';
const MONO: any = Platform.OS === 'ios' ? 'Menlo-Bold' : 'monospace';
const SW   = Math.max(320, Dimensions.get('window').width);

type Message = { id: string; role: 'user'|'assistant'|'system'; content: string; ts: number; };

const SUGGESTIONS = [
  'What can you do right now?',
  'Scan LAN for active hosts',
  'Free up disk space',
  'Show top CPU processes',
  'Write a backup script',
  'Explain my system specs',
];

const MODES = [
  { key: 'chat',   label: 'CHAT',    icon: 'chat-outline',   color: PURP },
  { key: 'code',   label: 'CODE',    icon: 'code-braces',    color: CYAN },
  { key: 'system', label: 'SYSTEM',  icon: 'server',         color: GREEN },
];

// ── Pulse dot ─────────────────────────────────────────────────────
const PulseDot = memo(({ color, size = 6 }: { color: string; size?: number }) => {
  const a = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(a, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(a, { toValue: 0.2, duration: 700, useNativeDriver: true }),
    ]));
    loop.start(); return () => loop.stop();
  }, []);
  return <Animated.View style={{ width: size, height: size, borderRadius: size/2, backgroundColor: color, opacity: a }} />;
});

// ── Message bubble ─────────────────────────────────────────────────
const MsgBubble = memo(({ msg }: { msg: Message }) => {
  const isUser = msg.role === 'user';
  const isSystem = msg.role === 'system';
  const color = isUser ? CYAN : isSystem ? AMBER : PURP;
  const fade = useRef(new Animated.Value(0)).current;
  const slideX = useRef(new Animated.Value(isUser ? 24 : -24)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade,  { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.spring(slideX,{ toValue: 0, tension: 200, friction: 14, useNativeDriver: true }),
    ]).start();
  }, []);
  return (
    <Animated.View style={[
      mb.row,
      isUser && { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
      { opacity: fade, transform: [{ translateX: slideX }] }
    ]}>
      <View style={[mb.avatar, { borderColor: color+'60', backgroundColor: color+'12' }]}>
        <MaterialCommunityIcons name={isUser ? 'account' : isSystem ? 'information' : 'robot-happy'} size={12} color={color} />
      </View>
      <View style={{ maxWidth: SW * 0.75, gap: 3 }}>
        {!isUser && (
          <Text style={[mb.roleLabel, { color }]}>{isSystem ? 'SYSTEM' : 'BUTLER AI'}</Text>
        )}
        <View style={[mb.bubble, {
          borderColor: color+'30',
          backgroundColor: isUser ? color+'12' : SURF,
          borderLeftWidth: isUser ? 1.5 : 3,
          borderLeftColor: color,
        }]}>
          <Text style={[mb.content, { color: isUser ? color+'EE' : TEXT }]}>{msg.content}</Text>
        </View>
        <Text style={[mb.ts, { alignSelf: isUser ? 'flex-end' : 'flex-start' }]}>
          {new Date(msg.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </Animated.View>
  );
});
const mb = StyleSheet.create({
  row:       { flexDirection: 'row', alignItems: 'flex-end', gap: 8, paddingHorizontal: 12, marginBottom: 10 },
  avatar:    { width: 26, height: 26, borderRadius: 8, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  roleLabel: { fontFamily: MONO, fontSize: 8, fontWeight: '900', letterSpacing: 1, paddingLeft: 2 },
  bubble:    { borderWidth: 1.5, borderRadius: 14, padding: 12, paddingTop: 9 },
  content:   { fontFamily: MONO, fontSize: 12.5, lineHeight: 19.5, color: TEXT },
  ts:        { fontFamily: MONO, fontSize: 8, color: MID },
});

// ── Typing indicator ───────────────────────────────────────────────
const TypingDots = memo(() => {
  const anims = [0,1,2].map(() => useRef(new Animated.Value(0.2)).current);
  useEffect(() => {
    const loops = anims.map((a, i) => Animated.loop(Animated.sequence([
      Animated.delay(i * 160),
      Animated.timing(a, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(a, { toValue: 0.1, duration: 400, useNativeDriver: true }),
    ])));
    loops.forEach(l => l.start()); return () => loops.forEach(l => l.stop());
  }, []);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8, paddingHorizontal: 12, marginBottom: 10 }}>
      <View style={[mb.avatar, { borderColor: PURP+'60', backgroundColor: PURP+'12' }]}>
        <MaterialCommunityIcons name="robot-happy" size={12} color={PURP} />
      </View>
      <View style={[mb.bubble, { borderColor: PURP+'30', backgroundColor: SURF, borderLeftWidth: 3, borderLeftColor: PURP }]}>
        <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center', padding: 2 }}>
          {anims.map((a, i) => (
            <Animated.View key={i} style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: PURP, opacity: a }} />
          ))}
        </View>
      </View>
    </View>
  );
});

// ── Header ─────────────────────────────────────────────────────────
const ButlerHeader = memo(({ safeTop, isConn, model, msgCount, onClear }: {
  safeTop: number; isConn: boolean; model: string; msgCount: number; onClear: () => void;
}) => {
  const [hh, setHh] = useState('--:--');
  const [ss, setSs] = useState('--');
  const scanX = useRef(new Animated.Value(-SW)).current;
  useEffect(() => {
    const tick = () => {
      const n = new Date();
      setHh(`${String(n.getHours()).padStart(2,'0')}:${String(n.getMinutes()).padStart(2,'0')}`);
      setSs(String(n.getSeconds()).padStart(2,'0'));
    };
    tick();
    const t = setInterval(tick, 1000); return () => clearInterval(t);
  }, []);
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(scanX, { toValue: SW+120, duration: 2200, useNativeDriver: true }),
      Animated.timing(scanX, { toValue: -SW, duration: 0, useNativeDriver: true }),
      Animated.delay(5000),
    ]));
    loop.start(); return () => loop.stop();
  }, []);
  const cc = isConn ? GREEN : AMBER;
  return (
    <View style={[H.root, { paddingTop: safeTop }]}>
      <View style={{ height: 3, backgroundColor: PURP }} />
      <Animated.View pointerEvents="none" style={[H.scan, { transform: [{ translateX: scanX }] }]} />
      <View style={H.body}>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={H.eye}>LOCAL OLLAMA · PRIVATE · ZERO CLOUD</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <MaterialCommunityIcons name="robot-happy" size={18} color={PURP} />
            <Text style={H.title}>BUTLER <Text style={{ color: PURP }}>AI</Text></Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
            <View style={[H.pill, { borderColor: cc+'70', backgroundColor: cc+'10' }]}>
              <PulseDot color={cc} size={5} />
              <Text style={[H.pTxt, { color: cc }]}>{isConn ? 'ONLINE' : 'OFFLINE'}</Text>
            </View>
            {model ? (
              <View style={[H.pill, { borderColor: PURP+'50', backgroundColor: PURP+'08' }]}>
                <MaterialCommunityIcons name="brain" size={9} color={PURP} />
                <Text style={[H.pTxt, { color: PURP }]}>{model.split(':')[0]}</Text>
              </View>
            ) : null}
            <View style={[H.pill, { borderColor: DIM+'60', backgroundColor: DIM+'20' }]}>
              <Text style={[H.pTxt, { color: MID }]}>{msgCount} MSG</Text>
            </View>
          </View>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 1 }}>
            <Text style={[H.cBig, { color: TEXT }]}>{hh}</Text>
            <Text style={[H.cSec, { color: PURP }]}>{ss}</Text>
          </View>
          <Text style={H.cSub}>LOCAL · SECURE</Text>
          <TouchableOpacity onPress={onClear} activeOpacity={0.8} hitSlop={{top:8,bottom:8,left:8,right:8}}>
            <MaterialIcons name="delete-sweep" size={16} color={RED+'80'} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={{ height: 2, backgroundColor: PURP+'30' }} />
    </View>
  );
});
const H = StyleSheet.create({
  root: { backgroundColor: '#080E1C', overflow: 'hidden',
    ...Platform.select({ ios:{ shadowColor:'#000', shadowOffset:{width:0,height:4}, shadowOpacity:0.4, shadowRadius:10 }, android:{elevation:5} }) },
  scan: { position:'absolute', top:0, bottom:0, width:80, backgroundColor: PURP+'06' },
  body: { flexDirection:'row', alignItems:'flex-start', paddingHorizontal:14, paddingTop:11, paddingBottom:12, gap:10, zIndex:1 },
  eye:  { fontFamily:MONO, fontSize:7.5, color: PURP+'60', letterSpacing:1.8, fontWeight:'700' },
  title:{ fontSize:22, fontWeight:'900', color:'#FFF' },
  pill: { flexDirection:'row', alignItems:'center', gap:5, borderWidth:1.5, borderRadius:20, paddingHorizontal:9, paddingVertical:4 },
  pTxt: { fontFamily:MONO, fontSize:9, fontWeight:'900' },
  cBig: { fontFamily:MONO, fontSize:22, fontWeight:'900', letterSpacing:1 },
  cSec: { fontFamily:MONO, fontSize:14, fontWeight:'900' },
  cSub: { fontFamily:MONO, fontSize:7, color:MID, letterSpacing:1 },
});

// ── Mode bar ───────────────────────────────────────────────────────
const ModeBar = memo(({ mode, onChange }: { mode: string; onChange: (m: string) => void }) => (
  <View style={{ flexDirection:'row', backgroundColor: SURF, borderBottomWidth:1, borderBottomColor: DIM+'40' }}>
    {MODES.map(m => {
      const active = mode === m.key;
      return (
        <TouchableOpacity key={m.key} onPress={() => { haptics.light(); onChange(m.key); }} activeOpacity={0.8}
          style={{ flex:1, flexDirection:'row', alignItems:'center', justifyContent:'center', gap:5,
            paddingVertical:10, borderBottomWidth: active ? 2 : 0, borderBottomColor: m.color }}>
          <MaterialCommunityIcons name={m.icon as any} size={12} color={active ? m.color : MID} />
          <Text style={{ fontFamily:MONO, fontSize:10, fontWeight:'900', color: active ? m.color : MID, letterSpacing:0.5 }}>
            {m.label}
          </Text>
        </TouchableOpacity>
      );
    })}
  </View>
));

// ── Main screen ────────────────────────────────────────────────────
function ButlerInner() {
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Message[]>([
    { id:'sys0', role:'system', content:'Butler online — running 100% on your own PC via local Ollama. No cloud, no telemetry. Pair your PC from the PAIR tab to start chatting.', ts: Date.now() },
  ]);
  const [input, setInput]     = useState('');
  const [sending, setSending] = useState(false);
  const [isConn, setIsConn]   = useState(false);
  const [model, setModel]     = useState('');
  const [mode, setMode]       = useState('chat');
  const listRef = useRef<FlatList<Message>>(null);

  useFocusEffect(useCallback(() => {
    const c = serverConnection.isConnected?.() ?? false;
    setIsConn(c);
    if (c) fetchModel();
  }, []));

  const fetchModel = async () => {
    try {
      const ip  = serverConnection.getIP?.() || '';
      const prt = serverConnection.getPort?.() || '';
      if (!ip || !prt) return;
      const tok = serverConnection.getToken?.() || '';
      const h: Record<string,string> = {};
      if (tok) h['Authorization'] = 'Bearer ' + tok;
      const res = await fetch(`http://${ip}:${prt}/api/ollama/models`, { headers: h });
      if (res.ok) {
        const d = await res.json();
        const list: string[] = Array.isArray(d) ? d : (d.models ?? []);
        const priority = ['qwen2.5-coder','qwen2.5','mistral','llama3.2','llama3','codellama','phi','gemma'];
        const best = priority.find(p => list.some(m => m.toLowerCase().includes(p))) || list[0] || '';
        setModel(best);
      }
    } catch {}
  };

  const scrollToEnd = () => setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);

  const sendMessage = async (content?: string) => {
    const text = (content || input).trim();
    if (!text || sending) return;
    haptics.medium();
    setInput('');
    const userMsg: Message = { id: Date.now().toString(), role:'user', content: text, ts: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setSending(true);
    scrollToEnd();
    try {
      if (!isConn) {
        await new Promise(r => setTimeout(r, 600));
        const reply = offlineReply(text);
        setMessages(prev => [...prev, { id: Date.now().toString(), role:'assistant', content: reply, ts: Date.now() }]);
      } else {
        const ip  = serverConnection.getIP?.() || '';
        const prt = serverConnection.getPort?.() || '';
        const tok = serverConnection.getToken?.() || '';
        const h: Record<string,string> = { 'Content-Type': 'application/json' };
        if (tok) h['Authorization'] = 'Bearer ' + tok;
        const ctrl = new AbortController();
        setTimeout(() => ctrl.abort(), 30000);
        const sysPrompt = mode === 'code' ? 'You are an expert Python coder. Always include runnable code.' :
                          mode === 'system' ? 'You are a system administrator. Be precise and technical.' :
                          'You are Butler AI, a helpful local PC assistant.';
        const res = await fetch(`http://${ip}:${prt}/api/butler/chat`, {
          method: 'POST', headers: h,
          body: JSON.stringify({ messages: [
            { role:'system', content: sysPrompt },
            ...messages.slice(-10).map(m => ({ role: m.role === 'system' ? 'assistant' : m.role, content: m.content })),
            { role:'user', content: text },
          ]}),
          signal: ctrl.signal,
        });
        const d = await res.json();
        const reply = (d.reply || d.content || d.message || '').trim() || 'Done.';
        setMessages(prev => [...prev, { id: Date.now().toString(), role:'assistant', content: reply, ts: Date.now() }]);
        haptics.success();
      }
    } catch (e: any) {
      const errMsg = e?.name === 'AbortError' ? 'Request timed out (30s)' : (e?.message?.slice(0,80) || 'Request failed');
      setMessages(prev => [...prev, { id: Date.now().toString(), role:'assistant', content: 'Error: ' + errMsg, ts: Date.now() }]);
    }
    setSending(false);
    scrollToEnd();
  };

  const offlineReply = (text: string) => {
    const t = text.toLowerCase();
    if (/hello|hi|hey/.test(t)) return 'Hello! Pair your PC via QR code to unlock full local AI.';
    if (/help|what can/.test(t)) return 'I can run Python scripts, monitor PC health, and chat via local Ollama AI — 100% offline.';
    if (/script|python|code/.test(t)) return 'Tap FORGE tab to browse 250+ automation scripts.';
    if (/pair|connect|qr/.test(t)) return 'Run butler_server.py on your PC, then scan the QR from the PAIR tab.';
    if (/security|safe|private/.test(t)) return 'AES-256-GCM encrypted. HMAC-SHA256 signed. LAN-only. Zero telemetry.';
    return 'Pair your PC first to unlock full Butler AI capabilities. Go to the PAIR tab.';
  };

  const clearChat = () => {
    haptics.medium();
    setMessages([{ id:'sys'+Date.now(), role:'system', content:'Chat cleared. Butler ready for new session.', ts: Date.now() }]);
  };

  const userMsgCount = messages.filter(m => m.role === 'user').length;
  const isEmpty = userMsgCount === 0;

  const renderItem = useCallback(({ item }: { item: Message }) => (
    <MsgBubble msg={item} />
  ), []);

  const keyExtractor = useCallback((item: Message) => item.id, []);

  return (
    <View style={{ flex:1, backgroundColor: BG }}>
      <ButlerHeader safeTop={insets.top} isConn={isConn} model={model} msgCount={userMsgCount} onClear={clearChat} />
      <ModeBar mode={mode} onChange={setMode} />

      <KeyboardAvoidingView style={{ flex:1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={{ paddingTop: 14, paddingBottom: 6 }}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={Platform.OS === 'android'}
          ListFooterComponent={sending ? <TypingDots /> : null}
          onContentSizeChange={scrollToEnd}
        />

        {/* Suggestions */}
        {isEmpty && !sending && (
          <View style={{ paddingHorizontal: 12, paddingBottom: 10 }}>
            <Text style={{ fontFamily:MONO, fontSize:9, color: PURP+'70', letterSpacing:1.5, textAlign:'center', marginBottom:10 }}>
              SUGGESTED PROMPTS
            </Text>
            <View style={{ flexDirection:'row', flexWrap:'wrap', gap:7, justifyContent:'center' }}>
              {SUGGESTIONS.map((s, i) => (
                <TouchableOpacity key={i} onPress={() => sendMessage(s)} activeOpacity={0.8}
                  style={{ borderWidth:1.5, borderRadius:20, paddingHorizontal:12, paddingVertical:7, borderColor: PURP+'40', backgroundColor: PURP+'09' }}>
                  <Text style={{ fontFamily:MONO, fontSize:10, color: PURP+'CC' }}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Input bar */}
        <View style={[IB.root, { paddingBottom: Math.max(insets.bottom + 6, 10) }]}>
          <View style={[IB.row, { borderColor: input.trim() ? PURP+'60' : DIM+'50' }]}>
            <MaterialCommunityIcons name="robot-happy-outline" size={16} color={PURP+'70'} />
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder={isConn ? `[${mode.toUpperCase()}] Ask Butler anything…` : 'Pair PC for full AI or ask offline…'}
              placeholderTextColor={MID}
              style={IB.input}
              returnKeyType="send"
              onSubmitEditing={() => sendMessage()}
              blurOnSubmit={false}
              editable={!sending}
              multiline
              maxLength={1000}
            />
            <TouchableOpacity onPress={() => sendMessage()} disabled={!input.trim() || sending} activeOpacity={0.8}
              style={[IB.send, { backgroundColor: input.trim() && !sending ? PURP : DIM+'40', borderColor: input.trim() && !sending ? PURP : DIM }]}>
              {sending
                ? <ActivityIndicator size="small" color={PURP} style={{ transform: [{ scale: 0.75 }] }} />
                : <MaterialIcons name="send" size={15} color={input.trim() ? '#000' : MID} />}
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection:'row', justifyContent:'center', gap:12, paddingTop:6 }}>
            {[['AES-256',CYAN],['LAN ONLY',GREEN],['OLLAMA',PURP]].map(([l,c]) => (
              <Text key={l} style={{ fontFamily:MONO, fontSize:8, color: (c as string)+'50', fontWeight:'900' }}>{l}</Text>
            ))}
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
const IB = StyleSheet.create({
  root:  { backgroundColor: SURF, borderTopWidth:1, borderTopColor: PURP+'20', paddingTop:8, paddingHorizontal:12 },
  row:   { flexDirection:'row', alignItems:'flex-end', gap:9, borderWidth:1.5, borderRadius:16, paddingHorizontal:12, paddingVertical:9, backgroundColor: BG },
  input: { flex:1, fontFamily:MONO, fontSize:13, color:TEXT, padding:0, maxHeight:100, includeFontPadding: false },
  send:  { width:38, height:38, borderRadius:12, borderWidth:1.5, alignItems:'center', justifyContent:'center', flexShrink:0 },
});

export default function ButlerScreen() {
  return <TabErrorBoundary name="Butler"><ButlerInner /></TabErrorBoundary>;
}
