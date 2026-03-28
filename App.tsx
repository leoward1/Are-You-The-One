import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import RootNavigator from './src/navigation/RootNavigator';
import { useAuthStore } from './src/store';
import { usePushNotifications } from './src/hooks/usePushNotifications';

import Constants from 'expo-constants';

// Keep the native splash screen visible while we load auth state
SplashScreen.preventAutoHideAsync();

export default function App() {
  usePushNotifications(); // Register and manage Push Notifications
  
  const [appIsReady, setAppIsReady] = useState(false);
  const loadUser = useAuthStore((state: any) => state.loadUser);
  const initAuthListener = useAuthStore((state: any) => state.initAuthListener);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const initApp = async () => {
      try {
        // 1. Load cached user session first — must complete before listener
        await loadUser();
        // 2. Only start the live auth listener after session is restored
        unsubscribe = initAuthListener();
      } catch (error) {
        console.error('App init error:', error);
      } finally {
        // 3. Mark app as ready to render the navigation container
        setAppIsReady(true);
      }
    };

    initApp();

    // Cleanup listener on unmount
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  if (!appIsReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
          <NavigationContainer onReady={() => {
            SplashScreen.hideAsync();
          }}>
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
