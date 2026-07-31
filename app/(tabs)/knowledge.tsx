/**
 * BUTLER AI — Knowledge Base v4 · KB Dashboard
 * Non-scrollable chrome · Stats + graph + FlatList facts
 * © 2026 Andrej Sladkovic — ALL RIGHTS RESERVED
 */
import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
  Animated, Platform, Dimensions, ActivityIndicator,
} from 'react-native';
import Svg, { Circle, Path, Line } from 'react-native-svg';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { TabErrorBoundary } from '@/components/ui/TabErrorBoundary';
import { serverConnection } from '@/services/serverConnection';
import { knowledgeAccumulator } from '@/services/knowledgeAccumulator';
import { haptics } from '@/services/haptics';

const BG   = '#060D18';
const SURF = '#0A1520';
const SURF2= '#0D1C2C';
const AMBER= '#FFB020';
const CYAN = '#00E5FF';
const GREEN= '#00FF9D';
const PURP = '#CC44FF';
const TEAL = '#00CCBB';
const DIM  = '#1A2E44';
const MID  = '#4A6880';
const TEXT = '#D0E8F4';
const MONO: any = Platform.OS === 'ios' ? 'Menlo-Bold' : 'monospace';
const SW   = Math.max(320, Dimensions.get('window').width);

type Fact = { id:string; cat:string; color:string; text:string; when:string; };

const STARTER_FACTS: Fact[] = [
  { id:'f1',  cat:'Py',  color:CYAN,  text:'Python 3 subprocess.run() for shell commands',        when:'2d ago' },
  { id:'f2',  cat:'Sys', color:GREEN, text:'Windows Task Scheduler for automated script runs',     when:'3d ago' },
  { id:'f3',  cat:'Net', color:AMBER, text:'LAN socket bind to 0.0.0.0 for multi-interface reach', when:'5d ago' },
  { id:'f4',  cat:'AI',  color:PURP,  text:'Ollama REST API — /api/generate for local LLM calls',  when:'1w ago' },
  { id:'f5',  cat:'Sys', color:TEAL,  text:'psutil.cpu_percent(interval=1) for accurate CPU read',  when:'1w ago' },
  { id:'f6',  cat:'Py',  color:CYAN,  text:'pathlib.Path for cross-platform file path handling',   when:'2w ago' },
  { id:'f7',  cat:'Net', color:AMBER, text:'HMAC-SHA256 token signing for Butler auth flow',        when:'2w ago' },
  { id:'f8',  cat:'AI',  color:PURP,  text:'Qwen2.5-Coder best model for coding tasks via Ollama', when:'3w ago' },
];

const CAT_COLORS: Record<string,string> = { Py: CYAN, Sys: GREEN, Net: AMBER, AI: PURP };

const PulseDot = memo(({ color, size = 6 }: { color:string; size?: number }) => {
  const a = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(a, { toValue:1, duration:700, useNativeDriver:true }),
      Animated.timing(a, { toValue:0.2, duration:700, useNativeDriver:true }),
    ]));
    loop.start(); return () => loop.stop();
  }, []);
  return <Animated.View style={{ width:size, height:size, borderRadius:size/2, backgroundColor:color, opacity:a }} />;
});

// Header
const KBHeader = memo(({ safeTop, isConn, total }: { safeTop:number; isConn:boolean; total:number }) => {
  const [hh, setHh] = useState('--:--');
  const scanX = useRef(new Animated.Value(-SW)).current;
  useEffect(() => {
    const t = setInterval(() => {
      const n = new Date();
      setHh(`${String(n.getHours()).padStart(2,'0')}:${String(n.getMinutes()).padStart(2,'0')}`);
    }, 1000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(scanX, { toValue:SW+120, duration:2600, useNativeDriver:true }),
      Animated.timing(scanX, { toValue:-SW, duration:0, useNativeDriver:true }),
      Animated.delay(6000),
    ]));
    loop.start(); return () => loop.stop();
  }, []);
  return (
    <View style={[KH.root, { paddingTop:safeTop }]}>
      <View style={{ height:3, backgroundColor:AMBER }} />
      <Animated.View pointerEvents="none" style={[KH.scan, { transform:[{ translateX:scanX }] }]} />
      <View style={KH.body}>
        <View style={{ flex:1, gap:4 }}>
          <Text style={KH.eye}>AI NEURAL STORE · SELF-LEARNING</Text>
          <View style={{ flexDirection:'row', alignItems:'center', gap:8 }}>
            <MaterialCommunityIcons name="brain" size={18} color={AMBER} />
            <Text style={KH.title}>KNOWLEDGE <Text style={{ color:AMBER }}>BASE</Text></Text>
          </View>
          <View style={{ flexDirection:'row', gap:6 }}>
            <View style={[KH.pill, { borderColor: AMBER+'70', backgroundColor: AMBER+'12' }]}>
              <PulseDot color={isConn ? GREEN : AMBER} size={5} />
              <Text style={[KH.pTxt, { color: AMBER }]}>{total} FACTS</Text>
            </View>
            <View style={[KH.pill, { borderColor: (isConn?GREEN:AMBER)+'50', backgroundColor: (isConn?GREEN:AMBER)+'08' }]}>
              <Text style={[KH.pTxt, { color: isConn?GREEN:AMBER }]}>{isConn ? 'LEARNING' : 'PAUSED'}</Text>
            </View>
          </View>
        </View>
        <View style={{ alignItems:'flex-end', gap:3 }}>
          <Text style={[KH.cBig, { color:TEXT }]}>{hh}</Text>
          <Text style={KH.cSub}>LOCAL · SECURE</Text>
        </View>
      </View>
      <View style={{ height:2, backgroundColor: AMBER+'30' }} />
    </View>
  );
});
const KH = StyleSheet.create({
  root: { backgroundColor:'#0A0C0C', overflow:'hidden' },
  scan: { position:'absolute', top:0, bottom:0, width:80, backgroundColor: AMBER+'07' },
  body: { flexDirection:'row', alignItems:'flex-start', paddingHorizontal:14, paddingTop:11, paddingBottom:12, gap:10, zIndex:1 },
  eye:  { fontFamily:MONO, fontSize:7.5, color: AMBER+'60', letterSpacing:1.5, fontWeight:'700' },
  title:{ fontSize:22, fontWeight:'900', color:'#FFF' },
  pill: { flexDirection:'row', alignItems:'center', gap:5, borderWidth:1.5, borderRadius:20, paddingHorizontal:9, paddingVertical:4 },
  pTxt: { fontFamily:MONO, fontSize:9, fontWeight:'900' },
  cBig: { fontFamily:MONO, fontSize:22, fontWeight:'900', letterSpacing:1 },
  cSub: { fontFamily:MONO, fontSize:7, color:MID, letterSpacing:1 },
});

// Stats row
const StatsRow = memo(({ total, isConn }: { total:number; isConn:boolean }) => {
  const CATS = [{l:'Py',c:CYAN},{l:'Sys',c:GREEN},{l:'Net',c:AMBER},{l:'AI',c:PURP}];
  const items = [
    { label:'FACTS',    val: String(total), color:AMBER },
    { label:'SESSIONS', val: isConn ? '12' : '0', color:CYAN },
    { label:'VECTORS',  val: isConn ? String(total * 12) : '0', color:PURP },
    { label:'GROWTH',   val: isConn ? '+4.2%' : '--', color:GREEN },
  ];
  return (
    <View style={{ flexDirection:'row', padding:12, gap:8 }}>
      {items.map((it, i) => (
        <View key={i} style={[ST.cell, { borderTopColor: it.color, borderColor: it.color+'30' }]}>
          <Text style={[ST.val, { color: isConn || it.label==='FACTS' ? it.color : MID }]}>{it.val}</Text>
          <Text style={ST.label}>{it.label}</Text>
        </View>
      ))}
    </View>
  );
});
const ST = StyleSheet.create({
  cell:  { flex:1, backgroundColor:SURF, borderRadius:10, borderWidth:1.5, borderTopWidth:2.5, padding:10, alignItems:'center', gap:3 },
  val:   { fontFamily:MONO, fontSize:16, fontWeight:'900', lineHeight:20 },
  label: { fontFamily:MONO, fontSize:7.5, color:MID, fontWeight:'900', letterSpacing:0.8 },
});

// KB graph (mini)
const KBGraph = memo(({ isConn }: { isConn:boolean }) => {
  const GW = SW - 28; const GH = 80;
  const CATS = [
    { cat:'Py', color:CYAN,  rx:0.15, ry:0.2 },
    { cat:'Sys',color:GREEN, rx:0.85, ry:0.2 },
    { cat:'Net',color:AMBER, rx:0.2,  ry:0.82 },
    { cat:'AI', color:PURP,  rx:0.8,  ry:0.82 },
  ];
  const pulse = useRef(new Animated.Value(0.5)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue:1, duration:1100, useNativeDriver:true }),
      Animated.timing(pulse, { toValue:0.2, duration:1100, useNativeDriver:true }),
    ]));
    loop.start(); return () => loop.stop();
  }, []);
  return (
    <View style={{ marginHorizontal:14, backgroundColor:SURF, borderRadius:12, borderWidth:1.5, borderColor: AMBER+'25', padding:14, marginBottom:4 }}>
      <View style={{ flexDirection:'row', alignItems:'center', gap:6, marginBottom:10 }}>
        <MaterialCommunityIcons name="graph-outline" size={11} color={AMBER} />
        <Text style={{ fontFamily:MONO, fontSize:9, color: AMBER+'90', fontWeight:'900', letterSpacing:1.2 }}>NEURAL KNOWLEDGE GRAPH</Text>
        <View style={{ flex:1 }} />
        <PulseDot color={isConn?GREEN:AMBER} size={5} />
        <Text style={{ fontFamily:MONO, fontSize:8, color: isConn?GREEN:AMBER, fontWeight:'900' }}>
          {isConn ? 'LIVE' : 'IDLE'}
        </Text>
      </View>
      <View style={{ height:GH, position:'relative' }}>
        <Svg width="100%" height={GH} viewBox={`0 0 ${GW} ${GH}`}>
          {CATS.map((n,i) => CATS.slice(i+1).map((m,j) => (
            <Line key={`l${i}${j}`} x1={n.rx*GW} y1={n.ry*GH} x2={m.rx*GW} y2={m.ry*GH}
              stroke={isConn ? n.color : DIM} strokeWidth="0.8" opacity={isConn ? 0.35 : 0.08} />
          )))}
          <Circle cx={GW/2} cy={GH/2} r="7" fill={isConn ? AMBER+'22' : 'transparent'}
            stroke={isConn ? AMBER : DIM} strokeWidth="1.5" opacity={0.9} />
          <Circle cx={GW/2} cy={GH/2} r="3.5" fill={isConn ? AMBER : DIM} opacity={0.9} />
          {CATS.map((c,i) => (
            <Circle key={i} cx={c.rx*GW} cy={c.ry*GH} r="6"
              fill={isConn ? c.color+'20' : 'transparent'}
              stroke={isConn ? c.color : DIM} strokeWidth="1.2" opacity={isConn ? 0.8 : 0.15} />
          ))}
        </Svg>
        {CATS.map((c,i) => (
          <Animated.View key={i} style={{ position:'absolute', left:c.rx*GW-11, top:c.ry*GH-11, opacity: isConn ? pulse : 0.2 }}>
            <View style={{ width:22, height:22, borderRadius:11, borderWidth:1.5, borderColor: c.color+'AA', backgroundColor: c.color+'14', alignItems:'center', justifyContent:'center' }}>
              <Text style={{ fontFamily:MONO, fontSize:7, fontWeight:'900', color:c.color }}>{c.cat}</Text>
            </View>
          </Animated.View>
        ))}
      </View>
      <View style={{ flexDirection:'row', flexWrap:'wrap', gap:6, marginTop:8 }}>
        {Object.entries(CAT_COLORS).map(([cat,col]) => (
          <View key={cat} style={{ flexDirection:'row', alignItems:'center', gap:4, borderWidth:1, borderColor: col+'30', borderRadius:6, paddingHorizontal:7, paddingVertical:3, backgroundColor: col+'08' }}>
            <View style={{ width:5, height:5, borderRadius:2.5, backgroundColor:col }} />
            <Text style={{ fontFamily:MONO, fontSize:8, color:col, fontWeight:'900' }}>{cat}</Text>
          </View>
        ))}
      </View>
    </View>
  );
});

// Fact row
const FactRow = memo(({ fact }: { fact:Fact }) => (
  <View style={{ flexDirection:'row', alignItems:'center', gap:10, paddingVertical:10, borderBottomWidth:1, borderBottomColor: DIM+'40', paddingHorizontal:14 }}>
    <View style={{ width:32, height:32, borderRadius:8, borderWidth:1.5, borderColor: fact.color+'40', backgroundColor: fact.color+'12', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
      <Text style={{ fontFamily:MONO, fontSize:9, fontWeight:'900', color:fact.color }}>{fact.cat}</Text>
    </View>
    <Text style={{ fontFamily:MONO, fontSize:11.5, color:TEXT, flex:1, lineHeight:17 }}>{fact.text}</Text>
    <Text style={{ fontFamily:MONO, fontSize:8, color:MID, flexShrink:0 }}>{fact.when}</Text>
  </View>
));

function KBInner() {
  const insets = useSafeAreaInsets();
  const [isConn, setIsConn] = useState(false);
  const [total, setTotal]   = useState(STARTER_FACTS.length);
  const [query, setQuery]   = useState('');
  const [catFilter, setCatFilter] = useState<string|null>(null);

  useFocusEffect(useCallback(() => {
    setIsConn(serverConnection.isConnected?.() ?? false);
    knowledgeAccumulator.getStats?.().then(s => { if (s?.totalFindings) setTotal(s.totalFindings + STARTER_FACTS.length); }).catch(() => {});
  }, []));

  const filtered = STARTER_FACTS.filter(f => {
    if (catFilter && f.cat !== catFilter) return false;
    if (query.trim() && !f.text.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  return (
    <View style={{ flex:1, backgroundColor:BG }}>
      <KBHeader safeTop={insets.top} isConn={isConn} total={total} />
      <StatsRow total={total} isConn={isConn} />
      <KBGraph isConn={isConn} />

      {/* Search + filter */}
      <View style={{ flexDirection:'row', gap:8, paddingHorizontal:14, paddingVertical:9, borderBottomWidth:1, borderBottomColor: DIM+'40', backgroundColor: SURF }}>
        <View style={[KF.search, { borderColor: query ? AMBER+'60' : DIM+'50', flex:1 }]}>
          <MaterialIcons name="search" size={14} color={MID} />
          <TextInput value={query} onChangeText={setQuery} placeholder="Search facts…"
            placeholderTextColor={MID} style={KF.input} />
        </View>
        {(['Py','Sys','Net','AI'] as const).map(cat => (
          <TouchableOpacity key={cat} onPress={() => { haptics.light(); setCatFilter(catFilter===cat ? null : cat); }} activeOpacity={0.8}
            style={[KF.catBtn, { borderColor: CAT_COLORS[cat]+(catFilter===cat?'80':'30'), backgroundColor: CAT_COLORS[cat]+(catFilter===cat?'20':'08') }]}>
            <Text style={[KF.catTxt, { color: CAT_COLORS[cat] }]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={f => f.id}
        renderItem={({ item }) => <FactRow fact={item} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
        ListEmptyComponent={
          <View style={{ alignItems:'center', paddingTop:40, gap:10 }}>
            <MaterialCommunityIcons name="brain" size={40} color={DIM} />
            <Text style={{ fontFamily:MONO, fontSize:11, color:MID }}>No facts match</Text>
          </View>
        }
      />

      <View style={[KF.statusBar, { paddingBottom: Math.max(insets.bottom+4, 10) }]}>
        <PulseDot color={isConn ? GREEN : AMBER} size={5} />
        <Text style={{ fontFamily:MONO, fontSize:9, color: isConn?GREEN:AMBER, fontWeight:'900' }}>
          {isConn ? 'SIGMA-NET ACTIVE · LEARNING' : 'OFFLINE · LEARNING PAUSED'}
        </Text>
        <View style={{ flex:1 }} />
        <Text style={{ fontFamily:MONO, fontSize:9, color:MID }}>{filtered.length} FACTS</Text>
      </View>
    </View>
  );
}
const KF = StyleSheet.create({
  search:    { flexDirection:'row', alignItems:'center', gap:8, borderWidth:1.5, borderRadius:10, paddingHorizontal:10, paddingVertical:7, backgroundColor:BG },
  input:     { flex:1, fontFamily:MONO, fontSize:12, color:TEXT, padding:0, includeFontPadding:false },
  catBtn:    { borderWidth:1.5, borderRadius:8, paddingHorizontal:9, paddingVertical:7 },
  catTxt:    { fontFamily:MONO, fontSize:9, fontWeight:'900' },
  statusBar: { backgroundColor:SURF, borderTopWidth:1, borderTopColor: DIM+'40', paddingTop:9, paddingHorizontal:14, flexDirection:'row', alignItems:'center', gap:8 },
});

export default function KnowledgeScreen() {
  return <TabErrorBoundary name="Knowledge"><KBInner /></TabErrorBoundary>;
}
