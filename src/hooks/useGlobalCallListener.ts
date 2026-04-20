import { useEffect } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../config/supabase';
import { useAuthStore } from '../store/useAuthStore';
import { callService } from '../services/call.service';
import { navigationRef } from './usePushNotifications';

export function useGlobalCallListener() {
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`global_calls_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'call_sessions',
        },
        async (payload) => {
          const session = payload.new as any;

          // Only handle calls intended for this user (not initiated by them)
          if (session.from_user_id === user.id) return;
          if (session.status !== 'ringing') return;

          // Verify this call is for a match that involves the current user
          const { data: match } = await supabase
            .from('matches')
            .select('id, user_a_id, user_b_id')
            .eq('id', session.match_id)
            .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`)
            .single();

          if (!match) return;

          // Get caller name
          const { data: callerProfile } = await supabase
            .from('profiles')
            .select('first_name')
            .eq('id', session.from_user_id)
            .single();

          const callerName = callerProfile?.first_name || 'Someone';

          Alert.alert(
            '📞 Incoming Call',
            `${callerName} is calling you!`,
            [
              {
                text: 'Decline',
                style: 'cancel',
                onPress: () => callService.endCall(session.id),
              },
              {
                text: 'Answer',
                onPress: () => {
                  if (navigationRef.isReady()) {
                    (navigationRef as any).navigate('MatchesTab', {
                      screen: 'Call',
                      params: {
                        matchId: session.match_id,
                        partnerName: callerName,
                        callType: session.kind,
                        sessionId: session.id,
                      },
                    });
                  }
                },
              },
            ]
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);
}
