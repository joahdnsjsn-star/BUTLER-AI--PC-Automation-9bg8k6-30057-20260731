/**
 * OnboardingHeroStep — Welcome screen hero panel
 * Shown on the first onboarding page (WELCOME).
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const MONO: any = Platform.OS === 'ios' ? 'Menlo-Bold' : 'monospace';
const CYAN = '#00E5FF';

interface Props {
  onBegin?: () => void;
}

export function OnboardingHeroStep({ onBegin }: Props) {
  const pulse = useRef(new Animated.Value(0.6)).current;
  const ringScale = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(pulse, { toValue: 1, duration: 1200, useNativeDriver: false }),
          Animated.timing(ringScale, { toValue: 1, duration: 1200, useNativeDriver: false }),
        ]),
        Animated.parallel([
          Animated.timing(pulse, { toValue: 0.6, duration: 1200, useNativeDriver: false }),
          Animated.timing(ringScale, { toValue: 0.85, duration: 1200, useNativeDriver: false }),
        ]),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse, ringScale]);

  return (
    <View style={s.container}>
      {/* Animated ring */}
      <Animated.View style={[s.ring, { opacity: pulse, transform: [{ scale: ringScale }] }]} />

      {/* Logo icon */}
      <View style={s.iconWrap}>
        <MaterialCommunityIcons name="robot" size={52} color={CYAN} />
      </View>

      {/* Labels */}
      <Text style={s.title}>BUTLER AI</Text>
      <Text style={s.sub}>LOCAL PC COMMAND CENTRE</Text>

      {/* Decorative bars */}
      <View style={s.bars}>
        {[1, 0.6, 0.35].map((op, i) => (
          <View key={i} style={[s.bar, { opacity: op, width: 40 - i * 12 }]} />
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  ring: {
    position: 'absolute',
    top: 4,
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 1.5,
    borderColor: CYAN + '40',
  },
  iconWrap: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: CYAN + '0C',
    borderWidth: 2,
    borderColor: CYAN + '50',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: {
    fontFamily: MONO,
    fontSize: 22,
    fontWeight: '900',
    color: CYAN,
    letterSpacing: 4,
  },
  sub: {
    fontFamily: MONO,
    fontSize: 9,
    color: CYAN + '70',
    letterSpacing: 2,
    marginTop: 4,
    marginBottom: 14,
  },
  bars: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  bar: {
    height: 2,
    backgroundColor: CYAN,
    borderRadius: 1,
  },
});
