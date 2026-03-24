import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_ENDPOINTS, ERROR_MESSAGES } from '@/utils/constants';
import { ApiError, ApiResponse } from '@/types';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || Constants.expoConfig?.extra?.apiBaseUrl || 'https://api.areyoutheone.app/api/1.1';
const API_KEY = process.env.EXPO_PUBLIC_API_KEY || Constants.expoConfig?.extra?.laravelApiKey || '';
const API_TIMEOUT = 30000;

class ApiService {
  private client: AxiosInstance;
  private isRefreshing = false;
  private refreshSubscribers: ((token: string) => void)[] = [];

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': API_KEY,
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        const token = await this.getAccessToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            return new Promise((resolve) => {
              this.refreshSubscribers.push((token: string) => {
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${token}`;
                }
                resolve(this.client(originalRequest));
              });
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const newToken = await this.refreshAccessToken();
            this.isRefreshing = false;
            this.onRefreshed(newToken);
            this.refreshSubscribers = [];

            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }
            return this.client(originalRequest);
          } catch (refreshError) {
            this.isRefreshing = false;
            this.refreshSubscribers = [];
            await this.clearTokens();
            throw refreshError;
          }
        }

        return Promise.reject(this.handleError(error));
      }
    );
  }

  private onRefreshed(token: string) {
    this.refreshSubscribers.forEach((callback) => callback(token));
  }

  private async getAccessToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync('access_token');
    } catch {
      return null;
    }
  }

  private async getRefreshToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync('refresh_token');
    } catch {
      return null;
    }
  }

  private async refreshAccessToken(): Promise<string> {
    const refreshToken = await this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await this.client.post(API_ENDPOINTS.AUTH.REFRESH, {
      refresh_token: refreshToken,
    });

    const { access_token } = response.data;
    await SecureStore.setItemAsync('access_token', access_token);
    return access_token;
  }

  async setTokens(accessToken: string, refreshToken: string): Promise<void> {
    await SecureStore.setItemAsync('access_token', accessToken);
    await SecureStore.setItemAsync('refresh_token', refreshToken);
  }

  async clearTokens(): Promise<void> {
    await SecureStore.deleteItemAsync('access_token');
    await SecureStore.deleteItemAsync('refresh_token');
  }

  private handleError(error: AxiosError): ApiError {
    if (error.response) {
      const data = error.response.data as any;
      return {
        error: data.error || 'api_error',
        message: data.message || ERROR_MESSAGES.SERVER_ERROR,
        details: data.details,
      };
    }

    if (error.request) {
      return {
        error: 'network_error',
        message: ERROR_MESSAGES.NETWORK_ERROR,
      };
    }

    return {
      error: 'unknown_error',
      message: ERROR_MESSAGES.UNKNOWN_ERROR,
    };
  }

  async get<T>(url: string, params?: any): Promise<T> {
    const response = await this.client.get<ApiResponse<T>>(url, { params });
    return response.data.data || (response.data as any);
  }

  async post<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.post<ApiResponse<T>>(url, data);
    return response.data.data || (response.data as any);
  }

  async patch<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.patch<ApiResponse<T>>(url, data);
    return response.data.data || (response.data as any);
  }

  async put<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.put<ApiResponse<T>>(url, data);
    return response.data.data || (response.data as any);
  }

  async delete<T>(url: string): Promise<T> {
    const response = await this.client.delete<ApiResponse<T>>(url);
    return response.data.data || (response.data as any);
  }

  async upload<T>(url: string, file: FormData, onProgress?: (progress: number) => void): Promise<T> {
    const response = await this.client.post<ApiResponse<T>>(url, file, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      },
    });
    return response.data.data || (response.data as any);
  }
}

export const apiService = new ApiService();
