import { supabase } from '@/config/supabase';
import { Message, PaginatedResponse, SendMessageData } from '@/types';
import { RealtimeChannel } from '@supabase/supabase-js';

class ChatService {
  private channels: Map<string, RealtimeChannel> = new Map();

  async getMessageHistory(
    matchId: string,
    limit: number = 50,
    before?: string
  ): Promise<Message[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    let query = supabase
      .from('messages')
      .select('*', { count: 'exact' })
      .eq('match_id', matchId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (before) {
      query = query.lt('created_at', before);
    }

    const { data: messages, error } = await query;
    if (error) throw new Error(error.message);

    // Return messages in chronological order
    return (messages || []).reverse() as Message[];
  }

  async sendMessage(data: SendMessageData): Promise<Message> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    let mediaUrl: string | undefined;

    // Upload media if present
    if (data.media) {
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(filePath, data.media);

      if (uploadError) throw new Error(uploadError.message);

      const { data: { publicUrl } } = supabase.storage
        .from('photos')
        .getPublicUrl(filePath);

      mediaUrl = publicUrl;
    }

    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        match_id: data.match_id,
        from_user_id: user.id,
        type: data.type,
        content: data.content || null,
        media: mediaUrl || null,
        game_data: (data as any).game_data || null,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    // Update the match's last_message_at
    await supabase
      .from('matches')
      .update({
        updated_at: new Date().toISOString(),
      })
      .eq('id', data.match_id);

    return message as Message;
  }

  async markAsRead(matchId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('messages')
      .update({ read: true })
      .eq('match_id', matchId)
      .neq('from_user_id', user.id)
      .eq('read', false);
  }

  async shareDateSuggestion(matchId: string, suggestionId: string): Promise<Message> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: suggestion } = await supabase
      .from('date_suggestions')
      .select('*')
      .eq('id', suggestionId)
      .single();

    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        match_id: matchId,
        from_user_id: user.id,
        type: 'date_suggestion',
        content: `Suggested: ${suggestion?.name || 'A date idea'}`,
        date_suggestion: suggestion,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return message as Message;
  }

  // Realtime: subscribe to new messages in a match
  subscribeToMessages(matchId: string, onNewMessage: (message: Message) => void): () => void {
    const channelName = `messages:${matchId}`;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          onNewMessage(payload.new as Message);
        }
      )
      .subscribe();

    this.channels.set(channelName, channel);

    return () => {
      channel.unsubscribe();
      this.channels.delete(channelName);
    };
  }
}

export const chatService = new ChatService();
