import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SafetyDashboardScreen from '@/screens/safety/SafetyDashboardScreen';
import ActiveCheckinScreen from '@/screens/safety/ActiveCheckinScreen';
import DateModeScreen from '@/screens/safety/DateModeScreen';
import TrustedContactsScreen from '@/screens/safety/TrustedContactsScreen';

export type SafetyStackParamList = {
  SafetyDashboard: undefined;
  ActiveCheckin: { checkinId: string };
  DateMode: { checkinId: string; partnerName: string };
  TrustedContacts: undefined;
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
      <Stack.Screen
        name="TrustedContacts"
        component={TrustedContactsScreen}
        options={{ title: 'Trusted Contacts' }}
      />
    </Stack.Navigator>
  );
}