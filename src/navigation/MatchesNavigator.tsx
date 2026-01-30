import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MatchListScreen from '@/screens/matches/MatchListScreen';
import ChatScreen from '@/screens/matches/ChatScreen';

export type MatchesStackParamList = {
  MatchList: undefined;
  Chat: { matchId: string };
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
    </Stack.Navigator>
  );
}
