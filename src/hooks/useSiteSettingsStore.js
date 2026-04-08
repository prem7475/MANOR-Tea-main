import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Shared (client-side) settings store.
// - Used by admin UI to toggle checkout options.
// - Used by storefront to conditionally render payment methods.
// - For production: load/store these settings from a backend.
export const useSiteSettingsStore = create(
  persist(
    (set) => ({
      payments: {
        upi: true,
        card: true,
        cod: true,
      },
      notifications: true,

      setPaymentEnabled: (key, enabled) =>
        set((state) => ({
          payments: { ...state.payments, [key]: Boolean(enabled) },
        })),

      setNotifications: (enabled) => set({ notifications: Boolean(enabled) }),
    }),
    { name: 'manor:admin:settings:v1', version: 1 },
  ),
)

