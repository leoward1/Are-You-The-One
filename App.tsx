import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { StyleSheet, useColorScheme } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import RootNavigator from './src/navigation/RootNavigator';
import { useAuthStore } from './src/store';
import { usePushNotifications } from './src/hooks/usePushNotifications';
import { useThemeStore } from './src/store/useThemeStore';
import { useAppSettingsStore } from './src/store/useAppSettingsStore';
import { useNetworkStatus } from './src/hooks/useNetworkStatus';
import { OfflineBanner } from './src/components/ui/OfflineBanner';
import Constants from 'expo-constants';

// Keep the native splash screen visible while we load auth state
SplashScreen.preventAutoHideAsync();

export default function App() {
  usePushNotifications();

  const [appIsReady, setAppIsReady] = useState(false);
  const loadUser = useAuthStore((state: any) => state.loadUser);
  const initAuthListener = useAuthStore((state: any) => state.initAuthListener);
  const updatePresence = useAuthStore((state: any) => state.updatePresence);
  const isAuthenticated = useAuthStore((state: any) => state.isAuthenticated);
  const { mode, loadMode } = useThemeStore();
  const loadAppSettings = useAppSettingsStore((state) => state.loadAppSettings);
  const isOnline = useNetworkStatus();
  const systemScheme = useColorScheme();
  const isDark = mode === 'dark' || (mode === 'system' && systemScheme === 'dark');

  // HEARTBEAT: Update presence every 2 minutes
  useEffect(() => {
    if (!isAuthenticated || !isOnline) return;

    // Update immediately on mount
    updatePresence();

    const interval = setInterval(() => {
      updatePresence();
    }, 120000); // 2 minutes

    return () => clearInterval(interval);
  }, [isAuthenticated, isOnline]);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const initApp = async () => {
      try {
        await loadMode();
        await loadAppSettings();
        await loadUser();
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
        <NavigationContainer onReady={() => { SplashScreen.hideAsync(); }}>
          <RootNavigator />
        </NavigationContainer>
        {!isOnline && <OfflineBanner />}
        <StatusBar style={isDark ? 'light' : 'dark'} />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
