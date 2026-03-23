import * as SplashScreen from 'expo-splash-screen';
import { registerRootComponent } from 'expo';
import App from './App';

// Prevent the splash screen from auto-hiding before App.tsx can take over
// This is the absolute earliest we can call this in the JS lifecycle
SplashScreen.preventAutoHideAsync().catch(() => {
  /* ignore error if already prevented */
});

registerRootComponent(App);
