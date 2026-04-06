import React, { Component, useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Image,
  Dimensions,
} from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '@/store';

import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import VideoIntroScreen from '@/screens/shared/VideoIntroScreen';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── In-App Splash Screen ──────────────────────────────────────────────────
function InAppSplash({ onDone }: { onDone: () => void }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    // Fade + scale in
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 6, useNativeDriver: true }),
    ]).start();

    // Fade out after 2.4 seconds then call onDone
    const timer = setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: 400, useNativeDriver: true }).start(() => {
        onDone();
      });
    }, 2400);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={splashStyles.container}>
      <Animated.View style={[splashStyles.content, { opacity, transform: [{ scale }] }]}>
        <Image
          source={require('../../assets/icon.png')}
          style={splashStyles.logo}
          resizeMode="contain"
        />
        <Text style={splashStyles.title}>Are You The One</Text>
        <Text style={splashStyles.tagline}>Where real connections begin</Text>
      </Animated.View>
      <Animated.Text style={[splashStyles.footer, { opacity }]}>
        ✨ Find your perfect match
      </Animated.Text>
    </View>
  );
}

const splashStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#8B1538',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  content: {
    alignItems: 'center',
  },
  logo: {
    width: SCREEN_WIDTH * 0.55,
    height: SCREEN_WIDTH * 0.55,
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    fontWeight: '400',
  },
  footer: {
    position: 'absolute',
    bottom: 48,
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
});

export type RootStackParamList = {
  Auth: { screen?: string } | undefined;
  Main: undefined;
  VideoIntroCamera: { userId: string } | undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// FIX: Error boundary catches uncaught JS errors and shows a clean fallback
// instead of the raw red React Native error screen on TestFlight
interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

class ErrorBoundary extends Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('App Error Boundary caught:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, errorMessage: '' });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={errorStyles.container}>
          <Text style={errorStyles.emoji}>💔</Text>
          <Text style={errorStyles.title}>Something went wrong</Text>
          <Text style={errorStyles.subtitle}>
            We hit an unexpected error. Please try again.
          </Text>
          {__DEV__ && <Text style={errorStyles.devError}>{this.state.errorMessage}</Text>}
          <TouchableOpacity
            style={errorStyles.button}
            onPress={this.handleReset}
          >
            <Text style={errorStyles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const errorStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#8B1538',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  devError: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: 'monospace',
    paddingHorizontal: 16,
  },
  button: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 50,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B1538',
  },
});

// Main navigator component
function AppNavigator() {
  const { isAuthenticated, user } = useAuthStore();
  const isOnboarded = user?.is_onboarded;
  const [splashDone, setSplashDone] = useState(false);

  if (!splashDone) {
    return <InAppSplash onDone={() => setSplashDone(true)} />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated && (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
      {isAuthenticated && !isOnboarded && (
        <Stack.Screen name="Auth" component={AuthNavigator} initialParams={{ screen: 'Onboarding' }} />
      )}
      {isAuthenticated && isOnboarded && (
        <Stack.Screen name="Main" component={MainNavigator} />
      )}
      {isAuthenticated && (
        <Stack.Screen name="VideoIntroCamera" component={VideoIntroScreen} options={{ presentation: 'fullScreenModal' }} />
      )}
    </Stack.Navigator>
  );
}

// FIX: Wrap entire app in ErrorBoundary
export default function RootNavigator() {
  return (
    <ErrorBoundary>
      <AppNavigator />
    </ErrorBoundary>
  );
}