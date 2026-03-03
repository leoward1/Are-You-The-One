import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MatchListScreen from '@/screens/matches/MatchListScreen';
import ChatScreen from '@/screens/matches/ChatScreen';
import DateSuggestionsScreen from '@/screens/dates/DateSuggestionsScreen';
import AddReviewScreen from '@/screens/matches/AddReviewScreen';
import CallScreen from '@/screens/matches/CallScreen';

export type MatchesStackParamList = {
  MatchList: undefined;
  Chat: { matchId: string; matchName?: string };
  DateSuggestions: { matchId: string };
  AddReview: { matchId: string; partnerName: string };
  Call: { matchId: string; partnerName: string; callType: 'voice' | 'video'; sessionId?: string };
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
      <Stack.Screen
        name="AddReview"
        component={AddReviewScreen}
        options={{ title: 'Leave a Review' }}
      />
      <Stack.Screen
        name="Call"
        component={CallScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
