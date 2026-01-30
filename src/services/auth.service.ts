import { apiService } from './api';
import { API_ENDPOINTS } from '@/utils/constants';
import { AuthResponse, LoginCredentials, SignupData, User } from '@/types';

class AuthService {
  async signup(data: SignupData): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>(API_ENDPOINTS.AUTH.SIGNUP, data);
    
    await apiService.setTokens(
      response.tokens.access_token,
      response.tokens.refresh_token
    );
    
    return response;
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials);
    
    await apiService.setTokens(
      response.tokens.access_token,
      response.tokens.refresh_token
    );
    
    return response;
  }

  async logout(): Promise<void> {
    try {
      await apiService.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await apiService.clearTokens();
    }
  }

  async getCurrentUser(): Promise<User> {
    return apiService.get<User>(API_ENDPOINTS.USER.ME);
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    return apiService.patch<User>(API_ENDPOINTS.USER.UPDATE, data);
  }
}

export const authService = new AuthService();
