/**
 * Butler AI — QuickButlerBar
 * Floating quick-action bar for the Butler AI tab.
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const MONO: any = Platform.OS === 'ios' ? 'Menlo-Bold' : 'monospace';
const CYAN = '#00DCFF';

interface Action {
  icon:  string;
  label: string;
  onPress: () => void;
}

interface Props {
  actions?: Action[];
}

const DEFAULT_ACTIONS: Action[] = [
  { icon: 'bolt', label: 'QUICK CMD', onPress: () => {} },
  { icon: 'code', label: 'SCRIPT',    onPress: () => {} },
  { icon: 'tune', label: 'CONFIG',    onPress: () => {} },
];

export default function QuickButlerBar({ actions = DEFAULT_ACTIONS }: Props) {
  return (
    <View style={s.bar}>
      {actions.map((a, i) => (
        <TouchableOpacity key={i} style={s.btn} onPress={a.onPress} activeOpacity={0.7}>
          <MaterialIcons name={a.icon as any} size={16} color={CYAN} />
          <Text style={s.label}>{a.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#0A1018',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,220,255,0.10)',
  },
  btn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: `${CYAN}30`,
    borderRadius: 7,
    paddingVertical: 7,
    backgroundColor: `${CYAN}08`,
  },
  label: {
    fontFamily: MONO,
    fontSize: 9,
    fontWeight: '900',
    color: CYAN,
    letterSpacing: 0.8,
  },
});
