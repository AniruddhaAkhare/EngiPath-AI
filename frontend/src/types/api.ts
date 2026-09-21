export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: Record<string, unknown>;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}
