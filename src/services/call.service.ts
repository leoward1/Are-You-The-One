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

    async initiateCall(matchId: string, kind: 'voice' | 'video'): Promise<ApiResponse<CallSession>> {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            // 1. Create a Call Session record in Supabase
            // In a real app, a Supabase hook or Edge Function would create the Daily Room
            // For this MVP, we use a predictable URL (Insecure for production!)
            const roomUrl = `https://your-domain.daily.co/match_${matchId.substring(0, 8)}`;

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
