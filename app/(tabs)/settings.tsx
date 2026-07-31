/**
 * Butler AI — CFG (Settings) Tab
 * App configuration and preferences.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TabErrorBoundary } from '@/components/ui/TabErrorBoundary';
import { D, FONT } from '@/constants/design';
import { notifyOnboardingReset } from './_layout';
import LegalAboutScreen from '@/components/ui/LegalAboutScreen';

function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [aboutOpen, setAboutOpen] = useState(false);

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
        <Text style={s.sectionLabel}>LEGAL</Text>
        <TouchableOpacity style={s.row} onPress={() => setAboutOpen(true)} activeOpacity={0.7}>
          <MaterialIcons name="verified-user" size={18} color={D.violet} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={s.rowTitle}>About & Legal</Text>
            <Text style={s.rowSub}>License, trademark, contact</Text>
          </View>
          <MaterialIcons name="chevron-right" size={18} color={D.textDim} />
        </TouchableOpacity>
        <TouchableOpacity style={s.row} onPress={() => router.push('/terms' as any)} activeOpacity={0.7}>
          <MaterialIcons name="description" size={18} color={D.textMid} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={s.rowTitle}>Terms of Service</Text>
          </View>
          <MaterialIcons name="chevron-right" size={18} color={D.textDim} />
        </TouchableOpacity>
        <TouchableOpacity style={s.row} onPress={() => router.push('/data-safety' as any)} activeOpacity={0.7}>
          <MaterialIcons name="security" size={18} color={D.green} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={s.rowTitle}>Data Safety</Text>
          </View>
          <MaterialIcons name="chevron-right" size={18} color={D.textDim} />
        </TouchableOpacity>
        <TouchableOpacity style={s.row} onPress={() => router.push('/privacy-policy' as any)} activeOpacity={0.7}>
          <MaterialIcons name="policy" size={18} color={D.cyan} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={s.rowTitle}>Privacy Policy</Text>
          </View>
          <MaterialIcons name="chevron-right" size={18} color={D.textDim} />
        </TouchableOpacity>
      </View>

      <View style={s.section}>
        <Text style={s.sectionLabel}>DIAGNOSTICS</Text>
        <TouchableOpacity style={s.row} onPress={() => router.push('/crash-report' as any)} activeOpacity={0.7}>
          <MaterialIcons name="bug-report" size={18} color={D.red} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={s.rowTitle}>Crash Report</Text>
            <Text style={s.rowSub}>Startup diagnostics & boot error log</Text>
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

      <Modal visible={aboutOpen} animationType="slide" onRequestClose={() => setAboutOpen(false)}>
        <LegalAboutScreen />
        <TouchableOpacity
          onPress={() => setAboutOpen(false)}
          style={{ position: 'absolute', top: insets.top + 10, right: 16, width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.4)' }}
        >
          <MaterialIcons name="close" size={20} color="#FFF" />
        </TouchableOpacity>
      </Modal>
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
