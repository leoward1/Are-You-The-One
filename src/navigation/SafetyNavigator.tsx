import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SafetyDashboardScreen from '@/screens/safety/SafetyDashboardScreen';
import ActiveCheckinScreen from '@/screens/safety/ActiveCheckinScreen';

export type SafetyStackParamList = {
  SafetyDashboard: undefined;
  ActiveCheckin: undefined;
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
    </Stack.Navigator>
  );
}
