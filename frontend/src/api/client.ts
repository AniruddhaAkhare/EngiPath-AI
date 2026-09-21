import axios, { AxiosError } from 'axios';
import { ApiError } from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 90000, // 90 seconds for live web search and AI analysis
});

// Attach Authorization Bearer token from localStorage
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('engipath_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Format API errors
export function formatApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const axiosErr = error as AxiosError<{ error?: { code?: string; message?: string; details?: unknown } }>;
    if (axiosErr.response?.data?.error) {
      return {
        code: axiosErr.response.data.error.code || 'API_ERROR',
        message: axiosErr.response.data.error.message || 'An unexpected server error occurred.',
        details: axiosErr.response.data.error.details,
      };
    }
    if (axiosErr.code === 'ECONNABORTED') {
      return {
        code: 'TIMEOUT',
        message: 'The live search request timed out. Please try again.',
      };
    }
    if (!axiosErr.response) {
      return {
        code: 'NETWORK_ERROR',
        message: 'Unable to connect to the EngiPath AI backend server. Please verify the backend is running.',
      };
    }
    return {
      code: `HTTP_${axiosErr.response.status}`,
      message: axiosErr.message || 'Request failed.',
    };
  }
  return {
    code: 'UNKNOWN_ERROR',
    message: error instanceof Error ? error.message : 'An unknown error occurred.',
  };
}
