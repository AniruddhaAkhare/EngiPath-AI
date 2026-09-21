import { create } from 'zustand';
import { UserProfile, LoginPayload, RegisterPayload } from '../types/auth';
import { authApi } from '../api/auth';

interface AuthState {
  token: string | null;
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  initialize: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('engipath_auth_token'),
  user: null,
  isAuthenticated: !!localStorage.getItem('engipath_auth_token'),
  isLoading: true,
  error: null,

  async login(payload) {
    set({ isLoading: true, error: null });
    try {
      const data = await authApi.login(payload);
      localStorage.setItem('engipath_auth_token', data.token);
      set({
        token: data.token,
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err) {
      const msg = err && typeof err === 'object' && 'message' in err ? String(err.message) : 'Login failed';
      set({ error: msg, isLoading: false });
      throw err;
    }
  },

  async register(payload) {
    set({ isLoading: true, error: null });
    try {
      const data = await authApi.register(payload);
      localStorage.setItem('engipath_auth_token', data.token);
      set({
        token: data.token,
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err) {
      const msg = err && typeof err === 'object' && 'message' in err ? String(err.message) : 'Registration failed';
      set({ error: msg, isLoading: false });
      throw err;
    }
  },

  logout() {
    localStorage.removeItem('engipath_auth_token');
    set({
      token: null,
      user: null,
      isAuthenticated: false,
      error: null,
    });
  },

  async initialize() {
    const token = localStorage.getItem('engipath_auth_token');
    if (!token) {
      set({ isLoading: false, isAuthenticated: false, user: null });
      return;
    }
    try {
      const user = await authApi.getMe();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      localStorage.removeItem('engipath_auth_token');
      set({ token: null, user: null, isAuthenticated: false, isLoading: false });
    }
  },

  clearError() {
    set({ error: null });
  },
}));
