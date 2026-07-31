/**
 * Butler AI — LegalDocView component
 * A simple full-screen scroll view for legal documents.
 * Used by app/terms.tsx and app/data-safety.tsx.
 */

import React from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { D, FONT, alpha } from '@/constants/design';

interface Props {
  title: string;
  body: string;
  /** Per-page accent so each legal doc reads as its own screen, not a clone. */
  accent?: string;
}

export function LegalDocView({ title, body, accent = D.cyan }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={[s.header, { borderBottomColor: alpha(accent, 0.12) }]}>
        <TouchableOpacity onPress={() => { try { router.back(); } catch {} }} style={[s.backBtn, { backgroundColor: alpha(accent, 0.08), borderColor: alpha(accent, 0.2) }]} activeOpacity={0.7}>
          <MaterialIcons name="arrow-back" size={20} color={accent} />
        </TouchableOpacity>
        <Text style={[s.title, { color: accent }]}>{title.toUpperCase()}</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Body */}
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {body.split('\n').map((line, i) => {
          const trimmed = line.trim();
          if (trimmed.startsWith('## ')) {
            return <Text key={i} style={[s.h2, { color: accent }]}>{trimmed.slice(3)}</Text>;
          }
          if (trimmed.startsWith('# ')) {
            return <Text key={i} style={[s.h1, { color: accent }]}>{trimmed.slice(2)}</Text>;
          }
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            return <Text key={i} style={s.bullet}>{'• ' + trimmed.slice(2)}</Text>;
          }
          if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
            return <Text key={i} style={s.bold}>{trimmed.slice(2, -2)}</Text>;
          }
          if (trimmed === '---') {
            return <View key={i} style={s.divider} />;
          }
          if (!trimmed) {
            return <View key={i} style={{ height: 8 }} />;
          }
          return <Text key={i} style={s.body}>{trimmed}</Text>;
        })}
        <View style={{ height: insets.bottom + 40 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: D.bg },
  header:  {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    backgroundColor: D.surface,
  },
  backBtn: {
    width: 36, height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
  },
  title:   { fontFamily: FONT.mono, fontSize: 12, fontWeight: '900', letterSpacing: 2 },
  scroll:  { flex: 1 },
  content: { padding: 20 },
  h1:      { fontFamily: FONT.mono, fontSize: 15, fontWeight: '900', letterSpacing: 1, marginBottom: 12, marginTop: 8 },
  h2:      { fontFamily: FONT.mono, fontSize: 13, fontWeight: '700', letterSpacing: 0.5, marginTop: 20, marginBottom: 8 },
  body:    { fontFamily: FONT.mono, fontSize: 12, color: D.textMid, lineHeight: 20, marginBottom: 4 },
  bold:    { fontFamily: FONT.mono, fontSize: 12, fontWeight: '700', color: D.text, lineHeight: 20, marginBottom: 4 },
  bullet:  { fontFamily: FONT.mono, fontSize: 12, color: D.textMid, lineHeight: 20, marginBottom: 2, paddingLeft: 8 },
  divider: { height: 1, backgroundColor: D.border, marginVertical: 16 },
});
