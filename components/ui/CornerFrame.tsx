/**
 * Butler AI — CornerFrame
 * HUD-style corner bracket decoration for panels.
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';

interface Props {
  color?:  string;
  size?:   number;
  weight?: number;
}

export function CornerFrame({ color = 'rgba(0,229,255,0.4)', size = 12, weight = 1.5 }: Props) {
  const corner = (pos: object, borderStyle: object) => (
    <View style={[s.corner, { width: size, height: size, borderColor: color, borderWidth: 0, ...borderStyle }, pos as any]} />
  );
  return (
    <>
      {corner({ top: 0, left: 0 },    { borderTopWidth: weight, borderLeftWidth: weight })}
      {corner({ top: 0, right: 0 },   { borderTopWidth: weight, borderRightWidth: weight })}
      {corner({ bottom: 0, left: 0 }, { borderBottomWidth: weight, borderLeftWidth: weight })}
      {corner({ bottom: 0, right: 0 },{ borderBottomWidth: weight, borderRightWidth: weight })}
    </>
  );
}

const s = StyleSheet.create({
  corner: { position: 'absolute' },
});
