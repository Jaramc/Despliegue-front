import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AUTH_STORAGE_KEY } from '@/lib/constants';
import { api } from '@/lib/api';
import type {
  ApiResult,
  AuthTokens,
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
  login: (payload: LoginRequest) => Promise<ApiResult<User>>;
  register: (payload: RegisterRequest) => Promise<ApiResult<User>>;
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
      login: async (payload) => {
        const result = await api.login(payload);
        if (!result.ok) return result;
        set({
          tokens: { accessToken: result.data.accessToken, refreshToken: result.data.refreshToken },
        });
        // El backend no incluye el perfil en la respuesta de login: lo pedimos con el token recien obtenido.
        const profile = await api.me();
        if (profile.ok) set({ user: profile.data });
        return profile;
      },
      register: async (payload) => {
        const result = await api.register(payload);
        if (!result.ok) return result;
        set({
          tokens: { accessToken: result.data.accessToken, refreshToken: result.data.refreshToken },
        });
        const profile = await api.me();
        if (profile.ok) set({ user: profile.data });
        return profile;
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
