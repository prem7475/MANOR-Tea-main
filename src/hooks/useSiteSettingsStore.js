import { create } from 'zustand'
import { fetchSiteSettings } from '../services/publicApi.js'

const fallback = {
  payments: { upi: true, card: true, cod: true },
  notifications: true,
  contact: {
    email: 'support@manor-tea.com',
    phone: '+91 98765 43210',
    location: 'Nagpur, India',
  },
  shipping: { freeAbove: 499, fee: 49 },
}

export const useSiteSettingsStore = create((set, get) => ({
  ...fallback,
  status: 'idle',

  load: async () => {
    if (get().status === 'loading') return
    set({ status: 'loading' })
    try {
      const settings = await fetchSiteSettings()
      if (settings) set({ ...fallback, ...settings, status: 'success' })
      else set({ ...fallback, status: 'success' })
    } catch {
      set({ ...fallback, status: 'error' })
    }
  },

  setSettings: (payload) => set((state) => ({ ...state, ...payload })),

  setPaymentEnabled: (key, enabled) =>
    set((state) => ({
      payments: { ...state.payments, [key]: Boolean(enabled) },
    })),

  setNotifications: (enabled) => set({ notifications: Boolean(enabled) }),
}))
