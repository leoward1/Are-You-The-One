import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { COLORS, FONTS } from '@/utils/constants';

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

// FIX: Stable tab icon component with explicit key to prevent iOS 18 re-render crash
const TabIcon = React.memo(({ emoji, focused }: { emoji: string; focused: boolean }) => (
  <View style={styles.tabIconContainer}>
    <Text style={[styles.tabEmoji, { opacity: focused ? 1 : 0.45 }]}>{emoji}</Text>
  </View>
));

export default function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarLabelStyle: {
          fontFamily: FONTS.medium,
          fontSize: 11,
          marginTop: -2,
        },
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 24 : 12,
          height: Platform.OS === 'ios' ? 88 : 70,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
        },
        // FIX: Prevent tab re-mounting which causes swipe gesture crashes
        lazy: false,
        unmountOnBlur: false,
      }}
    >
      <Tab.Screen
        name="DiscoveryTab"
        component={DiscoveryNavigator}
        options={{
          tabBarLabel: 'Discover',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🔥" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="MatchesTab"
        component={MatchesNavigator}
        options={{
          tabBarLabel: 'Matches',
          tabBarIcon: ({ focused }) => <TabIcon emoji="💕" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="DatesTab"
        component={DatesNavigator}
        options={{
          tabBarLabel: 'Dates',
          tabBarIcon: ({ focused }) => <TabIcon emoji="📅" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="SafetyTab"
        component={SafetyNavigator}
        options={{
          tabBarLabel: 'Safety',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🛡️" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileNavigator}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ focused }) => <TabIcon emoji="👤" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 28,
  },
  tabEmoji: {
    fontSize: 22,
  },
});