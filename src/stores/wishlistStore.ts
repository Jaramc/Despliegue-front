import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WISHLIST_STORAGE_KEY } from '@/lib/constants';
import { api } from '@/lib/api';
import { useAuthStore } from './authStore';

interface WishlistState {
  ids: string[];
  hydrated: boolean;
  has: (propertyId: string) => boolean;
  toggle: (propertyId: string) => void;
  loadFromServer: () => Promise<void>;
  syncOnLogin: () => Promise<void>;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      ids: [],
      hydrated: false,
      has: (propertyId) => get().ids.includes(propertyId),
      toggle: (propertyId) => {
        const exists = get().ids.includes(propertyId);
        set((state) => ({
          ids: exists
            ? state.ids.filter((id) => id !== propertyId)
            : [...state.ids, propertyId],
        }));
        if (useAuthStore.getState().isAuthenticated()) {
          if (exists) api.removeFromWishlist(propertyId);
          else api.addToWishlist(propertyId);
        }
      },
      loadFromServer: async () => {
        const result = await api.getWishlist();
        if (result.ok) set({ ids: result.data.map((property) => property.id) });
      },
      syncOnLogin: async () => {
        const local = get().ids;
        if (local.length > 0) {
          const merged = await api.mergeWishlist(local);
          if (merged.ok) {
            set({ ids: merged.data.map((property) => property.id) });
            return;
          }
        }
        await get().loadFromServer();
      },
    }),
    {
      name: WISHLIST_STORAGE_KEY,
      partialize: (state) => ({ ids: state.ids }),
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    },
  ),
);
