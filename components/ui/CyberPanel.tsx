/**
 * Butler AI — CyberPanel
 * Styled panel card with HUD corner brackets and accent border.
 */
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { CornerFrame } from './CornerFrame';

interface Props {
  children:   React.ReactNode;
  color?:     string;
  style?:     ViewStyle;
  padding?:   number;
}

export function CyberPanel({ children, color = 'rgba(0,229,255,0.25)', style, padding = 14 }: Props) {
  return (
    <View style={[s.panel, { borderColor: color, padding }, style]}>
      <CornerFrame color={color} />
      {children}
    </View>
  );
}

const s = StyleSheet.create({
  panel: {
    backgroundColor: '#0C1220',
    borderWidth: 1,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
});
