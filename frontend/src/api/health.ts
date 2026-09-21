import { apiClient } from './client';

export interface HealthStatus {
  service: string;
  status: string;
  database: string;
  version: string;
  timestamp: string;
}

export const healthApi = {
  async checkHealth(): Promise<HealthStatus> {
    const response = await apiClient.get('/api/v1/health');
    return response.data;
  },
};
