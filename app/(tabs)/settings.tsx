/**
 * Butler AI — CFG (Settings) Tab
 * App configuration and preferences.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TabErrorBoundary } from '@/components/ui/TabErrorBoundary';
import { D, FONT } from '@/constants/design';
import { notifyOnboardingReset } from './_layout';

function SettingsScreen() {
  const insets = useSafeAreaInsets();

  const handleReplayTutorial = async () => {
    try {
      await AsyncStorage.clear();
    } catch {}
    notifyOnboardingReset();
  };

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <MaterialIcons name="tune" size={22} color={D.cyan} />
        <Text style={[s.title, { color: D.cyan }]}>CFG</Text>
        <Text style={s.sub}>Configuration & Settings</Text>
      </View>

      <View style={s.section}>
        <Text style={s.sectionLabel}>ONBOARDING</Text>
        <TouchableOpacity style={s.row} onPress={handleReplayTutorial} activeOpacity={0.7}>
          <MaterialIcons name="replay" size={18} color={D.primary} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={s.rowTitle}>Replay Tutorial</Text>
            <Text style={s.rowSub}>Re-run the onboarding flow</Text>
          </View>
          <MaterialIcons name="chevron-right" size={18} color={D.textDim} />
        </TouchableOpacity>
      </View>

      <View style={s.section}>
        <Text style={s.sectionLabel}>APP INFO</Text>
        <View style={s.row}>
          <MaterialIcons name="info-outline" size={18} color={D.textMid} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={s.rowTitle}>Butler AI</Text>
            <Text style={s.rowSub}>Local PC Automation · v1.0</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

export default function Settings() {
  return (
    <TabErrorBoundary tabName="CFG">
      <SettingsScreen />
    </TabErrorBoundary>
  );
}

const s = StyleSheet.create({
  root:         { flex: 1, backgroundColor: D.bg },
  header:       { paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: D.border, alignItems: 'center' },
  title:        { fontFamily: FONT.mono, fontSize: 16, fontWeight: '900', letterSpacing: 2, marginTop: 6 },
  sub:          { fontFamily: FONT.mono, fontSize: 10, color: D.textMid, marginTop: 2 },
  section:      { marginTop: 24, paddingHorizontal: 16 },
  sectionLabel: { fontFamily: FONT.mono, fontSize: 9, color: D.textDim, letterSpacing: 2, marginBottom: 8, marginLeft: 4 },
  row:          { flexDirection: 'row', alignItems: 'center', backgroundColor: D.surface, borderWidth: 1, borderColor: D.border, borderRadius: 10, padding: 14, marginBottom: 8 },
  rowTitle:     { fontFamily: FONT.mono, fontSize: 13, fontWeight: '700', color: D.text },
  rowSub:       { fontFamily: FONT.mono, fontSize: 10, color: D.textMid, marginTop: 2 },
});
