import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MatchListScreen from '@/screens/matches/MatchListScreen';
import ChatScreen from '@/screens/matches/ChatScreen';
import CallScreen from '@/screens/matches/CallScreen';
import AddReviewScreen from '@/screens/matches/AddReviewScreen';

export type MatchesStackParamList = {
  MatchList: undefined;
  Chat: { matchId: string; matchName?: string };
  Call: { matchId: string; partnerName?: string; callType: 'voice' | 'video'; sessionId?: string };
  AddReview: { matchId: string; partnerName?: string };
  DateSuggestions: { matchId: string };
};

const Stack = createNativeStackNavigator<MatchesStackParamList>();

export default function MatchesNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MatchList"
        component={MatchListScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Call"
        component={CallScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddReview"
        component={AddReviewScreen}
        options={{ title: 'Review Date' }}
      />
    </Stack.Navigator>
  );
}
