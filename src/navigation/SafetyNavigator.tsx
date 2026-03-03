import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SafetyDashboardScreen from '@/screens/safety/SafetyDashboardScreen';
import ActiveCheckinScreen from '@/screens/safety/ActiveCheckinScreen';
import DateModeScreen from '@/screens/safety/DateModeScreen';

export type SafetyStackParamList = {
  SafetyDashboard: undefined;
  ActiveCheckin: undefined;
  DateMode: { checkinId: string; partnerName: string };
};

const Stack = createNativeStackNavigator<SafetyStackParamList>();

export default function SafetyNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="SafetyDashboard"
        component={SafetyDashboardScreen}
        options={{ title: 'Safety' }}
      />
      <Stack.Screen
        name="ActiveCheckin"
        component={ActiveCheckinScreen}
        options={{ title: 'Active Check-in' }}
      />
      <Stack.Screen
        name="DateMode"
        component={DateModeScreen}
        options={{ title: 'Date Mode', headerLeft: () => null }}
      />
    </Stack.Navigator>
  );
}
