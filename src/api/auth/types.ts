import type { User } from '../../features/auth/types';

export interface LoginResponse {
  user: User;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
}