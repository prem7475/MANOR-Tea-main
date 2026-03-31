import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useWishlistStore = create(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (productId) => {
        const id = String(productId)
        const exists = get().ids.includes(id)
        set((state) => ({ ids: exists ? state.ids.filter((x) => x !== id) : [id, ...state.ids] }))
      },
      clear: () => set({ ids: [] }),
    }),
    { name: 'manor:wishlist:v1', version: 1 },
  ),
)

