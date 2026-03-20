import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '@/store';

import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';

export type RootStackParamList = {
  Auth: { screen?: string } | undefined;
  Main: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { isAuthenticated, user } = useAuthStore();
  const isOnboarded = user?.is_onboarded;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : !isOnboarded ? (
        // Keep them in the Auth stack but let them finish onboarding
        <Stack.Screen name="Auth" component={AuthNavigator} initialParams={{ screen: 'Onboarding' }} />
      ) : (
        <Stack.Screen name="Main" component={MainNavigator} />
      )}
    </Stack.Navigator>
  );
}
