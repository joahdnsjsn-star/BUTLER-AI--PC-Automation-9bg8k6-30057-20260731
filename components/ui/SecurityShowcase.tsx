/**
 * SecurityShowcase — HUD security info tiles
 * Used on the WELCOME page of onboarding to show key privacy facts.
 */

import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';

const MONO: any = Platform.OS === 'ios' ? 'Menlo-Bold' : 'monospace';

interface SecurityItem {
  icon: string;
  iconLib: 'material' | 'community';
  title: string;
  sub: string;
  color: string;
}

const ITEMS: SecurityItem[] = [
  { icon: 'wifi-off',       iconLib: 'material',   title: 'LAN ONLY',     sub: 'No cloud routing',       color: '#00FF88' },
  { icon: 'lock',           iconLib: 'material',   title: 'HMAC-256',     sub: 'All requests signed',    color: '#00E5FF' },
  { icon: 'shield-check',   iconLib: 'community',  title: 'LOCAL EXEC',   sub: 'Runs on your machine',   color: '#CC44FF' },
  { icon: 'eye-off',        iconLib: 'community',  title: 'NO TELEMETRY', sub: 'Zero data collected',    color: '#FFB020' },
];

interface Props {
  mode?: 'compact' | 'full';
}

export default function SecurityShowcase({ mode = 'compact' }: Props) {
  const items = mode === 'compact' ? ITEMS.slice(0, 2) : ITEMS;

  return (
    <View style={s.wrap}>
      {items.map((item) => {
        const Icon = item.iconLib === 'community' ? MaterialCommunityIcons : MaterialIcons;
        return (
          <View key={item.title} style={[s.tile, { borderColor: item.color + '50', backgroundColor: item.color + '0A' }]}>
            <View style={[s.iconBox, { borderColor: item.color + '40', backgroundColor: item.color + '12' }]}>
              <Icon name={item.icon as any} size={18} color={item.color} />
            </View>
            <Text style={[s.title, { color: item.color }]}>{item.title}</Text>
            <Text style={[s.sub, { color: item.color + '80' }]}>{item.sub}</Text>
          </View>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tile: {
    flex: 1,
    minWidth: 120,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    gap: 6,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: MONO,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  sub: {
    fontFamily: MONO,
    fontSize: 9,
    textAlign: 'center',
  },
});
