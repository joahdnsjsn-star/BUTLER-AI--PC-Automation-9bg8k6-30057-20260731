/**
 * BUTLER AI — Settings v5 · Config Redesign
 * Non-scrollable chrome · Settings FlatList
 * © 2026 Andrej Sladkovic — ALL RIGHTS RESERVED
 */
import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Animated, Platform, Dimensions, Alert, Linking, ScrollView, TextInput, Modal, ActivityIndicator,
} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TabErrorBoundary } from '@/components/ui/TabErrorBoundary';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { haptics } from '@/services/haptics';
import * as ExpoClipboard from 'expo-clipboard';
import * as DocumentPicker from 'expo-document-picker';

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

  { type:'header', label:'CODE EXPORT & IMPORT', color:PURP },
  { type:'action', label:'Export App as HTML',      sub:'Full source snapshot for offline editing', icon:'code', color:PURP, action:'exportHtml' },
  { type:'action', label:'Import HTML Changes',     sub:'Apply HTML snippet to update UI/UX',      icon:'upload', color:CYAN, action:'importHtml' },
  { type:'action', label:'Copy Source to Clipboard',sub:'All source code → clipboard for AI tools', icon:'content-copy', color:AMBER, action:'copySource' },

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


function buildHtmlExport(files: {path:string; source:string}[]): string {
  const ts = new Date().toISOString();
  const sections = files.map(f => {
    const escaped = (f.source || '')
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    return `<section class="file">
  <div class="file-header">
    <span class="file-path">${f.path}</span>
    <span class="file-lines">${(f.source||'').split('\n').length} lines</span>
  </div>
  <pre class="code">${escaped}</pre>
</section>`;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Butler AI — Source Snapshot · ${ts}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:#050d18;color:#c0d8f0;font-family:Menlo,monospace;font-size:12px;line-height:1.55}
header{padding:22px 24px 18px;border-bottom:2px solid #00e5ff30;background:#060d18}
h1{font-size:22px;font-weight:900;color:#fff;letter-spacing:1px}.accent{color:#00e5ff}
.meta{font-size:10px;color:#3a5870;margin-top:6px;letter-spacing:.8px}
.toc{padding:16px 24px;background:#080e18;border-bottom:1px solid #0e1c2c}
.toc-title{font-size:9px;color:#00e5ff80;font-weight:900;letter-spacing:2px;margin-bottom:10px}
.toc-grid{display:flex;flex-wrap:wrap;gap:8px}
.toc-item{border:1px solid #00e5ff30;border-radius:6px;padding:5px 10px;font-size:9px;color:#00e5ff;cursor:pointer;text-decoration:none}
.toc-item:hover{background:#00e5ff15}
.toolbar{position:sticky;top:0;z-index:99;background:#060d18;border-bottom:1px solid #0e1c2c;padding:10px 24px;display:flex;align-items:center;gap:12px}
.toolbar input{flex:1;background:#0a1520;border:1px solid #0e1c2c;border-radius:8px;padding:7px 12px;color:#c0d8f0;font-size:12px;font-family:Menlo,monospace}
.toolbar input:focus{outline:none;border-color:#00e5ff60}
.toolbar button{background:#00e5ff;color:#000;border:none;border-radius:8px;padding:7px 14px;font-weight:900;font-size:11px;cursor:pointer;letter-spacing:.5px}
.toolbar button:hover{opacity:.88}
.toolbar button.sec{background:#cc44ff20;color:#cc44ff;border:1px solid #cc44ff40}
.file{margin:0;border-bottom:1px solid #0e1c2c}
.file-header{display:flex;align-items:center;justify-content:space-between;padding:10px 24px;background:#080e18;cursor:pointer;user-select:none}
.file-header:hover{background:#0a1420}
.file-path{font-size:11px;font-weight:900;color:#00e5ff;letter-spacing:.5px}
.file-lines{font-size:9px;color:#3a5870;letter-spacing:.5px}
.code{padding:16px 24px;background:#040810;overflow-x:auto;tab-size:2;font-size:11.5px;line-height:1.65;display:none}
.file.open .code{display:block}
.highlight{background:#ffb02025}
.no-match{display:none!important}
.import-zone{padding:24px;background:#080e18;border-bottom:2px solid #cc44ff30}
.import-zone h2{font-size:13px;font-weight:900;color:#cc44ff;letter-spacing:1px;margin-bottom:8px}
.import-zone p{font-size:10px;color:#3a5870;margin-bottom:14px;line-height:1.6}
.import-zone textarea{width:100%;height:180px;background:#040810;border:1.5px solid #cc44ff30;border-radius:10px;padding:12px;color:#c0d8f0;font-size:11px;font-family:Menlo,monospace;resize:vertical}
.import-zone textarea:focus{outline:none;border-color:#cc44ff70}
.import-btn{margin-top:10px;background:#cc44ff;color:#000;border:none;border-radius:8px;padding:9px 18px;font-weight:900;font-size:12px;cursor:pointer}
.import-btn:hover{opacity:.88}
.copy-btn{background:#ffb02020;color:#ffb020;border:1px solid #ffb02040;border-radius:8px;padding:9px 18px;font-weight:900;font-size:12px;cursor:pointer;margin-left:10px}
.badge{display:inline-block;border:1px solid;border-radius:4px;padding:2px 7px;font-size:8px;font-weight:900;margin-right:5px;letter-spacing:.5px}
.badge-cyan{border-color:#00e5ff40;color:#00e5ff}
.badge-green{border-color:#00ff9d40;color:#00ff9d}
.badge-amber{border-color:#ffb02040;color:#ffb020}
.badge-purp{border-color:#cc44ff40;color:#cc44ff}
</style>
</head>
<body>
<header>
  <h1><span class="accent">BUTLER</span> AI — Source Snapshot</h1>
  <div class="meta">Exported ${ts} · ${files.length} files · AES-256 · LAN ONLY · ZERO CLOUD</div>
  <div style="margin-top:10px">
    <span class="badge badge-cyan">REACT NATIVE</span>
    <span class="badge badge-green">EXPO ROUTER</span>
    <span class="badge badge-amber">TYPESCRIPT</span>
    <span class="badge badge-purp">BUTLER AI v7.3</span>
  </div>
</header>

<div class="import-zone">
  <h2>◈ IMPORT UI CHANGES</h2>
  <p>Paste modified TypeScript/React Native code below. Describe what to change using <code style="color:#cc44ff">&lt;!-- EDIT: ... --&gt;</code> comments inline. Copy the result and paste into OnSpace AI chat to apply changes without spending extra credits.</p>
  <textarea id="importCode" placeholder="Paste your modified component code here…\n\nExample:\n// EDIT: Change PURP color from #CC44FF to #9B6AFF\nconst PURP = '#9B6AFF';\n\nOr paste an entire file to replace a tab page."></textarea>
  <br>
  <button class="import-btn" onclick="applyImport()">◈ COPY IMPORT PROMPT</button>
  <button class="copy-btn" onclick="copyAll()">⊕ COPY ALL SOURCE</button>
</div>

<div class="toc">
  <div class="toc-title">TABLE OF CONTENTS · ${files.length} SOURCE FILES</div>
  <div class="toc-grid">
    ${files.map((f,i) => `<a class="toc-item" href="#file-${i}" onclick="openFile(${i})">${f.path.replace('app/(tabs)/','').replace('.tsx','')}</a>`).join('\n    ')}
  </div>
</div>

<div class="toolbar">
  <input id="searchBox" type="text" placeholder="Search across all source files…" oninput="doSearch(this.value)">
  <button onclick="expandAll()">EXPAND ALL</button>
  <button onclick="collapseAll()" class="sec">COLLAPSE</button>
</div>

${sections}

<script>
function openFile(i){var f=document.querySelectorAll('.file')[i];if(f){f.classList.toggle('open');f.scrollIntoView({behavior:'smooth',block:'start'})}}
function expandAll(){document.querySelectorAll('.file').forEach(f=>f.classList.add('open'))}
function collapseAll(){document.querySelectorAll('.file').forEach(f=>f.classList.remove('open'))}
function doSearch(q){
  var term=q.toLowerCase().trim();
  document.querySelectorAll('.file').forEach(function(f){
    if(!term){f.classList.remove('no-match');var c=f.querySelector('.code');if(c)c.innerHTML=c.innerHTML.replace(/<mark class="highlight">/g,'').replace(/<\/mark>/g,'');return;}
    var txt=f.querySelector('.code')?.textContent?.toLowerCase()||'';
    if(txt.includes(term)){f.classList.remove('no-match');f.classList.add('open');}else{f.classList.add('no-match');}
  });
}
function applyImport(){
  var code=document.getElementById('importCode').value.trim();
  if(!code){alert('Paste your modified code above first.');return;}
  var prompt='I want to update my Butler AI app.\\n\\nHere is the modified code — please apply these changes to the corresponding file in my project:\\n\\n```typescript\\n'+code+'\\n```\\n\\nOnly change what is different from the current file. Keep all other logic intact.';
  navigator.clipboard.writeText(prompt).then(function(){
    alert('Import prompt copied! Paste it into OnSpace AI chat to apply the change.');
  }).catch(function(){
    var ta=document.createElement('textarea');ta.value=prompt;document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);
    alert('Import prompt copied! Paste it into OnSpace AI chat.');
  });
}
function copyAll(){
  var allCode=Array.from(document.querySelectorAll('.file')).map(function(f){
    var path=f.querySelector('.file-path')?.textContent||'';
    var code=f.querySelector('.code')?.textContent||'';
    return '// === '+path+' ===\\n'+code;
  }).join('\\n\\n');
  navigator.clipboard.writeText(allCode).then(function(){
    alert('All source code copied to clipboard!');
  }).catch(function(){
    alert('Copy failed — use browser copy instead.');
  });
}
document.querySelectorAll('.file-header').forEach(function(h,i){
  h.addEventListener('click',function(){h.parentElement.classList.toggle('open');});
});
</script>
</body></html>`;
}

// ── Export/Import modal ───────────────────────────────────────────
const ExportImportPanel = memo(({ visible, onClose }: { visible:boolean; onClose:()=>void }) => {
  const [status, setStatus] = useState('');
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [previewCode, setPreviewCode] = useState('');
  const shakeA = useRef(new Animated.Value(0)).current;

  const shake = () => Animated.sequence([
    Animated.timing(shakeA, { toValue:8, duration:55, useNativeDriver:true }),
    Animated.timing(shakeA, { toValue:-8, duration:55, useNativeDriver:true }),
    Animated.timing(shakeA, { toValue:4, duration:55, useNativeDriver:true }),
    Animated.timing(shakeA, { toValue:0, duration:55, useNativeDriver:true }),
  ]).start();

  const doExportHtml = async () => {
    haptics.heavy(); setExporting(true); setStatus('Building HTML snapshot…');
    try {
      // Pull source from the appSourceBundle which already has all file sources embedded
      let allText = '';
      try {
        const bundle = require('@/constants/appSourceBundle');
        if (bundle?.buildAllFilesExport) allText = bundle.buildAllFilesExport();
      } catch {}

      // Fallback: build from AsyncStorage-cached sources (populated when tabs are visited)
      const files: {path:string; source:string}[] = [];
      const tabPaths = [
        'home.tsx','butler.tsx','scripts.tsx','knowledge.tsx',
        'logs.tsx','connect.tsx','fileshare.tsx','builder.tsx',
        'cosmetic.tsx','settings.tsx',
      ];
      for (const p of tabPaths) {
        try {
          const cached = await AsyncStorage.getItem('@butler_src_' + p).catch(() => null);
          const src = cached || (allText ? '' : '/* Open this tab first to cache its source */');
          files.push({ path: 'app/(tabs)/' + p, source: src });
        } catch { files.push({ path: 'app/(tabs)/' + p, source: '/* unavailable */' }); }
      }
      // If we got the full bundle text, embed it as one giant file too
      if (allText) {
        files.push({ path: 'FULL_SOURCE_BUNDLE.txt', source: allText.slice(0, 400000) });
      }

      const html = buildHtmlExport(files);

      // Try expo-file-system + expo-sharing first, fall back to clipboard
      let shared = false;
      try {
        const FS = require('expo-file-system');
        const SH = require('expo-sharing');
        const uri = FS.cacheDirectory + 'butler_ai_source_' + Date.now() + '.html';
        await FS.writeAsStringAsync(uri, html, { encoding: FS.EncodingType.UTF8 });
        const canShare = await SH.isAvailableAsync();
        if (canShare) {
          await SH.shareAsync(uri, { mimeType:'text/html', dialogTitle:'Save Butler AI Source HTML', UTI:'public.html' });
          shared = true;
        }
      } catch {}

      if (!shared) {
        // Clipboard fallback — truncate to clipboard limit
        const clip = html.slice(0, 950000);
        await ExpoClipboard.setStringAsync(clip);
        Alert.alert(
          'HTML Copied to Clipboard',
          `${Math.round(html.length/1024)}KB HTML source copied. Paste into a text editor and save as .html to open in browser.`,
          [{ text:'OK' }]
        );
      }

      setStatus(`✓ HTML exported (${Math.round(html.length/1024)}KB)`);
      haptics.success();
    } catch (e:any) {
      setStatus('Error: ' + (e?.message||'export failed'));
      shake();
    }
    setExporting(false);
  };

  const doImportHtml = async () => {
    haptics.medium(); setImporting(true); setStatus('Opening file picker…');
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/html','application/octet-stream','text/plain','*/*'],
        copyToCacheDirectory: true,
      });
      if (result.canceled || !result.assets?.[0]) { setStatus('Cancelled.'); setImporting(false); return; }
      const asset = result.assets[0];
      let content = '';
      try {
        const FS = require('expo-file-system');
        content = await FS.readAsStringAsync(asset.uri, { encoding: FS.EncodingType.UTF8 });
      } catch {
        const r = await fetch(asset.uri); content = await r.text();
      }
      const previewMatch = content.match(/<pre[^>]*class="code"[^>]*>([\s\S]*?)<\/pre>/i);
      const preview = previewMatch
        ? previewMatch[1].replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&').slice(0,1200)
        : content.slice(0, 1200);
      setPreviewCode(preview);
      await AsyncStorage.setItem('@butler_import_html_v1', content.slice(0, 512000));
      setStatus(`✓ Loaded ${Math.round(content.length/1024)}KB · ${asset.name}`);
      haptics.success();
    } catch (e:any) {
      setStatus('Error: ' + (e?.message||'import failed')); shake();
    }
    setImporting(false);
  };

  const copyImportPrompt = async () => {
    haptics.medium();
    try {
      const cached = await AsyncStorage.getItem('@butler_import_html_v1');
      if (!cached) { Alert.alert('No Import', 'Import an HTML file first.'); return; }
      const prompt = `I have a modified Butler AI source HTML export. Please apply the UI/UX changes from this file to my project. Here is the exported HTML content:\n\n${cached.slice(0,8000)}\n\n(Apply only the changes visible in the modified sections. Keep all logic and API wiring intact.)`;
      await ExpoClipboard.setStringAsync(prompt);
      setStatus('✓ Prompt copied — paste into OnSpace AI chat!');
      haptics.success();
    } catch { setStatus('Copy failed'); }
  };

  if (!visible) return null;
  return (
    <Modal visible transparent animationType="slide">
      <View style={{ flex:1, backgroundColor:'rgba(0,0,0,0.88)', justifyContent:'flex-end' }}>
        <View style={{ backgroundColor:SURF, borderTopLeftRadius:24, borderTopRightRadius:24, maxHeight:'88%' }}>
          <View style={{ height:3, flexDirection:'row' }}>
            <View style={{ flex:1, backgroundColor:PURP }} />
            <View style={{ flex:1, backgroundColor:CYAN }} />
          </View>
          <View style={{ flexDirection:'row', alignItems:'center', gap:10, padding:16, paddingBottom:12 }}>
            <MaterialCommunityIcons name="code-json" size={20} color={PURP} />
            <View style={{ flex:1 }}>
              <Text style={{ fontFamily:MONO, fontSize:15, fontWeight:'900', color:TEXT }}>CODE EXPORT & IMPORT</Text>
              <Text style={{ fontFamily:MONO, fontSize:9, color:MID, marginTop:2 }}>Save credits · Edit UI offline · Import back</Text>
            </View>
            <TouchableOpacity onPress={onClose} activeOpacity={0.8} style={{ padding:4 }}>
              <MaterialIcons name="close" size={22} color={MID} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding:16, gap:12, paddingBottom:40 }}>

            {/* How it works */}
            <View style={{ backgroundColor:SURF2, borderRadius:12, borderWidth:1.5, borderColor:PURP+'30', padding:14, gap:6 }}>
              <Text style={{ fontFamily:MONO, fontSize:10, fontWeight:'900', color:PURP, letterSpacing:1.2 }}>HOW TO SAVE CREDITS</Text>
              {[
                '1. Export → HTML file with ALL source code',
                '2. Open HTML in browser → edit code directly',
                '3. Use built-in Import Prompt tool inside HTML',
                '4. Import HTML here → copy prompt → paste in chat',
                '5. AI applies only your specific changes — cheap!',
              ].map((s,i) => (
                <View key={i} style={{ flexDirection:'row', alignItems:'flex-start', gap:8 }}>
                  <Text style={{ fontFamily:MONO, fontSize:10, color: [PURP,CYAN,GREEN,AMBER,PURP][i], fontWeight:'900' }}>{s.charAt(0)}</Text>
                  <Text style={{ fontFamily:MONO, fontSize:10, color:MID, flex:1, lineHeight:15 }}>{s.slice(2)}</Text>
                </View>
              ))}
            </View>

            {/* Export + Import side by side */}
            <View style={{ flexDirection:'row', gap:10 }}>
              <TouchableOpacity onPress={doExportHtml} disabled={exporting} activeOpacity={0.85}
                style={{ flex:1, flexDirection:'row', alignItems:'center', justifyContent:'center', gap:8,
                  backgroundColor: exporting ? DIM : PURP, borderRadius:14, paddingVertical:14 }}>
                {exporting
                  ? <ActivityIndicator color={TEXT} size="small" />
                  : <MaterialCommunityIcons name="export-variant" size={18} color={exporting?MID:'#000'} />}
                <Text style={{ fontFamily:MONO, fontSize:12, fontWeight:'900', color: exporting ? MID : '#000' }}>
                  {exporting ? 'BUILDING…' : 'EXPORT HTML'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={doImportHtml} disabled={importing} activeOpacity={0.85}
                style={{ flex:1, flexDirection:'row', alignItems:'center', justifyContent:'center', gap:8,
                  backgroundColor: CYAN+'0F', borderRadius:14, paddingVertical:14,
                  borderWidth:1.5, borderColor: CYAN+'55' }}>
                {importing
                  ? <ActivityIndicator color={CYAN} size="small" />
                  : <MaterialCommunityIcons name="import" size={18} color={CYAN} />}
                <Text style={{ fontFamily:MONO, fontSize:12, fontWeight:'900', color: importing ? MID : CYAN }}>
                  {importing ? 'LOADING…' : 'IMPORT HTML'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Copy import prompt */}
            <TouchableOpacity onPress={copyImportPrompt} activeOpacity={0.85}
              style={{ flexDirection:'row', alignItems:'center', justifyContent:'center', gap:10,
                backgroundColor:AMBER+'0F', borderRadius:14, paddingVertical:13,
                borderWidth:1.5, borderColor:AMBER+'45' }}>
              <MaterialIcons name="content-copy" size={18} color={AMBER} />
              <View style={{ gap:2 }}>
                <Text style={{ fontFamily:MONO, fontSize:12, fontWeight:'900', color:AMBER }}>COPY AI IMPORT PROMPT</Text>
                <Text style={{ fontFamily:MONO, fontSize:8.5, color:MID, textAlign:'center' }}>Paste into OnSpace AI chat · applies changes cheaply</Text>
              </View>
            </TouchableOpacity>

            {/* Status */}
            {!!status && (
              <Animated.View style={{ transform:[{translateX:shakeA}], borderWidth:1.5, borderRadius:10, padding:11,
                borderColor: (status.startsWith('✓') ? GREEN : RED) + '45',
                backgroundColor: (status.startsWith('✓') ? GREEN : RED) + '08',
                flexDirection:'row', alignItems:'center', gap:8 }}>
                <MaterialIcons name={status.startsWith('✓') ? 'check-circle' : 'error-outline'} size={15}
                  color={status.startsWith('✓') ? GREEN : RED} />
                <Text style={{ fontFamily:MONO, fontSize:10.5, color: status.startsWith('✓') ? GREEN : RED, flex:1 }}>
                  {status}
                </Text>
                <TouchableOpacity onPress={() => setStatus('')} hitSlop={{top:8,bottom:8,left:8,right:8}}>
                  <MaterialIcons name="close" size={12} color={MID} />
                </TouchableOpacity>
              </Animated.View>
            )}

            {/* Preview of imported code */}
            {!!previewCode && (
              <View style={{ backgroundColor:'#020508', borderRadius:12, borderWidth:1.5, borderColor:CYAN+'25', overflow:'hidden' }}>
                <View style={{ flexDirection:'row', alignItems:'center', gap:7, padding:10, backgroundColor:SURF, borderBottomWidth:1, borderBottomColor:DIM }}>
                  <MaterialCommunityIcons name="file-code-outline" size={12} color={CYAN} />
                  <Text style={{ fontFamily:MONO, fontSize:9, fontWeight:'900', color:CYAN+'90', flex:1 }}>PREVIEW — FIRST 1200 CHARS</Text>
                  <TouchableOpacity onPress={() => setPreviewCode('')} hitSlop={{top:8,bottom:8,left:8,right:8}}>
                    <MaterialIcons name="close" size={13} color={MID} />
                  </TouchableOpacity>
                </View>
                <ScrollView style={{ maxHeight:180 }} showsVerticalScrollIndicator={false}>
                  <Text style={{ fontFamily:MONO, fontSize:10, color:TEXT+'CC', padding:12, lineHeight:17 }}>
                    {previewCode}
                  </Text>
                </ScrollView>
              </View>
            )}

            {/* Tips */}
            <View style={{ backgroundColor:SURF, borderRadius:12, borderWidth:1.5, borderColor:GREEN+'25', padding:13, gap:7 }}>
              <Text style={{ fontFamily:MONO, fontSize:9, color:GREEN+'90', fontWeight:'900', letterSpacing:1.2 }}>CREDIT-SAVING TIPS</Text>
              {[
                { tip:'Export HTML → edit color tokens (CYAN/AMBER/PURP) → import → one message applies all', c:CYAN },
                { tip:'Edit only StyleSheet values in HTML, not logic — minimal diff = minimal tokens used', c:GREEN },
                { tip:'Use <!-- EDIT: description --> comments in HTML so AI knows exactly what changed', c:AMBER },
                { tip:'One file at a time — paste a single tsx block to AI for a single-credit apply', c:PURP },
              ].map((t,i) => (
                <View key={i} style={{ flexDirection:'row', alignItems:'flex-start', gap:7 }}>
                  <View style={{ width:3, height:3, borderRadius:1.5, backgroundColor:t.c, marginTop:6, flexShrink:0 }} />
                  <Text style={{ fontFamily:MONO, fontSize:9.5, color:MID, flex:1, lineHeight:15 }}>{t.tip}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
});

function SettingsInner() {
  const insets = useSafeAreaInsets();
  const [showExportPanel, setShowExportPanel] = useState(false);

  const handleAction = async (action: string) => {
    haptics.medium();
    switch (action) {
      case 'exportHtml':
        setShowExportPanel(true);
        return;
      case 'importHtml':
        setShowExportPanel(true);
        return;
      case 'copySource':
        try {
          const { buildAllFilesExport } = await import('@/constants/appSourceBundle').catch(() => ({ buildAllFilesExport: null }));
          const text = buildAllFilesExport ? buildAllFilesExport() : 'Source bundle not available — use Export HTML instead.';
          await ExpoClipboard.setStringAsync(text.slice(0, 100000));
          haptics.success();
          Alert.alert('Copied!', `Source code copied to clipboard. Paste into any AI tool.`);
        } catch (e:any) { Alert.alert('Copy Failed', e?.message || 'Try Export HTML instead.'); }
        return;
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

      <ExportImportPanel visible={showExportPanel} onClose={() => setShowExportPanel(false)} />

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
