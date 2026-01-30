import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import DateSuggestionsScreen from '@/screens/dates/DateSuggestionsScreen';
import DateDetailScreen from '@/screens/dates/DateDetailScreen';

export type DatesStackParamList = {
  DateSuggestions: undefined;
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
        name="DateDetail"
        component={DateDetailScreen}
        options={{ title: 'Date Details' }}
      />
    </Stack.Navigator>
  );
}
