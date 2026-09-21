import { apiClient, formatApiError } from './client';
import { RegisterPayload, LoginPayload, AuthData, UserProfile } from '../types/auth';

export const authApi = {
  async register(payload: RegisterPayload): Promise<AuthData> {
    try {
      const response = await apiClient.post('/api/v1/auth/register', payload);
      return response.data.data;
    } catch (err) {
      throw formatApiError(err);
    }
  },

  async login(payload: LoginPayload): Promise<AuthData> {
    try {
      const response = await apiClient.post('/api/v1/auth/login', payload);
      return response.data.data;
    } catch (err) {
      throw formatApiError(err);
    }
  },

  async getMe(): Promise<UserProfile> {
    try {
      const response = await apiClient.get('/api/v1/auth/me', { timeout: 5000 });
      return response.data.data.user;
    } catch (err) {
      throw formatApiError(err);
    }
  },
};
