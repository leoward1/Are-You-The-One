import { apiService } from './api';
import { API_ENDPOINTS } from '@/utils/constants';
import { 
  DiscoveryResponse, 
  Like, 
  Match, 
  LikeType,
  PaginatedResponse 
} from '@/types';

class MatchService {
  async getDiscoveryProfiles(limit: number = 10, offset: number = 0): Promise<DiscoveryResponse> {
    return apiService.get<DiscoveryResponse>(API_ENDPOINTS.DISCOVERY.PROFILES, {
      limit,
      offset,
    });
  }

  async sendLike(userId: string, type: LikeType, note?: string): Promise<Like> {
    return apiService.post<Like>(API_ENDPOINTS.LIKES.CREATE, {
      to_user_id: userId,
      type,
      note,
    });
  }

  async sendPass(userId: string): Promise<void> {
    await apiService.post(API_ENDPOINTS.PASSES.CREATE, {
      user_id: userId,
    });
  }

  async getMatches(
    status?: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<PaginatedResponse<Match>> {
    return apiService.get<PaginatedResponse<Match>>(API_ENDPOINTS.MATCHES.LIST, {
      status,
      limit,
      offset,
    });
  }

  async unlockStage(matchId: string): Promise<Match> {
    return apiService.post<Match>(API_ENDPOINTS.MATCHES.UNLOCK(matchId));
  }
}

export const matchService = new MatchService();
