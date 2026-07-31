/**
 * Butler AI — Root Layout (Expo Router entry point)
 *
 * Keeps the native splash visible until the app is ready.
 * All actual navigation logic lives in app/(tabs)/_layout.tsx.
 */

import { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';

// Keep the native splash visible until we're ready.
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={s.root}>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false, animation: 'none' }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="terms"       options={{ headerShown: false, presentation: 'modal' }} />
          <Stack.Screen name="data-safety" options={{ headerShown: false, presentation: 'modal' }} />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
});
