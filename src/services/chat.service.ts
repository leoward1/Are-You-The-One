import { apiService } from './api';
import { API_ENDPOINTS } from '@/utils/constants';
import { Message, PaginatedResponse, SendMessageData } from '@/types';

class ChatService {
  async getMessages(
    matchId: string,
    limit: number = 50,
    before?: string
  ): Promise<PaginatedResponse<Message>> {
    return apiService.get<PaginatedResponse<Message>>(
      API_ENDPOINTS.MATCHES.MESSAGES(matchId),
      { limit, before }
    );
  }

  async sendMessage(data: SendMessageData): Promise<Message> {
    if (data.media) {
      const formData = new FormData();
      formData.append('type', data.type);
      if (data.content) {
        formData.append('content', data.content);
      }
      formData.append('media', data.media as any);

      return apiService.upload<Message>(
        API_ENDPOINTS.MATCHES.SEND_MESSAGE(data.match_id),
        formData
      );
    }

    return apiService.post<Message>(
      API_ENDPOINTS.MATCHES.SEND_MESSAGE(data.match_id),
      {
        type: data.type,
        content: data.content,
      }
    );
  }

  async shareDateSuggestion(matchId: string, suggestionId: string): Promise<Message> {
    return apiService.post<Message>(API_ENDPOINTS.MATCHES.SHARE_DATE(matchId), {
      date_suggestion_id: suggestionId,
    });
  }
}

export const chatService = new ChatService();
