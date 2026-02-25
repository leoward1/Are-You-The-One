import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { StyleSheet } from 'react-native';

import RootNavigator from './src/navigation/RootNavigator';
import { useAuthStore } from './src/store';

export default function App() {
  const loadUser = useAuthStore((state: any) => state.loadUser);
  const initAuthListener = useAuthStore((state: any) => state.initAuthListener);

  useEffect(() => {
    loadUser();
    const unsubscribe = initAuthListener();
    return () => unsubscribe();
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
        <StatusBar style="auto" />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
