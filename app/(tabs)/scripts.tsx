/**
 * Butler AI — FORGE (Scripts) Tab
 * Script builder and executor module.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { TabErrorBoundary } from '@/components/ui/TabErrorBoundary';
import { D, FONT } from '@/constants/design';

function ScriptsScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <MaterialIcons name="code" size={22} color={D.primary} />
        <Text style={s.title}>FORGE</Text>
        <Text style={s.sub}>Script Builder & Executor</Text>
      </View>
      <View style={s.body}>
        <MaterialIcons name="construction" size={48} color={D.textDim} />
        <Text style={s.comingSoon}>COMING SOON</Text>
        <Text style={s.hint}>Script library and remote execution engine</Text>
      </View>
    </View>
  );
}

export default function Scripts() {
  return (
    <TabErrorBoundary tabName="FORGE">
      <ScriptsScreen />
    </TabErrorBoundary>
  );
}

const s = StyleSheet.create({
  root:        { flex: 1, backgroundColor: D.bg },
  header:      { paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: D.border, alignItems: 'center' },
  title:       { fontFamily: FONT.mono, fontSize: 16, fontWeight: '900', color: D.primary, letterSpacing: 2, marginTop: 6 },
  sub:         { fontFamily: FONT.mono, fontSize: 10, color: D.textMid, marginTop: 2 },
  body:        { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  comingSoon:  { fontFamily: FONT.mono, fontSize: 14, fontWeight: '900', color: D.textDim, letterSpacing: 3 },
  hint:        { fontFamily: FONT.mono, fontSize: 11, color: D.textDim, textAlign: 'center', paddingHorizontal: 32 },
});
