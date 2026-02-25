import { supabase } from '@/config/supabase';
import { Message, PaginatedResponse, SendMessageData } from '@/types';
import { RealtimeChannel } from '@supabase/supabase-js';

class ChatService {
  private channels: Map<string, RealtimeChannel> = new Map();

  async getMessages(
    matchId: string,
    limit: number = 50,
    before?: string
  ): Promise<PaginatedResponse<Message>> {
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

    const { data: messages, error, count } = await query;
    if (error) throw new Error(error.message);

    // Return messages in chronological order
    const sorted = (messages || []).reverse();

    return {
      data: sorted as Message[],
      total: count || 0,
      limit,
      offset: 0,
      has_more: (messages || []).length === limit,
    };
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
        sender_id: user.id,
        type: data.type,
        content: data.content || null,
        media_url: mediaUrl || null,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    // Update the match's last_message_at
    await supabase
      .from('matches')
      .update({
        last_message_at: new Date().toISOString(),
        message_count: undefined, // DB trigger handles this
      })
      .eq('id', data.match_id);

    return message as Message;
  }

  async shareDateSuggestion(matchId: string, suggestionId: string): Promise<Message> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        match_id: matchId,
        sender_id: user.id,
        type: 'date_suggestion',
        content: suggestionId,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return message as Message;
  }

  // Realtime: subscribe to new messages in a match
  subscribeToMessages(matchId: string, onNewMessage: (message: Message) => void): void {
    const channelName = `messages:${matchId}`;

    // Unsubscribe if already subscribed
    if (this.channels.has(channelName)) {
      this.channels.get(channelName)?.unsubscribe();
    }

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
  }

  unsubscribeFromMessages(matchId: string): void {
    const channelName = `messages:${matchId}`;
    const channel = this.channels.get(channelName);
    if (channel) {
      channel.unsubscribe();
      this.channels.delete(channelName);
    }
  }
}

export const chatService = new ChatService();
