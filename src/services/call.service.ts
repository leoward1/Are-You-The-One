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

            // SECURITY: Generate a unique, unpredictable room URL per call session
            // In production, a Supabase Edge Function should create the Daily room
            // and return a time-limited meeting token for each participant.
            const roomToken = Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
            const roomUrl = `https://areyoutheone.daily.co/s_${roomToken}`;

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
