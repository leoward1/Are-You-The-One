import Daily, { DailyCall } from '@daily-co/react-native-daily-js';
import { supabase } from '../config/supabase';
import { CallSession, ApiResponse } from '../types';

class CallService {
    private callObject: DailyCall | null = null;

    getCallObject(): DailyCall {
        if (!this.callObject) {
            this.callObject = Daily.createCallObject();
        }
        return this.callObject;
    }

    async getCallCountToday(userId: string): Promise<number> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const { count, error } = await supabase
            .from('call_sessions')
            .select('*', { count: 'exact', head: true })
            .eq('from_user_id', userId)
            .gte('started_at', today.toISOString());

        if (error) {
            console.error('Error counting today\'s calls:', error);
            return 0;
        }

        return count || 0;
    }

    async initiateCall(matchId: string, kind: 'voice' | 'video'): Promise<ApiResponse<CallSession>> {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            // Fetch user profile for tier info
            const { data: profile } = await supabase
                .from('profiles')
                .select('tier')
                .eq('id', user.id)
                .single();

            const tier = profile?.tier || 'free';
            const callCount = await this.getCallCountToday(user.id);

            // LIMIT ENFORCEMENT
            if (tier === 'free' && callCount >= 3) {
                throw new Error('Daily call limit reached (3/3). Upgrade to Plus or Pro for unlimited calls!');
            }
            if (tier === 'plus' && callCount >= 15) {
                throw new Error('Daily call limit reached (15/15) for Plus. Upgrade to Pro for unlimited calls!');
            }

            // Create a real Daily.co room via REST API
            const roomName = `match-${matchId.substring(0, 8)}-${Date.now()}`;
            const dailyApiKey = process.env.EXPO_PUBLIC_DAILY_API_KEY;
            let roomUrl: string;

            if (dailyApiKey) {
                const dailyRes = await fetch('https://api.daily.co/v1/rooms', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${dailyApiKey}`,
                    },
                    body: JSON.stringify({
                        name: roomName,
                        properties: {
                            exp: Math.floor(Date.now() / 1000) + 3600,
                            max_participants: 2,
                            enable_chat: false,
                            start_video_off: kind === 'voice',
                            start_audio_off: false,
                        },
                    }),
                });
                const dailyData = await dailyRes.json();
                if (!dailyRes.ok || !dailyData.url) {
                    throw new Error(dailyData.error || 'Failed to create call room');
                }
                roomUrl = dailyData.url;
            } else {
                throw new Error('Call service is not configured. Please contact support.');
            }

            const { data, error } = await supabase
                .from('call_sessions')
                .insert([
                    {
                        match_id: matchId,
                        from_user_id: user.id,
                        kind,
                        status: 'ringing',
                        daily_url: roomUrl,
                        started_at: new Date().toISOString(),
                    }
                ])
                .select()
                .single();

            if (error) throw error;

            return {
                data: data as CallSession,
                success: true
            };
        } catch (error: any) {
            console.error('Error initiating call:', error);
            return {
                data: null as any,
                success: false,
                message: error.message || 'Failed to initiate call'
            };
        }
    }

    async endCall(sessionId: string): Promise<void> {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            // SECURITY: Verify user is part of the match associated with this call session
            const { data: sessionData } = await supabase
                .from('call_sessions')
                .select('match_id')
                .eq('id', sessionId)
                .single();

            if (!sessionData) throw new Error('Call session not found');

            const { data: matchVerify } = await supabase
                .from('matches')
                .select('id')
                .eq('id', sessionData.match_id)
                .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`)
                .single();

            if (!matchVerify) throw new Error('Not authorized to end this call');

            if (this.callObject) {
                await this.callObject.leave();
                await this.callObject.destroy();
                this.callObject = null;
            }

            await supabase
                .from('call_sessions')
                .update({
                    status: 'completed',
                    ended_at: new Date().toISOString()
                })
                .eq('id', sessionId);
        } catch (error) {
            console.error('Error ending call:', error);
        }
    }

    subscribeToCalls(matchId: string, callback: (session: CallSession) => void) {
        return supabase
            .channel(`calls:${matchId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'call_sessions',
                    filter: `match_id=eq.${matchId}`
                },
                (payload) => {
                    callback(payload.new as CallSession);
                }
            )
            .subscribe();
    }
}

export const callService = new CallService();
