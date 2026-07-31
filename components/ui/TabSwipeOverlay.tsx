/**
 * TabSwipeOverlay — invisible gesture layer for left/right tab swipes
 * Sits behind all content (zIndex 0) and responds to horizontal pan gestures.
 * Navigates to leftRoute (swipe right) or rightRoute (swipe left).
 */

import React, { useRef } from 'react';
import { View, PanResponder, StyleSheet } from 'react-native';
import { router } from 'expo-router';

interface Props {
  leftRoute?: string;
  rightRoute?: string;
  /** Minimum horizontal swipe distance to trigger (default 60px) */
  threshold?: number;
}

export function TabSwipeOverlay({ leftRoute, rightRoute, threshold = 60 }: Props) {
  const startX = useRef(0);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gs) =>
        Math.abs(gs.dx) > 12 && Math.abs(gs.dx) > Math.abs(gs.dy) * 1.5,
      onPanResponderGrant: (_, gs) => { startX.current = gs.x0; },
      onPanResponderRelease: (_, gs) => {
        if (gs.dx < -threshold && rightRoute) {
          try { router.push(rightRoute as any); } catch {}
        } else if (gs.dx > threshold && leftRoute) {
          try { router.push(leftRoute as any); } catch {}
        }
      },
    })
  ).current;

  return (
    <View
      style={StyleSheet.absoluteFill}
      pointerEvents="box-none"
      {...panResponder.panHandlers}
    />
  );
}
