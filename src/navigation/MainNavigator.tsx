import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { COLORS } from '@/utils/constants';

import DiscoveryNavigator from './DiscoveryNavigator';
import MatchesNavigator from './MatchesNavigator';
import DatesNavigator from './DatesNavigator';
import SafetyNavigator from './SafetyNavigator';
import ProfileNavigator from './ProfileNavigator';

export type MainTabParamList = {
  DiscoveryTab: undefined;
  MatchesTab: undefined;
  DatesTab: undefined;
  SafetyTab: undefined;
  ProfileTab: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
      }}
    >
      <Tab.Screen
        name="DiscoveryTab"
        component={DiscoveryNavigator}
        options={{
          tabBarLabel: 'Discover',
          tabBarIcon: () => null,
        }}
      />
      <Tab.Screen
        name="MatchesTab"
        component={MatchesNavigator}
        options={{
          tabBarLabel: 'Matches',
          tabBarIcon: () => null,
        }}
      />
      <Tab.Screen
        name="DatesTab"
        component={DatesNavigator}
        options={{
          tabBarLabel: 'Dates',
          tabBarIcon: () => null,
        }}
      />
      <Tab.Screen
        name="SafetyTab"
        component={SafetyNavigator}
        options={{
          tabBarLabel: 'Safety',
          tabBarIcon: () => null,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileNavigator}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: () => null,
        }}
      />
    </Tab.Navigator>
  );
}
