import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import DateSuggestionsScreen from '@/screens/dates/DateSuggestionsScreen';
import DateDetailScreen from '@/screens/dates/DateDetailScreen';
import TruthBoothScreen from '@/screens/dates/TruthBoothScreen';

export type DatesStackParamList = {
  DateSuggestions: undefined;
  TruthBooth: undefined;
  DateDetail: { suggestionId: string };
};

const Stack = createNativeStackNavigator<DatesStackParamList>();

export default function DatesNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="DateSuggestions"
        component={DateSuggestionsScreen}
        options={{ title: 'Date Ideas' }}
      />
      <Stack.Screen
        name="TruthBooth"
        component={TruthBoothScreen}
        options={{ title: 'Truth Booth' }}
      />
      <Stack.Screen
        name="DateDetail"
        component={DateDetailScreen}
        options={{ title: 'Date Details' }}
      />
    </Stack.Navigator>
  );
}
