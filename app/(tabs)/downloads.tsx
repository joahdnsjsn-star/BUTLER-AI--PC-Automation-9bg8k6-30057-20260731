/**
 * Butler AI — DOWNLOAD CENTER Tab
 * Download Butler Server, Ollama, Python and tools.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { TabErrorBoundary } from '@/components/ui/TabErrorBoundary';
import { D, FONT } from '@/constants/design';

interface DownloadItem {
  label: string;
  sub: string;
  icon: string;
  iconLib: 'material' | 'community';
  color: string;
  url: string;
}

const DOWNLOADS: DownloadItem[] = [
  {
    label: 'Butler Server',
    sub: 'Python server · runs on your PC',
    icon: 'server',
    iconLib: 'community',
    color: D.primary,
    url: 'https://github.com/joahdnsjsn-star/BUTLER-AI--PC-Automation-9bg8k6-30057-20260731',
  },
  {
    label: 'Ollama',
    sub: 'Local AI model runner',
    icon: 'robot',
    iconLib: 'community',
    color: D.green,
    url: 'https://ollama.com/download',
  },
  {
    label: 'Python 3.11+',
    sub: 'Required for Butler Server',
    icon: 'language-python',
    iconLib: 'community',
    color: D.amber,
    url: 'https://www.python.org/downloads/',
  },
];

function DownloadsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <MaterialCommunityIcons name="download-circle" size={22} color={D.cyan} />
        <Text style={[s.title, { color: D.cyan }]}>DOWNLOAD CENTER</Text>
        <Text style={s.sub}>Get every tool in one place</Text>
      </View>

      <View style={s.list}>
        {DOWNLOADS.map((item) => {
          const Icon = item.iconLib === 'community' ? MaterialCommunityIcons : MaterialIcons;
          return (
            <TouchableOpacity
              key={item.label}
              style={[s.card, { borderColor: item.color + '40' }]}
              onPress={() => Linking.openURL(item.url).catch(() => {})}
              activeOpacity={0.75}
            >
              <View style={[s.iconBox, { backgroundColor: item.color + '14', borderColor: item.color + '40' }]}>
                <Icon name={item.icon as any} size={24} color={item.color} />
              </View>
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={[s.label, { color: item.color }]}>{item.label}</Text>
                <Text style={s.itemSub}>{item.sub}</Text>
              </View>
              <MaterialIcons name="open-in-new" size={16} color={D.textDim} />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function Downloads() {
  return (
    <TabErrorBoundary tabName="DOWNLOAD CENTER">
      <DownloadsScreen />
    </TabErrorBoundary>
  );
}

const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: D.bg },
  header:  { paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: D.border, alignItems: 'center' },
  title:   { fontFamily: FONT.mono, fontSize: 14, fontWeight: '900', letterSpacing: 2, marginTop: 6 },
  sub:     { fontFamily: FONT.mono, fontSize: 10, color: D.textMid, marginTop: 2 },
  list:    { padding: 16, gap: 12 },
  card:    { flexDirection: 'row', alignItems: 'center', backgroundColor: D.surface, borderWidth: 1, borderRadius: 12, padding: 16 },
  iconBox: { width: 48, height: 48, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  label:   { fontFamily: FONT.mono, fontSize: 13, fontWeight: '900', letterSpacing: 0.5 },
  itemSub: { fontFamily: FONT.mono, fontSize: 10, color: D.textMid, marginTop: 3 },
});
