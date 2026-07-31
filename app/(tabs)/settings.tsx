/**
 * BUTLER AI — Settings v5 · Config Redesign
 * Non-scrollable chrome · Settings FlatList
 * © 2026 Andrej Sladkovic — ALL RIGHTS RESERVED
 */
import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Animated, Platform, Dimensions, Alert, Switch, Linking,
} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TabErrorBoundary } from '@/components/ui/TabErrorBoundary';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { haptics } from '@/services/haptics';

const BG   = '#04060C';
const SURF = '#070B14';
const SURF2= '#0A0F1A';
const CYAN = '#00E5FF';
const GREEN= '#00FF9D';
const AMBER= '#FFB020';
const RED  = '#FF3D5A';
const PURP = '#CC44FF';
const BLUE = '#4A8DFF';
const DIM  = '#0D1620';
const MID  = '#3A5060';
const TEXT = '#C8E4F0';
const MONO: any = Platform.OS === 'ios' ? 'Menlo-Bold' : 'monospace';
const SW   = Math.max(320, Dimensions.get('window').width);

type SettingItem =
  | { type:'header'; label:string; color:string }
  | { type:'toggle'; label:string; sub:string; icon:string; color:string; key:string }
  | { type:'action'; label:string; sub:string; icon:string; color:string; action:string; danger?:boolean }
  | { type:'info';   label:string; sub:string; icon:string; color:string }
  | { type:'link';   label:string; sub:string; icon:string; color:string; url:string };

const SETTINGS: SettingItem[] = [
  { type:'header', label:'CONNECTION', color:CYAN },
  { type:'action', label:'Pair PC via QR',          sub:'Scan QR from butler_server.py',    icon:'qr-code-scanner', color:CYAN,  action:'pair' },
  { type:'action', label:'Manual IP Entry',          sub:'Connect by IP address + port',     icon:'wifi',           color:BLUE,  action:'manual' },
  { type:'action', label:'Forget Paired PC',         sub:'Remove stored credentials',        icon:'link-off',       color:AMBER, action:'forget' },

  { type:'header', label:'AI ENGINE', color:PURP },
  { type:'action', label:'Check Ollama Status',      sub:'Verify local AI model is running', icon:'robot-happy',    color:PURP,  action:'ollama' },
  { type:'action', label:'Pull Best Model',           sub:'Download qwen2.5-coder:7b',        icon:'download',       color:CYAN,  action:'pull' },

  { type:'header', label:'PRIVACY & DATA', color:GREEN },
  { type:'info',   label:'Telemetry',                sub:'Zero telemetry — nothing sent',    icon:'analytics',      color:GREEN },
  { type:'info',   label:'Cloud Storage',            sub:'Zero cloud — all data local',       icon:'cloud-off',      color:GREEN },
  { type:'action', label:'Clear Chat History',       sub:'Delete all chat sessions',          icon:'delete-sweep',   color:AMBER, action:'clearChat' },
  { type:'action', label:'Delete All My Data',        sub:'GDPR wipe — irreversible',          icon:'delete-forever', color:RED,   action:'deleteAll', danger:true },

  { type:'header', label:'SYNC & UPDATES', color:BLUE },
  { type:'action', label:'Open GitHub Repo',         sub:'Download latest butler_server.py', icon:'code-tags',      color:CYAN,  action:'github' },
  { type:'link',   label:'Privacy Policy',           sub:'View full privacy document',        icon:'shield',         color:GREEN, url:'https://shawnjan-cmd.github.io/privacy-policy-/' },
  { type:'link',   label:'Terms of Service',         sub:'Read full terms',                   icon:'gavel',          color:AMBER, url:'https://shawnjan-cmd.github.io/privacy-policy-/#terms-of-service' },

  { type:'header', label:'ABOUT', color:MID },
  { type:'info',   label:'Butler AI',                sub:'v7.3.0 · com.butlerai.pc.automation', icon:'information', color:CYAN },
  { type:'info',   label:'Security',                 sub:'AES-256-GCM · HMAC-SHA256 · LAN only', icon:'lock',       color:GREEN },
  { type:'info',   label:'© 2026 Andrej Sladkovic', sub:'All rights reserved · Proprietary',    icon:'copyright',   color:MID },
];

const PulseDot = memo(({ color, size=6 }: { color:string; size?:number }) => {
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

const ConfigHeader = memo(({ safeTop }: { safeTop:number }) => {
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
      Animated.timing(scanX, { toValue:SW+120, duration:3000, useNativeDriver:true }),
      Animated.timing(scanX, { toValue:-SW, duration:0, useNativeDriver:true }),
      Animated.delay(8000),
    ]));
    loop.start(); return () => loop.stop();
  }, []);
  return (
    <View style={[CH.root, { paddingTop:safeTop }]}>
      <View style={{ height:3, backgroundColor:CYAN }} />
      <Animated.View pointerEvents="none" style={[CH.scan, { transform:[{translateX:scanX}] }]} />
      <View style={CH.body}>
        <View style={{ flex:1, gap:4 }}>
          <Text style={CH.eye}>SYSTEM PREFERENCES · LOCAL CONFIG</Text>
          <View style={{ flexDirection:'row', alignItems:'center', gap:8 }}>
            <MaterialCommunityIcons name="tune-variant" size={18} color={CYAN} />
            <Text style={CH.title}>SYSTEM <Text style={{ color:CYAN }}>CONFIG</Text></Text>
          </View>
          <View style={{ flexDirection:'row', gap:6 }}>
            <View style={[CH.pill, { borderColor: GREEN+'60', backgroundColor: GREEN+'10' }]}>
              <PulseDot color={GREEN} size={5} />
              <Text style={[CH.pTxt, { color:GREEN }]}>ZERO TELEMETRY</Text>
            </View>
          </View>
        </View>
        <View style={{ alignItems:'flex-end', gap:3 }}>
          <Text style={[CH.cBig, { color:TEXT }]}>{hh}</Text>
          <Text style={CH.cSub}>LOCAL · SECURE</Text>
        </View>
      </View>
      <View style={{ height:2, backgroundColor: CYAN+'30' }} />
    </View>
  );
});
const CH = StyleSheet.create({
  root: { backgroundColor:'#050810', overflow:'hidden' },
  scan: { position:'absolute', top:0, bottom:0, width:80, backgroundColor: CYAN+'06' },
  body: { flexDirection:'row', alignItems:'flex-start', paddingHorizontal:14, paddingTop:11, paddingBottom:12, gap:10, zIndex:1 },
  eye:  { fontFamily:MONO, fontSize:7.5, color: CYAN+'60', letterSpacing:1.5, fontWeight:'700' },
  title:{ fontSize:22, fontWeight:'900', color:'#FFF' },
  pill: { flexDirection:'row', alignItems:'center', gap:5, borderWidth:1.5, borderRadius:20, paddingHorizontal:9, paddingVertical:4 },
  pTxt: { fontFamily:MONO, fontSize:9, fontWeight:'900' },
  cBig: { fontFamily:MONO, fontSize:22, fontWeight:'900', letterSpacing:1 },
  cSub: { fontFamily:MONO, fontSize:7, color:MID, letterSpacing:1 },
});

function SettingsInner() {
  const insets = useSafeAreaInsets();

  const handleAction = async (action: string) => {
    haptics.medium();
    switch (action) {
      case 'pair':
        try { (global as any).__nexusHomeOpenQR?.(); } catch {}
        break;
      case 'github':
        Linking.openURL('https://github.com/shawnjan-cmd/butler-server/releases/latest').catch(() => {});
        break;
      case 'clearChat':
        Alert.alert('Clear Chat History', 'Delete all Butler AI chat sessions?', [
          { text:'Cancel', style:'cancel' },
          { text:'CLEAR', style:'destructive', onPress: async () => {
            try { await AsyncStorage.removeItem('@butler_sessions_v1'); haptics.success(); } catch {}
          }},
        ]);
        break;
      case 'deleteAll':
        Alert.alert('Delete All Data', 'This will wipe ALL local app data permanently. This cannot be undone.', [
          { text:'Cancel', style:'cancel' },
          { text:'DELETE ALL', style:'destructive', onPress: async () => {
            try {
              const keys = await AsyncStorage.getAllKeys();
              const butlerKeys = keys.filter(k => k.startsWith('@butler') || k.startsWith('butler'));
              await AsyncStorage.multiRemove(butlerKeys);
              haptics.success();
            } catch {}
          }},
        ]);
        break;
      case 'forget':
        Alert.alert('Forget PC', 'Remove paired PC credentials?', [
          { text:'Cancel', style:'cancel' },
          { text:'FORGET', style:'destructive', onPress: async () => {
            try {
              await AsyncStorage.multiRemove(['butler.sessionToken','butler.hostIp','butler.hostPort']);
              haptics.success();
            } catch {}
          }},
        ]);
        break;
      case 'ollama':
        Alert.alert('Ollama Status', 'Open the AI Chat tab to check Ollama model status and pull new models.');
        break;
      case 'pull':
        Alert.alert('Pull Model', 'Go to the AI Chat tab. In the model badge, tap "PULL MODEL" to download qwen2.5-coder:7b.');
        break;
    }
  };

  const renderItem = useCallback(({ item }: { item: SettingItem }) => {
    if (item.type === 'header') {
      return (
        <View style={{ flexDirection:'row', alignItems:'center', gap:8, paddingHorizontal:14, paddingTop:18, paddingBottom:8 }}>
          <View style={{ width:3, height:14, borderRadius:2, backgroundColor: item.color }} />
          <Text style={{ fontFamily:MONO, fontSize:10, fontWeight:'900', color: item.color+'90', letterSpacing:2 }}>
            {item.label}
          </Text>
          <View style={{ flex:1, height:1, backgroundColor: item.color+'20' }} />
        </View>
      );
    }
    if (item.type === 'action') {
      return (
        <TouchableOpacity onPress={() => handleAction(item.action)} activeOpacity={0.8}
          style={[SI.row, { borderColor: (item.danger?RED:item.color)+'25' }]}>
          <View style={[SI.iconBox, { backgroundColor: (item.danger?RED:item.color)+'10', borderColor: (item.danger?RED:item.color)+'35' }]}>
            <MaterialIcons name={item.icon as any} size={18} color={item.danger?RED:item.color} />
          </View>
          <View style={{ flex:1 }}>
            <Text style={[SI.label, { color: item.danger ? RED : TEXT }]}>{item.label}</Text>
            <Text style={SI.sub}>{item.sub}</Text>
          </View>
          <MaterialIcons name="chevron-right" size={18} color={MID} />
        </TouchableOpacity>
      );
    }
    if (item.type === 'link') {
      return (
        <TouchableOpacity onPress={() => Linking.openURL(item.url).catch(()=>{})} activeOpacity={0.8}
          style={[SI.row, { borderColor: item.color+'25' }]}>
          <View style={[SI.iconBox, { backgroundColor: item.color+'10', borderColor: item.color+'35' }]}>
            <MaterialIcons name={item.icon as any} size={18} color={item.color} />
          </View>
          <View style={{ flex:1 }}>
            <Text style={[SI.label, { color:TEXT }]}>{item.label}</Text>
            <Text style={SI.sub}>{item.sub}</Text>
          </View>
          <MaterialIcons name="open-in-new" size={16} color={MID} />
        </TouchableOpacity>
      );
    }
    if (item.type === 'info') {
      return (
        <View style={[SI.row, { borderColor: item.color+'15', opacity:0.85 }]}>
          <View style={[SI.iconBox, { backgroundColor: item.color+'08', borderColor: item.color+'20' }]}>
            <MaterialIcons name={item.icon as any} size={18} color={item.color} />
          </View>
          <View style={{ flex:1 }}>
            <Text style={[SI.label, { color:TEXT+'CC' }]}>{item.label}</Text>
            <Text style={SI.sub}>{item.sub}</Text>
          </View>
          <View style={{ width:6, height:6, borderRadius:3, backgroundColor: item.color+'60' }} />
        </View>
      );
    }
    return null;
  }, []);

  return (
    <View style={{ flex:1, backgroundColor:BG }}>
      <ConfigHeader safeTop={insets.top} />

      <FlatList
        data={SETTINGS}
        keyExtractor={(item, i) => `${item.type}-${i}`}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
        removeClippedSubviews={Platform.OS === 'android'}
      />

      <View style={{ backgroundColor:SURF, borderTopWidth:1, borderTopColor: DIM+'80', paddingTop:8, paddingBottom:Math.max(insets.bottom+4,10), paddingHorizontal:14 }}>
        <Text style={{ fontFamily:MONO, fontSize:8, color:MID, textAlign:'center', lineHeight:13 }}>
          BUTLER AI v7.3.0 · © 2026 ANDREJ SLADKOVIC · ALL RIGHTS RESERVED{'\n'}
          PROPRIETARY · LAN ONLY · ZERO TELEMETRY · AES-256-GCM
        </Text>
      </View>
    </View>
  );
}
const SI = StyleSheet.create({
  row:     { flexDirection:'row', alignItems:'center', gap:12, marginHorizontal:14, marginBottom:6, padding:12, backgroundColor:SURF, borderRadius:12, borderWidth:1.5 },
  iconBox: { width:38, height:38, borderRadius:10, borderWidth:1.5, alignItems:'center', justifyContent:'center', flexShrink:0 },
  label:   { fontFamily:MONO, fontSize:13, fontWeight:'700', lineHeight:17 },
  sub:     { fontFamily:MONO, fontSize:9.5, color:MID, lineHeight:14, marginTop:2 },
});

export default function SettingsScreen() {
  return <TabErrorBoundary name="Settings"><SettingsInner /></TabErrorBoundary>;
}
