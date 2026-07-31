/**
 * Butler AI — Root index redirect
 * Expo Router requires an index route. Redirect to nexushome.
 */

import { Redirect } from 'expo-router';

export default function Index() {
  return <Redirect href="/(tabs)/nexushome" />;
}
