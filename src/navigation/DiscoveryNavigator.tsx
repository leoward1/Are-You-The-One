import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SwipeDeckScreen from '@/screens/discovery/SwipeDeckScreen';
import ProfileDetailScreen from '@/screens/discovery/ProfileDetailScreen';

export type DiscoveryStackParamList = {
  SwipeDeck: undefined;
  ProfileDetail: { userId: string };
};

const Stack = createNativeStackNavigator<DiscoveryStackParamList>();

export default function DiscoveryNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="SwipeDeck"
        component={SwipeDeckScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ProfileDetail"
        component={ProfileDetailScreen}
        options={{ title: 'Profile' }}
      />
    </Stack.Navigator>
  );
}
