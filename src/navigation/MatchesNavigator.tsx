import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MatchListScreen from '@/screens/matches/MatchListScreen';
import ChatScreen from '@/screens/matches/ChatScreen';
import DateSuggestionsScreen from '@/screens/dates/DateSuggestionsScreen';

export type MatchesStackParamList = {
  MatchList: undefined;
  Chat: { matchId: string; matchName?: string };
  DateSuggestions: { matchId: string };
};

const Stack = createNativeStackNavigator<MatchesStackParamList>();

export default function MatchesNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MatchList"
        component={MatchListScreen}
        options={{ title: 'Matches' }}
      />
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={{ title: 'Chat' }}
      />
      <Stack.Screen
        name="DateSuggestions"
        component={DateSuggestionsScreen}
        options={{ title: 'Suggest a Date' }}
      />
    </Stack.Navigator>
  );
}
