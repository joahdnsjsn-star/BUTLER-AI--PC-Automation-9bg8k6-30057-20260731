/**
 * Butler AI — LegalDocView component
 * A simple full-screen scroll view for legal documents.
 * Used by app/terms.tsx and app/data-safety.tsx.
 */

import React from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

interface Props {
  title: string;
  body: string;
}

export function LegalDocView({ title, body }: Props) {
  const insets = useSafeAreaInsets();
  const MONO: any = Platform.OS === 'ios' ? 'Menlo' : 'monospace';

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => { try { router.back(); } catch {} }} style={s.backBtn} activeOpacity={0.7}>
          <MaterialIcons name="arrow-back" size={20} color="#00E5FF" />
        </TouchableOpacity>
        <Text style={[s.title, { fontFamily: MONO }]}>{title.toUpperCase()}</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Body */}
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {body.split('\n').map((line, i) => {
          const trimmed = line.trim();
          if (trimmed.startsWith('## ')) {
            return <Text key={i} style={[s.h2, { fontFamily: MONO }]}>{trimmed.slice(3)}</Text>;
          }
          if (trimmed.startsWith('# ')) {
            return <Text key={i} style={[s.h1, { fontFamily: MONO }]}>{trimmed.slice(2)}</Text>;
          }
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            return <Text key={i} style={[s.bullet, { fontFamily: MONO }]}>{'• ' + trimmed.slice(2)}</Text>;
          }
          if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
            return <Text key={i} style={[s.bold, { fontFamily: MONO }]}>{trimmed.slice(2, -2)}</Text>;
          }
          if (trimmed === '---') {
            return <View key={i} style={s.divider} />;
          }
          if (!trimmed) {
            return <View key={i} style={{ height: 8 }} />;
          }
          return <Text key={i} style={[s.body, { fontFamily: MONO }]}>{trimmed}</Text>;
        })}
        <View style={{ height: insets.bottom + 40 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: '#07090F' },
  header:  {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,229,255,0.12)',
    backgroundColor: '#0C1220',
  },
  backBtn: {
    width: 36, height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: 'rgba(0,229,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0,229,255,0.20)',
  },
  title:   { fontSize: 12, fontWeight: '900', color: '#00E5FF', letterSpacing: 2 },
  scroll:  { flex: 1 },
  content: { padding: 20 },
  h1:      { fontSize: 15, fontWeight: '900', color: '#00E5FF', letterSpacing: 1, marginBottom: 12, marginTop: 8 },
  h2:      { fontSize: 13, fontWeight: '700', color: '#C8E4F0', letterSpacing: 0.5, marginTop: 20, marginBottom: 8 },
  body:    { fontSize: 12, color: '#8892AA', lineHeight: 20, marginBottom: 4 },
  bold:    { fontSize: 12, fontWeight: '700', color: '#C8E4F0', lineHeight: 20, marginBottom: 4 },
  bullet:  { fontSize: 12, color: '#8892AA', lineHeight: 20, marginBottom: 2, paddingLeft: 8 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginVertical: 16 },
});
