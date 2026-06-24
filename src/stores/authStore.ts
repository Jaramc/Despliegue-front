import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AUTH_STORAGE_KEY } from '@/lib/constants';
import { api } from '@/lib/api';
import type {
  ApiResult,
  AuthResponse,
  AuthTokens,
  KycStatus,
  LoginRequest,
  RegisterRequest,
  User,
} from '@/lib/types';

interface SessionPatch {
  tokens?: AuthTokens;
  user?: User;
}

interface AuthState {
  tokens: AuthTokens | null;
  user: User | null;
  hydrated: boolean;
  isAuthenticated: () => boolean;
  setSession: (patch: SessionPatch) => void;
  setKycStatus: (status: KycStatus) => void;
  login: (payload: LoginRequest) => Promise<ApiResult<AuthResponse>>;
  register: (payload: RegisterRequest) => Promise<ApiResult<AuthResponse>>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      tokens: null,
      user: null,
      hydrated: false,
      isAuthenticated: () => Boolean(get().tokens?.accessToken),
      setSession: (patch) =>
        set((state) => ({
          tokens: patch.tokens ?? state.tokens,
          user: patch.user ?? state.user,
        })),
      setKycStatus: (status) =>
        set((state) =>
          state.user ? { user: { ...state.user, kycStatus: status } } : {},
        ),
      login: async (payload) => {
        const result = await api.login(payload);
        if (result.ok) {
          set({
            tokens: { accessToken: result.data.accessToken, refreshToken: result.data.refreshToken },
            user: result.data.user,
          });
        }
        return result;
      },
      register: async (payload) => {
        const result = await api.register(payload);
        if (result.ok) {
          set({
            tokens: { accessToken: result.data.accessToken, refreshToken: result.data.refreshToken },
            user: result.data.user,
          });
        }
        return result;
      },
      logout: () => set({ tokens: null, user: null }),
    }),
    {
      name: AUTH_STORAGE_KEY,
      partialize: (state) => ({ tokens: state.tokens, user: state.user }),
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    },
  ),
);
