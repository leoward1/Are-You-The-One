import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SwipeDeckScreen from '@/screens/discovery/SwipeDeckScreen';
import ProfileDetailScreen from '@/screens/discovery/ProfileDetailScreen';
import SuccessStoriesScreen from '@/screens/discovery/SuccessStoriesScreen';
import PerfectMatchLabScreen from '@/screens/discovery/PerfectMatchLabScreen';

export type DiscoveryStackParamList = {
  SwipeDeck: undefined;
  ProfileDetail: { userId: string };
  SuccessStories: undefined;
  PerfectMatchLab: undefined;
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
      <Stack.Screen
        name="SuccessStories"
        component={SuccessStoriesScreen}
        options={{ title: 'Success Stories', headerShown: false }}
      />
      <Stack.Screen
        name="PerfectMatchLab"
        component={PerfectMatchLabScreen}
        options={{ title: 'Perfect Match Lab' }}
      />
    </Stack.Navigator>
  );
}
